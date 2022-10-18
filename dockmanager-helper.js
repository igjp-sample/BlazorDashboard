
// Obtains the DockManager body element implemented in WebComponents.
// However, the DockManager body element is hidden in the Shadow DOM as a child element of the element drawn with the Blazor component tag,
// so it is retrieved by carefully traversing the DOM hierarchy.
function getDockManagerInternal(dockManagerContainerSelector) {
  const dockManager = document.querySelector(dockManagerContainerSelector)
    ?.querySelector("igc-component-renderer-container")
    ?.shadowRoot
    ?.querySelector("igc-dockmanager");
  return dockManager || null;
}

// Ensure the DockManagerf instance is ready.
function getDockManager(dockManagerContainerSelector) {

  return new Promise((resolve, reject) => {
    const dockManager = getDockManagerInternal(dockManagerContainerSelector);
    if (dockManager !== null) {
      resolve(dockManager);
    }
    else {
      let counter = 0;
      const timerId = setInterval(() => {
        counter++;
        const dockManager = getDockManagerInternal(dockManagerContainerSelector);
        if (dockManager !== null) {
          clearInterval(timerId);
          resolve(dockManager);
        }
        else if (counter > (5000 / 10)) {
          clearInterval(timerId);
          reject();
        }
      }, 10)
    }
  });
}

export async function attachContentPane(dockManagerContainerSelector, contentId, header) {

  const dockManager = await getDockManager(dockManagerContainerSelector);

  // Create a slot element corresponding to the pane to be added this time and add it as a child element of DockManager.
  const slot = document.createElement("slot");
  slot.name = contentId;
  slot.slot = contentId;
  dockManager.appendChild(slot)

  // Create layout information corresponding to the pane to be added this time and add it to the layout property of DockManager.
  const newPane = {
    type: "contentPane",
    contentId: contentId,
    header: header
  };
  dockManager.layout.rootPane.panes.push(newPane);

  // However, this is not enough for the DockManager to notice the change in layout information.
  // So we duplicate the layout information and reassign the layout property as an object with a different reference.
  // The DockManager will then detect the change in the layout property and the pane will be added.
  dockManager.layout = { ...dockManager.layout };
}

export async function restoreLayout(dockManagerContainerSelector, layout) {
  const dockManager = await getDockManager(dockManagerContainerSelector);
  dockManager.layout = JSON.parse(layout);
}

let eventHandlerCounter = 0;
const eventHandlers = new Map();

export async function subscribeEvent(dockManagerContainerSelector, eventName, handlerId, dotNetObjRef, callbackMethodName) {

  const dockManager = await getDockManager(dockManagerContainerSelector);

  const eventHandler = {
    eventName: eventName,
    callback: (e) => {
      const eventArgs = (() => {
        switch (e.type) {
          case "layoutChange": return JSON.stringify(dockManager.layout);
          case "paneClose": return JSON.stringify(e.detail.panes.map(pane => pane.contentId));
          default: return null;
        }
      })();
      dotNetObjRef.invokeMethodAsync(callbackMethodName, handlerId, eventArgs);
    }
  };

  dockManager.addEventListener(eventHandler.eventName, eventHandler.callback);

  const subscriptionId = eventHandlerCounter++;
  eventHandlers.set(subscriptionId, eventHandler);
  return subscriptionId;
}

export async function unsubscribeEvent(dockManagerContainerSelector, subscriptionId) {
  const dockManager = await getDockManager(dockManagerContainerSelector);
  const eventHandler = eventHandlers.get(subscriptionId) || null;
  if (eventHandler === null) return;

  eventHandlers.delete(subscriptionId);
  dockManager.removeEventListener(eventHandler.eventName, eventHandler.callback);
}