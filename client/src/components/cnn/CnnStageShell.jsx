import { useState } from "react";
import { Eye, BookOpen, Code2, Copy, Check, ChevronRight, Cpu, Layers, Braces, Network } from "lucide-react";
import toast from "react-hot-toast";

export default function CnnStageShell({
  stageId,
  stageTitle,
  stageDesc,
  badgeTag,
  icon: StageIcon,
  simView,
  theoryView,
  codeData,
}) {
  const [subTab, setSubTab] = useState("sim"); // 'sim' | 'theory' | 'code'
  const [activeFw, setActiveFw] = useState("numpy");
  const [copied, setCopied] = useState(false);

  const currentFw = codeData?.frameworks?.[activeFw] || codeData?.frameworks?.numpy;

  const handleCopy = () => {
    if (!currentFw?.code) return;
    navigator.clipboard.writeText(currentFw.code);
    setCopied(true);
    toast.success("Đã sao chép mã nguồn!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── Top Unified Control Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <StageIcon className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900">{stageTitle}</span>
              {badgeTag && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  {badgeTag}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 line-clamp-1">{stageDesc}</p>
          </div>
        </div>

        {/* Segmented Control Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab("sim")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "sim"
                ? "bg-white text-emerald-950 shadow-sm shadow-black/5 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trực quan</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("theory")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "theory"
                ? "bg-white text-emerald-950 shadow-sm shadow-black/5 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nguyên lý &amp; Cơ chế</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "code"
                ? "bg-white text-emerald-950 shadow-sm shadow-black/5 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Mã nguồn 3 cách</span>
          </button>
        </div>
      </div>

      {/* ── Sub-view 1: Interactive Live Simulation ── */}
      {subTab === "sim" && (
        <div className="space-y-4 animate-fade-in">
          {simView}

          {/* Quick interactive shortcut bar at bottom of simulation */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-700">Mã nguồn kiểm tra:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveFw("numpy");
                  setSubTab("code");
                }}
                className="font-mono text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition font-bold"
              >
                NumPy (Scratch)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFw("keras");
                  setSubTab("code");
                }}
                className="font-mono text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 transition font-bold"
              >
                Keras / TF
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFw("pytorch");
                  setSubTab("code");
                }}
                className="font-mono text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition font-bold"
              >
                PyTorch
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSubTab("theory")}
              className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
            >
              <span>Xem nguyên lý &amp; kiến trúc</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── Sub-view 2: Pedagogical Theory ── */}
      {subTab === "theory" && (
        <div className="space-y-4 animate-fade-in">
          {theoryView}
        </div>
      )}

      {/* ── Sub-view 3: 3 Frameworks Code Comparison ── */}
      {subTab === "code" && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4 animate-fade-in shadow-lg">
          {/* Framework Tab switcher & File Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveFw("numpy")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFw === "numpy"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Braces className="w-3.5 h-3.5" />
                <span>NumPy (Scratch)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFw("keras")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFw === "keras"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>TensorFlow / Keras</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFw("pytorch")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFw === "pytorch"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>PyTorch</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentFw?.file}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã chép" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Concept Header */}
          {codeData?.concept && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Cách làm &amp; Cơ chế: </strong>
              {codeData.concept}
            </div>
          )}

          {/* Code Block */}
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed max-h-80">
            <code>{currentFw?.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
