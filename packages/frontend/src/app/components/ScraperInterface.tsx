import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Globe,
  Play,
  FolderOpen,
  FileJson,
  FileSpreadsheet,
  Save,
  Trash2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  HardDrive,
  Terminal,
  Zap,
  Link2,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

// ── Types ────────────────────────────────────────────────────────────────

interface ScrapedData {
  title: string;
  url: string;
  content: string;
  timestamp: string;
}

interface ScraperConfig {
  delayMs: number;
  maxPages: number;
}

type ExportFormat = 'json' | 'xlsx';

interface TempFile {
  id: string;
  name: string;
  format: ExportFormat;
  size: string;
  createdAt: Date;
  data: ScrapedData[];
}

type ScraperStatus = 'idle' | 'running' | 'done' | 'error';

// ── Helpers ──────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ── Component ────────────────────────────────────────────────────────────

export function ScraperInterface() {
  const [url, setUrl] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [config, setConfig] = useState<ScraperConfig>({ delayMs: 1000, maxPages: 10 });
  const [status, setStatus] = useState<ScraperStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [savePath, setSavePath] = useState<string>('~/Downloads');
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ScrapedData[] | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  const handleScrape = async (): Promise<void> => {
    if (!url) return;

    setStatus('running');
    setProgress(0);
    setLogs([]);
    setPreviewData(null);
    addLog(`Bắt đầu scrape: ${url}`);
    addLog(`Config: delay=${config.delayMs}ms, maxPages=${config.maxPages}`);

    const totalSteps = config.maxPages;

    for (let i = 0; i < totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(Math.round(((i + 1) / totalSteps) * 100));
      addLog(`Đang crawl trang ${i + 1}/${totalSteps}...`);
    }

    await new Promise((r) => setTimeout(r, 500));

    const mockData: ScrapedData[] = Array.from({ length: config.maxPages }, (_, i) => ({
      title: `Page ${i + 1} — ${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}`,
      url: `${url.startsWith('http') ? url : `https://${url}`}/page-${i + 1}`,
      content: `Extracted content from page ${i + 1}. Lorem ipsum dolor sit amet...`,
      timestamp: new Date().toISOString(),
    }));

    const fileSize =
      exportFormat === 'json'
        ? formatBytes(new Blob([JSON.stringify(mockData, null, 2)]).size)
        : formatBytes(mockData.length * 120);

    const newFile: TempFile = {
      id: generateId(),
      name: `scrape-${Date.now()}.${exportFormat}`,
      format: exportFormat,
      size: fileSize,
      createdAt: new Date(),
      data: mockData,
    };

    setTempFiles((prev) => [newFile, ...prev]);
    setSelectedFileId(newFile.id);
    setPreviewData(mockData);
    addLog(`Hoàn tất! Đã lưu tạm ${newFile.name} (${fileSize})`);
    setStatus('done');
  };

  const handleSaveFile = (file: TempFile): void => {
    if (file.format === 'json') {
      const jsonString = JSON.stringify(file.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadBlob(blob, file.name);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(file.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');
      XLSX.writeFile(workbook, file.name);
    }
    addLog(`Đã lưu file ${file.name} → ${savePath}`);
  };

  const handleDeleteFile = (id: string): void => {
    setTempFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
      setPreviewData(null);
    }
    addLog('Đã xoá file tạm.');
  };

  const downloadBlob = (blob: Blob, filename: string): void => {
    const u = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(u);
  };

  const isValidUrl = url.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
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
            <p className="text-[11px] text-white/30 tracking-wide">Electron + React</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full ${
              status === 'running'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : status === 'done'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'running'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'done'
                    ? 'bg-emerald-400'
                    : 'bg-white/30'
              }`}
            />
            {status === 'idle' && 'Sẵn sàng'}
            {status === 'running' && 'Đang chạy...'}
            {status === 'done' && 'Hoàn tất'}
            {status === 'error' && 'Lỗi'}
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
                  style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
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
                  onClick={() => setExportFormat('json')}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all border ${
                    exportFormat === 'json'
                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => setExportFormat('xlsx')}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all border ${
                    exportFormat === 'xlsx'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  XLSX
                </button>
              </div>
            </div>

            {/* Save Path */}
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
                  style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-3 py-1 rounded-lg bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70 transition-all border border-white/[0.06]"
                  onClick={() => {
                    // In Electron: dialog.showOpenDialog({ properties: ['openDirectory'] })
                    addLog('Mở hộp thoại chọn thư mục... (Electron only)');
                  }}
                >
                  Chọn...
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-1.5 pl-1">
                Trong Electron, nút "Chọn..." sẽ mở native file dialog
              </p>
            </div>
          </div>

          {/* Config Accordion */}
          <div className="px-5 pb-4">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-2 text-[12px]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                Cấu hình nâng cao
              </div>
              {configOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <AnimatePresence>
              {configOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
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
                        onChange={(e) => setConfig({ ...config, delayMs: Number(e.target.value) })}
                        min="0"
                        step="100"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 focus:outline-none focus:border-violet-500/40 transition-all"
                        style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
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
                        onChange={(e) => setConfig({ ...config, maxPages: Number(e.target.value) })}
                        min="1"
                        max="100"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 focus:outline-none focus:border-violet-500/40 transition-all"
                        style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
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
              disabled={status === 'running' || !isValidUrl}
              className="group w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background:
                  status === 'running'
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: status === 'running' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                color: 'white',
                boxShadow: status === 'running' ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
              }}
            >
              {status === 'running' ? (
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

            {/* Progress */}
            {status === 'running' && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Đang xử lý...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
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
                <p className="text-[11px] text-white/15 italic">Chưa có log nào...</p>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className="text-[11px] text-white/40 leading-relaxed">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Files & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Temp Files Section */}
          <div className="border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-[12px] text-white/50 uppercase tracking-widest">
                <HardDrive className="w-3.5 h-3.5" />
                File tạm ({tempFiles.length})
              </div>
              {tempFiles.length > 0 && (
                <button
                  onClick={() => {
                    setTempFiles([]);
                    setSelectedFileId(null);
                    setPreviewData(null);
                    addLog('Đã xoá tất cả file tạm.');
                  }}
                  className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Xoá tất cả
                </button>
              )}
            </div>

            {tempFiles.length === 0 ? (
              <div className="px-6 pb-6 pt-2">
                <div className="border border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-white/15" />
                  </div>
                  <p className="text-[13px] text-white/25">Chưa có file nào</p>
                  <p className="text-[11px] text-white/15 mt-1">
                    Nhập URL và bấm "Bắt đầu Scrape" để tạo file
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-4 space-y-2 max-h-[240px] overflow-y-auto">
                <AnimatePresence>
                  {tempFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedFileId === file.id
                          ? 'bg-violet-500/[0.08] border-violet-500/20'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                      }`}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        setPreviewData(file.data);
                      }}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          file.format === 'json'
                            ? 'bg-violet-500/15 text-violet-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {file.format === 'json' ? (
                          <FileJson className="w-4 h-4" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/80 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {file.size} &middot;{' '}
                          {file.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveFile(file);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          title="Lưu file"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Xoá file tạm"
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
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                        <th className="text-left text-[11px] text-white/40 px-4 py-2.5 uppercase tracking-wider">
                          #
                        </th>
                        <th className="text-left text-[11px] text-white/40 px-4 py-2.5 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="text-left text-[11px] text-white/40 px-4 py-2.5 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="text-left text-[11px] text-white/40 px-4 py-2.5 uppercase tracking-wider">
                          Content
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="text-[11px] text-white/25 px-4 py-2.5 tabular-nums">{i + 1}</td>
                          <td className="text-[12px] text-white/70 px-4 py-2.5 max-w-[200px] truncate">
                            {row.title}
                          </td>
                          <td
                            className="text-[11px] text-violet-400/70 px-4 py-2.5 max-w-[200px] truncate"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {row.url}
                          </td>
                          <td className="text-[11px] text-white/40 px-4 py-2.5 max-w-[250px] truncate">
                            {row.content}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
                    <FileJson className="w-7 h-7 text-white/10" />
                  </div>
                  <p className="text-[13px] text-white/20">Chưa có dữ liệu để xem trước</p>
                  <p className="text-[11px] text-white/10 mt-1 max-w-[280px]">
                    Dữ liệu sẽ hiển thị ở đây sau khi scrape xong. Bạn có thể click vào file tạm để xem lại.
                  </p>
                </div>
              )}
            </div>

            {/* Save Selected File Bar */}
            {selectedFileId && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-6 mb-5 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(124,58,237,0.04) 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-[12px] text-white/70">
                      Sẵn sàng lưu tới{' '}
                      <span className="text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {savePath}
                      </span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      File đang nằm trong thư mục tạm, bấm "Lưu file" để chuyển
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const file = tempFiles.find((f) => f.id === selectedFileId);
                    if (file) handleSaveFile(file);
                  }}
                  className="h-9 px-5 rounded-lg flex items-center gap-2 text-[12px] text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 2px 12px rgba(16,185,129,0.25)',
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu file
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
