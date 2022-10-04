using System.Collections.ObjectModel;
using System.Data;
using Infragistics.Documents.Excel;

namespace BlazorDashboard.Services;

public record DashboardItem
(
    string ID,
    string Title,
    DataTable DataTable
);

public class DashboardService
{
    public ObservableCollection<DashboardItem> Items { get; } = new();

    public void AddDashboardItem(string fileName, byte[] fileContent)
    {
        using var ms = new MemoryStream(fileContent);
        var workBook = Workbook.Load(ms);
        var dataTable = ConvertWorksheetToDataTable(workBook.Worksheets[0]);
        var item = new DashboardItem(Guid.NewGuid().ToString(), fileName, dataTable);
        this.Items.Add(item);
    }

    private static DataTable ConvertWorksheetToDataTable(Worksheet worksheet)
    {
        // Tableを作成するための情報を収集する。
        // 追加用のDataTable
        var newDataTable = new DataTable(worksheet.Name);

        foreach (var headerCell in worksheet.Rows[0].Cells)
        {
            var dataCell = worksheet.Rows[1].Cells[headerCell.ColumnIndex];

            // カラムを追加
            var headerColumn = new DataColumn();
            headerColumn.ColumnName = headerCell.GetText();

            // 2行目を型の判定に利用する。
            headerColumn.DataType = typeof(string);

            var cellText = dataCell.GetText(TextFormatMode.IgnoreCellWidth);

            if (string.IsNullOrEmpty(cellText))
            {
                headerColumn.DataType = typeof(string);
            }
            else
            {
                // 日付にコンバートできるか
                if (DateTime.TryParse(cellText, out var _))
                {
                    headerColumn.DataType = typeof(DateTime);
                }
                else if (Decimal.TryParse(cellText, out var _))
                {
                    headerColumn.DataType = typeof(decimal);
                }
            }

            newDataTable.Columns.Add(headerColumn);
        }

        // データを挿入します。
        foreach (var row in worksheet.Rows.Skip(1))
        {
            // 1レコード分のデータを取得
            var addRow = newDataTable.NewRow();
            for (var c = 0; c < newDataTable.Columns.Count; c++)
            {
                var cellText = row.Cells[c].GetText(TextFormatMode.IgnoreCellWidth);

                // 日付にコンバートできるか
                if (DateTime.TryParse(cellText, out var tryParseDate))
                {
                    if (tryParseDate.Year >= 1900)
                    {
                        addRow[newDataTable.Columns[c]] = tryParseDate;
                    }
                    else if (Decimal.TryParse(cellText, out var tryParseDecimal))
                    {
                        addRow[newDataTable.Columns[c]] = tryParseDecimal;
                    }
                    else
                    {
                        addRow[newDataTable.Columns[c]] = row.Cells[c].Value;
                    }
                }
                else if (Decimal.TryParse(cellText, out var tryParseDecimal))
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

