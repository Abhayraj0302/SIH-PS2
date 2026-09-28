import { useEffect, useState, type ReactNode } from "react";
import type { PageId } from "../state/app-types";

const groups: ReadonlyArray<{ label: string; items: ReadonlyArray<{ id: PageId; label: string; icon: string }> }> = [
  { label: "Main", items: [{ id: "dashboard", label: "Dashboard", icon: "◉" }, { id: "sonar-analysis", label: "Sonar Analysis", icon: "⌁" }, { id: "detections", label: "Detections", icon: "◎" }] },
  { label: "Intelligence", items: [{ id: "detection-map", label: "Detection Map", icon: "⌖" }, { id: "survey-comparison", label: "Survey Comparison", icon: "⇄" }, { id: "analytics", label: "Analytics", icon: "▥" }] },
  { label: "System", items: [{ id: "reports", label: "Reports", icon: "▤" }, { id: "settings", label: "Settings", icon: "⚙" }] },
];

const titles: Record<PageId, string> = {
  dashboard: "Mission overview",
  "sonar-analysis": "Sonar analysis",
  detections: "Detection register",
  "detection-map": "Marine detection map",
  "survey-comparison": "Survey comparison",
  analytics: "Survey analytics",
  reports: "Reports",
  settings: "Settings",
};

type Props = { activePage: PageId; onNavigate: (page: PageId) => void; children: ReactNode };

export default function AppShell({ activePage, onNavigate, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);

  const navigation = (
    <>
      <a className="brand-lockup" href="#/dashboard" onClick={() => { onNavigate("dashboard"); setDrawerOpen(false); }}>
        <span className="brand-icon" aria-hidden="true">≈</span>
        <span><strong>MARINE AI</strong><small>DEBRIS INTELLIGENCE</small></span>
      </a>
      <nav aria-label="Main navigation">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <a key={item.id} href={`#/${item.id}`} aria-current={activePage === item.id ? "page" : undefined}
                className={activePage === item.id ? "nav-link is-active" : "nav-link"}
                onClick={() => { onNavigate(item.id); setDrawerOpen(false); }}>
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot"><span className="online-dot" />Demo environment <span>LOCAL</span></div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{navigation}</aside>
      {drawerOpen && <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
      <aside className={`mobile-drawer${drawerOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!drawerOpen} inert={!drawerOpen}>{navigation}</aside>
      <div className="app-column">
        <header className="app-topbar">
          <button className="menu-button" aria-label={drawerOpen ? "Close navigation" : "Open navigation"} aria-expanded={drawerOpen} onClick={() => setDrawerOpen(!drawerOpen)}>☰</button>
          <div><span className="topbar-kicker">MARINE DEBRIS INTELLIGENCE</span><h1>{titles[activePage]}</h1></div>
          <span className="topbar-status"><i /> SYSTEM READY</span>
        </header>
        <main className={`page-content page-${activePage}`}>{children}</main>
      </div>
    </div>
  );
}
