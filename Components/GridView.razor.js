const getDataGrid = (containerElement) => {
  return new Promise((resolve, reject) => {
    const dataGrid = containerElement.querySelector('igc-data-grid');
    if (dataGrid !== null) { resolve(dataGrid); }
    else {
      let counter = 0;
      const timerId = setInterval(() => {
        counter++;
        const dataGrid = containerElement.querySelector('igc-data-grid');
        if (dataGrid !== null) {
          clearInterval(timerId);
          resolve(dataGrid);
        }
        else if (counter > (5000 / 10)) {
          clearInterval(timerId);
          reject();
        }
      }, 10)
    }
  });
};

export const setDataSource = async (containerElement, dataSourceObject) => {
  const dataGrid = await getDataGrid(containerElement);
  dataGrid.dataSource = dataSourceObject;
};
