import { useState } from "react";
import SectionNav from "./components/section-nav";
import DashboardPage from "./pages/dashboard-page";
import SonarAnalysisPage from "./pages/sonar-analysis-page";
import DetectionsPage from "./pages/detections-page";
import DetectionMapPage from "./pages/detection-map-page";
import SurveyComparisonPage from "./pages/survey-comparison-page";
import AnalyticsPage from "./pages/analytics-page";
import ReportsPage from "./pages/reports-page";
import SettingsPage from "./pages/settings-page";
import type { AnalysisPreferences } from "./state/app-types";
import { demoDetections } from "./state/demo-data";

const defaultPreferences: AnalysisPreferences = { showDetections: true, showAcousticShadows: true, confidenceThreshold: 50 };
const storageKey = "marine-debris-intelligence.preferences.v1";

function loadPreferences(): { value: AnalysisPreferences; message: string } {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return { value: defaultPreferences, message: "" };
    const parsed = JSON.parse(stored) as Partial<AnalysisPreferences>;
    if (typeof parsed.showDetections !== "boolean" || typeof parsed.showAcousticShadows !== "boolean" || typeof parsed.confidenceThreshold !== "number" || !Number.isFinite(parsed.confidenceThreshold) || parsed.confidenceThreshold < 0 || parsed.confidenceThreshold > 100) {
      return { value: defaultPreferences, message: "Saved preferences were invalid; using browser defaults." };
    }
    return { value: { showDetections: parsed.showDetections, showAcousticShadows: parsed.showAcousticShadows, confidenceThreshold: parsed.confidenceThreshold }, message: "" };
  } catch {
    return { value: defaultPreferences, message: "Browser storage is unavailable; preferences will last for this session." };
  }
}

export default function App() {
  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(17);
  const [loadedPreferences] = useState(loadPreferences);
  const [preferences, setPreferences] = useState<AnalysisPreferences>(loadedPreferences.value);
  const [storageMessage, setStorageMessage] = useState(loadedPreferences.message);

  const selectDetection = (id: number) => {
    if (demoDetections.some((detection) => detection.id === id)) setSelectedDetectionId(id);
  };
  const viewSonar = () => document.getElementById("sonar-analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const changePreferences = (next: AnalysisPreferences) => {
    setPreferences(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageMessage("");
    } catch {
      setStorageMessage("Browser storage is unavailable; preferences will last for this session.");
    }
  };

  return <main className="page-content scroll-page">
    <SectionNav />
    <section id="dashboard" className="scroll-section scroll-section-hero"><DashboardPage onViewSonar={viewSonar} onSelectDetection={selectDetection} /></section>
    <section id="sonar-analysis" className="scroll-section"><SonarAnalysisPage detections={demoDetections} selectedDetectionId={selectedDetectionId} onSelectDetection={selectDetection} preferences={preferences} onPreferencesChange={changePreferences} /></section>
    <section id="detections" className="scroll-section"><DetectionsPage selectedDetectionId={selectedDetectionId} onSelectDetection={(id) => { selectDetection(id); viewSonar(); }} /></section>
    <section id="detection-map" className="scroll-section"><DetectionMapPage selectedDetectionId={selectedDetectionId} onSelectDetection={selectDetection} onViewSonar={viewSonar} /></section>
    <section id="survey-comparison" className="scroll-section"><SurveyComparisonPage onSelectDetection={selectDetection} onViewSonar={viewSonar} /></section>
    <section id="analytics" className="scroll-section"><AnalyticsPage /></section>
    <section id="reports" className="scroll-section"><ReportsPage /></section>
    <section id="settings" className="scroll-section"><SettingsPage preferences={preferences} onChange={changePreferences} storageMessage={storageMessage} /></section>
  </main>;
}
