export function TitleBar() {
  return (
    <div
      className="flex items-center justify-between h-9 px-4 bg-[#0f1117] border-b border-white/5 shrink-0"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      <span className="text-xs text-white/40 font-medium tracking-widest uppercase">
        WebScraper Pro
      </span>

      <div
        className="flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="w-8 h-9 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <span className="text-lg leading-none mb-1">─</span>
        </button>
        <button
          onClick={() => window.electronAPI.maximizeWindow()}
          className="w-8 h-9 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <span className="text-xs">□</span>
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="w-8 h-9 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="text-sm">✕</span>
        </button>
      </div>
    </div>
  );
}