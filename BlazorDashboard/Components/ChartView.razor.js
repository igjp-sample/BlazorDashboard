const getDataChart = (containerElement) => {
  return new Promise((resolve, reject) => {
    const dataChart = containerElement.querySelector('igc-data-chart');
    if (dataChart !== null) { resolve(dataChart); }
    else {
      let counter = 0;
      const timerId = setInterval(() => {
        counter++;
        const dataChart = containerElement.querySelector('igc-data-chart');
        if (dataChart !== null) {
          clearInterval(timerId);
          resolve(dataChart);
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

  const dataChart = await getDataChart(containerElement);
  const series = dataChart.actualSeries;
  const axis = dataChart.actualAxes;

  dataChart.dataSource = dataSourceObject;
  series[0].dataSource = dataSourceObject;
  axis[0].dataSource = dataSourceObject;
};
