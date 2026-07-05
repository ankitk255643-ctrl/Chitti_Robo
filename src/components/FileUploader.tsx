import React, { useState, useRef } from "react";
import { UploadCloud, File, Image, CheckCircle2, AlertCircle, X } from "lucide-react";
import { AttachedFile } from "../types";

interface FileUploaderProps {
  onFileLoaded: (file: AttachedFile | null) => void;
  attachedFile: AttachedFile | null;
}

export default function FileUploader({
  onFileLoaded,
  attachedFile,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64Content = result.split(",")[1] || result;
      
      const filePayload: AttachedFile = {
        name: file.name,
        type: file.type || "application/octet-stream",
        base64: base64Content,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: result,
      };
      
      onFileLoaded(filePayload);
    };
    reader.onerror = (err) => {
      console.error("FileReader failed content generation", err);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileLoaded(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div id="file-uploader-container" className="w-full">
      {attachedFile ? (
        // File attached badge
        <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/20 border border-cyan-900 text-sm font-mono text-cyan-400">
          <div className="flex items-center gap-2.5 truncate max-w-[85%]">
            {attachedFile.type.startsWith("image/") ? (
              <img 
                src={attachedFile.url} 
                alt="Upload preview" 
                className="w-10 h-10 object-cover rounded-lg border border-cyan-800"
              />
            ) : (
              <div className="p-2 bg-gray-900 rounded-lg border border-gray-800">
                <File className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div className="truncate text-left">
              <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{attachedFile.name}</p>
              <p className="text-[10px] text-gray-400">{attachedFile.size} • {attachedFile.type.split("/")[1] || 'generic'}</p>
            </div>
          </div>
          <button 
            onClick={clearFile}
            className="p-1.5 hover:bg-cyan-900/30 rounded-lg text-gray-400 hover:text-white transition"
            title="Dismount attachment"
            id="clear-attachment-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Interaction Panel
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border border-dashed p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 select-none
            ${dragActive 
              ? "border-cyan-400 bg-cyan-950/10 text-cyan-400" 
              : "border-gray-800 hover:border-gray-700 bg-slate-950/20 text-gray-400 hover:text-gray-300"}
          `}
          id="file-uploader-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,text/*,.docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <UploadCloud className="w-6 h-6 text-gray-500 mb-1.5 animate-bounce" />
          <span className="text-xs font-mono font-medium block">
            Drag files here or <span className="text-cyan-400 font-bold underline group-hover:text-cyan-300">Browse</span>
          </span>
          <span className="text-[9px] text-gray-500 block mt-1">Accepts images, Word files (.docx, .doc), PDFs, and text (Max 10MB)</span>
        </div>
      )}
    </div>
  );
}
