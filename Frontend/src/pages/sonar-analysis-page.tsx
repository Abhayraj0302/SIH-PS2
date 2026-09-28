import { useEffect, useState } from "react";
import SonarViewer from "../components/sonar-viewer";
import DetectionDetailPanel from "../components/detection-detail-panel";
import EvidenceCard from "../components/evidence-card";
import NaturalVsManmade from "../components/natural-vs-manmade";
import type { AnalysisPreferences, Detection } from "../state/app-types";

type Props = { detections: ReadonlyArray<Detection>; selectedDetectionId: number | null; onSelectDetection: (id: number) => void; preferences: AnalysisPreferences; onPreferencesChange: (preferences: AnalysisPreferences) => void };
export default function SonarAnalysisPage({ detections, selectedDetectionId, onSelectDetection, preferences, onPreferencesChange }: Props) {
  const [zoom, setZoom] = useState(100);
  const [compare, setCompare] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [analysisState, setAnalysisState] = useState<"idle" | "running" | "complete">("idle");
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  useEffect(() => {
    if (analysisState !== "running") return;
    const timeout = window.setTimeout(() => setAnalysisState("complete"), 1100);
    return () => window.clearTimeout(timeout);
  }, [analysisState]);
  const selected = detections.find((item) => item.id === selectedDetectionId);
  const onImageError = () => {
    setImageUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return null; });
    setUploadError("This image could not be previewed. The demo sonar scan is still available.");
  };
  const onUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Choose an image file to preview. The demo sonar scan is still available."); return; }
    try {
      const nextUrl = URL.createObjectURL(file);
      setImageUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return nextUrl; });
      setUploadError("");
      setAnalysisState("idle");
    } catch { setUploadError("This image could not be previewed. The demo sonar scan is still available."); }
  };
  const togglePreference = (key: "showDetections" | "showAcousticShadows") => onPreferencesChange({ ...preferences, [key]: !preferences[key] });
  return <div className="analysis-page page-section">
    <div className="page-intro"><div><span className="eyebrow">PRIMARY WORKSPACE · DEMO SURVEY</span><h2>Review the seafloor return</h2><p>Inspect highlighted targets and the evidence behind each sample detection.</p></div><span className={`analysis-status ${analysisState}`}>{analysisState === "complete" ? "ANALYSIS COMPLETE" : analysisState === "running" ? "ANALYZING…" : "DEMO SCAN READY"}</span></div>
    <div className="analysis-layout"><section className="analysis-main"><SonarViewer detections={detections} selectedDetectionId={selectedDetectionId} onSelectDetection={onSelectDetection} preferences={preferences} imageUrl={imageUrl} onImageError={onImageError} zoom={zoom} compare={compare} />
      <div className="control-deck"><div className="control-row"><label className="upload-button">↑ Upload Scan<input type="file" accept="image/*" onChange={(event) => onUpload(event.currentTarget.files?.[0])} /></label><button className="primary-button" disabled={analysisState === "running"} onClick={() => setAnalysisState("running")}>{analysisState === "running" ? "Analyzing…" : "Run Analysis"}</button><button className="secondary-button" onClick={() => { setImageUrl(null); setUploadError(""); setAnalysisState("idle"); setZoom(100); setCompare(false); onSelectDetection(17); }}>Reset</button></div>
        <div className="control-row"><button className="toggle-button" aria-pressed={preferences.showDetections} onClick={() => togglePreference("showDetections")}>Detection overlay <b>{preferences.showDetections ? "ON" : "OFF"}</b></button><button className="toggle-button" aria-pressed={preferences.showAcousticShadows} onClick={() => togglePreference("showAcousticShadows")}>Acoustic shadow <b>{preferences.showAcousticShadows ? "ON" : "OFF"}</b></button><button className="toggle-button" aria-pressed={compare} onClick={() => setCompare(!compare)}>Compare <b>{compare ? "ON" : "OFF"}</b></button><div className="zoom-control"><button aria-label="Zoom out" onClick={() => setZoom(Math.max(50, zoom - 10))}>−</button><span>{zoom}%</span><button aria-label="Zoom in" onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button></div></div>
        {uploadError && <p className="inline-alert" role="alert">{uploadError}</p>}
      </div>
      <section className="evidence-section"><div className="section-heading"><div><span className="eyebrow">EXPLAINABLE AI · DEMO</span><h2>Why was this detected?</h2></div></div><div className="evidence-grid">{(selected?.evidence ?? []).map((item, index) => <EvidenceCard key={item.label} index={`0${index + 1}`} label={item.label} description={item.description} />)}</div></section>
      <NaturalVsManmade />
    </section><aside className="analysis-aside"><DetectionDetailPanel detection={selected} /><div className="panel scan-context"><span className="eyebrow">SCAN CONTEXT</span><h3>Survey_024 · June 2026</h3><p>Side-scan sonar sample<br />Coverage: 4.8 km²<br />Quality score: 94%</p><span className="context-badge">ILLUSTRATIVE DEMO VALUES</span></div></aside></div>
  </div>;
}
