import { demoDetections, demoSurveys } from "../state/demo-data";

type Props = { onSelectDetection: (id: number) => void; onViewSonar: () => void };
export default function SurveyComparisonPage({ onSelectDetection, onViewSonar }: Props) {
  const changed = demoDetections.filter((detection) => detection.change !== null);
  const openDetection = (id: number) => { onSelectDetection(id); onViewSonar(); };
  return <div className="page-section"><div className="page-intro"><div><span className="eyebrow">TEMPORAL MONITORING · DEMO</span><h2>Survey comparison</h2><p>Compare repeat survey coverage to spot sample changes over time.</p></div><span className="live-indicator">AI CHANGE DETECTION · DEMO</span></div>
    <div className="survey-compare-grid">{demoSurveys.map((survey, index) => <section className="panel survey-card" key={survey.id}><div className="section-heading"><div><span className="eyebrow">SURVEY {index + 1}</span><h3>{survey.label}</h3></div><span className="mono">{survey.date}</span></div><div className={`comparison-sonar compare-sonar-${index}`}><div className="comparison-texture" /><span className="compare-target" /></div><p>Side-scan sonar · illustrative sample</p></section>)}</div>
    <section className="panel change-summary"><span className="eyebrow">AI CHANGE DETECTION · ILLUSTRATIVE</span><div className="change-arrow">JAN 2026 <span>↓ DETECT CHANGES ↓</span> JUN 2026</div><div className="change-counts"><div><strong>04</strong><span>New detections</span></div><div><strong>02</strong><span>Removed</span></div><div><strong>07</strong><span>Persistent</span></div></div></section>
    <section className="changed-list"><div className="section-heading"><div><span className="eyebrow">CHANGE REGISTER</span><h2>Changed detections</h2></div></div><div className="changed-chips">{changed.map((detection) => <button key={detection.id} onClick={() => openDetection(detection.id)}><span className={`priority-pill priority-${detection.priority}`}>#{detection.id}</span><strong>{detection.type}</strong><small>{detection.change}</small><span aria-hidden="true">↗</span></button>)}</div></section>
  </div>;
}
