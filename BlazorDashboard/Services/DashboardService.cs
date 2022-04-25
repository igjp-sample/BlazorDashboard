using Infragistics.Documents.Excel;
using Microsoft.AspNetCore.Components;
using System.Collections.ObjectModel;
using System.Data;

namespace BlazorDashboard.Services
{
    public class DashboardService
    {

        public ObservableCollection<DashboardItem> Items { get; set; }

        public delegate void AddDashboardItemMethod(DashboardItem item);

        public DashboardService()
        {
            Items = new ObservableCollection<DashboardItem>();
        }

        public void AddDashboardItem(byte[] content)
        {
            DashboardItem item = new DashboardItem();
            item.ID = "123";
            item.Title = "aiueo";

            //var ms = new MemoryStream(content);
            //var wb = Workbook.Load(ms);
            //item.Workbook = wb;

            //item.DataTable = ConvertDTbyWB(wb);


            Items.Add(item);
        }


        public async void AddDashboardItemAsync(string fileName, byte[] fileContent, AddDashboardItemMethod delegeteMethod)
        {
            await Task.Delay(1500);
            Task task = Task.Run(() =>
            {
                AddDashboardItem(fileName, fileContent, delegeteMethod);
            });
        }

        private void AddDashboardItem(string fileName, byte[] fileContent, AddDashboardItemMethod delegeteMethod)
        {
            DashboardItem item = new DashboardItem();
            item.Title = fileName;

            var ms = new MemoryStream(fileContent);
            Workbook wb = Workbook.Load(ms);

            item.Workbook = wb;
            item.DataTable = ConvertWSToDT(wb.Worksheets[0]);
 

            Items.Add(item);

            delegeteMethod(item);

        }


        public void AddDashboardItem(string fileName, Workbook wb)
        {
            DashboardItem item = new DashboardItem();
            item.ID = "123";
            item.Title = fileName;

            item.Workbook = wb;
            item.DataTable = ConvertWSToDT(wb.Worksheets[0]);


            //Items.Add(item);
        }

        public DataTable ConvertWSToDT(Worksheet worksheet)
        {
            // Tableを作成するための情報を収集する。
            // 追加用のDataTable
            DataTable newDataTable = new DataTable(worksheet.Name);

            foreach (WorksheetCell headerCell in worksheet.Rows[0].Cells)
            {

                WorksheetCell dataCell = worksheet.Rows[1].Cells[headerCell.ColumnIndex];

                // カラムを追加
                DataColumn headerColumn = new DataColumn();
                headerColumn.ColumnName = headerCell.GetText();

                // 2行目を型の判定に利用する。

                headerColumn.DataType = typeof(string);


                string cellText = dataCell.GetText(TextFormatMode.IgnoreCellWidth);


                if (string.IsNullOrEmpty(cellText))
                {
                    headerColumn.DataType = typeof(string);
                }
                else
                {
                    // 日付にコンバートできるか
                    DateTime tryParseDate;
                    Decimal tryParseDecimal;
                    if (DateTime.TryParse(cellText, out tryParseDate))
                    {
                        headerColumn.DataType = typeof(DateTime);
                    }
                    else if (Decimal.TryParse(cellText, out tryParseDecimal))
                    {
                        headerColumn.DataType = typeof(decimal);
                    }
                }


                newDataTable.Columns.Add(headerColumn);
            }

            // データを挿入します。
            int currentRowIdx = 0;
            foreach (WorksheetRow row in worksheet.Rows)
            {
                currentRowIdx++;
                // 1行目はスルー
                if (currentRowIdx <= 1) continue;

                // 1レコード分のデータを取得
                DataRow addRow = newDataTable.NewRow();
                for (int c = 0; c < newDataTable.Columns.Count; c++)
                {
                    string cellText = row.Cells[c].GetText(TextFormatMode.IgnoreCellWidth);

                    // 日付にコンバートできるか
                    DateTime tryParseDate;
                    Decimal tryParseDecimal;
                    if (DateTime.TryParse(cellText, out tryParseDate))
                    {
                        if (tryParseDate.Year >= 1900)
                        {
                            addRow[newDataTable.Columns[c]] = tryParseDate;
                        }
                        else if (Decimal.TryParse(cellText, out tryParseDecimal))
                        {
                            addRow[newDataTable.Columns[c]] = tryParseDecimal;
                        }
                        else
                        {
                            addRow[newDataTable.Columns[c]] = row.Cells[c].Value;
                        }

                    }
                    else if (Decimal.TryParse(cellText, out tryParseDecimal))
                    {
                        addRow[newDataTable.Columns[c]] = tryParseDecimal;
                    }
                    else
                    {
                        if (row.Cells[c].Value == null)
                        {
                            addRow[newDataTable.Columns[c]] = DBNull.Value;
                        }
                        else
                        {
                            addRow[newDataTable.Columns[c]] = row.Cells[c].Value;
                        }

                    }


                }
                newDataTable.Rows.Add(addRow);
            }

            return newDataTable;
        }

    }

    public class DashboardItem
    {
        public string ID { get; set; }
        public string Title { get; set; }
        public Workbook Workbook { get; set; }
        public DataTable DataTable { get; set; }
    }
}
