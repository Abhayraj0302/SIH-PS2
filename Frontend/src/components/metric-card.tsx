type Props = { label: string; value: string; tone?: "default" | "warning" | "verified"; note?: string };

export default function MetricCard({ label, value, tone = "default", note = "Demo data" }: Props) {
  return <article className={`metric-card tone-${tone}`}><div className="metric-topline"><span className="metric-index">SURVEY</span><span className="metric-mark" /></div><p>{label}</p><strong>{value}</strong><small>{note}</small></article>;
}
