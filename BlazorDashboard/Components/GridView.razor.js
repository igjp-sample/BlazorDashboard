export const setDataSource = (containerElement, dataSourceJson) => {
  const dataGrid = containerElement.querySelector('igc-data-grid');
  const dataSourceObject = JSON.parse(dataSourceJson);
  dataGrid.dataSource = dataSourceObject;
};
