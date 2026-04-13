import * as XLSX from "xlsx";

export const exportToExcel = (transactions: any[]) => {
  if (!transactions || transactions.length === 0) return;

  // 🔥 Summary
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expense;

  // 🔥 Create worksheet manually (better control)
  const wsData = [
    ["FINANCIAL REPORT"],
    [],
    ["SUMMARY"],
    ["Total Income", income],
    ["Total Expense", expense],
    ["Savings", savings],
    [],
    ["TRANSACTION HISTORY"],
    ["Type", "Amount", "Category", "Description", "Date"],
  ];

  // 🔥 Add transactions
  transactions.forEach((t) => {
    wsData.push([
      t.type,
      t.amount,
      t.categoryName,
      t.description || "-",
      new Date(t.date).toLocaleDateString("en-GB").replace(/\//g, "-"),
    ]);
  });

  // 🔥 Convert to sheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // 🔥 Column widths
  worksheet["!cols"] = [
    { wch: 15 }, // Type
    { wch: 15 }, // Amount
    { wch: 20 }, // Category
    { wch: 30 }, // Description
    { wch: 15 }, // Date
  ];

  // 🔥 Merge heading cells (center-like effect)
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // FINANCIAL REPORT
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // SUMMARY
    { s: { r: 7, c: 0 }, e: { r: 7, c: 4 } }, // TRANSACTION HISTORY
  ];

  // 🔥 Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  // 🔥 Download
  XLSX.writeFile(
    workbook,
    `financial-report-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
