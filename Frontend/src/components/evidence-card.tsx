type Props = { label: string; description: string; index: string };
export default function EvidenceCard({ label, description, index }: Props) {
  return <article className="evidence-card"><span>{index}</span><div><h3>{label}</h3><p>{description}</p></div><i aria-hidden="true">↗</i></article>;
}
