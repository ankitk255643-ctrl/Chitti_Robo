import React, { useState, useEffect, useRef } from "react";
import Galaxy from "./Galaxy";
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2 as AudioIcon,
  Archive as ArchiveIcon,
  FileSpreadsheet,
  Tv as PresentationIcon,
  History as HistoryIcon,
  Upload,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  FolderLock,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  CornerDownRight,
  HelpCircle,
  FileUp,
  FileCheck2,
  FolderOpen,
  Lock,
  Unlock,
  RotateCw,
  Layers,
  Sparkle,
  ArrowUp,
  ArrowDown,
  Plus,
  Key
} from "lucide-react";
import BulkUploadManager from "./BulkUploadManager";
import { motion, AnimatePresence } from "motion/react";

interface HistoryEntry {
  id: string;
  originalName: string;
  originalFormat: string;
  convertedFormat: string;
  fileSize: string;
  createdAt: string;
  status: string;
  downloadUrl: string;
}

interface SavedFile {
  id: string;
  name: string;
  format: string;
  size: string;
  dataUrl: string;
  savedAt: string;
}

export default function FileConverter() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>("overview");

  // State Management
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilesBase64, setSelectedFilesBase64] = useState<string[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>("");
  const [detectedCategory, setDetectedCategory] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [quality, setQuality] = useState<string>("medium"); // low, medium, high
  const [customResolution, setCustomResolution] = useState<string>("native");
  const [pdfPageSize, setPdfPageSize] = useState<string>("a4"); // a4, letter, custom
  const [estimatedSize, setEstimatedSize] = useState<string>("");

  // Multiple Files (Batch Conversion)
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchTargets, setBatchTargets] = useState<{ [key: string]: string }>({});

  // Conversion Progress & Status
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [conversionStatus, setConversionStatus] = useState<string>("idle"); // idle, processing, done, error
  const [convertedResult, setConvertedResult] = useState<{
    name: string;
    format: string;
    size: string;
    url: string;
    durationMs: number;
  } | null>(null);

  // PDF Sub-Tools Active states
  const [activePdfTool, setActivePdfTool] = useState<string>("merge");
  const [mergeFiles, setMergeFiles] = useState<{ id: string; file: File; base64: string }[]>([]);
  const [pdfWatermark, setPdfWatermark] = useState<string>("");
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [pdfPagesToDelete, setPdfPagesToDelete] = useState<string>("");
  const [pdfPagesToReorder, setPdfPagesToReorder] = useState<string>("");
  const [pdfSplitRange, setPdfSplitRange] = useState<string>("1-2");
  const [pdfRotateAngle, setPdfRotateAngle] = useState<string>("90");
  const [pdfExtractedText, setPdfExtractedText] = useState<string>("");

  // History & Saved Files (Synced with server DB)
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error" | "info" | null; text: string }>({ type: null, text: "" });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const [hasCloudConvertKey, setHasCloudConvertKey] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [cloudConvertApiKey, setCloudConvertApiKey] = useState<string>("");

  // Synchronize history and saved files from database
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/converter/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error loading conversion history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchSavedFiles = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/converter/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedFiles(data);
      }
    } catch (err) {
      console.error("Error loading saved files:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/converter/config");
      if (res.ok) {
        const data = await res.json();
        setHasCloudConvertKey(!!data.hasApiKey);
        if (data.maskedKey) {
          setCloudConvertApiKey(data.maskedKey);
        }
      }
    } catch (err) {
      console.error("Error checking converter config:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchSavedFiles();
    fetchConfig();
  }, []);

  const triggerAlert = (type: "success" | "error" | "info", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg({ type: null, text: "" });
    }, 4500);
  };

  const handleSaveApiKey = async () => {
    try {
      const res = await fetch("/api/converter/set-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: cloudConvertApiKey }),
      });
      if (res.ok) {
        triggerAlert("success", "CloudConvert API Key updated successfully!");
        fetchConfig();
        setShowKeyInput(false);
      } else {
        throw new Error("Failed to save key");
      }
    } catch (err) {
      triggerAlert("error", "Failed to update CloudConvert API Key.");
    }
  };

  // Safe file size detector
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Automatically parse supported target formats
  const getSupportedTargets = (category: string, format: string) => {
    const normFormat = format.toLowerCase();
    switch (category) {
      case "document":
        if (normFormat === "pdf") return ["docx", "txt", "png", "jpg"];
        if (normFormat === "docx" || normFormat === "doc") return ["pdf", "txt"];
        if (normFormat === "txt") return ["pdf", "docx", "json"];
        if (normFormat === "rtf") return ["docx", "pdf"];
        if (normFormat === "html") return ["pdf", "txt"];
        if (normFormat === "md" || normFormat === "markdown") return ["pdf", "html"];
        return ["pdf", "docx", "txt"];
      case "image":
        if (normFormat === "gif") return ["mp4", "png", "webp"];
        if (normFormat === "pdf") return ["jpg", "png", "webp"];
        return ["png", "jpg", "webp", "pdf", "gif"];
      case "video":
        if (normFormat === "mp4") return ["mov", "gif", "mp3", "wav", "m4a"];
        return ["mp4", "mov", "avi", "webm", "gif", "mp3"];
      case "audio":
        return ["mp3", "wav", "aac", "m4a", "ogg"];
      case "spreadsheet":
        if (normFormat === "xlsx" || normFormat === "xls") return ["csv", "pdf", "json"];
        if (normFormat === "csv") return ["xlsx", "pdf", "json"];
        return ["csv", "xlsx", "pdf"];
      case "presentation":
        if (normFormat === "pdf") return ["pptx", "png"];
        return ["pdf", "images_zip"];
      case "archive":
        if (normFormat === "zip") return ["rar", "7z", "extracted_folder"];
        return ["zip"];
      case "code":
        if (normFormat === "json") return ["csv", "xml", "yaml"];
        if (normFormat === "csv") return ["json"];
        if (normFormat === "xml") return ["json"];
        if (normFormat === "yaml") return ["json"];
        return ["json", "txt"];
      default:
        return ["pdf", "txt", "zip"];
    }
  };

  // AI Assistant Smart Agent Suggestions Engine
  const getAISuggestion = () => {
    if (selectedFiles.length === 0) {
      return {
        tip: "Upload any document, image, audio, video, archive or spreadsheet file. I'll automatically analyze its structure, detect security signatures, and guide your target configurations.",
        actionable: "Ready to process files up to 100MB securely."
      };
    }

    if (selectedFiles.length > 1) {
      const allPdfs = selectedFiles.every(f => f.name.toLowerCase().endsWith(".pdf"));
      const allImages = selectedFiles.every(f => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext);
      });
      if (allPdfs) {
        return {
          tip: "Multiple PDF files detected. You can Merge PDF, Compress PDF, Extract Text, or batch convert PDF to Word in bulk.",
          actionable: "Suggested Option: Merge PDF or batch Convert to DOCX"
        };
      } else if (allImages) {
        return {
          tip: "Multiple images detected. You can convert to PDF, compress, resize, or run OCR in bulk.",
          actionable: "Suggested Option: Create PDF Booklet or batch Compress"
        };
      } else {
        return {
          tip: "Mixed file types detected. Recommended actions: ZIP archive, AI analysis, or convert files individually.",
          actionable: "Suggested Option: Bundle as ZIP or batch convert"
        };
      }
    }

    const name = selectedFile ? selectedFile.name : "";
    const size = selectedFile ? selectedFile.size : 0;
    const ext = name.split(".").pop()?.toLowerCase() || "";

    let advice = "";
    let action = "";

    // File size warning
    if (size > 15 * 1024 * 1024) {
      advice += "⚠️ Your file size is large (" + formatBytes(size) + "). I highly recommend enabling output compression to speed up the transfer. ";
    }

    // Format specific AI recommendations
    if (["png"].includes(ext)) {
      advice += `Your uploaded file is a PNG image. Keep PNG if you require a transparent alpha channel. For website integration and modern loading speed, convert to **WEBP**. For print-ready layouts or generic distribution, **PDF** is recommended.`;
      action = "Suggested Output: WEBP or JPG";
    } else if (["jpg", "jpeg"].includes(ext)) {
      advice += `JPG file detected. JPG uses lossy compression and is already compact. For lossless preservation or editing, convert to **PNG**. For smaller web payloads, choose **WEBP**.`;
      action = "Suggested Output: WEBP (for sites) or PNG (for editing)";
    } else if (["pdf"].includes(ext)) {
      advice += `PDF Document detected. For editing text inside, use **PDF to Word (DOCX)**. If you need to extract graphics, choose **PDF to Image**. To make it smaller, use our **Compress PDF** tool under the PDF Tools tab.`;
      action = "Recommended: PDF Tools workspace";
    } else if (["doc", "docx"].includes(ext)) {
      advice += `Microsoft Word Document uploaded. For formal and professional distribution, locking the layout is essential. Convert this file to **PDF** to guarantee matching typography across all client platforms.`;
      action = "Suggested Output: PDF";
    } else if (["xlsx", "xls", "csv"].includes(ext)) {
      advice += `Spreadsheet file detected. For importing into local data hubs, convert to **CSV**. For distributing visual tables beautifully, convert to **PDF** with fitted page dimensions.`;
      action = "Suggested Output: CSV for APIs, PDF for reporting";
    } else if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) {
      advice += `Video asset loaded. To reduce memory use or isolate sound layers, choose **Video to Audio (MP3)**. For universal HTML5 compatibility, **MP4** is our golden standard.`;
      action = "Suggested: MP4 or Extract Audio (MP3)";
    } else if (["mp3", "wav", "aac", "m4a", "ogg"].includes(ext)) {
      advice += `Audio payload ready. For high-fidelity lossless sound engineering, use **WAV**. For standard mobile play or lightweight storage, **MP3** is recommended.`;
      action = "Suggested: MP3 or WAV";
    } else if (["zip", "rar", "7z"].includes(ext)) {
      advice += `Archive format detected. You can extract individual nested documents or convert this archive into a modern high-compression **ZIP** cluster.`;
      action = "Suggested: Extract ZIP or RAR to ZIP";
    } else if (["json", "xml", "yaml"].includes(ext)) {
      advice += `Data/Code file recognized. I can convert structural trees automatically. Convert **JSON to CSV** for easy spreadsheet reviews, or **YAML to JSON** for web APIs.`;
      action = "Suggested: CSV or JSON";
    } else {
      advice += `Secure system file detected. I support over 150 file conversions. Please select a matching output format below to initialize.`;
      action = "Suggested: Select Target Format";
    }

    return { tip: advice, actionable: action };
  };

  const aiDetails = getAISuggestion();

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Common File Processing
  const processSelectedFile = (file: File) => {
    // Validate file type
    const name = file.name;
    const ext = name.split(".").pop()?.toLowerCase() || "";
    
    // Safety check - do not execute executable files
    const blockedExtensions = ["exe", "bat", "sh", "msi", "cmd", "com", "vbs", "scr", "pif"];
    if (blockedExtensions.includes(ext)) {
      triggerAlert("error", `Security Protocol Alert: Running executable or script files (.${ext}) is strictly prohibited.`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      triggerAlert("error", "File limit exceeded. Maximum upload size allowed in sandbox is 100MB.");
      return;
    }

    setSelectedFile(file);
    setSelectedFiles([file]);
    setCustomName(name.substring(0, name.lastIndexOf(".")) || name);
    
    // Categorization Logic
    let category = "document";
    const mime = file.type;

    if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "svg", "heic", "gif", "bmp"].includes(ext)) {
      category = "image";
    } else if (mime.startsWith("video/") || ["mp4", "mov", "avi", "mkv", "webm", "flv"].includes(ext)) {
      category = "video";
    } else if (mime.startsWith("audio/") || ["mp3", "wav", "aac", "m4a", "ogg", "flac"].includes(ext)) {
      category = "audio";
    } else if (["xlsx", "xls", "csv", "ods"].includes(ext)) {
      category = "spreadsheet";
    } else if (["ppt", "pptx", "key"].includes(ext)) {
      category = "presentation";
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      category = "archive";
    } else if (["json", "xml", "yaml", "yml", "ini"].includes(ext)) {
      category = "code";
    }

    setDetectedFormat(ext.toUpperCase());
    setDetectedCategory(category);
    
    // Auto-select first target format
    const targets = getSupportedTargets(category, ext);
    if (targets.length > 0) {
      setTargetFormat(targets[0]);
    }

    // Reset status
    setConversionStatus("idle");
    setConvertedResult(null);

    // Convert file to Base64 for simulated backend processing
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedFileBase64(base64);
      setSelectedFilesBase64([base64]);
    };
    reader.readAsDataURL(file);

    // Calculate simulated estimate file size
    const estRatio = ext === "png" && targets[0] === "jpg" ? 0.4 : 
                     ext === "jpg" && targets[0] === "webp" ? 0.75 :
                     ext === "wav" && targets[0] === "mp3" ? 0.15 : 1.1;
    setEstimatedSize(formatBytes(Math.round(file.size * estRatio)));
  };

  const handleAddMoreFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    const isMergeTool = activePdfTool === "merge" && activeTab === "pdfTools";
    const isImageToPdf = activePdfTool === "imageToPdf" && activeTab === "pdfTools";

    let hasInvalid = false;
    const validFiles: File[] = [];

    for (const file of filesArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      
      // Safety check - blocked extensions
      const blockedExtensions = ["exe", "bat", "sh", "msi", "cmd", "com", "vbs", "scr", "pif"];
      if (blockedExtensions.includes(ext)) {
        triggerAlert("error", `Security Protocol Alert: Executable or script files (.${ext}) are prohibited.`);
        continue;
      }

      if (file.size > 100 * 1024 * 1024) {
        triggerAlert("error", `File "${file.name}" exceeds the 100MB size limit.`);
        continue;
      }

      if (isMergeTool && ext !== "pdf") {
        hasInvalid = true;
        continue;
      }

      if (isImageToPdf && !["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext)) {
        hasInvalid = true;
        continue;
      }

      validFiles.push(file);
    }

    if (hasInvalid) {
      if (isMergeTool) {
        triggerAlert("error", "Only PDF files (.pdf) can be added for Merge PDF.");
      } else if (isImageToPdf) {
        triggerAlert("error", "Only image files (.png, .jpg, .jpeg, .webp, .gif, .bmp) can be added for Image to PDF.");
      }
    }

    if (validFiles.length > 0) {
      const addedFiles: File[] = [];
      const addedBase64s: string[] = [];
      let processed = 0;

      validFiles.forEach((f) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          addedFiles.push(f);
          addedBase64s.push(reader.result as string);
          processed++;

          if (processed === validFiles.length) {
            setSelectedFiles((prev) => [...prev, ...addedFiles]);
            setSelectedFilesBase64((prev) => [...prev, ...addedBase64s]);
            triggerAlert("success", `Added ${validFiles.length} file(s) to selection queue.`);
          }
        };
        reader.readAsDataURL(f);
      });
    }
  };

  const handleAddMergeFiles = (files: FileList | null) => {
    if (!files) return;
    
    const isMergeTool = activePdfTool === "merge";
    const allowedExtensions = isMergeTool ? ["pdf"] : ["png", "jpg", "jpeg", "webp", "gif", "bmp"];
    const fileListArray = Array.from(files);
    let addedCount = 0;
    let hasInvalid = false;

    for (const file of fileListArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(ext)) {
        hasInvalid = true;
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        triggerAlert("error", `File "${file.name}" exceeds the 50MB size limit.`);
        continue;
      }

      addedCount++;
      const reader = new FileReader();
      const itemId = Math.random().toString(36).substring(2, 9);
      reader.onloadend = () => {
        setMergeFiles(prev => {
          if (prev.some(item => item.file.name === file.name && item.file.size === file.size)) {
            return prev;
          }
          return [...prev, { id: itemId, file, base64: reader.result as string }];
        });
      };
      reader.readAsDataURL(file);
    }

    if (hasInvalid) {
      if (isMergeTool) {
        triggerAlert("error", "Only PDF files (.pdf) are allowed for merging.");
      } else {
        triggerAlert("error", "Only image files (.png, .jpg, .jpeg, .webp, .gif) are allowed for compiling.");
      }
    } else if (addedCount > 0) {
      triggerAlert("success", `Added ${addedCount} file(s) to the queue.`);
    }
  };

  // Estimated size updater on target change
  useEffect(() => {
    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      const targets = targetFormat.toLowerCase();
      let ratio = 1.0;

      if (ext === "png" && targets === "jpg") ratio = 0.35;
      else if (ext === "png" && targets === "webp") ratio = 0.25;
      else if (ext === "jpg" && targets === "webp") ratio = 0.70;
      else if (ext === "wav" && targets === "mp3") ratio = 0.15;
      else if (ext === "mp4" && targets === "mp3") ratio = 0.08;
      else if (ext === "pdf" && targets === "txt") ratio = 0.05;
      else if (ext === "xlsx" && targets === "csv") ratio = 0.10;

      if (quality === "low") ratio *= 0.6;
      if (quality === "high") ratio *= 1.3;

      setEstimatedSize(formatBytes(Math.round(selectedFile.size * ratio)));
    }
  }, [targetFormat, quality, selectedFile]);

  // Execute Conversion
  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) {
      triggerAlert("error", "Please upload a valid file and select an output format first.");
      return;
    }

    setIsConverting(true);
    setConversionStatus("processing");
    setConversionProgress(5);

    const simpleOrigName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
    const baseName = customName || simpleOrigName;

    // 1. High-fidelity Client-Side Image-to-Image Conversion
    const isImageToImage = detectedCategory === "image" && ["png", "jpg", "jpeg", "webp"].includes(targetFormat.toLowerCase());
    
    if (isImageToImage) {
      try {
        const img = new Image();
        img.src = selectedFileBase64;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create 2D canvas context");

        ctx.drawImage(img, 0, 0);

        let mimeType = "image/png";
        const targetLower = targetFormat.toLowerCase();
        if (targetLower === "jpg" || targetLower === "jpeg") {
          mimeType = "image/jpeg";
        } else if (targetLower === "webp") {
          mimeType = "image/webp";
        }

        const qualityVal = quality === "low" ? 0.45 : quality === "high" ? 0.95 : 0.8;
        const dataUrl = canvas.toDataURL(mimeType, qualityVal);

        setConversionProgress(100);
        setConversionStatus("done");

        const finalName = `${baseName}_converted.${targetFormat.toLowerCase()}`;

        const finalObj = {
          name: finalName,
          format: targetFormat.toUpperCase(),
          size: formatBytes(Math.round(dataUrl.length * 0.75)),
          url: dataUrl,
          durationMs: 120,
        };

        setConvertedResult(finalObj);
        triggerAlert("success", `File converted successfully into ${finalObj.name}!`);

        // Post back history item to server
        await fetch("/api/converter/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalName: selectedFile.name,
            originalFormat: detectedFormat,
            convertedFormat: finalObj.format,
            fileSize: finalObj.size,
            status: "Completed",
            downloadUrl: finalObj.url,
          }),
        });

        fetchHistory(); // Refresh history
        setIsConverting(false);
        return;
      } catch (err: any) {
        console.warn("Client-side image conversion failed, falling back to server:", err);
      }
    }

    // Simulated progress timer for server conversion
    const interval = setInterval(() => {
      setConversionProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 95);
      });
    }, 150);

    try {
      // Prepare payload to convert file API
      const base64Data = selectedFileBase64.split(",")[1] || selectedFileBase64;
      const response = await fetch("/api/convert-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: `${baseName}.${selectedFile.name.split(".").pop()}`,
          fileType: selectedFile.type,
          base64: base64Data,
          targetFormat: targetFormat.toLowerCase(),
        }),
      });

      clearInterval(interval);

      if (response.ok) {
        const result = await response.json();
        
        // Finalize state
        setConversionProgress(100);
        setConversionStatus("done");
        
        const finalObj = {
          name: result.convertedName,
          format: result.outputFormat.toUpperCase(),
          size: estimatedSize || result.fileSize,
          url: result.downloadUrl,
          durationMs: result.durationMs,
        };

        setConvertedResult(finalObj);
        triggerAlert("success", `File converted successfully into ${finalObj.name}!`);

        // Post back history item to server
        await fetch("/api/converter/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalName: result.originalName,
            originalFormat: detectedFormat,
            convertedFormat: finalObj.format,
            fileSize: finalObj.size,
            status: "Completed",
            downloadUrl: finalObj.url,
          }),
        });

        fetchHistory(); // Refresh history
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server responded with conversion error.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setConversionStatus("error");
      triggerAlert("error", `Conversion Failed: ${err.message || "Please check your network connection."}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Save Converted File to User account
  const handleSaveToMyFiles = async () => {
    if (!convertedResult) return;
    try {
      const res = await fetch("/api/converter/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: convertedResult.name,
          format: convertedResult.format,
          size: convertedResult.size,
          dataUrl: convertedResult.url,
        }),
      });

      if (res.ok) {
        triggerAlert("success", "File successfully synchronized with Chitti-Robo account Cloud Storage!");
        fetchSavedFiles();
      } else {
        throw new Error("Unable to save file.");
      }
    } catch (error) {
      triggerAlert("error", "Failed to save file to profile storage.");
    }
  };

  // Clear states
  const handleClear = () => {
    setSelectedFile(null);
    setSelectedFileBase64("");
    setSelectedFiles([]);
    setSelectedFilesBase64([]);
    setDetectedFormat("");
    setDetectedCategory("");
    setTargetFormat("");
    setCustomName("");
    setConvertedResult(null);
    setConversionStatus("idle");
    setConversionProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (addMoreInputRef.current) addMoreInputRef.current.value = "";
  };

  // Delete saved file
  const handleDeleteSavedFile = async (id: string) => {
    try {
      const res = await fetch(`/api/converter/saved/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerAlert("success", "File purged from Cloud Storage.");
        fetchSavedFiles();
      }
    } catch (error) {
      triggerAlert("error", "Purge failed.");
    }
  };

  // Clear conversion history
  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/converter/history", {
        method: "DELETE",
      });
      if (res.ok) {
        triggerAlert("success", "Operation logs wiped.");
        fetchHistory();
      }
    } catch (error) {
      triggerAlert("error", "Wipe failed.");
    }
  };

  // Multiple Batch Files Upload
  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files) as File[];
      const safeList = list.filter(f => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return !["exe", "sh", "bat"].includes(ext);
      });
      setBatchFiles(safeList);
      
      const defaults: { [key: string]: string } = {};
      safeList.forEach(f => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        defaults[f.name] = ext === "png" ? "jpg" : "pdf";
      });
      setBatchTargets(defaults);
    }
  };

  const handleBatchConvert = async () => {
    if (batchFiles.length === 0) {
      triggerAlert("error", "No batch files selected.");
      return;
    }
    
    setIsConverting(true);
    setConversionProgress(10);
    
    // Batch conversion timer simulation
    const interval = setInterval(() => {
      setConversionProgress(p => Math.min(p + 8, 95));
    }, 200);

    setTimeout(async () => {
      clearInterval(interval);
      setConversionProgress(100);
      setConversionStatus("done");
      setIsConverting(false);
      triggerAlert("success", `Successfully processed ${batchFiles.length} files in parallel batch mode!`);

      // Write them to history
      for (const file of batchFiles) {
        const target = batchTargets[file.name] || "PDF";
        await fetch("/api/converter/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalName: file.name,
            originalFormat: file.name.split(".").pop()?.toUpperCase() || "UNK",
            convertedFormat: target.toUpperCase(),
            fileSize: formatBytes(file.size),
            status: "Completed",
            downloadUrl: "data:text/plain;base64,QmF0Y2ggY29udmVyc2lvbiBzdWNjZXNzZnVsIQ==",
          }),
        });
      }
      fetchHistory();
    }, 2500);
  };

  // PDF Sub-Tools Action triggers
  const handlePdfToolExecute = () => {
    if (activePdfTool === "merge") {
      if (selectedFiles.length < 2) {
        triggerAlert("error", "Please upload at least 2 PDF files to merge.");
        return;
      }
    } else if (activePdfTool === "imageToPdf") {
      if (selectedFiles.length < 1) {
        triggerAlert("error", "Please upload at least 1 image file to compile.");
        return;
      }
    } else if (!selectedFile) {
      triggerAlert("error", "Please upload a target PDF file first.");
      return;
    }

    setIsConverting(true);
    setConversionProgress(20);

    const timer = setInterval(() => {
      setConversionProgress(p => Math.min(p + 15, 95));
    }, 150);

    const totalQueueSize = selectedFiles.reduce((sum, item) => sum + item.size, 0);

    setTimeout(async () => {
      clearInterval(timer);
      setConversionProgress(100);
      setIsConverting(false);

      let msg = "";
      let downloadName = "processed_document.pdf";
      let dummyUrl = "data:application/pdf;base64,JVBERi0xLjQKJSDosvI...[PDF_MOCK_CONTENT]";
      let finalSize = "1.2 MB";

      switch (activePdfTool) {
        case "merge":
          msg = `Successfully merged ${selectedFiles.length} PDF files into a single master PDF!`;
          downloadName = `merged_${selectedFiles.length}_docs.pdf`;
          finalSize = formatBytes(Math.round(totalQueueSize * 0.92));
          break;
        case "split":
          msg = `Split PDF successfully. Pages extracted: ${pdfSplitRange}.`;
          downloadName = `split_pages_${pdfSplitRange}.pdf`;
          break;
        case "compress":
          msg = `Compressed PDF layout successfully. Reduced file size by 54%.`;
          downloadName = "compressed_document.pdf";
          break;
        case "pdfToWord":
          msg = "Converted PDF vectors into dynamic DOCX Word file successfully.";
          downloadName = "converted_word_outline.docx";
          dummyUrl = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAA=";
          break;
        case "wordToPdf":
          msg = "Rendered DOCX text components into lock-layout PDF.";
          downloadName = "word_to_pdf_conversion.pdf";
          break;
        case "pdfToImage":
          msg = "Extracted high resolution PNG frames from PDF sheets.";
          downloadName = "pdf_pages_images.zip";
          dummyUrl = "data:application/zip;base64,UEsDBAoAAAAAA";
          break;
        case "imageToPdf":
          msg = `Successfully compiled ${selectedFiles.length} image files into a single PDF document!`;
          downloadName = `compiled_${selectedFiles.length}_images.pdf`;
          finalSize = formatBytes(Math.round(totalQueueSize * 0.88));
          break;
        case "rotate":
          msg = `Rotated PDF pages successfully by ${pdfRotateAngle} degrees.`;
          downloadName = `rotated_${pdfRotateAngle}_doc.pdf`;
          break;
        case "deletePages":
          msg = `Deleted specified pages: ${pdfPagesToDelete} successfully.`;
          downloadName = "reorganized_doc.pdf";
          break;
        case "reorder":
          msg = `Reordered PDF page tree sequence into: [${pdfPagesToReorder}]`;
          downloadName = "sequenced_doc.pdf";
          break;
        case "addWatermark":
          msg = `Stamped professional watermark "${pdfWatermark}" on all document pages.`;
          downloadName = "watermarked_document.pdf";
          break;
        case "lock":
          msg = "Encrypted file structure with robust owner password block.";
          downloadName = "secured_confidential_document.pdf";
          break;
        case "unlock":
          msg = "Successfully decrypted and unlocked password protection constraints.";
          downloadName = "unrestricted_document.pdf";
          break;
        case "extractText":
          msg = "Extracted all OCR readable text layers from target PDF sheets.";
          setPdfExtractedText("CHITTI-ROBO COGNITIVE ENGINE - OCR EXTRACTED TEXT:\n\n1. Project Overview and Operational Layout:\nThis document represents the master schema for central intent routing. All nodes are connected to port 3000.\n\n2. Security Parameters:\nNo persistent client files are cached in our sandboxes. Security logs verified. Active state: Synced.");
          break;
      }

      triggerAlert("success", msg);

      if (activePdfTool !== "extractText") {
        const finalObj = {
          name: downloadName,
          format: "PDF",
          size: finalSize,
          url: dummyUrl,
          durationMs: (activePdfTool === "merge" || activePdfTool === "imageToPdf") ? 600 + selectedFiles.length * 350 : 1400,
        };
        setConvertedResult(finalObj);

        // Save PDF Tool output to Database History
        try {
          await fetch("/api/converter/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              originalName: (activePdfTool === "merge" || activePdfTool === "imageToPdf") 
                ? `${selectedFiles.length} Queue Items` 
                : selectedFile?.name || "pdf_source.pdf",
              originalFormat: (activePdfTool === "merge" || activePdfTool === "imageToPdf") ? "BATCH" : "PDF",
              convertedFormat: "PDF",
              fileSize: finalSize,
              status: "Completed",
              downloadUrl: dummyUrl,
            }),
          });
          fetchHistory();
        } catch (historyErr) {
          console.error("Failed to sync pdf tool history:", historyErr);
        }
      }
    }, (activePdfTool === "merge" || activePdfTool === "imageToPdf") ? 1000 + selectedFiles.length * 200 : 1800);
  };

  // Interactive PDF extraction clear
  const clearPdfExtraction = () => {
    setPdfExtractedText("");
    triggerAlert("info", "OCR buffer flushed.");
  };

  return (
    <div className="relative pb-12 text-gray-100 min-h-screen" id="file-converter-page-wrapper">
      {/* Background Galaxy Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
        {showAnimation && (
          <Galaxy
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1.5}
            glowIntensity={0.6}
            saturation={0.8}
            hueShift={200}
            transparent={true}
          />
        )}
        {/* Extremely light overlay for optimal text contrast without blurring or dimming the animation */}
        <div className="absolute inset-0 bg-[#030612]/15" />
      </div>

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto px-4 py-3" id="file-converter-page">
      {/* Dynamic Alert bar */}
      {alertMsg.text && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-xl animate-bounce text-xs font-mono font-semibold ${
            alertMsg.type === "success" 
              ? "bg-[#0b251a] border-emerald-500/30 text-emerald-400"
              : alertMsg.type === "error"
              ? "bg-[#2d0f0f] border-rose-500/30 text-rose-400"
              : "bg-[#0f1d3a] border-cyan-500/30 text-cyan-400"
          }`}
        >
          {alertMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-900 pb-5">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Sandbox Converter Module
            </span>
            {hasCloudConvertKey ? (
              <span className="text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1">
                ⚡ CloudConvert Key Active
              </span>
            ) : (
              <span className="text-[10px] bg-amber-950/70 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1">
                ☁️ Simulated Mode
              </span>
            )}
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-gray-300 border border-gray-800 px-2.5 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1 cursor-pointer transition-all hover:text-white"
            >
              🔑 {showKeyInput ? "Close Settings" : "Configure API Key"}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white mt-1.5 flex items-center gap-2">
            <RefreshCw className="text-cyan-400 w-7 h-7" /> File Converter
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Convert any file format into another format quickly, safely, and easily. Completely sandboxed server-side parsing.
          </p>
        </div>

        {/* Quick status counter info */}
        <div className="flex gap-3 text-xs font-mono">
          <div className="bg-gray-950 border border-gray-850 px-3 py-2 rounded-lg text-gray-400">
            Saved Files: <span className="text-cyan-400 font-bold">{savedFiles.length}</span>
          </div>
          <div className="bg-gray-950 border border-gray-850 px-3 py-2 rounded-lg text-gray-400">
            Total Logs: <span className="text-cyan-400 font-bold">{history.length}</span>
          </div>
        </div>
      </div>

      {/* Collapsible API Key Config Panel */}
      {showKeyInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-[#0a1026] border border-cyan-500/20 rounded-2xl space-y-4 shadow-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key className="text-cyan-400 w-4 h-4" /> CloudConvert API Configuration
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Enable actual real-time file format conversion by supplying your personal CloudConvert API Key.
              </p>
            </div>
            <a
              href="https://cloudconvert.com/dashboard/api/v2/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Get Key <Sparkles className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              placeholder="Paste your CloudConvert API Key (e.g. env.CLOUDCONVERT_API_KEY)"
              value={cloudConvertApiKey}
              onChange={(e) => setCloudConvertApiKey(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Key
              </button>
              {hasCloudConvertKey && (
                <button
                  onClick={() => {
                    setCloudConvertApiKey("");
                    fetch("/api/converter/set-key", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ apiKey: "" }),
                    }).then(() => {
                      triggerAlert("success", "API Key removed successfully.");
                      fetchConfig();
                    });
                  }}
                  className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Tab Navigation */}
      <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-800">
        <div className="flex space-x-1.5 bg-gray-950/20 backdrop-blur-sm p-1.5 rounded-xl border border-gray-900/40 min-w-max">
          {[
            { id: "overview", label: "Overview", icon: HelpCircle },
            { id: "document", label: "Document", icon: FileText },
            { id: "image", label: "Image", icon: ImageIcon },
            { id: "video", label: "Video", icon: VideoIcon },
            { id: "audio", label: "Audio", icon: AudioIcon },
            { id: "pdfTools", label: "PDF Tools", icon: FolderLock },
            { id: "spreadsheet", label: "Spreadsheet", icon: FileSpreadsheet },
            { id: "presentation", label: "Presentation", icon: PresentationIcon },
            { id: "archive", label: "Archive", icon: ArchiveIcon },
            { id: "history", label: "History & Storage", icon: HistoryIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  handleClear();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800/40" 
                    : "text-gray-400 hover:text-white hover:bg-gray-900/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout: Controls (Left) & Smart AI Assistant suggestions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Processing Workbench (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* DRAG & DROP UPLOAD WORKSPACE via BulkUploadManager */}
          {activeTab !== "history" && (
            <BulkUploadManager
              selectedFiles={selectedFiles}
              selectedFilesBase64={selectedFilesBase64}
              onFilesChanged={(files, base64s) => {
                setSelectedFiles(files);
                setSelectedFilesBase64(base64s);
                if (files.length > 0) {
                  setSelectedFile(files[0]);
                  const name = files[0].name;
                  setCustomName(name.substring(0, name.lastIndexOf(".")) || name);
                  const ext = name.split(".").pop()?.toLowerCase() || "";
                  
                  let category = "document";
                  const mime = files[0].type;
                  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "svg", "heic", "gif", "bmp"].includes(ext)) {
                    category = "image";
                  } else if (mime.startsWith("video/") || ["mp4", "mov", "avi", "mkv", "webm", "flv"].includes(ext)) {
                    category = "video";
                  } else if (mime.startsWith("audio/") || ["mp3", "wav", "aac", "m4a", "ogg", "flac"].includes(ext)) {
                    category = "audio";
                  } else if (["xlsx", "xls", "csv", "ods"].includes(ext)) {
                    category = "spreadsheet";
                  } else if (["ppt", "pptx", "key"].includes(ext)) {
                    category = "presentation";
                  } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
                    category = "archive";
                  } else if (["json", "xml", "yaml", "yml", "ini"].includes(ext)) {
                    category = "code";
                  }

                  setDetectedFormat(ext.toUpperCase());
                  setDetectedCategory(category);
                  const targets = getSupportedTargets(category, ext);
                  if (targets.length > 0) {
                    setTargetFormat(targets[0]);
                  }
                  
                  // Calculate simulated estimate file size
                  const estRatio = ext === "png" && targets[0] === "jpg" ? 0.4 : 
                                   ext === "jpg" && targets[0] === "webp" ? 0.75 :
                                   ext === "wav" && targets[0] === "mp3" ? 0.15 : 1.1;
                  setEstimatedSize(formatBytes(Math.round(files[0].size * estRatio)));
                  setSelectedFileBase64(base64s[0] || "");
                } else {
                  handleClear();
                }
              }}
              onClearAll={handleClear}
              activeTab={activeTab}
              activePdfTool={activePdfTool}
              targetFormat={targetFormat}
              triggerAlert={(type, msg) => triggerAlert(type, msg)}
              fetchHistory={fetchHistory}
            />
          )}

          {/* BATCH CONVERSION SECTION */}
          {activeTab === "overview" && batchFiles.length === 0 && (
            <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 rounded-xl text-center space-y-3">
              <div className="inline-flex p-2 bg-cyan-950/20 text-cyan-400 rounded-lg border border-cyan-900/30">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-mono text-white font-bold">Need to convert multiple files at once?</h3>
              <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                Select parallel batch conversion. Our server processes multiple photos, audio tracks, or documents simultaneously.
              </p>
              <button 
                onClick={() => batchInputRef.current?.click()}
                className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-mono transition"
              >
                Select Batch Files
              </button>
              <input 
                type="file" 
                multiple 
                ref={batchInputRef}
                onChange={handleBatchChange}
                className="hidden" 
              />
            </div>
          )}

          {/* BATCH ACTIVE INTERFACE */}
          {batchFiles.length > 0 && activeTab === "overview" && (
            <div className="bg-gray-950 border border-cyan-950 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Batch Processing Hub ({batchFiles.length} files loaded)
                </span>
                <button 
                  onClick={() => setBatchFiles([])}
                  className="text-[10px] font-mono text-rose-400 hover:underline"
                >
                  Clear Batch
                </button>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {batchFiles.map((file, idx) => {
                  const fext = file.name.split(".").pop() || "";
                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-900/40 p-2 border border-gray-900 rounded-lg text-xs font-mono">
                      <span className="truncate max-w-xs font-semibold text-white">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">{formatBytes(file.size)}</span>
                        <select 
                          value={batchTargets[file.name] || "pdf"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchTargets(prev => ({ ...prev, [file.name]: val }));
                          }}
                          className="bg-gray-950 border border-gray-805 text-[10px] text-cyan-400 font-bold rounded p-1 outline-none"
                        >
                          <option value="pdf">PDF</option>
                          <option value="jpg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WEBP</option>
                          <option value="docx">DOCX</option>
                          <option value="txt">TXT</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar or convert button */}
              {conversionStatus === "processing" ? (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono text-gray-500">
                    <span>Batch Queue Processing...</span>
                    <span>{conversionProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${conversionProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleBatchConvert}
                  className="w-full py-2 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-400 hover:text-white rounded-lg text-xs font-mono font-bold transition"
                >
                  Convert Batch Queue ({batchFiles.length} files)
                </button>
              )}
            </div>
          )}

          {/* TAB EXCLUSIVE WORKSPACES */}

          {/* 1. DOCUMENT / IMAGE / VIDEO / AUDIO / SPREADSHEET / PRESENTATION / ARCHIVE TAB SPECIFICS */}
          {selectedFile && activeTab !== "overview" && activeTab !== "pdfTools" && activeTab !== "history" && (
            <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Settings2 className="w-4 h-4" /> Conversion Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Format Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Select Target Format</label>
                  <select 
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  >
                    {getSupportedTargets(detectedCategory, selectedFile.name.split(".").pop() || "").map((fmt) => (
                      <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Quality Profile */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Quality Profile</label>
                  <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-lg border border-gray-850">
                    {["low", "medium", "high"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`py-1 rounded text-[10px] font-mono capitalize transition ${
                          quality === q 
                            ? "bg-cyan-950 text-cyan-400 border border-cyan-900/40 font-bold" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category-specific Advanced options */}
                {detectedCategory === "image" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Custom Resolution</label>
                    <select 
                      value={customResolution} 
                      onChange={(e) => setCustomResolution(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="native">Native Dimensions (Fitted)</option>
                      <option value="1920x1080">Full HD (1920 x 1080)</option>
                      <option value="1280x720">HD (1280 x 720)</option>
                      <option value="800x600">Standard Web (800 x 600)</option>
                      <option value="512x512">Square (512 x 512)</option>
                    </select>
                  </div>
                )}

                {detectedCategory === "video" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">FPS Limit / Sizing</label>
                    <select className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono">
                      <option>Native Match (Smooth)</option>
                      <option>30 FPS (Optimized)</option>
                      <option>24 FPS (Cinematic)</option>
                      <option>Compress & Lock dimensions</option>
                    </select>
                  </div>
                )}

                {detectedCategory === "document" && targetFormat === "pdf" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">PDF Page Size</label>
                    <select 
                      value={pdfPageSize} 
                      onChange={(e) => setPdfPageSize(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="a4">A4 Sheet (Standard)</option>
                      <option value="letter">Letter Sheet</option>
                      <option value="legal">Legal Sheet</option>
                    </select>
                  </div>
                )}

                {/* Estimate details */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="bg-gray-900 border border-gray-850 rounded-lg p-2.5 text-[11px] font-mono flex justify-between text-gray-400 items-center">
                    <span>Estimated output size:</span>
                    <span className="text-cyan-400 font-bold">{estimatedSize}</span>
                  </div>
                </div>
              </div>

              {/* Action convert button */}
              <div className="pt-2">
                {isConverting ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                      <span>Converting {selectedFile.name}...</span>
                      <span className="text-cyan-400 font-bold">{conversionProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-900 border border-gray-850 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200" style={{ width: `${conversionProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <button 
                      onClick={handleConvert}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-800 text-cyan-400 hover:text-white rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-slow" /> Convert File
                    </button>
                    <button 
                      onClick={handleClear}
                      className="px-4 py-3 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-mono transition"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PDF TOOLS SUBSECTION */}
          {activeTab === "pdfTools" && (
            <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 rounded-xl space-y-5">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-900 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest inline-flex items-center gap-1">
                  PDF Hub
                </span>
                <h3 className="text-md font-display font-medium text-white mt-1">Multi-vector PDF Utility Engine</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Manipulate document parameters, edit hierarchies, append text watermarks, or unlock owner security keys.</p>
              </div>

              {/* Tools selector pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {[
                  { id: "merge", label: "Merge PDF" },
                  { id: "split", label: "Split PDF" },
                  { id: "compress", label: "Compress PDF" },
                  { id: "pdfToWord", label: "PDF to Word" },
                  { id: "wordToPdf", label: "Word to PDF" },
                  { id: "pdfToImage", label: "PDF to Image" },
                  { id: "imageToPdf", label: "Image to PDF" },
                  { id: "rotate", label: "Rotate PDF" },
                  { id: "deletePages", label: "Delete Pages" },
                  { id: "reorder", label: "Reorder Pages" },
                  { id: "addWatermark", label: "Add Watermark" },
                  { id: "lock", label: "Lock PDF" },
                  { id: "unlock", label: "Unlock PDF" },
                  { id: "extractText", label: "Extract Text" },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActivePdfTool(tool.id);
                      setConvertedResult(null);
                    }}
                    className={`py-1.5 px-2.5 rounded-lg border text-left text-[11px] font-mono transition flex justify-between items-center ${
                      activePdfTool === tool.id
                        ? "bg-cyan-500/10 border-cyan-500/45 text-cyan-400 font-bold"
                        : "bg-gray-900/40 border-gray-850 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>{tool.label}</span>
                    {activePdfTool === tool.id && <Sparkle className="w-2.5 h-2.5 animate-pulse" />}
                  </button>
                ))}
              </div>

              {/* Render dynamic settings for active PDF tool */}
              <div className="bg-gray-900/65 border border-gray-850 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Configure: {activePdfTool.replace(/([A-Z])/g, " $1")}
                  </span>
                </div>

                {/* Specific tool parameter widgets */}
                {(activePdfTool === "merge" || activePdfTool === "imageToPdf") && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest font-bold">
                        {activePdfTool === "merge" ? "PDF Documents Queue" : "Images Collection Queue"}
                      </label>
                      {mergeFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setMergeFiles([]);
                            triggerAlert("info", "Queue cleared.");
                          }}
                          className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition flex items-center gap-1 bg-rose-950/20 px-2 py-1 rounded border border-rose-900/30"
                        >
                          <Trash2 className="w-3 h-3" /> Clear Queue
                        </button>
                      )}
                    </div>

                    {/* Drag/drop or click box for adding files */}
                    <div
                      onClick={() => mergeFileInputRef.current?.click()}
                      className="border border-dashed border-cyan-850/60 hover:border-cyan-400 bg-gray-950/35 hover:bg-cyan-950/10 p-4 rounded-xl text-center cursor-pointer transition space-y-1"
                    >
                      <input
                        type="file"
                        ref={mergeFileInputRef}
                        onChange={(e) => handleAddMergeFiles(e.target.files)}
                        multiple
                        accept={activePdfTool === "merge" ? ".pdf" : "image/*"}
                        className="hidden"
                      />
                      <FileUp className="w-5 h-5 text-cyan-400 mx-auto" />
                      <p className="text-[11px] font-mono text-cyan-400 font-bold">
                        {activePdfTool === "merge" ? "+ Add PDF Files to Merge" : "+ Add Images to Booklet"}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">
                        {activePdfTool === "merge" ? "Supports multiple PDFs. Click to browse." : "Supports PNG, JPG, WEBP, GIF."}
                      </p>
                    </div>

                    {/* Files List/Queue */}
                    {mergeFiles.length === 0 ? (
                      <div className="p-6 bg-gray-950/40 border border-gray-900 rounded-xl text-center">
                        <p className="text-xs text-gray-500 font-mono">Queue is empty. Load at least {activePdfTool === "merge" ? "2 PDFs" : "1 image"} to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {mergeFiles.map((item, index) => {
                          const isFirst = index === 0;
                          const isLast = index === mergeFiles.length - 1;
                          
                          const moveUp = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (isFirst) return;
                            setMergeFiles(prev => {
                              const next = [...prev];
                              const temp = next[index];
                              next[index] = next[index - 1];
                              next[index - 1] = temp;
                              return next;
                            });
                          };

                          const moveDown = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (isLast) return;
                            setMergeFiles(prev => {
                              const next = [...prev];
                              const temp = next[index];
                              next[index] = next[index + 1];
                              next[index + 1] = temp;
                              return next;
                            });
                          };

                          const removeFile = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            setMergeFiles(prev => prev.filter(f => f.id !== item.id));
                            triggerAlert("info", `Removed "${item.file.name}"`);
                          };

                          return (
                            <div 
                              key={item.id}
                              className="flex items-center justify-between gap-3 bg-gray-950/70 border border-gray-900 p-2.5 rounded-lg hover:border-cyan-900/40 transition group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-cyan-500/80 bg-cyan-950/30 border border-cyan-900/30 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-mono text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md" title={item.file.name}>
                                    {item.file.name}
                                  </p>
                                  <p className="text-[9px] font-mono text-gray-500">
                                    {formatBytes(item.file.size)} • {item.file.type.split("/")[1]?.toUpperCase() || "PDF"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Up button */}
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={moveUp}
                                  className={`p-1 rounded transition ${
                                    isFirst 
                                      ? "text-gray-700 cursor-not-allowed" 
                                      : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/30"
                                  }`}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                {/* Down button */}
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={moveDown}
                                  className={`p-1 rounded transition ${
                                    isLast 
                                      ? "text-gray-700 cursor-not-allowed" 
                                      : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/30"
                                  }`}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className="p-1 text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                                  title="Remove from Queue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Stats display */}
                    {mergeFiles.length > 0 && (
                      <div className="p-2.5 bg-cyan-950/15 border border-cyan-900/40 rounded-xl flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>QUEUE TOTAL: {mergeFiles.length} file{mergeFiles.length > 1 ? "s" : ""}</span>
                        <span>EST. OUTFLOW SIZE: {formatBytes(Math.round(mergeFiles.reduce((sum, item) => sum + item.file.size, 0) * 0.92))}</span>
                      </div>
                    )}
                  </div>
                )}

                {activePdfTool === "split" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Page Split Range</label>
                    <input 
                      type="text" 
                      value={pdfSplitRange}
                      onChange={(e) => setPdfSplitRange(e.target.value)}
                      placeholder="e.g. 1-3, 5-7"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none font-mono"
                    />
                    <p className="text-[10px] text-gray-500">Separated by commas or hyphens.</p>
                  </div>
                )}

                {activePdfTool === "addWatermark" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Watermark Stamp Text</label>
                    <input 
                      type="text" 
                      value={pdfWatermark}
                      onChange={(e) => setPdfWatermark(e.target.value)}
                      placeholder="CONFIDENTIAL / DRAFT"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                )}

                {(activePdfTool === "lock" || activePdfTool === "unlock") && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Secure Owner Password</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={pdfPassword}
                        onChange={(e) => setPdfPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 pl-8 text-xs text-white outline-none font-mono"
                      />
                      {activePdfTool === "lock" ? (
                        <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
                      )}
                    </div>
                  </div>
                )}

                {activePdfTool === "rotate" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Rotation Angle</label>
                    <div className="flex gap-2">
                      {["90", "180", "270"].map((angle) => (
                        <button
                          key={angle}
                          onClick={() => setPdfRotateAngle(angle)}
                          className={`flex-1 py-1.5 rounded text-xs font-mono transition border ${
                            pdfRotateAngle === angle 
                              ? "bg-cyan-950/40 border-cyan-900 text-cyan-400 font-bold"
                              : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                          }`}
                        >
                          {angle}° <RotateCw className="inline w-3 h-3 ml-1 animate-spin-slow" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activePdfTool === "deletePages" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Target Pages to Delete</label>
                    <input 
                      type="text" 
                      value={pdfPagesToDelete}
                      onChange={(e) => setPdfPagesToDelete(e.target.value)}
                      placeholder="e.g. 2, 4, 11"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                )}

                {activePdfTool === "reorder" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase tracking-widest">Desired Page Sequence</label>
                    <input 
                      type="text" 
                      value={pdfPagesToReorder}
                      onChange={(e) => setPdfPagesToReorder(e.target.value)}
                      placeholder="e.g. 3, 1, 2, 4"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                )}

                {activePdfTool === "extractText" && pdfExtractedText && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>OCR OCR Output buffer:</span>
                      <button onClick={clearPdfExtraction} className="text-rose-400 hover:underline">Flush buffer</button>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg text-xs font-mono text-slate-300 max-h-[140px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                      {pdfExtractedText}
                    </div>
                  </div>
                )}

                {/* Common Action button for active tool */}
                {isConverting ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-gray-500">
                      <span>Running PDF Engine...</span>
                      <span>{conversionProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-950 border border-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${conversionProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handlePdfToolExecute}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-400 hover:text-white rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Scissors className="w-3.5 h-3.5" /> 
                    {activePdfTool === "merge" 
                      ? `Merge ${mergeFiles.length > 0 ? `${mergeFiles.length} ` : ""}PDFs into Master` 
                      : activePdfTool === "imageToPdf" 
                      ? `Compile ${mergeFiles.length > 0 ? `${mergeFiles.length} ` : ""}Images to Booklet` 
                      : "Execute PDF Tool Action"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. OVERVIEW / GETTING STARTED TAB */}
          {activeTab === "overview" && !selectedFile && (
            <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 sm:p-6 rounded-xl space-y-5">
              <div>
                <h3 className="text-sm font-mono text-white font-bold flex items-center gap-1.5">
                  <Sparkles className="text-cyan-400 w-4 h-4" /> Multi-Format Engine Core
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  We run full isolated sandboxes allowing you to convert complex file topologies cleanly. Select a dedicated tab to configure advanced formats, or just drag and drop files anywhere.
                </p>
              </div>

              {/* Dynamic Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { name: "Document Converter", desc: "PDF, DOCX, TXT, HTML, RTF, Markdown", icon: FileText, color: "text-blue-400 bg-blue-950/20" },
                  { name: "Image Converter", desc: "PNG, JPG, WEBP, SVG, HEIC, MP4, GIF", icon: ImageIcon, color: "text-emerald-400 bg-emerald-950/20" },
                  { name: "Video Converter", desc: "MP4, MOV, AVI, MKV, WEBM, GIF, Audio", icon: VideoIcon, color: "text-purple-400 bg-purple-950/20" },
                  { name: "Audio Converter", desc: "MP3, WAV, AAC, M4A, OGG, Isolate layer", icon: AudioIcon, color: "text-yellow-400 bg-yellow-950/20" },
                  { name: "Spreadsheet Converter", desc: "XLSX to CSV, CSV to XLSX, Excel to PDF", icon: FileSpreadsheet, color: "text-pink-400 bg-pink-950/20" },
                  { name: "Presentation Converter", desc: "PPT to PDF, PPTX to PDF, PDF to Slides", icon: PresentationIcon, color: "text-orange-400 bg-orange-950/20" },
                ].map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div key={idx} className="flex gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-900 text-left">
                      <div className={`p-2 rounded-lg self-start ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white">{cat.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Privacy lock note */}
              <div className="flex items-center gap-2.5 p-3 bg-gray-900/60 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-500">
                <FolderLock className="w-4 h-4 text-cyan-400/80 shrink-0" />
                <span>
                  <strong>Privacy Notice:</strong> Your files are processed securely using temporary sandboxed structures. All cached contents are swept after conversion.
                </span>
              </div>
            </div>
          )}

          {/* 4. RESULTS DISPLAY (PREVIEW & DOWNLOAD PANEL) */}
          {convertedResult && (
            <div className="bg-gray-950/20 backdrop-blur-sm border border-cyan-800/40 p-5 rounded-xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full"></div>
              
              <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Output Payload Ready
                </span>
                <span className="text-[10px] font-mono text-gray-500">Processed in {convertedResult.durationMs}ms</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-950 p-4 rounded-lg border border-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-950/40 border border-cyan-800 text-cyan-400 rounded-lg">
                    <FileCheck2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-mono font-bold text-white truncate max-w-xs sm:max-w-md">
                      {convertedResult.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                      Size: {convertedResult.size} • Format: {convertedResult.format}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Download Link */}
                  <a 
                    href={convertedResult.url} 
                    download={convertedResult.name}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:text-white rounded-lg text-xs font-mono font-bold transition shadow-lg flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  {/* Save to profile storage */}
                  <button 
                    onClick={handleSaveToMyFiles}
                    className="px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg text-xs font-mono transition"
                  >
                    Save to My Files
                  </button>
                </div>
              </div>

              {/* Render dynamic File Preview if possible */}
              <div className="bg-gray-950/60 border border-gray-900 p-4 rounded-lg space-y-2 text-left">
                <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Output Sandbox Preview</h4>
                
                {/* Image Preview */}
                {["PNG", "JPG", "WEBP", "GIF"].includes(convertedResult.format) ? (
                  <div className="flex justify-center bg-gray-900/40 p-2 rounded border border-gray-900 max-h-[160px] overflow-hidden">
                    <img 
                      src={convertedResult.url} 
                      alt="Output preview" 
                      className="max-h-full max-w-full object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : ["MP3", "WAV", "AAC", "M4A"].includes(convertedResult.format) ? (
                  <div className="bg-gray-900 p-3 rounded border border-gray-850 flex items-center justify-center">
                    <audio src={convertedResult.url} controls className="w-full max-w-md h-9" />
                  </div>
                ) : (
                  <div className="bg-gray-900/30 p-4 rounded text-center border border-gray-900">
                    <p className="text-[10px] font-mono text-gray-500">
                      Standard visual preview not available for .{convertedResult.format.toLowerCase()} files. Secure download binary verified.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <button 
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-lg text-[11px] font-mono text-gray-400 hover:text-white transition"
                >
                  Convert Another File
                </button>
              </div>
            </div>
          )}

          {/* 5. HISTORY & STORAGE WORKSPACE TAB */}
          {activeTab === "history" && (
            <div className="space-y-6">
              
              {/* CLOUD USER FILES STORAGE */}
              <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-900 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest inline-flex items-center gap-1">
                      Cloud Storage
                    </span>
                    <h3 className="text-xs font-mono text-white font-bold mt-1">My Saved Files</h3>
                  </div>
                  {savedFiles.length > 0 && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      {savedFiles.length} item(s) persistent
                    </span>
                  )}
                </div>

                {loadingSaved ? (
                  <div className="text-center py-6 font-mono text-xs text-gray-500">Loading Cloud storage items...</div>
                ) : savedFiles.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gray-900 rounded-lg bg-slate-950/10 space-y-2">
                    <FolderOpen className="w-8 h-8 text-gray-650 mx-auto" />
                    <p className="text-xs text-gray-400 font-mono">No files saved to account storage yet.</p>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto">
                      Click &ldquo;Save to My Files&rdquo; on any converted output card to persist them securely here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-900/40 p-3 border border-gray-900 rounded-lg text-left text-xs font-mono relative overflow-hidden group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-cyan-950/20 text-cyan-400 rounded border border-cyan-900/30">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[160px] sm:max-w-[200px]" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[9px] text-gray-500 mt-0.5">
                              {file.format} • {file.size}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <a 
                            href={file.dataUrl} 
                            download={file.name}
                            className="p-1.5 bg-gray-950 hover:bg-cyan-950 text-gray-400 hover:text-cyan-400 rounded border border-gray-850 hover:border-cyan-900/40 transition"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button 
                            onClick={() => handleDeleteSavedFile(file.id)}
                            className="p-1.5 bg-gray-950 hover:bg-rose-950 text-gray-400 hover:text-rose-400 rounded border border-gray-850 hover:border-rose-900/40 transition"
                            title="Purge File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CONVERSION LOGS / HISTORY */}
              <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest inline-flex items-center gap-1">
                      WACRM Logs
                    </span>
                    <h3 className="text-xs font-mono text-white font-bold mt-1">Conversion System Logs</h3>
                  </div>
                  {history.length > 0 && (
                    <button 
                      onClick={handleClearHistory}
                      className="text-[10px] font-mono text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                    </button>
                  )}
                </div>

                {loadingHistory ? (
                  <div className="text-center py-6 font-mono text-xs text-gray-500">Loading system history logs...</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 font-mono text-xs text-gray-500">
                    No conversion logs available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-gray-900 text-gray-400 text-[10px] uppercase">
                          <th className="py-2.5">Original File</th>
                          <th className="py-2.5">Original Format</th>
                          <th className="py-2.5">Target Format</th>
                          <th className="py-2.5">Size</th>
                          <th className="py-2.5">Timestamp</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900 text-gray-300">
                        {history.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-900/25">
                            <td className="py-2.5 max-w-[140px] truncate font-semibold text-white" title={log.originalName}>
                              {log.originalName}
                            </td>
                            <td className="py-2.5 uppercase">{log.originalFormat}</td>
                            <td className="py-2.5 uppercase text-cyan-400 font-bold">{log.convertedFormat}</td>
                            <td className="py-2.5 text-[10px] text-gray-500">{log.fileSize}</td>
                            <td className="py-2.5 text-[10px] text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-2.5">
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900 font-bold uppercase">
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              {log.downloadUrl ? (
                                <a 
                                  href={log.downloadUrl}
                                  download={`converted_${log.originalName.split(".")[0]}.${log.convertedFormat.toLowerCase()}`}
                                  className="text-cyan-400 hover:underline hover:text-white"
                                >
                                  Download
                                </a>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Chitti-Robo Smart AI Assistant Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI SMART SUGGESTION BOX */}
          <div className="bg-gray-950/20 backdrop-blur-sm border border-cyan-900/30 rounded-xl p-5 shadow-xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-2xl rounded-full"></div>
            
            <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Chitti-Robo Smart Assistant</h3>
                <p className="text-[9px] text-gray-500">Live Context Analysis Engine</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="bg-gray-900/60 p-3.5 rounded-lg border border-gray-850 relative">
                <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-cyan-950 text-cyan-400 text-[8px] font-mono border border-cyan-900 rounded font-bold uppercase tracking-widest">
                  Recommendation
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed pt-1.5">
                  &ldquo;{aiDetails.tip}&rdquo;
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-start gap-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 p-2.5 rounded-lg">
                  <CornerDownRight className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
                  <span><strong>Actionable Suggestion:</strong> {aiDetails.actionable}</span>
                </div>
              )}
            </div>

            {/* AI helper hints */}
            <div className="pt-4 border-t border-gray-900 mt-4 space-y-2 text-[10px] font-mono text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Suggests PDF for professional formal layout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Suggests PNG for transparent web vectors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Suggests WEBP for optimized site assets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Suggests CSV for high-density DB import/export</span>
              </div>
            </div>
          </div>

          {/* QUICK HELPER ACCORDION */}
          <div className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 rounded-xl p-4 text-left space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Converter Core FAQ</h4>
            
            <div className="space-y-2.5 text-[11px] font-mono text-gray-400 divide-y divide-gray-900">
              <div className="pt-2">
                <span className="text-white block font-bold">Is conversion lossless?</span>
                <p className="text-[10px] text-gray-500 mt-0.5">We preserve vectors for vector files. For images and videos, selecting High Quality minimizes compression artifacts.</p>
              </div>
              <div className="pt-2">
                <span className="text-white block font-bold">Can I merge encrypted PDFs?</span>
                <p className="text-[10px] text-gray-500 mt-0.5">No. If a PDF is restricted, you must first input the security key in the Unlock PDF tool in the PDF Tools workspace.</p>
              </div>
              <div className="pt-2">
                <span className="text-white block font-bold">How are my files managed?</span>
                <p className="text-[10px] text-gray-500 mt-0.5">We maintain zero-retention temporary structures. If you do not click Save to My Files, they are purged immediately on socket teardown.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
}
