export type GeolocationType = "Real" | "Simulated" | "Unavailable";

export type AnalysisDetection = {
  detection_id: string;
  image_id: string;
  class_id: number;
  class_name: string;
  bbox: [number, number, number, number];
  raw_confidence: number;
  shadow_consistency: number | null;
  local_contrast: number | null;
  aspect_ratio: number;
  normalized_area: number;
  fusion_score: number | null;
  calibrated_confidence: number | null;
  confidence_status: string;
  false_positive_status: "keep" | "review" | "reject";
  reason_codes: string[];
  source_dataset: string;
  provenance: Record<string, unknown>;
  latitude: number | null;
  longitude: number | null;
  geolocation_type: GeolocationType;
  geolocation_status: string;
  metadata_source: string | null;
  inspection_priority: { label: string; score: number | null; band: string; fields_used: string[]; note: string };
  human_review: { status: string; note?: string; updated_at?: string };
  shadow_diagnostics: Record<string, unknown>;
  contrast_diagnostics: Record<string, unknown>;
};

export type AnalysisResult = {
  mode: "MOCK" | "REAL" | "UNAVAILABLE";
  image_id: string;
  filename: string;
  image_width: number;
  image_height: number;
  source_dataset: string;
  detector_status: string;
  message: string | null;
  detections: AnalysisDetection[];
  location_policy: string;
};

export type ApiHealth = { status: string; mode: "MOCK" | "REAL" | "UNAVAILABLE"; engine4: string; subpipe: string };

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function decode<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `API request failed (${response.status})`);
  return body;
}

export async function getApiHealth(): Promise<ApiHealth> {
  return decode<ApiHealth>(await fetch(`${apiBase}/api/health`));
}

export async function analyzeImage(file: File, sourceDataset: string): Promise<AnalysisResult> {
  return decode<AnalysisResult>(await fetch(`${apiBase}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-Filename": file.name,
      "X-Source-Dataset": sourceDataset,
    },
    body: file,
  }));
}
