export const setDataSource = (containerElement, dataSourceJson) => {

  const dataChart = containerElement.querySelector('igc-data-chart');
  const series = dataChart.actualSeries;
  const axis = dataChart.actualAxes;

  const dataSourceObject = JSON.parse(dataSourceJson);
  dataChart.dataSource = dataSourceObject;
  series[0].dataSource = dataSourceObject;
  axis[0].dataSource = dataSourceObject;
};
