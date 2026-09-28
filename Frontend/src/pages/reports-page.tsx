import { useState } from "react";
import DataTable from "../components/data-table";
import type { Column } from "../components/data-table";
import type { Detection } from "../state/app-types";
import { demoDetections } from "../state/demo-data";
import { exportDetectionsCsv } from "../utils/export-detections-csv";

const reportDetections = demoDetections.slice(0, 5);

const columns: ReadonlyArray<Column<Detection>> = [
  { key: "id", label: "ID", render: (row) => `#${row.id}` },
  { key: "type", label: "Type", render: (row) => row.type },
  { key: "confidence", label: "Confidence", render: (row) => row.confidence === null ? "—" : `${row.confidence}%` },
  { key: "location", label: "Location", render: (row) => `${row.latitude}, ${row.longitude}` },
  { key: "priority", label: "Priority", render: (row) => <span className={`priority-pill priority-${row.priority}`}><i />{row.priority}</span> },
  { key: "status", label: "Status", render: (row) => row.status.replaceAll("-", " ") },
];

export default function ReportsPage() {
  const [error, setError] = useState("");
  const onExport = () => { try { exportDetectionsCsv(reportDetections); setError(""); } catch { setError("CSV export was unavailable. You can still review the report table."); } };
  return <div className="page-section"><div className="page-intro"><div><span className="eyebrow">REPORTS · DEMO DATA</span><h2>Detection reports</h2><p>Review five sample records or export them as a CSV.</p></div><button className="primary-button" onClick={onExport}>↓ Export CSV</button></div>{error && <p className="inline-alert" role="alert">{error}</p>}<section className="panel table-panel"><DataTable rows={reportDetections} columns={columns} label="Five-record demo detection report" /></section><p className="demo-note">Report values and coordinates are illustrative demo data.</p></div>;
}
