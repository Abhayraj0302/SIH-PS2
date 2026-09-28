import DataTable from "../components/data-table";
import type { Column } from "../components/data-table";
import type { Detection } from "../state/app-types";
import { demoDetections } from "../state/demo-data";

type RegisterDetection = Detection & { registerId: number };
const registerDetections: ReadonlyArray<RegisterDetection> = demoDetections.slice(0, 5).map((detection, index) => ({ ...detection, registerId: index + 1 }));

type Props = { selectedDetectionId: number | null; onSelectDetection: (id: number) => void };
const columns: ReadonlyArray<Column<RegisterDetection>> = [
  { key: "id", label: "ID", render: (row) => <span className="mono">#{String(row.registerId).padStart(2, "0")}</span> },
  { key: "type", label: "Type", render: (row) => row.type },
  { key: "confidence", label: "Confidence", render: (row) => row.confidence === null ? "—" : `${row.confidence}%` },
  { key: "location", label: "Location · demo", render: (row) => `${row.latitude}, ${row.longitude}` },
  { key: "priority", label: "Priority", render: (row) => <span className={`priority-pill priority-${row.priority}`}><i />{row.priority}</span> },
  { key: "status", label: "Status", render: (row) => row.status.replaceAll("-", " ") },
];

export default function DetectionsPage({ selectedDetectionId, onSelectDetection }: Props) {
  return <div className="page-section"><div className="page-intro"><div><span className="eyebrow">5 RECORDS · DEMO DATA</span><h2>Detection register</h2><p>Select a row to open its sonar evidence.</p></div><span className="live-indicator">LOCAL DATASET</span></div><section className="panel table-panel"><DataTable rows={registerDetections} columns={columns} selectedId={selectedDetectionId} onSelect={(row) => onSelectDetection(row.id)} label="Five-record illustrative marine debris detection register" /></section></div>;
}
