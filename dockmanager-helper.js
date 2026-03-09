// Ensure the DockManagerf instance is ready.
const getDockManager = async (dockManagerContainerSelector) => {
  for (let i = 0; i < 50; i++) {
    const dockManager = document.querySelector(dockManagerContainerSelector)?.querySelector("igc-dockmanager");
    if (dockManager) return dockManager;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("DockManager instance not found within the timeout period.");
}

export const attachContentPane = async (dockManagerContainerSelector, contentId, header) => {

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

export const restoreLayout = async (dockManagerContainerSelector, layout) => {
  const dockManager = await getDockManager(dockManagerContainerSelector);
  dockManager.layout = JSON.parse(layout);
}

let eventHandlerCounter = 0;
const eventHandlers = new Map();

export const subscribeEvent = async (dockManagerContainerSelector, eventName, handlerId, dotNetObjRef, callbackMethodName) => {

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

export const unsubscribeEvent = async (dockManagerContainerSelector, subscriptionId) => {
  const dockManager = await getDockManager(dockManagerContainerSelector);
  const eventHandler = eventHandlers.get(subscriptionId) || null;
  if (eventHandler === null) return;

  eventHandlers.delete(subscriptionId);
  dockManager.removeEventListener(eventHandler.eventName, eventHandler.callback);
}