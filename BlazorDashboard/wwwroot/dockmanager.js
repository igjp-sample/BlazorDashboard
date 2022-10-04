window.settingDataSourceOfDataChart = (jsonData) => {
    var json = JSON.parse(jsonData);

    var dataChart = document.getElementsByTagName('igc-data-chart')[0];
    var series = dataChart.actualSeries;
    var axis = dataChart.actualAxes;

    dataChart.dataSource = json;
    series[0].dataSource = json;
    axis[0].dataSource = json;

    console.log(dataChart);
    console.log(series);
    console.log(axis);
}

window.settingIgbCategoryXAxis = (jsonData) => {

}

