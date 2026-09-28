import SonarDashboardIntro from "../components/sonar-dashboard-intro";
import DataTable from "../components/data-table";
import type { Column } from "../components/data-table";
import type { Detection } from "../state/app-types";
import { demoDetections } from "../state/demo-data";

type Props = { onViewSonar: () => void; onSelectDetection: (id: number) => void };
const metrics = [
  { label: "Total scans", value: "128", tone: "default" },
  { label: "Detections", value: "37", tone: "default" },
  { label: "High priority", value: "08", tone: "warning" },
  { label: "Scan quality", value: "94%", tone: "verified" },
] as const;

export default function DashboardPage({ onViewSonar, onSelectDetection }: Props) {
  const columns: ReadonlyArray<Column<Detection>> = [
    { key: "id", label: "ID", render: (row) => `#${row.id}` },
    { key: "type", label: "Object", render: (row) => row.type },
    { key: "confidence", label: "Confidence", render: (row) => row.confidence === null ? "—" : `${row.confidence}%` },
    { key: "priority", label: "Priority", render: (row) => <span className={`priority-pill priority-${row.priority}`}>{row.priority}</span> },
  ];
  return <>
    <SonarDashboardIntro title="Marine Debris Intelligence" description="AI-powered analysis of underwater side-scan sonar imagery." metrics={metrics} actionLabel="Open sonar analysis" />
    <section className="dashboard-lower page-section"><div className="section-heading"><div><span className="eyebrow">FIELD ACTIVITY · DEMO DATA</span><h2>Recent detections</h2></div><a className="text-action" href="#detections">View all detections ↓</a></div>
      <div className="dashboard-grid"><div className="panel recent-panel"><DataTable rows={demoDetections.slice(0, 5)} columns={columns} label="Recent marine debris detections" onSelect={(row) => { onSelectDetection(row.id); onViewSonar(); }} /></div><div className="panel next-step-panel"><span className="eyebrow">NEXT STEP</span><h3>Review sonar evidence</h3><p>Inspect highlighted targets, acoustic shadows, and sample AI reasoning.</p><button className="primary-button" onClick={onViewSonar}>Open sonar analysis <span>↓</span></button><a className="secondary-button" href="#detection-map">Explore detection map</a></div></div>
    </section>
  </>;
}
