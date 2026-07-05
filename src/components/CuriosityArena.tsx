import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Search,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  FileText,
  Bookmark,
  Activity,
  Award,
  BookOpen,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ExternalLink,
  Brain,
  History,
  Trash2,
  Radio,
  Eye,
  Info,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  Sliders,
  Globe2
} from "lucide-react";

interface Source {
  title: string;
  organization: string;
  link: string;
  whyRelevant: string;
}

interface RealityCheck {
  proven: string[];
  notProven: string[];
  possible: string[];
  impossible: string[];
  unknown: string[];
}

interface MultiStreamThoughts {
  scientist: string;
  philosopher: string;
  mythology: string;
  spiritual: string;
  historian: string;
  psychologist: string;
  futurist: string;
  skeptic: string;
}

interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

interface SimulationConfig {
  type: string;
  title: string;
  explanation: string;
  sliders: SliderConfig[];
  interactiveData?: any;
}

interface CuriosityData {
  category: string;
  proofLevel: string;
  isWarningNeeded: boolean;
  warningMessage: string;
  simpleAnswer: string;
  whatScienceSays: string;
  whatPhilosophySays: string;
  whatMythologyReligionSays: string;
  whatTheoreticalScienceSays: string;
  realityCheck: RealityCheck;
  top10Sources: Source[];
  multiStreamThoughts: MultiStreamThoughts;
  simulationConfig: SimulationConfig;
}

interface HistoryItem {
  id: string;
  question: string;
  category: string;
  proofLevel: string;
  timestamp: string;
  result: CuriosityData;
}

export default function CuriosityArena() {
  const [question, setQuestion] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curiosityResult, setCuriosityResult] = useState<CuriosityData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"analysis" | "simulation" | "thoughts" | "sources">("analysis");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});
  const [simExplanationOpen, setSimExplanationOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isObserveToggled, setIsObserveToggled] = useState(false);

  // Dragging states for panning
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const categories = [
    "Reality", "Existence", "Quantum", "Multiverse", "Aliens", "God", 
    "Soul", "Mythology", "Magic", "Demon", "Time", "Dimensions", 
    "Consciousness", "Physics", "Unknown"
  ];

  const presets = [
    { text: "Are we living in a simulation?", cat: "Reality" },
    { text: "Does the soul exist?", cat: "Soul" },
    { text: "Is time travel possible?", cat: "Time" },
    { text: "What existed before the Big Bang?", cat: "Physics" },
    { text: "Are aliens real?", cat: "Aliens" },
    { text: "Is magic real?", cat: "Magic" },
    { text: "What is quantum immortality?", cat: "Quantum" },
    { text: "What is consciousness?", cat: "Consciousness" },
    { text: "Do demons exist?", cat: "Demon" },
    { text: "Is god scientifically proven?", cat: "God" }
  ];

  // Fetch curiosity log history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/curiosity/history");
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        if (data.history.length > 0 && !curiosityResult) {
          // Pre-load the latest item as default
          setCuriosityResult(data.history[0].result);
          initializeSliders(data.history[0].result.simulationConfig);
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const initializeSliders = (config: SimulationConfig) => {
    if (config?.sliders) {
      const initialValues: { [key: string]: number } = {};
      config.sliders.forEach(s => {
        initialValues[s.id] = s.defaultValue;
      });
      setSliderValues(initialValues);
    }
    // Reset simulation interactive variables
    setRotationAngle(0);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsObserveToggled(false);
  };

  const handleQuery = async (queryText: string, categoryContext?: string | null) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/curiosity/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText, category: categoryContext })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Query processing failed.");
      }
      setCuriosityResult(resData.data);
      initializeSliders(resData.data.simulationConfig);
      await fetchHistory(); // refresh sidebar history
    } catch (err: any) {
      setError(err.message || "An unexpected cosmological error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/curiosity/history/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        if (curiosityResult && history.find(h => h.id === id)?.result === curiosityResult) {
          setCuriosityResult(null);
        }
      }
    } catch (err) {
      console.error("Error deleting history entry:", err);
    }
  };

  // Canvas-based Mini Simulation Renderer Loop
  useEffect(() => {
    if (!canvasRef.current || !curiosityResult || activeTab !== "simulation") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localAngle = rotationAngle;
    const simType = curiosityResult.simulationConfig.type;

    // Sub-renderers
    const renderSimulation = () => {
      // Clear with elegant deep grid background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save translation state for zoom and pan
      ctx.save();
      ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.rotate(localAngle);

      // Grid helper lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -600; x <= 600; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -600);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = -600; y <= 600; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-600, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }

      // Read current sliders
      const getVal = (id: string, fallback: number) => sliderValues[id] !== undefined ? sliderValues[id] : fallback;

      const time = Date.now() * 0.002;

      // Draw specific simulation
      if (simType === "quantum") {
        const freq = getVal("frequency", 5) || getVal("energy", 5) || 5;
        const width = getVal("packet_width", 40) || 40;

        ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.stroke();

        // Wave probability envelope
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
        ctx.lineWidth = 3;
        for (let x = -200; x <= 200; x++) {
          const envelope = Math.exp(-Math.pow(x / width, 2));
          let y = Math.sin(x * (freq * 0.1) - time) * 60 * envelope;
          if (isObserveToggled) {
            // Wavefunction collapsed to single delta peaks
            y = Math.sin(time * 5) * 5 * Math.exp(-Math.pow(x / 5, 2));
          }
          if (x === -200) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Probability wave height area
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
        ctx.beginPath();
        ctx.moveTo(-200, 0);
        for (let x = -200; x <= 200; x++) {
          const envelope = Math.exp(-Math.pow(x / width, 2));
          let y = Math.sin(x * (freq * 0.1) - time) * 60 * envelope;
          if (isObserveToggled) {
            y = Math.sin(time * 5) * 5 * Math.exp(-Math.pow(x / 5, 2));
          }
          ctx.lineTo(x, y);
        }
        ctx.lineTo(200, 0);
        ctx.closePath();
        ctx.fill();

        // Particle indicator
        if (isObserveToggled) {
          ctx.fillStyle = "#22c55e";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#22c55e";
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = "#22c55e";
          ctx.font = "10px monospace";
          ctx.fillText("COLLAPSED STATE (OBSERVED)", -70, -25);
        } else {
          ctx.fillStyle = "#a855f7";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#a855f7";
          // Render multiple potential positions in superposition
          for (let i = 0; i < 5; i++) {
            const tempX = Math.sin(time * (i + 1)) * 100 * Math.exp(-Math.pow((Math.sin(time) * 100) / width, 2));
            ctx.beginPath();
            ctx.arc(tempX, Math.cos(time + i) * 15, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#06b6d4";
          ctx.font = "10px monospace";
          ctx.fillText("SUPERPOSITION PROBABILITY WAVE", -80, -85);
        }

      } else if (simType === "multiverse") {
        const expansion = getVal("speed", 3) || getVal("expansion", 3) || 3;
        const count = getVal("bubbles", 5) || getVal("universes", 5) || 5;
        const vib = getVal("vibrations", 2) || 2;

        const colors = ["#06b6d4", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI * 2) / count + (time * 0.05);
          const dist = 120 + Math.sin(time * 0.5 + i) * 20 * (vib * 0.5);
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const radius = 30 + (Math.sin(time + i) * 5) + (expansion * 3);

          ctx.strokeStyle = colors[i % colors.length];
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Bubble inner glow
          const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.8, "rgba(255, 255, 255, 0.01)");
          grad.addColorStop(1, colors[i % colors.length] + "22");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Universe info node text
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "7px monospace";
          ctx.fillText(`Univ-${1000 + i}`, x - 18, y - 5);
          ctx.fillText(`c=${(2.5 + i * 0.1).toFixed(1)}e8 m/s`, x - 18, y + 4);
          ctx.fillText(`G=${(6.0 + i * 0.3).toFixed(1)}e-11`, x - 18, y + 11);
        }

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px monospace";
        ctx.fillText("COLLIDING MEMBRANES / MULTIVERSE BUBBLES", -110, -180);

      } else if (simType === "gravity") {
        const starMass = getVal("mass", 5) || getVal("gravity", 5) || 5;
        const orbitalRadius = getVal("radius", 120) || 120;
        const orbitalSpeed = getVal("speed", 1) || 1;

        // Central Star
        ctx.fillStyle = "#eab308";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#eab308";
        ctx.beginPath();
        ctx.arc(0, 0, 20 + (starMass * 1.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbital line
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, orbitalRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Planet
        const pAngle = time * (orbitalSpeed * 0.5) * (starMass / 5);
        const px = Math.cos(pAngle) * orbitalRadius;
        const py = Math.sin(pAngle) * orbitalRadius;

        ctx.fillStyle = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#3b82f6";
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gravitational force vector
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - Math.cos(pAngle) * 30, py - Math.sin(pAngle) * 30);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "7px monospace";
        ctx.fillText("Fg", px - Math.cos(pAngle) * 40 - 5, py - Math.sin(pAngle) * 40);

      } else if (simType === "black_hole") {
        const bhMass = getVal("mass", 5) || 5;
        const ringSpeed = getVal("speed", 2) || 2;
        const impact = getVal("photon_offset", 40) || getVal("offset", 40) || 40;

        // Gravitational bending lines (Photons coming from left)
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.lineWidth = 1.5;

        for (let i = -4; i <= 4; i++) {
          const startY = i * 25;
          ctx.beginPath();
          for (let px = -250; px <= 250; px += 4) {
            // Formula to simulate bending of light based on Schwarzschild-like lensing
            const distSq = px * px + startY * startY;
            const dist = Math.sqrt(distSq);
            let bentY = startY;

            if (dist > 10) {
              const bendingStrength = (bhMass * 4000) / distSq;
              bentY += (startY > 0 ? 1 : -1) * bendingStrength * (startY / dist) * (px > 0 ? 1.5 : 0.5);
            }

            if (px === -250) ctx.moveTo(px, bentY);
            else ctx.lineTo(px, bentY);
          }
          ctx.stroke();
        }

        // Accretion Disk (glowing ring)
        ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, 80 + bhMass * 4, 15, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();

        // Singularity event horizon
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20 + bhMass * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ff7849";
        ctx.font = "8px monospace";
        ctx.fillText("EVENT HORIZON (Rs)", -45, -35 - bhMass * 2);

      } else if (simType === "time_dilation") {
        const velFraction = getVal("speed", 5) || getVal("velocity", 5) || 5; // Fraction of c / 10
        const speed = velFraction / 10; // 0 to 0.99
        const lorentz = 1 / Math.sqrt(1 - Math.pow(speed, 2));

        // Draw static clock
        ctx.fillStyle = "rgba(17, 24, 39, 0.5)";
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-110, 0, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "8px monospace";
        ctx.fillText("EARTH STATION (v=0)", -145, 60);

        // Clock hand rotation
        const earthAngle = time;
        ctx.strokeStyle = "#10b981";
        ctx.beginPath();
        ctx.moveTo(-110, 0);
        ctx.lineTo(-110 + Math.cos(earthAngle) * 35, Math.sin(earthAngle) * 35);
        ctx.stroke();

        // Rocket moving clock
        ctx.fillStyle = "rgba(17, 24, 39, 0.5)";
        ctx.strokeStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(110, 0, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(`ROCKET (v=${speed.toFixed(3)}c)`, 70, 60);

        // Dilated Clock hand rotation (moves slower by lorentz factor)
        const rocketAngle = time / lorentz;
        ctx.strokeStyle = "#06b6d4";
        ctx.beginPath();
        ctx.moveTo(110, 0);
        ctx.lineTo(110 + Math.cos(rocketAngle) * 35, Math.sin(rocketAngle) * 35);
        ctx.stroke();

        // Stats Overlay
        ctx.fillStyle = "#06b6d4";
        ctx.font = "10px monospace";
        ctx.fillText(`Lorentz Factor (γ): ${lorentz.toFixed(4)}x`, -90, -85);
        ctx.fillText(`Time on earth: ${(time % 60).toFixed(1)}s`, -90, -70);
        ctx.fillText(`Time on rocket: ${((time / lorentz) % 60).toFixed(1)}s`, -90, -55);

      } else if (simType === "drake_equation") {
        // Star formation, planet fraction, etc
        const fp = getVal("planets", 40) || getVal("fraction_planets", 40) || 40;
        const fl = getVal("life", 10) || getVal("fraction_life", 10) || 10;
        const longevity = getVal("longevity", 1000) || getVal("civilizations_age", 1000) || 1000;

        // Draw signal scans
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.stroke();

        // Radar line sweeps
        const radarAngle = time % (Math.PI * 2);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(radarAngle) * 160, Math.sin(radarAngle) * 160);
        ctx.stroke();

        // Compute intelligent life signatures based on values
        const N_raw = (fp / 100) * (fl / 100) * (longevity / 10000) * 1200;
        const N = Math.max(1, Math.round(N_raw));

        // Draw target green signals inside the sphere
        for (let i = 0; i < N; i++) {
          const sAngle = (i * 2.399) + (time * 0.05); // golden angle approximation for even distribution
          const sDist = Math.sqrt(i / N) * 130;
          const sx = Math.cos(sAngle) * sDist;
          const sy = Math.sin(sAngle) * sDist;

          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();

          // Outer beacon ring
          ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
          ctx.beginPath();
          ctx.arc(sx, sy, 8 + Math.sin(time * 3 + i) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "#10b981";
        ctx.font = "10px monospace";
        ctx.fillText(`ESTIMATED CIVILIZATIONS (N) IN MILKY WAY: ${N}`, -135, -180);

      } else if (simType === "consciousness_neurons") {
        const fireFreq = getVal("frequency", 5) || getVal("synaptic_frequency", 5) || 5;
        const density = getVal("density", 12) || getVal("neurons", 12) || 12;

        const nodes: { x: number; y: number }[] = [];
        // Fixed positioning nodes based on index
        for (let i = 0; i < density; i++) {
          const rAngle = i * 0.95;
          const rDist = 45 + (i * 8) % 110;
          nodes.push({
            x: Math.cos(rAngle) * rDist,
            y: Math.sin(rAngle) * rDist
          });
        }

        // Draw neural connections
        ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const distSq = Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2);
            if (distSq < 15000) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw electrical pulses traversing the lines
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < nodes.length; i++) {
          const targetNodeIndex = (i + 3) % nodes.length;
          const nodeA = nodes[i];
          const nodeB = nodes[targetNodeIndex];

          const progress = (time * (fireFreq * 0.1)) % 1.0;
          const px = nodeA.x + (nodeB.x - nodeA.x) * progress;
          const py = nodeA.y + (nodeB.y - nodeA.y) * progress;

          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw neurons
        nodes.forEach((n, idx) => {
          const glow = Math.sin(time * fireFreq * 0.5 + idx) > 0.5;
          ctx.fillStyle = glow ? "#a78bfa" : "#4b5563";
          ctx.shadowBlur = glow ? 12 : 0;
          ctx.shadowColor = "#a78bfa";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        ctx.fillStyle = "#a78bfa";
        ctx.font = "10px monospace";
        ctx.fillText("COGNITIVE SYNAPSE TRANSMISSION CONCEPT MAP", -130, -180);

      } else if (simType === "mythology_map") {
        // Rotating timeline of mythologies
        const timelineScroll = getVal("era", 1000) || getVal("scroll", 1000) || 1000;
        const cultures = [
          { name: "Nordic Yggdrasil", desc: "Tree of life connecting nine unique worlds.", color: "#3b82f6" },
          { name: "Hindu Brahmanda", desc: "Cosmic egg containing Mount Meru in the center.", color: "#f59e0b" },
          { name: "Egyptian Nu", desc: "Infinite chaos ocean before ordering the sun.", color: "#10b981" },
          { name: "Greek Chaos", desc: "Primal void from which Gaia, Tartarus, Erebus sprang.", color: "#ec4899" },
          { name: "Mayan Xibalba", desc: "Three-layered universe of underworld, earth, and sky.", color: "#8b5cf6" }
        ];

        // Draw Dial
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.arc(0, 0, 140, 0, Math.PI * 2);
        ctx.stroke();

        cultures.forEach((cult, i) => {
          const cultAngle = (i * Math.PI * 2) / cultures.length + (timelineScroll * 0.002);
          const cx = Math.cos(cultAngle) * 140;
          const cy = Math.sin(cultAngle) * 140;

          ctx.fillStyle = cult.color;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "8px monospace";
          ctx.fillText(cult.name, cx - 40, cy - 20);

          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "6.5px monospace";
          ctx.fillText(cult.desc.substring(0, 24) + "...", cx - 40, cy + 24);
        });

        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.fillText("HISTORIC COSMOLOGY TIMELINE COMPARE", -110, -180);

      } else if (simType === "dimensions") {
        const dimSpeed = getVal("rotation", 2) || getVal("speed", 2) || 2;
        const scaleVal = getVal("scale", 60) || 60;

        // Coordinates of a 3D or 4D Tesseract projection
        const vertices = [
          { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
          { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
          { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 },

          // Inner tesseract for 4D hypercube look
          { x: -0.5, y: -0.5, z: -0.5 }, { x: 0.5, y: -0.5, z: -0.5 },
          { x: 0.5, y: 0.5, z: -0.5 }, { x: -0.5, y: 0.5, z: -0.5 },
          { x: -0.5, y: -0.5, z: 0.5 }, { x: 0.5, y: -0.5, z: 0.5 },
          { x: 0.5, y: 0.5, z: 0.5 }, { x: -0.5, y: 0.5, z: 0.5 },
        ];

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],

          [8, 9], [9, 10], [10, 11], [11, 8],
          [12, 13], [13, 14], [14, 15], [15, 12],
          [8, 12], [9, 13], [10, 14], [11, 15],

          [0, 8], [1, 9], [2, 10], [3, 11],
          [4, 12], [5, 13], [6, 14], [7, 15]
        ];

        // 3D rotation projection formulas
        const rAngle = time * (dimSpeed * 0.2);
        const cosY = Math.cos(rAngle);
        const sinY = Math.sin(rAngle);
        const cosX = Math.cos(rAngle * 0.5);
        const sinX = Math.sin(rAngle * 0.5);

        const projected = vertices.map(v => {
          // Rotate Y
          let x1 = v.x * cosY - v.z * sinY;
          let z1 = v.x * sinY + v.z * cosY;
          // Rotate X
          let y2 = v.y * cosX - z1 * sinX;
          let z2 = v.y * sinX + z1 * cosX;

          // Simple orthographic projection scaled
          return {
            x: x1 * scaleVal,
            y: y2 * scaleVal
          };
        });

        // Draw connections
        ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
        ctx.lineWidth = 1.5;
        edges.forEach(edge => {
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        // Draw vertices
        projected.forEach(p => {
          ctx.fillStyle = "#ec4899";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = "#06b6d4";
        ctx.font = "10px monospace";
        ctx.fillText("4D HYPERCUBE / TESSERACT ROTATIONAL SHADOW", -120, -180);

      } else {
        // Fallback or comparison visualization (energy_magic, god_demon_chart, etc.)
        const comparisonVal = getVal("intensity", 5) || getVal("scale", 5) || 5;

        ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-150, -100, 300, 200);
        ctx.fill();
        ctx.stroke();

        // Wave line across comparison
        ctx.strokeStyle = "#ec4899";
        ctx.beginPath();
        for (let x = -150; x <= 150; x++) {
          const y = Math.sin(x * 0.05 + time * (comparisonVal * 0.5)) * 40;
          if (x === -150) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px monospace";
        ctx.fillText("CONCEPT COMPARATIVE DATA MODEL", -95, -130);
        ctx.fillText(`System Level: ${comparisonVal}`, -45, 130);
      }

      ctx.restore();

      if (isPlaying) {
        localAngle += 0.005;
        animationFrameId.current = requestAnimationFrame(renderSimulation);
      }
    };

    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(renderSimulation);
    } else {
      renderSimulation();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [curiosityResult, activeTab, isPlaying, sliderValues, zoomLevel, panOffset, isObserveToggled, rotationAngle]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const resetSim = () => {
    if (curiosityResult?.simulationConfig) {
      initializeSliders(curiosityResult.simulationConfig);
    }
  };

  const toggleObserve = () => {
    setIsObserveToggled(!isObserveToggled);
  };

  const handleZoom = (amount: number) => {
    setZoomLevel(prev => Math.max(0.3, Math.min(prev + amount, 3)));
  };

  const triggerSearch = (text: string) => {
    setQuestion(text);
    handleQuery(text);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#030712] text-white">
      {/* Sidebar: Log History */}
      <div className="w-full lg:w-80 bg-[#090f24] border-b lg:border-b-0 lg:border-r border-[#151c35] p-5 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Compass className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="font-display font-semibold tracking-tight text-white leading-none text-base">Curiosity Arena</h1>
            <p className="text-[10px] font-mono text-purple-400/80 uppercase tracking-widest mt-1">Deep-Reality Explorer</p>
          </div>
        </div>

        {/* Identity statement requested strictly by user */}
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-950/20 to-blue-950/20 border border-purple-900/30 rounded-xl text-center">
          <p className="text-xs font-semibold font-sans text-cyan-400 tracking-wide">
            “Curiosity is allowed. Fake proof is not.”
          </p>
        </div>

        {/* Categories Box */}
        <div className="mb-6">
          <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">Filter Topics</h2>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition border cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-[#0c1432] text-gray-400 border-gray-900 hover:text-white hover:border-gray-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* History Area */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
            <History className="w-3 h-3" /> Search Archives
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[400px]">
            {history.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-850 rounded-xl">
                <Radio className="w-6 h-6 text-gray-600 mx-auto mb-2 animate-pulse" />
                <p className="text-[10px] font-mono text-gray-500">Telemetry archives are empty.</p>
              </div>
            ) : (
              history
                .filter(item => !activeCategory || item.category.toLowerCase() === activeCategory.toLowerCase() || item.result.category.toLowerCase() === activeCategory.toLowerCase())
                .map(item => {
                  const isActive = curiosityResult?.simpleAnswer === item.result.simpleAnswer;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCuriosityResult(item.result);
                        initializeSliders(item.result.simulationConfig);
                      }}
                      className={`group p-2.5 rounded-xl border transition cursor-pointer text-left ${
                        isActive
                          ? "bg-purple-950/20 border-purple-800/60 text-purple-300"
                          : "bg-[#0b122b] border-[#182245] text-gray-400 hover:text-white hover:bg-gray-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-mono font-medium truncate flex-1 leading-snug">
                          {item.question}
                        </span>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition"
                          title="Purge Search Log"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[8px] font-mono">
                        <span className="bg-purple-950 text-purple-400 px-1 py-0.2 rounded border border-purple-850">
                          {item.category}
                        </span>
                        <span className="text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-5 lg:p-7 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Futuristic Explorer Area */}
        <div className="bg-gradient-to-b from-[#0e1635] to-[#070b1a] rounded-2xl border border-[#1a254c] p-6 mb-7">
          <h2 className="text-lg font-display font-medium tracking-tight text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Ask the Cosmos
          </h2>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Query quantum physics, simulation realities, ancient mythological gods, space horizons, higher dimensions, or unknown occurrences. Curiosity Arena cross-references peer-reviewed databases and filters truth from belief.
          </p>

          {/* Question Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery(question, activeCategory);
            }}
            className="flex items-center gap-2 bg-[#050814] border border-[#212d5d] rounded-xl p-1.5 focus-within:border-cyan-500 transition duration-300 shadow-inner"
          >
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about reality, universe, soul, quantum, aliens, god, mythology..."
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs text-white placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-bold text-[10px] px-4 py-2 rounded-lg transition tracking-wider flex items-center gap-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> PROBING...
                </>
              ) : (
                <>
                  EXPLORE <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="mt-4">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">Popular Inquiries</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(item => (
                <button
                  key={item.text}
                  onClick={() => triggerSearch(item.text)}
                  className="text-[10px] font-mono bg-[#0c1432]/60 hover:bg-[#111c47] border border-[#1c2a5e] hover:border-cyan-600/50 text-gray-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-2.5 h-2.5 text-cyan-500" /> {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Panel */}
        {isLoading && (
          <div className="text-center py-16 bg-gradient-to-b from-[#0a1024] to-[#040817] rounded-2xl border border-[#131b3e] flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-950 border-t-cyan-400 animate-spin" />
              <Compass className="absolute inset-4 w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-display font-medium text-white">Accessing Academic Repositories...</p>
              <p className="text-xs text-gray-500 mt-1">Analyzing evidence levels, philosophy streams, and compiling simulations.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/45 rounded-xl text-red-400 text-xs flex items-center gap-2 mb-7">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Breakdown Card Layout */}
        {!isLoading && curiosityResult && (
          <div className="space-y-6">
            {/* Header: Category and Badges */}
            <div className="bg-[#090f24] border border-[#151c35] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded-full">
                  {curiosityResult.category}
                </span>
                <h3 className="text-base font-display font-semibold text-white tracking-tight mt-2">
                  Inquiry Breakdown Spectrum
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Proof Level Badge */}
                <div className="flex items-center gap-1.5 bg-[#0d1532] border border-[#202c5c] px-2.5 py-1 rounded-xl">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Proof Level:</span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    curiosityResult.proofLevel === "Confirmed" ? "text-green-400" :
                    curiosityResult.proofLevel === "Strong evidence" ? "text-emerald-400" :
                    curiosityResult.proofLevel === "Possible" ? "text-cyan-400" :
                    curiosityResult.proofLevel === "Hypothesis" ? "text-yellow-400" :
                    curiosityResult.proofLevel === "Belief" ? "text-purple-400" :
                    curiosityResult.proofLevel === "Fiction" ? "text-pink-400" : "text-gray-400"
                  }`}>
                    {curiosityResult.proofLevel}
                  </span>
                </div>

                {/* Badge Org info */}
                <div className="flex items-center gap-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-2 py-0.5 rounded-xl text-[9px] font-mono">
                  <Award className="w-3 h-3" /> VERIFIED CREDIBILITY
                </div>
              </div>
            </div>

            {/* Warning Message strictly handled */}
            {curiosityResult.isWarningNeeded && (
              <div className="bg-yellow-950/15 border border-yellow-800/40 text-yellow-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <span className="font-bold">Caution Advisory: </span>
                  {curiosityResult.warningMessage}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#182348] gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`py-2 px-4 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition ${
                  activeTab === "analysis"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                1. Scientific Analysis
              </button>
              <button
                onClick={() => setActiveTab("simulation")}
                className={`py-2 px-4 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "simulation"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                2. Cognitive Simulation
              </button>
              <button
                onClick={() => setActiveTab("thoughts")}
                className={`py-2 px-4 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition ${
                  activeTab === "thoughts"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                3. Stream Thoughts Panel
              </button>
              <button
                onClick={() => setActiveTab("sources")}
                className={`py-2 px-4 text-xs font-mono font-bold tracking-wider border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "sources"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                4. Authority Sources ({curiosityResult.top10Sources?.length || 0})
              </button>
            </div>

            {/* Tab: Analysis Breakdown */}
            {activeTab === "analysis" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Views Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Simple Answer */}
                  <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5">
                    <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Simple Essence
                    </h4>
                    <p className="text-sm font-sans font-medium text-white leading-relaxed">
                      {curiosityResult.simpleAnswer}
                    </p>
                  </div>

                  {/* Scientific View */}
                  <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5">
                    <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Modern Scientific View
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {curiosityResult.whatScienceSays}
                    </p>
                  </div>

                  {/* Theoretical View */}
                  {curiosityResult.whatTheoreticalScienceSays && (
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5">
                      <h4 className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" /> Theoretical Speculation
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        {curiosityResult.whatTheoreticalScienceSays}
                      </p>
                    </div>
                  )}

                  {/* Philosophical View */}
                  <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5">
                    <h4 className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Philosophical Inquiry
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {curiosityResult.whatPhilosophySays}
                    </p>
                  </div>

                  {/* Mythological View */}
                  <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5">
                    <h4 className="text-[10px] font-mono text-pink-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5" /> Cultural & Mythological Faiths
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {curiosityResult.whatMythologyReligionSays}
                    </p>
                  </div>
                </div>

                {/* Reality Check Side widget */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-b from-[#110c2e] to-[#06041a] border border-[#2b1856] rounded-2xl p-5">
                    <h4 className="text-xs font-display font-semibold text-purple-400 border-b border-purple-900 pb-2.5 flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-4 h-4" /> Reality Check
                    </h4>

                    <div className="space-y-4">
                      {/* Proven */}
                      {curiosityResult.realityCheck.proven?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/30">PROVEN</span>
                          <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-300 space-y-1">
                            {curiosityResult.realityCheck.proven.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Possible */}
                      {curiosityResult.realityCheck.possible?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-900/30">POSSIBLE</span>
                          <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-300 space-y-1">
                            {curiosityResult.realityCheck.possible.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Not Proven */}
                      {curiosityResult.realityCheck.notProven?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded border border-purple-900/30">NOT PROVEN</span>
                          <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-300 space-y-1">
                            {curiosityResult.realityCheck.notProven.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Impossible */}
                      {curiosityResult.realityCheck.impossible?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900/30">IMPOSSIBLE (CURRENT SCIENCE)</span>
                          <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-300 space-y-1">
                            {curiosityResult.realityCheck.impossible.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Unknown */}
                      {curiosityResult.realityCheck.unknown?.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-900/30">UNKNOWN</span>
                          <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-300 space-y-1">
                            {curiosityResult.realityCheck.unknown.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Interactive Simulation */}
            {activeTab === "simulation" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Canvas Container */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className={`relative bg-black rounded-2xl border border-gray-800 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-[450px]"}`}>
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={450}
                        className="w-full h-full cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                      />

                      {/* Overlay: Top-Right controls */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#030712]/80 backdrop-blur border border-[#1b254c] p-1.5 rounded-xl z-10">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1.5 bg-[#090f24] hover:bg-gray-800 rounded text-gray-300 cursor-pointer"
                          title={isPlaying ? "Pause physics rotation" : "Play physics rotation"}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
                        </button>
                        <button
                          onClick={() => handleZoom(0.1)}
                          className="p-1.5 bg-[#090f24] hover:bg-gray-800 rounded text-gray-300 font-mono font-bold text-[10px] cursor-pointer"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleZoom(-0.1)}
                          className="p-1.5 bg-[#090f24] hover:bg-gray-800 rounded text-gray-300 font-mono font-bold text-[10px] cursor-pointer"
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <button
                          onClick={resetSim}
                          className="p-1.5 bg-[#090f24] hover:bg-gray-800 rounded text-gray-300 cursor-pointer"
                          title="Reset Vectors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-1.5 bg-[#090f24] hover:bg-gray-800 rounded text-gray-300 cursor-pointer"
                          title="Toggle Fullscreen viewport"
                        >
                          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Special Observer button for quantum */}
                      {curiosityResult.simulationConfig.type === "quantum" && (
                        <div className="absolute bottom-4 left-4 z-10">
                          <button
                            onClick={toggleObserve}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition ${
                              isObserveToggled
                                ? "bg-green-600 text-white"
                                : "bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" /> {isObserveToggled ? "OBSERVER LINK ACTIVE" : "ACTIVATE OBSERVER"}
                          </button>
                        </div>
                      )}

                      {/* Display Simulation Title */}
                      <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur border border-cyan-800/40 p-2 px-3 rounded-xl pointer-events-none">
                        <span className="text-[8px] font-mono text-cyan-400 tracking-wider block uppercase">ACTIVE SIMULATION</span>
                        <span className="text-xs font-display font-semibold text-white mt-0.5 block">{curiosityResult.simulationConfig.title}</span>
                      </div>
                    </div>

                    <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5 flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-display font-semibold text-white">How this simulator behaves:</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {curiosityResult.simulationConfig.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sliders Control Panel Column */}
                  <div className="bg-[#0b122d] border border-[#16234f] rounded-2xl p-5 h-fit space-y-6">
                    <h4 className="text-xs font-display font-semibold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" /> Parameter Tuner
                    </h4>

                    {curiosityResult.simulationConfig.sliders?.length > 0 ? (
                      <div className="space-y-5">
                        {curiosityResult.simulationConfig.sliders.map(slider => (
                          <div key={slider.id} className="space-y-2">
                            <div className="flex justify-between text-[11px] font-mono text-gray-300">
                              <span>{slider.label}</span>
                              <span className="text-cyan-400 font-bold">
                                {sliderValues[slider.id] !== undefined ? sliderValues[slider.id] : slider.defaultValue} {slider.unit}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={slider.min}
                              max={slider.max}
                              step={slider.step}
                              value={sliderValues[slider.id] !== undefined ? sliderValues[slider.id] : slider.defaultValue}
                              onChange={(e) => {
                                setSliderValues(prev => ({
                                  ...prev,
                                  [slider.id]: parseFloat(e.target.value)
                                }));
                              }}
                              className="w-full accent-cyan-500 h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-gray-500">
                              <span>Min: {slider.min}</span>
                              <span>Max: {slider.max}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-gray-500 text-center py-6">This simulation utilizes automatic system factors.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Stream Thoughts Panel */}
            {activeTab === "thoughts" && (
              <div className="space-y-6">
                <div className="bg-[#090f24] border border-[#151c35] rounded-2xl p-5">
                  <h4 className="text-sm font-display font-semibold text-purple-400 flex items-center gap-2 mb-4">
                    <GitBranch className="w-4 h-4" /> Different Streams Think Like This
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    A comprehensive juxtaposition of how various historical, analytical, and speculative schools of human thought examine the question. Note that perspectives from mythology, history, and spiritual belief represent cultural paradigms rather than scientific proof.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scientist */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-900/30 px-1.5 py-0.5 rounded">Scientist View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.scientist}</p>
                    </div>

                    {/* Philosopher */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-900/30 px-1.5 py-0.5 rounded">Philosopher View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.philosopher}</p>
                    </div>

                    {/* Mythology */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-pink-400 font-bold bg-pink-950/40 border border-pink-900/30 px-1.5 py-0.5 rounded">Mythology View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.mythology}</p>
                    </div>

                    {/* Spiritual */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-950/40 border border-purple-900/30 px-1.5 py-0.5 rounded">Spiritual View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.spiritual}</p>
                    </div>

                    {/* Historian */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">Historian View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.historian}</p>
                    </div>

                    {/* Psychologist */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-teal-400 font-bold bg-teal-950/40 border border-teal-900/30 px-1.5 py-0.5 rounded">Psychologist View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.psychologist}</p>
                    </div>

                    {/* Futurist */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-900/30 px-1.5 py-0.5 rounded">Futurist View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.futurist}</p>
                    </div>

                    {/* Skeptic */}
                    <div className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 space-y-1.5">
                      <span className="text-[9px] font-mono text-red-400 font-bold bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded">Skeptic View</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">{curiosityResult.multiStreamThoughts.skeptic}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Authority Sources */}
            {activeTab === "sources" && (
              <div className="space-y-6">
                <div className="bg-[#090f24] border border-[#151c35] rounded-2xl p-5">
                  <h4 className="text-sm font-display font-semibold text-cyan-400 flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-cyan-400" /> Academic & Scientific Verification Ledger
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    A rigorous ranking of verified institutional sources, academic registries, space agencies, and peer-reviewed journals. Curiosity Arena enforces a direct block on speculative blogs and conspiracy networks.
                  </p>

                  <div className="space-y-3.5">
                    {curiosityResult.top10Sources && curiosityResult.top10Sources.length > 0 ? (
                      curiosityResult.top10Sources.map((source, idx) => (
                        <div key={idx} className="bg-[#0b122d] border border-[#16234f] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-800/40 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded font-bold border border-cyan-900/30">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-display font-semibold text-white">{source.title}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-sans mt-1">
                              {source.whyRelevant}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
                              {source.organization}
                            </span>
                            <a
                              href={source.link}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noopener noreferrer"
                              className="p-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-900/40 text-cyan-400 hover:text-white rounded-lg transition flex items-center gap-1.5 text-[10px] font-mono cursor-pointer"
                            >
                              LAUNCH VIEW <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-mono text-gray-500 py-6 text-center">No verified scientific evidence found yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State when no inquiry has run */}
        {!isLoading && !curiosityResult && (
          <div className="text-center py-20 bg-gradient-to-b from-[#0e1635] to-[#040816] rounded-3xl border border-[#1b254c] p-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center text-cyan-400 mb-5 animate-pulse">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-semibold text-white tracking-tight mb-2">Initialize Core Probing Gateway</h3>
            <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
              Enter a question above or select one of our popular inquiries to initiate the Curiosity Arena's verification pipeline. No fiction, no fake proofs — purely academic clarity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
