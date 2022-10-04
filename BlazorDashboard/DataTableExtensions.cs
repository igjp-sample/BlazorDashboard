using System.Data;

namespace BlazorDashboard;

public static class DataTableExtensions
{
    public static IEnumerable<Dictionary<string, object>> AsDictionaryEnumerable(this DataTable? table)
    {
        if (table == null) yield break;

        var columns = table.Columns;
        foreach (DataRow row in table.Rows)
        {
            yield return columns.Cast<DataColumn>().ToDictionary(col => col.ColumnName, col => row[col]);
        }
    }
}
