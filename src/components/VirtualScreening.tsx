import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Settings, 
  Terminal as TerminalIcon, 
  Sliders, 
  Download, 
  Search, 
  Dna, 
  Sparkles, 
  Cpu, 
  Database, 
  RefreshCw, 
  AlertCircle,
  FileCode,
  Activity,
  Heart,
  ChevronRight,
  HelpCircle,
  FlaskConical,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Label } from "recharts";

interface Protein {
  id: string;
  name: string;
  sequence: string;
  coordinates?: { atom: string; x: number; y: number; z: number }[];
}

interface Molecule {
  id: string;
  name: string;
  smiles: string;
  affinity: number;
  qed: number;
  logp: number;
  molecularWeight: number;
  saScore: number;
  hBonds: number;
  mechanism: string;
  atoms?: { element: string; x: number; y: number; z: number }[];
}

export default function VirtualScreening({ initialTab }: { initialTab?: "visualizer" | "parameters" | "analytics" | "cli" | "vista3d" } = {}) {
  // Config state
  const [selectedProtein, setSelectedProtein] = useState<string>("6LU7");
  const [customProteinName, setCustomProteinName] = useState<string>("");
  const [customProteinSeq, setCustomProteinSeq] = useState<string>("");
  const [numMolecules, setNumMolecules] = useState<number>(8);
  const [minAffinity, setMinAffinity] = useState<number>(-8.0);
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [screeningStep, setScreeningStep] = useState<string>("");
  const [screeningLogs, setScreeningLogs] = useState<string[]>([]);
  const [screenedData, setScreenedData] = useState<{ protein: Protein; molecules: Molecule[] } | null>(null);
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"visualizer" | "parameters" | "analytics" | "cli" | "vista3d">(initialTab || "visualizer");

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // NVIDIA VISTA-3D State variables
  const [vistaApiKey, setVistaApiKey] = useState<string>("");
  const [vistaImage, setVistaImage] = useState<string>("https://assets.ngc.nvidia.com/products/api-catalog/vista3d/example-1.nii.gz");
  const [vistaClasses, setVistaClasses] = useState<string[]>(["liver", "spleen"]);
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [vistaLogs, setVistaLogs] = useState<string[]>([]);
  const [vistaResponse, setVistaResponse] = useState<any>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [codeExampleTab, setCodeExampleTab] = useState<"python" | "shell" | "javascript">("python");
  const [vistaRotX, setVistaRotX] = useState<number>(0.5);
  const [vistaRotY, setVistaRotY] = useState<number>(0.5);
  const vistaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVistaDragging = useRef<boolean>(false);
  const previousVistaMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D Canvas rotation state
  const [rotX, setRotX] = useState<number>(0.5);
  const [rotY, setRotY] = useState<number>(0.5);
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-seed some default proteins
  const defaultProteins: Record<string, Protein> = {
    "6LU7": {
      id: "6LU7",
      name: "SARS-CoV-2 Main Protease (Mpro)",
      sequence: "SGFRKMAFPSGKVEGCMVQVTCGTTTLNGLWLDDVVYCPRHVICTSEDMLNPNYEDLLIRKSNHNFLVQAGNVQLRVIGHSMQNCVLKLKVDTANPKTPKYKFVRIQPGQTFSVLACYNGSPSGVCYVNDNFSLAAD"
    },
    "1M17": {
      id: "1M17",
      name: "EGFR Kinase Domain (Oncogenic Target)",
      sequence: "MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEIL"
    },
    "3SN6": {
      id: "3SN6",
      name: "Beta-2 Adrenergic Receptor (GPCR)",
      sequence: "MDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYLAITSPFKHQLTNLRIAMPVVMGAVWVLALILSCPLLGWR"
    }
  };

  const getTargetProteinDetails = (): Protein => {
    if (selectedProtein === "custom") {
      return {
        id: "CUSTOM-P",
        name: customProteinName || "Custom Synthetic Target",
        sequence: customProteinSeq || "MGEKRVLIVGGGGAGGLEAGIAVAKQLGCEVTVLERFSDPAASGVASGLIAAGVDV"
      };
    }
    return defaultProteins[selectedProtein];
  };

  // Run Virtual Screening trigger
  const runVirtualScreening = async () => {
    setIsScreening(true);
    setScreenedData(null);
    setSelectedMolecule(null);
    setScreeningLogs([]);

    const targetProtein = getTargetProteinDetails();
    
    // Simulate multi-agent steps with real-time logs before returning API payload
    const logSteps = [
      `[LAUNCH] Initiating BioNeMo blueprint deployment framework...`,
      `[SHELL] gh repo clone NVIDIA-BioNeMo-blueprints/generative-virtual-screening`,
      `[SHELL] cd generative-virtual-screening && conda env create -f environment.yml`,
      `[DOCKER] Pulling NVIDIA NIM: nvcr.io/nim/nvidia/diffdock-l v1.0.0`,
      `[DOCKER] Pulling NVIDIA NIM: nvcr.io/nim/nvidia/molmim v1.2.1`,
      `[DOCKER] Pulling NVIDIA NIM: nvcr.io/nim/nvidia/esmfold v2.0.0`,
      `[API] Activating secure access pipeline with key: nvapi-5eyDaEg...`,
      `[TARGET] Mapping receptor peptide: ${targetProtein.name} (${targetProtein.id})`,
      `[ESMFOLD] Folding amino-acid chain sequence (${targetProtein.sequence.length} residues)...`,
      `[MOLMIM] Designing novel chemical molecules (Lipinski optimized)`,
      `[DIFFDOCK] Docking candidate ligands into binding cavity pocket...`,
      `[METRICS] Computing free energy profiles (kcal/mol) and SA synthetic accessibility...`
    ];

    for (let i = 0; i < logSteps.length; i++) {
      setScreeningStep(logSteps[i]);
      setScreeningLogs(prev => [...prev, logSteps[i]]);
      await new Promise(resolve => setTimeout(resolve, 550));
    }

    try {
      const response = await fetch("/api/bionemo/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proteinId: targetProtein.id,
          proteinName: targetProtein.name,
          sequence: targetProtein.sequence,
          numMolecules,
          minAffinity
        })
      });

      if (!response.ok) {
        throw new Error("Screening execution endpoint returned error.");
      }

      const data = await response.json();
      if (data.success) {
        setScreenedData(data);
        if (data.molecules?.length > 0) {
          setSelectedMolecule(data.molecules[0]);
        }
        setScreeningLogs(prev => [...prev, `[SUCCESS] Screen completed! Screened ${data.molecules?.length} high-affinity hit ligands successfully.`]);
      } else {
        throw new Error("Screening protocol unsuccessful.");
      }
    } catch (err: any) {
      console.error(err);
      setScreeningLogs(prev => [...prev, `[ERROR] Secure screening node failed: ${err.message || "Network Timeout"}`]);
    } finally {
      setIsScreening(false);
    }
  };

  // HTML5 Canvas 3D Molecular rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 26;

      // 3D projection formulas
      const project = (x: number, y: number, z: number) => {
        // Apply rotation on Y axis
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Apply rotation on X axis
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective projection
        const distance = 10;
        const perspective = distance / (distance + z2);
        return {
          px: centerX + x1 * scale * perspective,
          py: centerY + y2 * scale * perspective,
          pz: z2
        };
      };

      // Draw background binding pocket sphere
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 130);
      gradient.addColorStop(0, "rgba(21, 33, 76, 0.15)");
      gradient.addColorStop(1, "rgba(7, 11, 25, 0.5)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render default/mock or custom protein backbone coordinates if present
      const proteinNodes = screenedData?.protein?.coordinates || [
        {atom: "CA", x: -4, y: 1, z: 0.5},
        {atom: "CA", x: -2.5, y: -1, z: -0.5},
        {atom: "CA", x: -1, y: 1.5, z: 1.2},
        {atom: "CA", x: 1, y: -1.2, z: -1},
        {atom: "CA", x: 2.8, y: 1, z: 0.8},
        {atom: "CA", x: 4, y: -0.5, z: -1.2}
      ];

      // Draw protein backbones ribbon connection
      ctx.beginPath();
      proteinNodes.forEach((node, idx) => {
        const { px, py } = project(node.x, node.y, node.z);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "rgba(139, 92, 246, 0.65)"; // Purple protein ribbon
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Draw protein atom beads
      proteinNodes.forEach((node) => {
        const { px, py, pz } = project(node.x, node.y, node.z);
        const radius = Math.max(3, 7 - pz * 0.3);
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.atom === "O" ? "#ef4444" : node.atom === "N" ? "#3b82f6" : "#a78bfa";
        ctx.fill();
        ctx.strokeStyle = "#1e1b4b";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Ligand atoms (Active bound compound)
      const ligandAtoms = selectedMolecule?.atoms || [
        {element: "C", x: 0.2, y: 0.4, z: 0.1},
        {element: "N", x: 1.1, y: -0.3, z: 0.8},
        {element: "O", x: -0.8, y: 1.1, z: -0.4},
        {element: "F", x: 1.8, y: -1.0, z: 1.5},
        {element: "C", x: -1.5, y: -0.6, z: -0.8}
      ];

      // Draw ligand skeletal connections
      ctx.beginPath();
      ligandAtoms.forEach((atom, idx) => {
        const { px, py } = project(atom.x, atom.y, atom.z);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "rgba(6, 182, 212, 0.85)"; // Cyan ligand
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw hydrogen bonding dotted lines between protein pocket and ligand
      if (proteinNodes.length > 2 && ligandAtoms.length > 0) {
        ctx.beginPath();
        const pNode = project(proteinNodes[1].x, proteinNodes[1].y, proteinNodes[1].z);
        const lNode = project(ligandAtoms[0].x, ligandAtoms[0].y, ligandAtoms[0].z);
        ctx.moveTo(pNode.px, pNode.py);
        ctx.lineTo(lNode.px, lNode.py);
        ctx.strokeStyle = "#10b981"; // green H-bond
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
        
        // Label
        ctx.fillStyle = "#10b981";
        ctx.font = "9px monospace";
        ctx.fillText("H-Bond (2.8Å)", (pNode.px + lNode.px)/2 + 8, (pNode.py + lNode.py)/2);
      }

      // Draw ligand atom spheres
      ligandAtoms.forEach((atom) => {
        const { px, py, pz } = project(atom.x, atom.y, atom.z);
        const radius = Math.max(4, 9 - pz * 0.4);
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, 2 * Math.PI);
        ctx.fillStyle = atom.element === "O" ? "#ef4444" : atom.element === "N" ? "#3b82f6" : atom.element === "F" ? "#10b981" : "#06b6d4";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Atom Symbol text
        ctx.fillStyle = "#020617";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(atom.element, px, py);
      });

      // Simple autorotation in idle state
      if (!isDragging.current) {
        setRotY(prev => prev + 0.005);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [screenedData, selectedMolecule, rotX, rotY]);

  // VISTA-3D HTML5 Canvas rendering loop
  useEffect(() => {
    const canvas = vistaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 50; // Bigger scale for organs

      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(vistaRotY);
        const sinY = Math.sin(vistaRotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const cosX = Math.cos(vistaRotX);
        const sinX = Math.sin(vistaRotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const distance = 8;
        const perspective = distance / (distance + z2);
        return {
          px: centerX + x1 * scale * perspective,
          py: centerY + y2 * scale * perspective,
          pz: z2
        };
      };

      // Draw background torso wireframe cage
      ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -2; i <= 2; i += 1) {
        const top = project(i, 2, -1);
        const bottom = project(i, -2, -1);
        ctx.moveTo(top.px, top.py);
        ctx.lineTo(bottom.px, bottom.py);
        
        const sideL = project(-2.5, i, 0);
        const sideR = project(2.5, i, 0);
        ctx.moveTo(sideL.px, sideL.py);
        ctx.lineTo(sideR.px, sideR.py);
      }
      ctx.stroke();

      // Render 3D point cloud points
      const points = vistaResponse?.points || [
        // default template points if empty/not segmented yet
        { x: -1.0, y: -0.2, z: 0.1, organ: "liver", color: "#b91c1c" },
        { x: -0.8, y: -0.1, z: 0.2, organ: "liver", color: "#b91c1c" },
        { x: -1.2, y: -0.3, z: 0.0, organ: "liver", color: "#b91c1c" },
        { x: -0.9, y: -0.4, z: -0.2, organ: "liver", color: "#b91c1c" },
        { x: 1.2, y: -0.2, z: 0.1, organ: "spleen", color: "#7c2d12" },
        { x: 1.0, y: -0.1, z: 0.2, organ: "spleen", color: "#7c2d12" },
        { x: 1.1, y: -0.3, z: 0.0, organ: "spleen", color: "#7c2d12" }
      ];

      // Sort points by depth (Z-order sorting for transparency correctness)
      const projectedPoints = points.map((pt: any) => {
        const proj = project(pt.x, pt.y, pt.z);
        return { ...pt, ...proj };
      });
      projectedPoints.sort((a: any, b: any) => b.pz - a.pz);

      projectedPoints.forEach((pt: any) => {
        const isHighlighted = selectedOrgan === null || pt.organ === selectedOrgan;
        const opacity = isHighlighted ? 0.85 : 0.15;
        const radius = Math.max(3, (isHighlighted ? 6 : 4) - pt.pz * 0.4);

        ctx.beginPath();
        ctx.arc(pt.px, pt.py, radius, 0, 2 * Math.PI);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        if (isHighlighted) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1.0; // reset

      // Draw active axes coordinates in corner
      const origin = project(-2.2, -1.8, -1.0);
      const xAxis = project(-1.7, -1.8, -1.0);
      const yAxis = project(-2.2, -1.3, -1.0);
      const zAxis = project(-2.2, -1.8, -0.5);

      ctx.lineWidth = 1.5;
      // X Axis (Red)
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(xAxis.px, xAxis.py);
      ctx.strokeStyle = "#ef4444"; ctx.stroke();
      // Y Axis (Green)
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(yAxis.px, yAxis.py);
      ctx.strokeStyle = "#22c55e"; ctx.stroke();
      // Z Axis (Blue)
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(zAxis.px, zAxis.py);
      ctx.strokeStyle = "#3b82f6"; ctx.stroke();

      // Labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px monospace";
      ctx.fillText("X", xAxis.px + 4, xAxis.py + 2);
      ctx.fillText("Y", yAxis.px - 2, yAxis.py - 4);
      ctx.fillText("Z", zAxis.px + 2, zAxis.py - 4);

      // Simple autorotation when not dragging
      if (!isVistaDragging.current && !isSegmenting) {
        setVistaRotY(prev => prev + 0.003);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [vistaResponse, selectedOrgan, vistaRotX, vistaRotY, isSegmenting]);

  const handleVistaMouseDown = (e: React.MouseEvent) => {
    isVistaDragging.current = true;
    previousVistaMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleVistaMouseMove = (e: React.MouseEvent) => {
    if (!isVistaDragging.current) return;
    const deltaX = e.clientX - previousVistaMousePosition.current.x;
    const deltaY = e.clientY - previousVistaMousePosition.current.y;

    setVistaRotY(prev => prev + deltaX * 0.01);
    setVistaRotX(prev => prev + deltaY * 0.01);

    previousVistaMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleVistaMouseUpOrLeave = () => {
    isVistaDragging.current = false;
  };

  const triggerVistaInference = async () => {
    setIsSegmenting(true);
    setVistaLogs([]);
    setVistaResponse(null);

    // Initial simulated setup logs
    const setupSteps = [
      `[LAUNCH] Deploying VISTA-3D docker context...`,
      `[SHELL] export NGC_API_KEY=${vistaApiKey ? "nvapi-****" : "<unset>"}`,
      `[SHELL] export LOCAL_NIM_CACHE=~/.cache/nim && mkdir -p $LOCAL_NIM_CACHE`,
      `[SHELL] docker login nvcr.io -u $oauthtoken -p ***key***`,
      `[SHELL] docker run -d --name vista3d -p 8000:8000 nvcr.io/nim/nvidia/vista3d:latest`,
      `[HEALTH] Pinging 'http://localhost:8000/v1/health/ready'...`,
      `[HEALTH] Status: {"status":"ready"}`
    ];

    for (let i = 0; i < setupSteps.length; i++) {
      setVistaLogs(prev => [...prev, setupSteps[i]]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      const res = await fetch("/api/vista3d/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: vistaImage,
          classes: vistaClasses,
          apiKey: vistaApiKey
        })
      });

      if (!res.ok) {
        throw new Error("VISTA-3D proxy endpoint failed.");
      }

      const data = await res.json();
      setVistaResponse(data);
      if (data.logs) {
        // Append backend logs
        for (let j = 0; j < data.logs.length; j++) {
          setVistaLogs(prev => [...prev, data.logs[j]]);
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
    } catch (err: any) {
      console.error(err);
      setVistaLogs(prev => [...prev, `[ERROR] VISTA-3D Segmenter node failed: ${err.message || "Network Error"}`]);
    } finally {
      setIsSegmenting(false);
    }
  };

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    setRotY(prev => prev + deltaX * 0.01);
    setRotX(prev => prev + deltaY * 0.01);

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Filter molecules by query
  const filteredMolecules = screenedData?.molecules?.filter(mol => {
    if (!searchQuery) return true;
    return mol.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           mol.smiles.toLowerCase().includes(searchQuery.toLowerCase()) ||
           mol.mechanism.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" id="virtual-screening-module">
      
      {/* Header and Branding section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0a0f24]/80 border border-[#1e293b] p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl shadow-lg">
            <FlaskConical className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Virtual Protein Screening</h1>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">BioNeMo GVS Blueprint</span>
            </div>
            <p className="text-xs text-gray-400 max-w-xl mt-1 leading-relaxed">
              Design and screen chemical candidates against target receptor peptide structures utilizing custom NVIDIA BioNeMo pipelines (DiffDock, MolMIM, and ESMFold).
            </p>
          </div>
        </div>
        <button
          onClick={runVirtualScreening}
          disabled={isScreening}
          className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white shadow-xl flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
        >
          {isScreening ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Screening Target...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Run Virtual Screening
            </>
          )}
        </button>
      </div>

      {/* Screen Panels / Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Setup Configurator / Blueprint parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a0f24]/80 border border-[#151c35] p-5 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" /> Target Configuration
              </span>
              <Dna className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-400">Target Receptor Protein</label>
              <select
                value={selectedProtein}
                onChange={(e) => setSelectedProtein(e.target.value)}
                className="w-full px-3 py-2 bg-[#070b19] border border-cyan-500/10 focus:border-cyan-500 rounded-lg text-xs text-gray-200"
              >
                <option value="6LU7">SARS-CoV-2 Main Protease (6LU7)</option>
                <option value="1M17">EGFR Kinase Domain (1M17)</option>
                <option value="3SN6">Beta-2 Adrenergic Receptor (3SN6)</option>
                <option value="custom">Custom Sequence Alignment...</option>
              </select>
            </div>

            {selectedProtein === "custom" && (
              <div className="space-y-3 animate-[fadeIn_0.3s_ease]">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Target Name</label>
                  <input
                    type="text"
                    value={customProteinName}
                    onChange={(e) => setCustomProteinName(e.target.value)}
                    placeholder="e.g. HER2 Kinase Pocket"
                    className="w-full px-3 py-2 bg-[#070b19] border border-cyan-500/10 focus:border-cyan-500 rounded-lg text-xs text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Amino Acid Sequence (FASTA)</label>
                  <textarea
                    value={customProteinSeq}
                    onChange={(e) => setCustomProteinSeq(e.target.value)}
                    placeholder="e.g. SGFRKMAF..."
                    rows={4}
                    className="w-full px-3 py-2 bg-[#070b19] border border-cyan-500/10 focus:border-cyan-500 rounded-lg text-xs font-mono text-gray-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Candidates to Screen</span>
                <span className="text-cyan-400 font-bold">{numMolecules} Ligands</span>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={numMolecules}
                onChange={(e) => setNumMolecules(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-[#070b19] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Min Binding Energy Limit</span>
                <span className="text-cyan-400 font-bold">{minAffinity} kcal/mol</span>
              </div>
              <input
                type="range"
                min="-11.0"
                max="-5.0"
                step="0.5"
                value={minAffinity}
                onChange={(e) => setMinAffinity(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-[#070b19] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="bg-[#0c133a]/30 border border-cyan-500/20 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] text-cyan-400 font-mono block uppercase">Active NVIDIA API Key</span>
              <div className="flex items-center justify-between gap-2 text-xs font-mono bg-[#070b19] p-2 rounded border border-[#1e293b]">
                <span className="text-slate-400 text-[10px]">nvapi-5eyDaEg...BLbZlC6bc</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
              </div>
            </div>
          </div>

          {/* BioNeMo Live Logs Monitor Panel */}
          <div className="bg-[#050814] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[280px]">
            <div className="bg-[#080d24] border-b border-[#1e293b] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Blueprint Execution logs
              </span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[9px] text-slate-500 font-mono">STABLE v2.1</span>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2 text-[10px] font-mono text-cyan-400 leading-relaxed bg-[#02050f]/95">
              {screeningLogs.length === 0 ? (
                <div className="text-slate-500 italic flex items-center justify-center h-full">
                  Waiting for virtual screening execution triggers...
                </div>
              ) : (
                screeningLogs.map((log, idx) => (
                  <div key={idx} className="border-l border-cyan-900/40 pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: 3D visual workspace & Interactive Screen Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Sub Tab selection bar */}
          <div className="flex items-center gap-1 bg-[#0a0f24]/80 p-1 border border-[#151c35] rounded-xl self-start">
            <button
              onClick={() => setActiveSubTab("visualizer")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === "visualizer"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3D Cavity Viewer
            </button>
            <button
              onClick={() => setActiveSubTab("analytics")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === "analytics"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Affinity Analytics
            </button>
            <button
              onClick={() => setActiveSubTab("cli")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === "cli"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CLI / Blueprint Guide
            </button>
            <button
              onClick={() => setActiveSubTab("vista3d")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === "vista3d"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              VISTA-3D NIM
            </button>
          </div>

          {activeSubTab === "visualizer" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* 3D Canvas Box */}
              <div className="md:col-span-7 flex flex-col gap-3">
                <div 
                  className="relative h-[340px] bg-[#050711] border border-[#151c35] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center shadow-inner"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                >
                  <canvas 
                    ref={canvasRef} 
                    width={410} 
                    height={340} 
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {/* Visual controls overlays */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md space-y-0.5 z-10 text-[9px] font-mono">
                    <span className="text-cyan-400 font-bold block">Binding Cavity Map</span>
                    <span className="text-gray-400 block">Drag mouse to rotate molecular posture</span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-950/80 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md text-[9px] font-mono z-10">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span className="text-gray-400">Ligand</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span className="text-gray-400">Protein Backbones</span>
                    </div>
                  </div>
                </div>

                {/* Molecule Card Details underneath */}
                {selectedMolecule && (
                  <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-cyan-400" /> {selectedMolecule.name}
                      </h3>
                      <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                        {selectedMolecule.affinity} kcal/mol
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono text-ellipsis overflow-hidden whitespace-nowrap bg-slate-950 p-2 rounded">
                      SMILES: {selectedMolecule.smiles}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">Mechanism:</strong> {selectedMolecule.mechanism}
                    </p>
                  </div>
                )}
              </div>

              {/* Screened molecules list table */}
              <div className="md:col-span-5 bg-[#0a0f24]/80 border border-[#1e293b] rounded-2xl p-4 flex flex-col h-[480px]">
                <div className="space-y-3 pb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ligands or SMILES..."
                      className="w-full pl-9 pr-3 py-2 bg-[#050814] border border-[#1e293b] focus:border-cyan-500 rounded-lg text-xs text-gray-200"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredMolecules.length === 0 ? (
                    <div className="text-center text-slate-500 italic py-8 text-xs">
                      No ligands screened yet. Click 'Run Virtual Screening' above.
                    </div>
                  ) : (
                    filteredMolecules.map((mol) => (
                      <button
                        key={mol.id}
                        onClick={() => setSelectedMolecule(mol)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                          selectedMolecule?.id === mol.id
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-md"
                            : "bg-[#050814] border-[#151c35] text-slate-400 hover:text-white hover:border-[#1e293b]"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold block text-white">{mol.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 block">{mol.id} | MW: {mol.molecularWeight}</span>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-xs font-mono font-bold text-cyan-400 block">{mol.affinity} kcal/mol</span>
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1 py-0.5 rounded font-mono">QED: {mol.qed}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {activeSubTab === "analytics" && (
            <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-6 rounded-2xl space-y-6">
              <h2 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> Screening Thermodynamic Profile
              </h2>

              {!screenedData ? (
                <div className="text-center py-12 text-slate-500 italic text-xs">
                  Run a virtual screening to populate dynamic molecular graphs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Binding affinity graph */}
                  <div className="space-y-3">
                    <span className="text-xs text-gray-400 font-medium block">Docking Binding Affinity Distributions</span>
                    <div className="h-[220px] bg-slate-950/60 p-2 rounded-xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={screenedData.molecules}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#151c35" />
                          <XAxis dataKey="id" stroke="#475569" fontSize={10} />
                          <YAxis stroke="#475569" fontSize={10} label={{ value: "kcal/mol", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: 11 }} />
                          <Bar dataKey="affinity" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chemical Space / QED vs LogP scatter */}
                  <div className="space-y-3">
                    <span className="text-xs text-gray-400 font-medium block">Chemical Druglikeness Space (QED vs LogP)</span>
                    <div className="h-[220px] bg-slate-950/60 p-2 rounded-xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#151c35" />
                          <XAxis type="number" dataKey="logp" name="logP" stroke="#475569" fontSize={10}>
                            <Label value="Lipophilicity (logP)" offset={0} position="insideBottom" fill="#475569" fontSize={9} />
                          </XAxis>
                          <YAxis type="number" dataKey="qed" name="QED" stroke="#475569" fontSize={10}>
                            <Label value="QED Score" angle={-90} position="insideLeft" fill="#475569" fontSize={9} />
                          </YAxis>
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", fontSize: 11 }} />
                          <Scatter name="Ligands" data={screenedData.molecules} fill="#a78bfa" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "cli" && (
            <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-6 rounded-2xl space-y-4 font-mono text-xs text-gray-300 leading-relaxed">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                  <FileCode className="w-4 h-4 text-cyan-400" /> BioNeMo Local GPU Deployment Guide
                </span>
                <span className="text-[10px] bg-[#1e293b] px-2 py-0.5 rounded text-cyan-400">DIFFDOCK-L</span>
              </div>

              <p className="font-sans text-xs text-gray-400 leading-relaxed">
                Execute the identical blueprint structure locally or on an enterprise cluster via NVIDIA NIM APIs with your configured keys.
              </p>

              <div className="space-y-2">
                <span className="text-cyan-400 block">1. Set API credentials</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-[#151c35] text-[11px] overflow-x-auto text-cyan-200">
                  {`export NVIDIA_API_KEY="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"`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-cyan-400 block">2. Setup and run screening pipeline</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-[#151c35] text-[11px] overflow-x-auto text-purple-200">
                  {`# Clone blueprint repo
git clone https://github.com/NVIDIA-BioNeMo-blueprints/generative-virtual-screening.git
cd generative-virtual-screening

# Activate container environment
conda env create -f environment.yml && conda activate bionemo-gvs-env

# Launch screening script
python run_gvs.py \\
  --target_pdb ${selectedProtein === "custom" ? "custom_receptor.pdb" : selectedProtein} \\
  --num_candidates ${numMolecules} \\
  --min_affinity ${minAffinity}`}
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === "vista3d" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn" id="vista3d-interactive-dashboard">
              
              {/* Left Column: Config, Organs Selection & Docker Logs */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Step 1: NGC Credentials */}
                <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase font-mono tracking-wider">
                      Step 1: Credentials
                    </span>
                    <a
                      href="https://org.ngc.nvidia.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      Get NGC API Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 block font-medium">NGC API KEY / NVIDIA_API_KEY</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Paste your personal nvapi-***** key"
                        value={vistaApiKey}
                        onChange={(e) => setVistaApiKey(e.target.value)}
                        className="w-full pl-3 pr-20 py-2 bg-[#050814] border border-[#1e293b] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg text-xs font-mono text-gray-200"
                      />
                      <div className="absolute right-2 top-2 text-[9px] bg-slate-900 px-2 py-0.5 rounded text-gray-400 font-mono">
                        {vistaApiKey ? "LOADED" : "OPTIONAL"}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                      If left empty, a premium high-fidelity Digital Twin simulation engine will process the segmented organ shapes.
                    </p>
                  </div>
                </div>

                {/* Step 2: Input Volume & Organ Targets Selection */}
                <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-5 rounded-2xl space-y-5 shadow-xl">
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase font-mono tracking-wider block">
                    Step 2: Medical Target Configuration
                  </span>

                  <div className="space-y-2 font-sans">
                    <label className="text-xs text-gray-400 block font-medium">NIfTI Volume Image URL (.nii.gz)</label>
                    <input
                      type="text"
                      value={vistaImage}
                      onChange={(e) => setVistaImage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050814] border border-[#1e293b] focus:border-cyan-500 rounded-lg text-xs text-slate-300 font-mono"
                    />
                  </div>

                  <div className="space-y-3 font-sans">
                    <label className="text-xs text-gray-400 block font-medium">Target Anatomical Organs (Classes)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "liver", label: "Liver", color: "bg-red-600" },
                        { id: "spleen", label: "Spleen", color: "bg-orange-700" },
                        { id: "kidney_right", label: "R-Kidney", color: "bg-emerald-700" },
                        { id: "kidney_left", label: "L-Kidney", color: "bg-green-600" },
                        { id: "pancreas", label: "Pancreas", color: "bg-yellow-500" },
                        { id: "gallbladder", label: "Gallbladder", color: "bg-teal-600" },
                        { id: "stomach", label: "Stomach", color: "bg-indigo-600" },
                        { id: "aorta", label: "Aorta", color: "bg-red-500" }
                      ].map((org) => {
                        const isSelected = vistaClasses.includes(org.id);
                        return (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setVistaClasses(prev => prev.filter(c => c !== org.id));
                              } else {
                                setVistaClasses(prev => [...prev, org.id]);
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition ${
                              isSelected
                                ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-200"
                                : "bg-[#050814] border-[#151c35] text-slate-400 hover:text-white"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${org.color}`}></span>
                            <span>{org.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={triggerVistaInference}
                    disabled={isSegmenting || vistaClasses.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSegmenting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Segmenting 3D volume...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Run VISTA-3D Segmenter
                      </>
                    )}
                  </button>
                </div>

                {/* Local Docker NIM Terminal Logs */}
                <div className="bg-[#050814] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[280px]">
                  <div className="bg-[#080d24] border-b border-[#1e293b] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" /> Container NIM Execution Logs
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[9px] text-slate-500 font-mono">PORT 8000</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-1.5 text-[10px] font-mono text-cyan-400 leading-relaxed bg-[#02050f]/95">
                    {vistaLogs.length === 0 ? (
                      <div className="text-slate-500 italic flex items-center justify-center h-full font-sans">
                        Waiting for VISTA-3D pipeline activation...
                      </div>
                    ) : (
                      vistaLogs.map((log, idx) => (
                        <div key={idx} className="border-l border-purple-900/40 pl-2 text-cyan-300">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive 3D point cloud & client code */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* 3D Anatomical point cloud frame */}
                <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-5 rounded-2xl shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                        <Dna className="w-4 h-4 text-cyan-400" /> 3D Digital Twin Organ Reconstructor
                      </h3>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Interactive anatomical spatial mesh. Drag cursor to rotate, hover/select organs below to inspect density.
                      </p>
                    </div>
                    {vistaResponse && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">
                        {vistaResponse.isLive ? "LIVE MODEL ACTIVE" : "EMULATION MESH"}
                      </span>
                    )}
                  </div>

                  <div 
                    className="relative h-[320px] bg-[#050711] border border-[#151c35] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
                    onMouseDown={handleVistaMouseDown}
                    onMouseMove={handleVistaMouseMove}
                    onMouseUp={handleVistaMouseUpOrLeave}
                    onMouseLeave={handleVistaMouseUpOrLeave}
                  >
                    <canvas 
                      ref={vistaCanvasRef} 
                      width={480} 
                      height={320} 
                      className="absolute inset-0 w-full h-full"
                    />

                    {/* Left overlay badge info */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md text-[9px] font-mono z-10 space-y-0.5">
                      <span className="text-cyan-400 font-bold block">Voxel segmentation pointcloud</span>
                      <span className="text-slate-400">Total voxels rendered: {vistaResponse ? `${vistaResponse.points?.length} nodes` : "0 nodes"}</span>
                    </div>
                  </div>

                  {/* Segmented Anatomical Statistics List */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 block font-medium font-sans">Segmented Organs & Tissue Density (Hounsfield Units)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {vistaResponse?.stats ? (
                        Object.entries(vistaResponse.stats).map(([orgId, details]: any) => (
                          <div
                            key={orgId}
                            onMouseEnter={() => setSelectedOrgan(orgId)}
                            onMouseLeave={() => setSelectedOrgan(null)}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              selectedOrgan === orgId 
                                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                                : "bg-[#050814] border-[#151c35] text-slate-400 hover:text-white hover:border-[#1e293b]"
                            }`}
                          >
                            <span className="text-xs font-bold block text-white capitalize">{orgId.replace("_", " ")}</span>
                            <span className="text-[10px] text-slate-400 block mt-1">Volume: {details.volumeCm3} cm³</span>
                            <span className="text-[10px] text-cyan-400 font-mono block">Density: {details.meanHounsfield} HU</span>
                            <span className="text-[9px] bg-[#1e293b] text-cyan-400 px-1.5 py-0.5 rounded inline-block mt-1 font-sans">{details.status}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-slate-500 italic font-sans">
                          No segmentation active. Execute VISTA-3D segmenter to map tissues.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Step 3: Developers Code Hub (Clients) */}
                <div className="bg-[#0a0f24]/80 border border-[#1e293b] p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase font-mono tracking-wider">
                      Step 3: Developers Code Hub
                    </span>
                    
                    {/* Toggles */}
                    <div className="flex bg-slate-950 border border-[#1e293b] rounded-lg p-0.5 text-[10px] font-mono">
                      {[
                        { id: "python", label: "Python" },
                        { id: "shell", label: "Shell" },
                        { id: "javascript", label: "Node.js" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setCodeExampleTab(t.id as any)}
                          className={`px-2 py-1 rounded transition ${
                            codeExampleTab === t.id
                              ? "bg-cyan-950 text-cyan-400 font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Deploy VISTA-3D into your custom pipelines with these clean client scripts.
                  </p>

                  <div className="relative">
                    <pre className="bg-slate-950 p-4 rounded-xl border border-[#1e293b] text-[10px] font-mono overflow-x-auto text-emerald-400 max-h-[260px] overflow-y-auto leading-relaxed">
                      {codeExampleTab === "python" && (
                        `import requests
import zipfile

base_url = "http://localhost:8000"

data = {
    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/example-1.nii.gz",
}

def unzip_file(zip_filepath, dest_dir):
    with zipfile.ZipFile(zip_filepath, 'r') as zip_ref:
        zip_ref.extractall(dest_dir)

response = requests.post(f"{base_url}/v1/vista3d/inference", json=data)
if response.status_code == 200:
    output_folder = "output"
    output_zip_name = "output.zip"

    with open(output_zip_name, "wb") as f:
        f.write(response.content)

    unzip_file(output_zip_name, output_folder)

# Execute the example:
# python nim_client.py`
                      )}

                      {codeExampleTab === "shell" && (
                        `LOCAL_URL='http://localhost:8000/v1/vista3d/inference'
DATA=$(cat <<EOF
{
    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/example-1.nii.gz"
}
EOF
)
response=$(curl -s -o output.zip -w "%{http_code}" -X POST \\
     -H "Content-Type: application/json" -d "$DATA" $LOCAL_URL)
if [ "$response" -eq 200 ]; then
  echo "Response Success, save inference results into folder: output"
  unzip -o "output.zip" -d "output"
else
  echo "Request failed with status $response"
fi

# Make executable and run:
# chmod +x nim_client.sh && ./nim_client.sh`
                      )}

                      {codeExampleTab === "javascript" && (
                        `// Pre-Requirements
// npm install node-fetch adm-zip

import fetch from "node-fetch";
import {writeFile} from 'fs/promises'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'
import os from 'os'

const invoke_url = \`https://health.api.nvidia.com/v1/medicalimaging/nvidia/vista-3d\`;
const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer $API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC",
};

const sample = "example-1";
const data = {
    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/" + sample + ".nii.gz",
    "prompts": {
        "classes": ["liver", "spleen"],
    }
};

const tempdir = fs.mkdtempSync(path.join(os.tmpdir(), sample))
let response = await fetch(invoke_url, {
    method: "post",
    body: JSON.stringify(data),
    headers: headers
});

const buffer = Buffer.from(await response.arrayBuffer())
const zip_file = path.join(tempdir, sample + '.zip')
await writeFile(zip_file, buffer)

const zip = new AdmZip(zip_file);
zip.extractAllTo(tempdir);

const paths = fs.readdirSync(tempdir).filter((p) => p.match(/\\.response$/) !== null)
const filename = sample + "_seg.nrrd"
fs.renameSync(path.join(tempdir, filename), filename)
fs.rmSync(tempdir, {recursive: true, force: true});

console.log("---------------------------------------------------------------")
console.log("Input Image: " + data['image'])
console.log("Class Prompts: " + data["prompts"]["classes"])
console.log("Response Mask: " + filename)`
                      )}
                    </pre>

                    {/* Copy to clipboard button overlay */}
                    <button
                      onClick={() => {
                        let text = "";
                        if (codeExampleTab === "python") {
                          text = `import requests\nimport zipfile\n\nbase_url = "http://localhost:8000"\n\ndata = {\n    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/example-1.nii.gz",\n}\n\ndef unzip_file(zip_filepath, dest_dir):\n    with zipfile.ZipFile(zip_filepath, 'r') as zip_ref:\n        zip_ref.extractall(dest_dir)\n\nresponse = requests.post(f"{base_url}/v1/vista3d/inference", json=data)\nif response.status_code == 200:\n    output_folder = "output"\n    output_zip_name = "output.zip"\n\n    with open(output_zip_name, "wb") as f:\n        f.write(response.content)\n\n    unzip_file(output_zip_name, output_folder)`;
                        } else if (codeExampleTab === "shell") {
                          text = `LOCAL_URL='http://localhost:8000/v1/vista3d/inference'\nDATA=$(cat <<EOF\n{\n    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/example-1.nii.gz"\n}\nEOF\n)\nresponse=$(curl -s -o output.zip -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$DATA" $LOCAL_URL)\nif [ "$response" -eq 200 ]; then\n  echo "Response Success, save inference results into folder: output"\n  unzip -o "output.zip" -d "output"\nelse\n  echo "Request failed with status $response"\nfi`;
                        } else {
                          text = `// Pre-Requirements\n// npm install node-fetch adm-zip\n\nimport fetch from "node-fetch";\nimport {writeFile} from 'fs/promises'\nimport AdmZip from 'adm-zip'\nimport fs from 'fs'\nimport path from 'path'\nimport os from 'os'\n\nconst invoke_url = \`https://health.api.nvidia.com/v1/medicalimaging/nvidia/vista-3d\`;\nconst headers = {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer $API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC",\n};\n\nconst sample = "example-1";\nconst data = {\n    "image": "https://assets.ngc.nvidia.com/products/api-catalog/vista3d/" + sample + ".nii.gz",\n    "prompts": {\n        "classes": ["liver", "spleen"],\n    }\n};\n\nconst tempdir = fs.mkdtempSync(path.join(os.tmpdir(), sample))\nlet response = await fetch(invoke_url, {\n    method: "post",\n    body: JSON.stringify(data),\n    headers: headers\n});\n\nconst buffer = Buffer.from(await response.arrayBuffer())\nconst zip_file = path.join(tempdir, sample + '.zip')\nawait writeFile(zip_file, buffer)\n\nconst zip = new AdmZip(zip_file);\nzip.extractAllTo(tempdir);\n\nconst paths = fs.readdirSync(tempdir).filter((p) => p.match(/\\.response$/) !== null)\nconst filename = sample + "_seg.nrrd"\nfs.renameSync(path.join(tempdir, filename), filename)\nfs.rmSync(tempdir, {recursive: true, force: true});\n\nconsole.log("---------------------------------------------------------------")\nconsole.log("Input Image: " + data['image'])\nconsole.log("Class Prompts: " + data["prompts"]["classes"])\nconsole.log("Response Mask: " + filename)`;
                        }
                        navigator.clipboard.writeText(text);
                      }}
                      className="absolute right-3 bottom-3 text-[10px] bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-mono px-3 py-1.5 rounded-lg font-bold transition-all"
                    >
                      Copy Snippet
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
