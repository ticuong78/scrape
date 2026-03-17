import { useState } from "react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [hovered, setHovered] = useState<"min" | "max" | "close" | null>(null);

  return (
    <div
      className="flex items-center justify-between h-10 px-3 shrink-0 relative"
      style={
        {
          WebkitAppRegion: "drag",
          background: "linear-gradient(180deg, #13151f 0%, #0e1018 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        } as any
      }
    >
      {/* Left — logo + title */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="2" fill="white" opacity="0.9" />
            <circle
              cx="5"
              cy="5"
              r="4"
              stroke="white"
              strokeWidth="1"
              opacity="0.4"
              fill="none"
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}
        >
          WEBSCRAPER <span style={{ color: "rgba(99,102,241,0.8)" }}>PRO</span>
        </span>
      </div>

      {/* Center — status dot */}
      <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
        />
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          ready
        </span>
      </div>

      {/* Right — window controls */}
      <div
        className="flex items-center gap-0.5"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        {/* Minimize */}
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          onMouseEnter={() => setHovered("min")}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background:
              hovered === "min" ? "rgba(255,255,255,0.07)" : "transparent",
            color:
              hovered === "min"
                ? "rgba(255,255,255,0.8)"
                : "rgba(255,255,255,0.35)",
          }}
        >
          <svg
            width="10"
            height="2"
            viewBox="0 0 10 2"
            fill="none"
            style={{ display: "block" }}
          >
            <line
              x1="0"
              y1="1"
              x2="10"
              y2="1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Maximize */}
        <button
          onClick={() => {
            window.electronAPI.maximizeWindow();
            setIsMaximized((p) => !p);
          }}
          onMouseEnter={() => setHovered("max")}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background:
              hovered === "max" ? "rgba(255,255,255,0.07)" : "transparent",
            color:
              hovered === "max"
                ? "rgba(255,255,255,0.8)"
                : "rgba(255,255,255,0.35)",
          }}
        >
          {isMaximized ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{ display: "block" }}
            >
              <rect
                x="0"
                y="2"
                width="8"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M2 2V1a1 1 0 011-1h7a1 1 0 011 1v7a1 1 0 01-1 1H9"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          ) : (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{ display: "block" }}
            >
              <rect
                x="0.6"
                y="0.6"
                width="8.8"
                height="8.8"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 12,
            background: "rgba(255,255,255,0.07)",
            margin: "0 2px",
          }}
        />

        {/* Close */}
        <button
          onClick={() => window.electronAPI.closeWindow()}
          onMouseEnter={() => setHovered("close")}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background:
              hovered === "close" ? "rgba(239,68,68,0.15)" : "transparent",
            color:
              hovered === "close"
                ? "rgb(248,113,113)"
                : "rgba(255,255,255,0.35)",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{ display: "block" }}
          >
            <line
              x1="1"
              y1="1"
              x2="9"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="9"
              y1="1"
              x2="1"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.35)",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
