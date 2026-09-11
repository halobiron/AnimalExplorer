import CnnArchitectureMap from "./CnnArchitectureMap";
import CnnStage1Input from "./CnnStage1Input";
import CnnStage2Preprocess from "./CnnStage2Preprocess";
import CnnStage3Convolution from "./CnnStage3Convolution";
import CnnStage4Pooling from "./CnnStage4Pooling";
import CnnStage5Softmax from "./CnnStage5Softmax";
import CnnStage6Gradcam from "./CnnStage6Gradcam";

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
    <div className="space-y-5">
      {/* 6-Stage Interactive Map */}
      <CnnArchitectureMap
        currentStep={currentStep}
        onSelectStep={onStepChange}
        isRunning={isRunning}
      />

      {/* Stage Container Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm transition-all duration-300 relative overflow-hidden">
        {/* Dynamic Stage View */}
        <div key={currentStep} className="animate-fade-in">
          {renderStageContent()}
        </div>
      </div>
    </div>
  );
};

export default CnnInteractiveLab;
