export interface ExcelColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

/** Export rows to a real .xlsx workbook and trigger a download. xlsx is lazy-loaded. */
export async function exportToExcel<T>(
  filename: string,
  sheetName: string,
  rows: T[],
  columns: ExcelColumn<T>[],
) {
  const XLSX = await import("xlsx");
  const data = rows.map((row) => {
    const out: Record<string, string | number | boolean> = {};
    for (const col of columns) {
      const v = col.value(row);
      out[col.header] = v === null || v === undefined ? "" : v;
    }
    return out;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = columns.map((c) => ({
    wch: Math.max(
      c.header.length + 2,
      ...data.slice(0, 200).map((r) => String(r[c.header] ?? "").length + 2),
      12,
    ),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
