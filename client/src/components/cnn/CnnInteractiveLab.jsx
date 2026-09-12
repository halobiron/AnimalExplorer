import { useState } from "react";
import { Sparkles, Layers, Cpu, ArrowLeft, ChevronRight } from "lucide-react";
import CnnArchitectureMap from "./CnnArchitectureMap";
import CnnStage1Input from "./CnnStage1Input";
import CnnStage2Preprocess from "./CnnStage2Preprocess";
import CnnStage3Convolution from "./CnnStage3Convolution";
import CnnStage4Pooling from "./CnnStage4Pooling";
import CnnStage5Softmax from "./CnnStage5Softmax";
import CnnStage6Gradcam from "./CnnStage6Gradcam";
import CnnImprovedArchitectures from "./CnnImprovedArchitectures";

const CnnInteractiveLab = ({
  result,
  previewUrl,
  currentStep = 1,
  onStepChange,
  isRunning = false,
  selectedGradcamLayer,
  onGradcamLayerChange,
  loadingGradcam = false,
}) => {
  const [labMode, setLabMode] = useState("pipeline"); // 'pipeline' | 'architectures'

  const renderStageContent = () => {
    switch (currentStep) {
      case 1:
        return <CnnStage1Input previewUrl={previewUrl} />;
      case 2:
        return <CnnStage2Preprocess previewUrl={previewUrl} cnnDemo={result?.cnnDemo} />;
      case 3:
        return <CnnStage3Convolution previewUrl={previewUrl} cnnDemo={result?.cnnDemo} />;
      case 4:
        return <CnnStage4Pooling previewUrl={previewUrl} />;
      case 5:
        return <CnnStage5Softmax result={result} cnnDemo={result?.cnnDemo} />;
      case 6:
        return (
          <CnnStage6Gradcam
            result={result}
            previewUrl={previewUrl}
            selectedGradcamLayer={selectedGradcamLayer}
            onGradcamLayerChange={onGradcamLayerChange}
            loadingGradcam={loadingGradcam}
          />
        );
      default:
        return <CnnStage1Input previewUrl={previewUrl} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Level Mode Selector: Pipeline vs Advanced Architectures ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLabMode("pipeline")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              labMode === "pipeline"
                ? "bg-white text-emerald-950 shadow-sm shadow-black/5 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quy Trình 6 Giai Đoạn CNN</span>
          </button>

          <button
            type="button"
            onClick={() => setLabMode("architectures")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              labMode === "architectures"
                ? "bg-white text-indigo-950 shadow-sm shadow-black/5 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tiến Hóa Kiến Trúc (VGG · ResNet · Inception)</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 px-2.5 py-1 bg-white/70 rounded-xl border border-slate-200/60">
          <Cpu className="w-3 h-3 text-indigo-500" />
          Interactive Lab
        </span>
      </div>

      {/* ── View 1: 6-Stage Interactive CNN Pipeline ── */}
      {labMode === "pipeline" && (
        <div className="space-y-4 animate-fade-in">
          {/* 6-Stage Architecture Flow Map */}
          <CnnArchitectureMap
            currentStep={currentStep}
            onSelectStep={onStepChange}
            isRunning={isRunning}
          />

          {/* Active Stage Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm transition-all duration-300 relative overflow-hidden">
            <div key={currentStep} className="animate-fade-in">
              {renderStageContent()}
            </div>
          </div>

          {/* Quick footer callout to switch to Architecture Exploration without stretching the page */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/70 rounded-2xl border border-indigo-100/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-gray-700 font-medium">
                Tìm hiểu cơ chế giải quyết giới hạn CNN qua <strong>VGG, ResNet &amp; Inception</strong>:
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLabMode("architectures")}
              className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm transition hover:scale-105"
            >
              <span>Khám phá ngay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── View 2: Advanced Deep Learning Architecture Evolution ── */}
      {labMode === "architectures" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setLabMode("pipeline")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Quy trình 6 bước</span>
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Chuyên đề phân tích so sánh các kiến trúc CNN kinh điển
            </span>
          </div>

          <CnnImprovedArchitectures />
        </div>
      )}
    </div>
  );
};

export default CnnInteractiveLab;
