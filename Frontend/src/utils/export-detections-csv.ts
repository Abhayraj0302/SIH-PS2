import type { Detection } from "../state/app-types";

function escapeCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportDetectionsCsv(detections: ReadonlyArray<Detection>): void {
  const headers = ["ID", "Type", "Confidence", "Latitude", "Longitude", "Priority", "Status"];
  const rows = detections.map((item) => [item.id, item.type, item.confidence === null ? null : `${item.confidence}%`, item.latitude, item.longitude, item.priority, item.status]);
  const blob = new Blob([[headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "marine-debris-detections-demo.csv";
  link.hidden = true;
  document.body.append(link);
  try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0); }
}
