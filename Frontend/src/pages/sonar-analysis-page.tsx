import { useEffect, useState } from "react";
import SonarViewer from "../components/sonar-viewer";
import DetectionDetailPanel from "../components/detection-detail-panel";
import EvidenceCard from "../components/evidence-card";
import NaturalVsManmade from "../components/natural-vs-manmade";
import type { AnalysisPreferences, Detection } from "../state/app-types";
import { analyzeImage, exportAnalysis, getApiHealth, saveReview, type AnalysisDetection, type AnalysisResult, type ApiHealth } from "../services/engine8-api";

type Props = { detections: ReadonlyArray<Detection>; selectedDetectionId: number | null; onSelectDetection: (id: number) => void; preferences: AnalysisPreferences; onPreferencesChange: (preferences: AnalysisPreferences) => void };
export default function SonarAnalysisPage({ detections, selectedDetectionId, onSelectDetection, preferences, onPreferencesChange }: Props) {
  const [zoom, setZoom] = useState(100);
  const [compare, setCompare] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [analysisState, setAnalysisState] = useState<"idle" | "running" | "complete">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceDataset, setSourceDataset] = useState("UNKNOWN");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");
  useEffect(() => { void getApiHealth().then(setApiHealth).catch(() => setApiHealth({ status: "unavailable", mode: "UNAVAILABLE", engine4: "PENDING", subpipe: "PENDING" })); }, []);
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
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
      setSelectedFile(file);
      setAnalysisResult(null);
      setSelectedApiId(null);
      setUploadError("");
      setAnalysisState("idle");
    } catch { setUploadError("This image could not be previewed. The demo sonar scan is still available."); }
  };
  const runAnalysis = async () => {
    if (!selectedFile) { setUploadError("Upload a sonar image first."); return; }
    setAnalysisState("running"); setUploadError("");
    try { setAnalysisResult(await analyzeImage(selectedFile, sourceDataset)); setAnalysisState("complete"); }
    catch (error) { setAnalysisState("idle"); setUploadError(`Analysis API unavailable: ${error instanceof Error ? error.message : "request failed"}`); }
  };
  const selectedApi = analysisResult?.detections.find((item) => item.detection_id === selectedApiId) ?? analysisResult?.detections[0];
  useEffect(() => {
    if (!imageUrl || !selectedApi || !analysisResult) { setCropUrl(null); return; }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      const [x1,y1,x2,y2] = selectedApi.bbox;
      const left=Math.max(0,Math.floor(x1)), top=Math.max(0,Math.floor(y1));
      const width=Math.min(image.naturalWidth,Math.ceil(x2))-left, height=Math.min(image.naturalHeight,Math.ceil(y2))-top;
      if (cancelled || width<1 || height<1) return setCropUrl(null);
      const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height;
      const context=canvas.getContext("2d");
      if (!context) return setCropUrl(null);
      context.drawImage(image,left,top,width,height,0,0,width,height); setCropUrl(canvas.toDataURL("image/png"));
    };
    image.onerror=()=>setCropUrl(null); image.src=imageUrl;
    return () => { cancelled=true; };
  }, [imageUrl, selectedApi, analysisResult]);
  const review = async (action: "confirm" | "reject" | "flag", detectionId = selectedApi?.detection_id) => {
    if (!detectionId) return;
    try { const saved = await saveReview(detectionId, action); setAnalysisResult((previous) => previous ? { ...previous, detections: previous.detections.map((row) => row.detection_id === detectionId ? { ...row, human_review: saved.human_review } : row) } : previous); setReviewMessage(`Review saved: ${action}.`); }
    catch (error) { setReviewMessage(`Review could not be saved: ${error instanceof Error ? error.message : "API unavailable"}`); }
  };
  const togglePreference = (key: "showDetections" | "showAcousticShadows") => onPreferencesChange({ ...preferences, [key]: !preferences[key] });
  return <div className="analysis-page page-section">
    <div className="page-intro"><div><span className="eyebrow">ENGINE 8 · UPLOAD ANALYSIS</span><h2>Review the seafloor return</h2><p>Uploaded images are sent to the local API only when you run analysis.</p></div><span className={`analysis-status ${analysisState}`}>{analysisState === "complete" ? `ANALYSIS COMPLETE · ${analysisResult?.mode ?? "UNKNOWN"}` : analysisState === "running" ? "ANALYZING…" : `${apiHealth?.mode ?? "UNAVAILABLE"} MODE`}</span></div>
    {apiHealth?.mode === "MOCK" && <p className="mock-mode-banner" role="status">DEMO / MOCK MODE — NOT REAL DETECTOR OUTPUT. Engine 4 is pending; the mock adapter intentionally returns no detections.</p>}
    {apiHealth?.mode === "UNAVAILABLE" && <p className="inline-alert" role="alert">API unavailable. Start the backend to analyze uploads. Existing illustrative dashboard sections remain demo data.</p>}
    <div className="analysis-layout"><section className="analysis-main"><SonarViewer detections={detections} selectedDetectionId={selectedDetectionId} onSelectDetection={onSelectDetection} preferences={preferences} imageUrl={imageUrl} onImageError={onImageError} zoom={zoom} compare={compare} apiDetections={analysisResult?.detections ?? null} apiImageSize={analysisResult ? { width: analysisResult.image_width, height: analysisResult.image_height } : null} onSelectApiDetection={setSelectedApiId} />
      <div className="control-deck"><div className="control-row"><label className="upload-button">↑ Upload Scan<input type="file" accept="image/*" onChange={(event) => onUpload(event.currentTarget.files?.[0])} /></label><select aria-label="Source dataset" value={sourceDataset} onChange={(event) => setSourceDataset(event.currentTarget.value)}><option value="UNKNOWN">Source unavailable</option><option value="AI4Shipwrecks">AI4Shipwrecks</option><option value="MILCO/NOMBO">MILCO/NOMBO</option><option value="SubPipe">SubPipe (adapter pending)</option></select><button className="primary-button" disabled={analysisState === "running" || !selectedFile} onClick={() => void runAnalysis()}>{analysisState === "running" ? "Analyzing…" : "Run Analysis"}</button><button className="secondary-button" onClick={() => { setImageUrl(null); setSelectedFile(null); setAnalysisResult(null); setUploadError(""); setAnalysisState("idle"); setZoom(100); setCompare(false); onSelectDetection(17); }}>Reset</button></div>
        <div className="control-row"><button className="toggle-button" aria-pressed={preferences.showDetections} onClick={() => togglePreference("showDetections")}>Detection overlay <b>{preferences.showDetections ? "ON" : "OFF"}</b></button><button className="toggle-button" aria-pressed={preferences.showAcousticShadows} onClick={() => togglePreference("showAcousticShadows")}>Acoustic shadow <b>{preferences.showAcousticShadows ? "ON" : "OFF"}</b></button><button className="toggle-button" aria-pressed={compare} onClick={() => setCompare(!compare)}>Compare <b>{compare ? "ON" : "OFF"}</b></button><div className="zoom-control"><button aria-label="Zoom out" onClick={() => setZoom(Math.max(50, zoom - 10))}>−</button><span>{zoom}%</span><button aria-label="Zoom in" onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button></div></div>
        {uploadError && <p className="inline-alert" role="alert">{uploadError}</p>}
        {analysisResult && <div className="api-result panel"><div className="section-heading"><div><span className="eyebrow">{analysisResult.mode} · {analysisResult.source_dataset}</span><h3>Upload analysis</h3></div><div className="control-row"><button className="secondary-button" onClick={() => exportAnalysis(analysisResult,"json")}>Export JSON</button><button className="secondary-button" onClick={() => exportAnalysis(analysisResult,"csv")}>Export CSV</button></div></div><p>{analysisResult.message ?? analysisResult.detector_status} · {analysisResult.detections.length} detections</p>{analysisResult.detections.length===0 ? <p>No detections returned. Engine 4 is pending; this is not a model result.</p> : <><h4>Inspection Priority queue</h4>{cropUrl && <figure><img className="evidence-crop" src={cropUrl} alt="Crop for selected detector result" /><figcaption>Selected detection crop · {selectedApi?.class_name}</figcaption></figure>}{[...analysisResult.detections].sort((left,right)=>(right.inspection_priority.score ?? -1)-(left.inspection_priority.score ?? -1)).map((item: AnalysisDetection) => <article className="api-detection-detail" key={item.detection_id}><strong>{item.class_name}</strong><p>Raw detector score: {item.raw_confidence.toFixed(3)} · Calibrated confidence: {item.calibrated_confidence === null ? "Unavailable" : item.calibrated_confidence.toFixed(3)} ({item.confidence_status})</p><p>Shadow consistency: {item.shadow_consistency?.toFixed(3) ?? "Unavailable"} · Local contrast: {item.local_contrast?.toFixed(3) ?? "Unavailable"} · Aspect ratio: {item.aspect_ratio.toFixed(3)}</p><p>Source: {item.source_dataset} · Provenance: {JSON.stringify(item.provenance)}</p><p>{item.geolocation_type === "Real" ? "REAL LOCATION" : item.geolocation_type === "Simulated" ? "SIMULATED LOCATION" : "LOCATION UNAVAILABLE"}{item.latitude !== null && item.longitude !== null ? ` · ${item.latitude}, ${item.longitude}` : ""} · {item.geolocation_status}</p><p>Inspection Priority: {item.inspection_priority.band} · {item.inspection_priority.score?.toFixed(3) ?? "Unavailable"} · review {item.human_review.status}</p><div className="control-row"><button className="secondary-button" onClick={() => { setSelectedApiId(item.detection_id); void review("confirm",item.detection_id); }}>Confirm</button><button className="secondary-button" onClick={() => { setSelectedApiId(item.detection_id); void review("reject",item.detection_id); }}>Reject</button><button className="secondary-button" onClick={() => { setSelectedApiId(item.detection_id); void review("flag",item.detection_id); }}>Flag for review</button></div></article>)}</>}{reviewMessage && <p role="status">{reviewMessage}</p>}</div>}
      </div>
      {!imageUrl && <><section className="evidence-section"><div className="section-heading"><div><span className="eyebrow">EXPLAINABLE AI · DEMO</span><h2>Why was this detected?</h2></div></div><div className="evidence-grid">{(selected?.evidence ?? []).map((item, index) => <EvidenceCard key={item.label} index={`0${index + 1}`} label={item.label} description={item.description} />)}</div></section><NaturalVsManmade /></>}
    </section>{!imageUrl && <aside className="analysis-aside"><DetectionDetailPanel detection={selected} /><div className="panel scan-context"><span className="eyebrow">SCAN CONTEXT</span><h3>Survey_024 · June 2026</h3><p>Side-scan sonar sample<br />Coverage: 4.8 km²<br />Quality score: 94%</p><span className="context-badge">ILLUSTRATIVE DEMO VALUES</span></div></aside>}</div>
  </div>;
}
