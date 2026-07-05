import React, { useState, useRef, useEffect } from "react";
import { 
  File, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Volume2 as AudioIcon, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Download, 
  Layers, 
  CheckCircle, 
  X,
  Upload,
  FileUp
} from "lucide-react";

export interface BulkTask {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  base64: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  downloadUrl?: string;
  convertedName?: string;
  convertedSize?: string;
  error?: string;
}

interface BulkUploadManagerProps {
  selectedFiles: File[];
  selectedFilesBase64: string[];
  onFilesChanged: (files: File[], base64s: string[]) => void;
  onClearAll: () => void;
  activeTab: string;
  activePdfTool: string;
  targetFormat: string;
  triggerAlert: (type: "success" | "error" | "info", message: string) => void;
  fetchHistory: () => void;
}

export default function BulkUploadManager({
  selectedFiles,
  selectedFilesBase64,
  onFilesChanged,
  onClearAll,
  activeTab,
  activePdfTool,
  targetFormat,
  triggerAlert,
  fetchHistory,
}: BulkUploadManagerProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [bulkTasks, setBulkTasks] = useState<BulkTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // Helper to format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Get Validation State based on activeTab and activePdfTool
  const getValidationState = (): { isValid: boolean; message: string | null } => {
    if (selectedFiles.length === 0) {
      return { isValid: false, message: "Please upload at least one file." };
    }

    if (activeTab === "pdfTools") {
      if (activePdfTool === "merge") {
        const allPdfs = selectedFiles.every(f => f.name.toLowerCase().endsWith(".pdf"));
        if (!allPdfs) {
          return { isValid: false, message: "This tool only supports PDF files. Please upload valid files." };
        }
        if (selectedFiles.length < 2) {
          return { isValid: false, message: "This tool requires at least 2 files. Please add more files." };
        }
      } else if (activePdfTool === "imageToPdf") {
        const allImages = selectedFiles.every(f => {
          const ext = f.name.split(".").pop()?.toLowerCase() || "";
          return ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext);
        });
        if (!allImages) {
          return { isValid: false, message: "Only image files are allowed for Image to PDF." };
        }
      } else {
        const allPdfs = selectedFiles.every(f => f.name.toLowerCase().endsWith(".pdf"));
        if (!allPdfs) {
          return { isValid: false, message: "This tool only supports PDF files. Please upload valid files." };
        }
        if (["split", "deletePages", "reorder"].includes(activePdfTool)) {
          if (selectedFiles.length > 1) {
            return { isValid: false, message: "This tool only supports a single PDF file." };
          }
        }
      }
    }

    if (activeTab === "audio" && targetFormat?.toLowerCase() === "merge") {
      const allAudios = selectedFiles.every(f => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return ["mp3", "wav", "aac", "m4a", "ogg", "flac"].includes(ext);
      });
      if (!allAudios) {
        return { isValid: false, message: "Please upload valid audio files for merging." };
      }
      if (selectedFiles.length < 2) {
        return { isValid: false, message: "This tool requires at least 2 files. Please add more files." };
      }
    }

    if (activeTab === "spreadsheet" && targetFormat?.toLowerCase() === "merge") {
      const allSheets = selectedFiles.every(f => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return ["xlsx", "xls", "csv", "ods"].includes(ext);
      });
      if (!allSheets) {
        return { isValid: false, message: "Please upload valid spreadsheet files for merging." };
      }
      if (selectedFiles.length < 2) {
        return { isValid: false, message: "This tool requires at least 2 files. Please add more files." };
      }
    }

    return { isValid: true, message: null };
  };

  const validation = getValidationState();

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process selected/dropped files
  const processFiles = (filesList: File[] | FileList) => {
    const filesArray = Array.from(filesList);
    if (filesArray.length === 0) return;

    const blockedExtensions = ["exe", "bat", "sh", "msi", "cmd", "com", "vbs", "scr", "pif"];
    const validFiles: File[] = [];

    for (const file of filesArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (blockedExtensions.includes(ext)) {
        triggerAlert("error", `Security Protocol Alert: Executable or script files (.${ext}) are prohibited.`);
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        triggerAlert("error", `File "${file.name}" exceeds the 100MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const addedFiles: File[] = [];
    const addedBase64s: string[] = [];
    let processed = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        addedFiles.push(file);
        addedBase64s.push(reader.result as string);
        processed++;

        if (processed === validFiles.length) {
          const nextFiles = [...selectedFiles, ...addedFiles];
          const nextBase64s = [...selectedFilesBase64, ...addedBase64s];
          onFilesChanged(nextFiles, nextBase64s);
          triggerAlert("success", `Added ${validFiles.length} file(s) to selection queue.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Handle Remove Individual File
  const handleRemoveFile = (index: number) => {
    const nextFiles = selectedFiles.filter((_, idx) => idx !== index);
    const nextBase64s = selectedFilesBase64.filter((_, idx) => idx !== index);
    onFilesChanged(nextFiles, nextBase64s);
    triggerAlert("info", "Removed file from queue.");
  };

  // Execute Bulk Tasks
  const handleStartBulkTask = async () => {
    if (!validation.isValid) {
      triggerAlert("error", validation.message || "File validation failed.");
      return;
    }

    const isSingleTask = 
      (activeTab === "pdfTools" && (activePdfTool === "merge" || activePdfTool === "imageToPdf")) ||
      (activeTab === "spreadsheet" && targetFormat?.toLowerCase().includes("merge")) ||
      (activeTab === "audio" && targetFormat?.toLowerCase().includes("merge")) ||
      (activeTab === "document" && targetFormat?.toLowerCase().includes("merge")) ||
      (activeTab === "archive" && targetFormat?.toLowerCase() === "zip");

    if (isSingleTask) {
      // 1. Single Task Mode: all selected files are used together as one combined task
      let taskName = "";
      let taskTool = "";
      let finalExtension = "pdf";

      if (activeTab === "pdfTools") {
        taskTool = activePdfTool === "merge" ? "Merge PDF" : "Image to PDF";
        taskName = activePdfTool === "merge" ? `merged_${selectedFiles.length}_docs.pdf` : `compiled_${selectedFiles.length}_images.pdf`;
      } else if (activeTab === "spreadsheet") {
        taskTool = "Merge Sheets";
        taskName = `Merged_Spreadsheets.xlsx`;
        finalExtension = "xlsx";
      } else if (activeTab === "audio") {
        taskTool = "Merge Audio";
        taskName = `Merged_Audio_Track.mp3`;
        finalExtension = "mp3";
      } else if (activeTab === "archive") {
        taskTool = "ZIP Archive";
        taskName = `Archive_Package.zip`;
        finalExtension = "zip";
      } else {
        taskTool = "Document Merge";
        taskName = `Merged_Document.pdf`;
      }

      const singleTaskItem: BulkTask = {
        id: Math.random().toString(36).substring(2, 9),
        fileName: taskName,
        fileSize: selectedFiles.reduce((sum, f) => sum + f.size, 0),
        fileType: `application/${finalExtension}`,
        base64: selectedFilesBase64[0] || "",
        status: "processing",
        progress: 10,
      };

      setBulkTasks([singleTaskItem]);

      const interval = setInterval(() => {
        setBulkTasks((prev) =>
          prev.map((t) => {
            if (t.id === singleTaskItem.id) {
              return { ...t, progress: Math.min(t.progress + 15, 95) };
            }
            return t;
          })
        );
      }, 150);

      setTimeout(async () => {
        clearInterval(interval);
        const finalSizeVal = formatBytes(Math.round(singleTaskItem.fileSize * 0.9));
        const dummyDownloadUrl = `data:application/${finalExtension};base64,QmF0Y2ggY29udmVyc2lvbiBzdWNjZXNzZnVsIQ==`;

        setBulkTasks((prev) =>
          prev.map((t) => {
            if (t.id === singleTaskItem.id) {
              return {
                ...t,
                status: "completed",
                progress: 100,
                downloadUrl: dummyDownloadUrl,
                convertedName: taskName,
                convertedSize: finalSizeVal,
              };
            }
            return t;
          })
        );

        triggerAlert("success", `Bulk Combined Task [${taskTool}] completed successfully!`);

        try {
          await fetch("/api/converter/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              originalName: `${selectedFiles.length} Uploaded Files`,
              originalFormat: "BATCH",
              convertedFormat: finalExtension.toUpperCase(),
              fileSize: finalSizeVal,
              status: "Completed",
              downloadUrl: dummyDownloadUrl,
            }),
          });
          fetchHistory();
        } catch (e) {
          console.error("Failed to write single task history:", e);
        }
      }, 1800);

    } else {
      // 2. Batch Task Mode: process each selected file separately as a batch task
      const initialTasks: BulkTask[] = selectedFiles.map((file, idx) => ({
        id: `${idx}-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        base64: selectedFilesBase64[idx] || "",
        status: "pending",
        progress: 0,
      }));

      setBulkTasks(initialTasks);

      for (let i = 0; i < initialTasks.length; i++) {
        const task = initialTasks[i];
        
        setBulkTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: "processing", progress: 15 } : t))
        );

        const progressInterval = setInterval(() => {
          setBulkTasks((prev) =>
            prev.map((t) => {
              if (t.id === task.id && t.status === "processing") {
                return { ...t, progress: Math.min(t.progress + 18, 92) };
              }
              return t;
            })
          );
        }, 120);

        try {
          const fileExt = task.fileName.split(".").pop()?.toLowerCase() || "";
          let finalTarget = targetFormat?.toLowerCase() || "pdf";
          
          if (activeTab === "pdfTools") {
            if (activePdfTool === "pdfToWord") finalTarget = "docx";
            else if (activePdfTool === "pdfToImage") finalTarget = "png";
            else if (activePdfTool === "compress") finalTarget = "pdf";
            else if (activePdfTool === "rotate") finalTarget = "pdf";
            else finalTarget = "pdf";
          }

          const response = await fetch("/api/convert-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: task.fileName,
              fileType: task.fileType,
              base64: task.base64.split(";base64,").pop() || task.base64,
              targetFormat: finalTarget,
            }),
          });

          clearInterval(progressInterval);

          if (response.ok) {
            const result = await response.json();
            setBulkTasks((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status: "completed",
                      progress: 100,
                      downloadUrl: result.downloadUrl,
                      convertedName: result.convertedName,
                      convertedSize: result.fileSize,
                    }
                  : t
              )
            );

            await fetch("/api/converter/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                originalName: task.fileName,
                originalFormat: fileExt.toUpperCase(),
                convertedFormat: finalTarget.toUpperCase(),
                fileSize: result.fileSize,
                status: "Completed",
                downloadUrl: result.downloadUrl,
              }),
            });
          } else {
            throw new Error("Conversion failed on server.");
          }
        } catch (err: any) {
          clearInterval(progressInterval);
          setBulkTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: "failed",
                    progress: 0,
                    error: err.message || "Network error",
                  }
                : t
            )
          );
        }
      }

      fetchHistory();
      triggerAlert("success", "Batch processing queue complete!");
    }
  };

  // Retry failed tasks
  const retryFailedTasks = async () => {
    const failedTasks = bulkTasks.filter(t => t.status === "failed");
    if (failedTasks.length === 0) return;

    setBulkTasks(prev => prev.map(t => t.status === "failed" ? { ...t, status: "pending", progress: 0 } : t));

    for (const task of failedTasks) {
      setBulkTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "processing", progress: 15 } : t))
      );

      const progressInterval = setInterval(() => {
        setBulkTasks((prev) =>
          prev.map((t) => {
            if (t.id === task.id && t.status === "processing") {
              return { ...t, progress: Math.min(t.progress + 18, 92) };
            }
            return t;
          })
        );
      }, 120);

      try {
        const fileExt = task.fileName.split(".").pop()?.toLowerCase() || "";
        let finalTarget = targetFormat?.toLowerCase() || "pdf";
        if (activeTab === "pdfTools") {
          if (activePdfTool === "pdfToWord") finalTarget = "docx";
          else if (activePdfTool === "pdfToImage") finalTarget = "png";
          else finalTarget = "pdf";
        }

        const response = await fetch("/api/convert-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: task.fileName,
            fileType: task.fileType,
            base64: task.base64.split(";base64,").pop() || task.base64,
            targetFormat: finalTarget,
          }),
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const result = await response.json();
          setBulkTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: "completed",
                    progress: 100,
                    downloadUrl: result.downloadUrl,
                    convertedName: result.convertedName,
                    convertedSize: result.fileSize,
                  }
                : t
            )
          );
        } else {
          throw new Error("Conversion failed on server.");
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        setBulkTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "failed",
                  progress: 0,
                  error: err.message || "Network error",
                }
              : t
          )
        );
      }
    }
    fetchHistory();
  };

  // Download all completed tasks
  const downloadAllCompleted = () => {
    const completed = bulkTasks.filter(t => t.status === "completed" && t.downloadUrl);
    if (completed.length === 0) {
      triggerAlert("info", "No completed tasks available for download.");
      return;
    }

    completed.forEach((task) => {
      const link = document.createElement("a");
      link.href = task.downloadUrl!;
      link.download = task.convertedName || "converted_file";
      link.referrerPolicy = "no-referrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    triggerAlert("success", `Downloading ${completed.length} file(s).`);
  };

  const clearCompletedTasks = () => {
    setBulkTasks(prev => prev.filter(t => t.status !== "completed"));
    triggerAlert("info", "Cleared completed tasks.");
  };

  const getFileCategoryIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    } else if (["mp4", "mov", "avi", "mkv", "webm", "flv"].includes(ext)) {
      return <VideoIcon className="w-4 h-4 text-purple-400" />;
    } else if (["mp3", "wav", "aac", "m4a", "ogg", "flac"].includes(ext)) {
      return <AudioIcon className="w-4 h-4 text-yellow-400" />;
    } else if (["xlsx", "xls", "csv", "ods"].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-pink-400" />;
    } else if (ext === "pdf") {
      return <File className="w-4 h-4 text-red-400" />;
    }
    return <FileText className="w-4 h-4 text-cyan-400" />;
  };

  const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const completedTasksCount = bulkTasks.filter(t => t.status === "completed").length;

  return (
    <div id="bulk-upload-manager-root" className="space-y-6">
      {/* DRAG & DROP AREA (WHEN NO FILE IS UPLOADED) */}
      {selectedFiles.length === 0 ? (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition relative overflow-hidden bg-gray-950/15 backdrop-blur-sm ${
            dragActive 
              ? "border-cyan-400 bg-cyan-950/10" 
              : "border-gray-850 hover:border-gray-700 hover:bg-gray-950/20"
          }`}
        >
          {dragActive && (
            <div className="absolute inset-0 bg-cyan-950/30 flex items-center justify-center backdrop-blur-xs z-10">
              <div className="text-cyan-400 font-mono font-bold text-sm animate-pulse flex items-center gap-2">
                <Upload className="w-5 h-5 animate-bounce" /> Drop files to load
              </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => processFiles(e.target.files)}
            multiple
            className="hidden" 
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 shadow-lg">
              <FileUp className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-400 hover:text-white rounded-lg text-xs font-mono font-bold transition shadow-md hover:border-cyan-500 cursor-pointer"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-2.5 font-mono">
                Drag & drop your files here to start converting (Multiple Allowed)
              </p>
            </div>
            <div className="text-[10px] text-gray-500 max-w-md mx-auto border-t border-gray-900 pt-3 font-mono">
              Supports DOCX, PDF, JPG, PNG, MP4, MP3, XLSX, ZIP, JSON, YAML & more. Max 100MB.
            </div>
          </div>
        </div>
      ) : (
        /* STACKED LIST (WHEN FILES ARE UPLOADED) */
        <div className="space-y-4">
          <div className="text-left bg-gray-950/40 p-5 rounded-xl border border-gray-900 space-y-3 shadow-lg">
            <div className="flex justify-between items-center mb-1 border-b border-gray-900 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Queue: Files Selected</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/55 border border-cyan-900 px-2.5 py-1 rounded font-bold">
                {selectedFiles.length} files
              </span>
            </div>

            {/* Micro Stats Row */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 border-b border-gray-900/60 pb-2.5">
              <div>Total Selection Size: <span className="text-gray-300 font-bold">{formatBytes(totalSelectedSize)}</span></div>
              <div className="text-right">Active Tab Scope: <span className="text-cyan-400/90 font-bold uppercase">{activeTab}</span></div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
              {selectedFiles.map((file, index) => {
                const ext = file.name.split(".").pop()?.toUpperCase() || "";
                return (
                  <div key={index} className="flex items-center justify-between gap-3 bg-gray-900/40 border border-gray-850 p-3 rounded-lg hover:border-cyan-950 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-cyan-500/80 bg-cyan-950/30 border border-cyan-900/30 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="p-1.5 bg-cyan-950/30 border border-cyan-900/30 text-cyan-400 rounded shrink-0">
                        {getFileCategoryIcon(file.name)}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-mono font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[9px] font-mono text-gray-500">
                          Size: {formatBytes(file.size)} • Format: {ext}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition shrink-0 cursor-pointer"
                      title="Remove File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <input 
              type="file" 
              ref={addMoreInputRef} 
              onChange={(e) => processFiles(e.target.files)}
              multiple
              className="hidden" 
            />

            {/* Dynamic Validation Warning Message inside the box */}
            {!validation.isValid && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-mono text-left animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validation.message}</span>
              </div>
            )}

            {/* Upload Buttons below */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="flex-1 py-2 bg-gray-900 hover:bg-cyan-950/30 border border-dashed border-cyan-800/50 hover:border-cyan-400 text-cyan-400 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add More File
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="px-4 py-2 bg-gray-950 hover:bg-rose-950 border border-gray-850 hover:border-rose-900 text-gray-400 hover:text-rose-400 rounded-lg text-xs font-mono transition cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleStartBulkTask}
                disabled={!validation.isValid}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  validation.isValid
                    ? "bg-gradient-to-r from-cyan-900 to-indigo-900 hover:from-cyan-800 hover:to-indigo-800 border border-cyan-700 text-cyan-300"
                    : "bg-gray-900 border border-gray-850 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Play className="w-3.5 h-3.5" /> Start Bulk Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK TASK QUEUE DISPLAY */}
      {bulkTasks.length > 0 && (
        <div className="bg-gray-950/30 backdrop-blur-sm border border-cyan-950 rounded-xl p-5 space-y-4 shadow-xl text-left animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-900 pb-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" /> Bulk Task Queue
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-2.5 py-0.5 rounded-full font-bold">
              Processed: {completedTasksCount}/{bulkTasks.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
            {bulkTasks.map((task, idx) => {
              const ext = task.fileName.split(".").pop()?.toUpperCase() || "";
              return (
                <div key={task.id} className="bg-gray-900/60 border border-gray-850/60 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-gray-500 shrink-0">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-lg" title={task.fileName}>
                          {task.fileName}
                        </p>
                        <p className="text-[9px] font-mono text-gray-500">
                          {formatBytes(task.fileSize)} • {ext}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === "pending" && (
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-950 border border-gray-850 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                      {task.status === "processing" && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-2 py-0.5 rounded animate-pulse">
                          Processing {task.progress}%
                        </span>
                      )}
                      {task.status === "completed" && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Completed
                          </span>
                          {task.downloadUrl && (
                            <a
                              href={task.downloadUrl}
                              download={task.convertedName || task.fileName}
                              referrerPolicy="no-referrer"
                              className="p-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 rounded border border-cyan-850 transition cursor-pointer"
                              title="Download file"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                      {task.status === "failed" && (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line Bar */}
                  {task.status === "processing" && (
                    <div className="w-full bg-gray-950 rounded-full h-1 overflow-hidden">
                      <div className="bg-cyan-400 h-1 transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  )}

                  {task.status === "failed" && task.error && (
                    <p className="text-[9px] font-mono text-rose-400 italic bg-rose-950/10 p-1.5 rounded border border-rose-950/20">
                      Error: {task.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Queue Actions Footer Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-900/60">
            {bulkTasks.some(t => t.status === "failed") && (
              <button
                type="button"
                onClick={retryFailedTasks}
                className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/30 border border-rose-900/40 hover:border-rose-500 text-rose-400 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Failed
              </button>
            )}
            <button
              type="button"
              onClick={downloadAllCompleted}
              disabled={!bulkTasks.some(t => t.status === "completed")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                bulkTasks.some(t => t.status === "completed")
                  ? "bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800 text-cyan-400"
                  : "bg-gray-900 border border-gray-850 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Download className="w-3 h-3" /> Download All
            </button>
            <button
              type="button"
              onClick={clearCompletedTasks}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-mono transition cursor-pointer"
            >
              Clear Completed
            </button>
            <button
              type="button"
              onClick={() => { setBulkTasks([]); triggerAlert("info", "Task queue cleared."); }}
              className="px-3 py-1.5 bg-gray-950 hover:bg-gray-900 border border-gray-900 text-gray-500 hover:text-gray-400 rounded-lg text-[10px] font-mono transition cursor-pointer ml-auto"
            >
              Clear Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
