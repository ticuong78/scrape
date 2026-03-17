import { useState, useCallback, useRef, useEffect } from "react";
import {
  Globe,
  Play,
  FolderOpen,
  FileJson,
  FileSpreadsheet,
  Trash2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  HardDrive,
  Terminal,
  Zap,
  Link2,
  Eye,
  AlertCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ── Types ────────────────────────────────────────────────────────────────

interface ScrapedData {
  id: string;
  name: string;
  category: string;
  address: string;
  location: string;
  state: string;
  telephone: string;
  hotline: string;
  emailAddress: string;
  website: string;
}

interface ScraperConfig {
  delayMs: number;
  maxPages: number;
}

type ExportFormat = "json" | "xlsx" | "api";

interface SavedFile {
  id: string;
  name: string;
  format: ExportFormat;
  size: string;
  savedAt: Date;
  savedPath: string;
  data?: ScrapedData[];
}

type ScraperStatus = "idle" | "running" | "done" | "error";

// ── Helpers ──────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ── Component ────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 15;

export function ScraperInterface() {
  const [url, setUrl] = useState<string>(
    "https://trangvangvietnam.com/categories/484645/logistics-dich-vu-logistics.html",
  );
  const [previewPage, setPreviewPage] = useState(1);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [apiUrl, setApiUrl] = useState("");
  const [config, setConfig] = useState<ScraperConfig>({
    delayMs: 1000,
    maxPages: 100,
  });
  const [status, setStatus] = useState<ScraperStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [savePath, setSavePath] = useState<string>("");
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ScrapedData[] | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  const totalPreviewPages = previewData
    ? Math.ceil(previewData.length / ROWS_PER_PAGE)
    : 0;
  const paginatedData = previewData?.slice(
    (previewPage - 1) * ROWS_PER_PAGE,
    previewPage * ROWS_PER_PAGE,
  );

  useEffect(() => {
    window.electronAPI.getDefaultPath().then((value) => setSavePath(value));
  }, []);

  useEffect(() => {
    addLog("Đã chọn thư mục " + savePath);
  }, [savePath]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  const handleScrape = async (): Promise<void> => {
    if (!url) return;

    setStatus("running");
    setProgress(0);
    setLogs([]);
    setPreviewData(null);
    addLog(`Bắt đầu scrape: ${url}`);
    addLog(`Config: delay=${config.delayMs}ms, maxPages=${config.maxPages}`);

    try {
      const file = await window.electronAPI.startScrape(
        // ✅ Thêm await
        url,
        exportFormat,
        savePath,
        config,
      );

      const newFile: SavedFile = {
        id: generateId(),
        name: file.fileName,
        format: exportFormat,
        size: `${file.size ?? 0}`,
        savedAt: new Date(),
        savedPath: file.path,
        data: file.data,
      };

      setSavedFiles((prev) => [newFile, ...prev]);
      setPreviewData(file.data);
      setSelectedFileId(newFile.id);
      addLog(`Đã lưu: ${newFile.savedPath} (${newFile.size})`);
    } catch (err) {
      addLog(`Lỗi: ${err}`);
      setStatus("error");
      return;
    } finally {
      setStatus("done");
    }
  };

  const isValidUrl = url.length > 0;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white/90" style={{ fontSize: 16 }}>
              WebScraper <span className="text-violet-400">Pro</span>
            </h1>
            <p className="text-[11px] text-white/30 tracking-wide">
              Electron + React
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full ${
              status === "running"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : status === "done"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/5 text-white/40 border border-white/10"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === "running"
                  ? "bg-amber-400 animate-pulse"
                  : status === "done"
                    ? "bg-emerald-400"
                    : "bg-white/30"
              }`}
            />
            {status === "idle" && "Sẵn sàng"}
            {status === "running" && "Đang chạy..."}
            {status === "done" && "Hoàn tất"}
            {status === "error" && "Lỗi"}
          </span>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Controls */}
        <div className="w-[420px] min-w-[380px] border-r border-white/5 flex flex-col overflow-y-auto">
          {/* URL Section */}
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[12px] text-white/50 uppercase tracking-widest mb-2 block">
                Target URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>
            </div>

            {/* Export Format Toggle */}
            <div>
              <label className="text-[12px] text-white/50 uppercase tracking-widest mb-2 block">
                Định dạng xuất
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat("json")}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all border ${
                    exportFormat === "json"
                      ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                      : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => setExportFormat("xlsx")}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all border ${
                    exportFormat === "xlsx"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  XLSX
                </button>
                <button
                  onClick={() => setExportFormat("api")}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all border ${
                    exportFormat === "api"
                      ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                      : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  API
                </button>
              </div>
            </div>

            {exportFormat === "api" && (
              <div className="mt-3 space-y-2">
                <label className="text-[11px] text-white/30 uppercase tracking-widest font-medium">
                  API Endpoint
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded-md tracking-wider">
                      POST
                    </span>
                  </div>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="w-full h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white/70 text-[13px] placeholder:text-white/20 outline-none transition-all pl-16 pr-10
                      focus:border-sky-500/40 focus:bg-sky-500/[0.04] focus:text-white/90"
                  />
                  {apiUrl && (
                    <button
                      onClick={() => setApiUrl("")}
                      className="absolute right-3 text-white/20 hover:text-white/50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {apiUrl && !apiUrl.startsWith("http") && (
                  <p className="text-[11px] text-red-400/70 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    URL phải bắt đầu bằng http:// hoặc https://
                  </p>
                )}
              </div>
            )}

            {/* Save Path */}
            {exportFormat !== "api" && (
              <div>
                <label className="text-[12px] text-white/50 uppercase tracking-widest mb-2 block">
                  Thư mục lưu file
                </label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type="text"
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                    className="w-full h-10 pl-10 pr-20 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-3 py-1 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70 transition-all border border-white/[0.06]"
                    onClick={async () => {
                      const path = await window.electronAPI.selectFolder();
                      setSavePath(path);
                      addLog("Mở hộp thoại chọn thư mục...");
                    }}
                  >
                    Chọn...
                  </button>
                </div>
                <p className="text-[10px] text-white/20 mt-1.5 pl-1">
                  Trong Electron, nút "Chọn..." sẽ mở native file dialog
                </p>
              </div>
            )}
          </div>

          {/* Config Accordion */}
          <div className="px-5 pb-4">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-2 text-[12px]">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                Cấu hình nâng cao
              </div>
              {configOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <AnimatePresence>
              {configOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/40 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Delay (ms)
                      </label>
                      <input
                        type="number"
                        value={config.delayMs}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            delayMs: Number(e.target.value),
                          })
                        }
                        min="0"
                        step="100"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 focus:outline-none focus:border-violet-500/40 transition-all"
                        style={{
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/40 flex items-center gap-1.5">
                        <Layers className="w-3 h-3" />
                        Max Pages
                      </label>
                      <input
                        type="number"
                        value={config.maxPages}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            maxPages: Number(e.target.value),
                          })
                        }
                        min="1"
                        max="100"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 focus:outline-none focus:border-violet-500/40 transition-all"
                        style={{
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Run Button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleScrape}
              disabled={status === "running" || !isValidUrl}
              className="group w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background:
                  status === "running"
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                border:
                  status === "running"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "none",
                color: "white",
                boxShadow:
                  status === "running"
                    ? "none"
                    : "0 4px 20px rgba(124,58,237,0.3)",
              }}
            >
              {status === "running" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                  <span className="text-white/70">Đang scrape...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Bắt đầu Scrape
                </>
              )}
            </button>

            {status === "running" && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Đang xử lý...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Log Console */}
          <div className="flex-1 flex flex-col border-t border-white/5">
            <div className="flex items-center gap-2 px-5 py-2.5 text-[11px] text-white/30 uppercase tracking-widest">
              <Terminal className="w-3 h-3" />
              Console
            </div>
            <div
              ref={logRef}
              className="flex-1 px-5 pb-4 overflow-y-auto max-h-[200px] space-y-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {logs.length === 0 ? (
                <p className="text-[11px] text-white/15 italic">
                  Chưa có log nào...
                </p>
              ) : (
                logs.map((log, i) => (
                  <p
                    key={i}
                    className="text-[11px] text-white/40 leading-relaxed"
                  >
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Files & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Saved Files Section */}
          <div className="border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-[12px] text-white/50 uppercase tracking-widest">
                <HardDrive className="w-3.5 h-3.5" />
                File đã lưu ({savedFiles.length})
              </div>
              {savedFiles.length > 0 && (
                <button
                  onClick={() => {
                    setSavedFiles([]);
                    setSelectedFileId(null);
                    setPreviewData(null);
                    addLog("Đã xoá toàn bộ danh sách file.");
                  }}
                  className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Xoá tất cả
                </button>
              )}
            </div>

            {savedFiles.length === 0 ? (
              <div className="px-6 pb-6 pt-2">
                <div className="border border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-white/15" />
                  </div>
                  <p className="text-[13px] text-white/25">Chưa có file nào</p>
                  <p className="text-[11px] text-white/15 mt-1">
                    Nhập URL và bấm "Bắt đầu Scrape" để tạo và lưu file
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-4 space-y-2 max-h-[240px] overflow-y-auto">
                <AnimatePresence>
                  {savedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedFileId === file.id
                          ? "bg-violet-500/[0.08] border-violet-500/20"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                      }`}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        setPreviewData(file.data ?? null);
                        setPreviewPage(1);
                      }}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          file.format === "json"
                            ? "bg-violet-500/15 text-violet-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {file.format === "json" ? (
                          <FileJson className="w-4 h-4" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12px] text-white/80 truncate"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {file.name}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {file.size} &middot; Đã lưu lúc{" "}
                          {file.savedAt.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                        <p
                          className="text-[10px] text-white/20 mt-0.5 truncate"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {file.savedPath}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInFolder(file);
                          }}
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
                          title="Mở thư mục chứa file"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Xoá khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 text-[12px] text-white/50 uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5" />
              Xem trước dữ liệu
            </div>

            <div className="flex-1 px-6 pb-6 overflow-auto">
              {previewData ? (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                          {[
                            "#",
                            "Tên công ty",
                            "Danh mục",
                            "Địa chỉ",
                            "Tỉnh/TP",
                            "SĐT",
                            "Hotline",
                            "Email",
                            "Website",
                          ].map((col) => (
                            <th
                              key={col}
                              className="text-left text-[11px] text-white/40 px-4 py-2.5 uppercase tracking-wider whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData?.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="text-[11px] text-white/25 px-4 py-2.5 tabular-nums">
                              {(previewPage - 1) * ROWS_PER_PAGE + i + 1}
                            </td>
                            <td className="text-[12px] text-white/70 px-4 py-2.5 max-w-[180px] truncate">
                              {row.name}
                            </td>
                            <td className="text-[11px] text-white/50 px-4 py-2.5 max-w-[140px] truncate">
                              {row.category}
                            </td>
                            <td className="text-[11px] text-white/50 px-4 py-2.5 max-w-[180px] truncate">
                              {row.address}
                            </td>
                            <td className="text-[11px] text-white/50 px-4 py-2.5 whitespace-nowrap">
                              {row.location}
                            </td>
                            <td
                              className="text-[11px] text-white/50 px-4 py-2.5 whitespace-nowrap"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {row.telephone}
                            </td>
                            <td
                              className="text-[11px] text-white/50 px-4 py-2.5 whitespace-nowrap"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {row.hotline}
                            </td>
                            <td
                              className="text-[11px] text-violet-400/70 px-4 py-2.5 max-w-[160px] truncate"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {row.emailAddress}
                            </td>
                            <td
                              className="text-[11px] text-sky-400/70 px-4 py-2.5 max-w-[160px] truncate"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              <a
                                href={row.website}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-sky-300 transition-colors"
                              >
                                {row.website}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06]">
                    <span className="text-[11px] text-white/30">
                      Trang {previewPage} / {totalPreviewPages} ·{" "}
                      {previewData.length} kết quả
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setPreviewPage((p) => Math.max(1, p - 1))
                        }
                        disabled={previewPage === 1}
                        className="px-3 py-1 rounded-lg text-[11px] bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        ← Trước
                      </button>
                      {(() => {
                        const delta = 2;
                        const start = Math.max(1, previewPage - delta);
                        const end = Math.min(
                          totalPreviewPages,
                          previewPage + delta,
                        );

                        return Array.from(
                          { length: end - start + 1 },
                          (_, i) => {
                            const page = start + i;
                            return (
                              <button
                                key={page}
                                onClick={() => setPreviewPage(page)}
                                className={`w-7 h-7 rounded-lg text-[11px] transition-all border ${
                                  previewPage === page
                                    ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                                    : "bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-white/[0.08]"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          },
                        );
                      })()}
                      <button
                        onClick={() =>
                          setPreviewPage((p) =>
                            Math.min(totalPreviewPages, p + 1),
                          )
                        }
                        disabled={previewPage === totalPreviewPages}
                        className="px-3 py-1 rounded-lg text-[11px] bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
                    <FileJson className="w-7 h-7 text-white/10" />
                  </div>
                  <p className="text-[13px] text-white/20">
                    Chưa có dữ liệu để xem trước
                  </p>
                  <p className="text-[11px] text-white/10 mt-1 max-w-[280px]">
                    Dữ liệu sẽ hiển thị ở đây sau khi scrape xong. Bạn có thể
                    click vào file trong danh sách để xem lại.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
