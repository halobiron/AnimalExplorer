import { useCallback, useState, useEffect } from "react";
import { UploadCloud, X, ImageIcon, CheckCircle2 } from "lucide-react";

const UploadBox = ({ onFileSelect, disabled = false, initialFile = null }) => {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  // Update preview when initialFile changes (from camera)
  useEffect(() => {
    if (initialFile) {
      setPreview(URL.createObjectURL(initialFile));
      setFileName(initialFile.name);
    }
  }, [initialFile]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const clearPreview = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    onFileSelect(null);
  };

  const containerClass = [
    "relative flex flex-col items-center justify-center w-full min-h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden",
    dragging
      ? "border-green-500 bg-green-50 scale-[1.01]"
      : preview
        ? "border-green-400 bg-green-50/50"
        : "border-gray-200 bg-gray-50 hover:bg-green-50/60 hover:border-green-400",
    disabled ? "opacity-60 pointer-events-none" : "",
  ].join(" ");

  return (
    <label
      className={containerClass}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={disabled} />

      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full h-full object-contain rounded-2xl p-2 max-h-72" />
          {!disabled && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-white text-xs truncate font-medium">{fileName}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${dragging ? "bg-green-200 scale-110" : "bg-green-100"}`}>
            <UploadCloud className={`w-8 h-8 transition-colors ${dragging ? "text-green-600" : "text-green-500"}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              {dragging ? "Thả ảnh vào đây!" : "Kéo thả ảnh vào đây"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              hoặc <span className="text-green-600 font-semibold underline underline-offset-2">chọn file</span> từ máy tính
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            <ImageIcon className="w-3 h-3" />
            <span>JPG · PNG · WEBP · GIF</span>
          </div>
        </div>
      )}
    </label>
  );
};

export default UploadBox;
