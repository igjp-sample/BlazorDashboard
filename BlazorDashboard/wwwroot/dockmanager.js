
// Dockmanagerの設定
window.settingDockManager = () => {

    var dockManager = document.getElementById('dockManager');
    dockManager.layout = {
        rootPane: {
            type: "splitPane",
            orientation: "horizontal",

            panes: [
                {
                    type: "contentPane",
                    contentId: "content1",
                    header: "データソース",
                                size: 30,
                },
                {
                    type: "splitPane",
                    orientation: "vertical",
                    size: 200,
                    panes: [
                        {
                            type: "contentPane",
                            contentId: "content2",
                            header: "データグリッド",
                            size : 100,
                        },
                        {
                            type: "contentPane",
                            contentId: "content3",
                            header: "チャート",
                            size: 200,
                        }
                    ]
                }
            ]
        }
    };
};

// データグリッドの設定
window.settingDataGrid = (jsonData) => {

    var dataGrid = document.getElementsByTagName('igc-data-grid')[0];
    var json = JSON.parse(jsonData);
    dataGrid.dataSource = json;
};

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

