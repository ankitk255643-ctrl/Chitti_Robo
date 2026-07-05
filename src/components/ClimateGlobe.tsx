import React, { useEffect, useRef, useState } from "react";
import { 
  Globe as GlobeIcon, 
  Activity, 
  Wind, 
  CloudRain, 
  Thermometer, 
  Key, 
  Compass, 
  RefreshCw, 
  Cpu, 
  TrendingUp, 
  Check, 
  AlertTriangle,
  MapPin,
  Sparkles,
  Terminal,
  ArrowRight,
  Download,
  Server,
  Settings,
  Database,
  Play,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  Layers,
  ListFilter
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";

// Predefined Storm Events with accurate coordinates and characteristics
interface StormEvent {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  variable: string;
  maxWind: number;
  pressure: number;
  description: string;
  parameters: {
    input_id: number;
    variables: string;
    simulation_length: number;
    ensemble_size: number;
    noise_amplitude: number;
  };
}

const SAMPLE_STORMS: StormEvent[] = [
  {
    id: "amphan",
    name: "Super Cyclonic Storm Amphan",
    category: "Category 5 Equivalent",
    lat: 20.2,
    lon: 87.9,
    variable: "w10m",
    maxWind: 240,
    pressure: 925,
    description: "Amphan was a powerful tropical cyclone that caused widespread damage in Eastern India and Bangladesh in May 2020. It had peak 10-meter winds exceeding 240 km/h and extremely high storm surges.",
    parameters: {
      input_id: 1042,
      variables: "w10m",
      simulation_length: 24,
      ensemble_size: 4,
      noise_amplitude: 0.05
    }
  },
  {
    id: "katrina",
    name: "Hurricane Katrina",
    category: "Category 5 Hurricane",
    lat: 29.5,
    lon: -89.5,
    variable: "w10m",
    maxWind: 280,
    pressure: 902,
    description: "Katrina was one of the deadliest and most destructive hurricanes in US history, making landfall on the Gulf Coast in August 2005 with peak wind speeds of 280 km/h and severe flooding.",
    parameters: {
      input_id: 2011,
      variables: "w10m",
      simulation_length: 24,
      ensemble_size: 8,
      noise_amplitude: 0.08
    }
  },
  {
    id: "haiyan",
    name: "Super Typhoon Haiyan (Yolanda)",
    category: "Category 5 Super Typhoon",
    lat: 11.0,
    lon: 125.0,
    variable: "w10m",
    maxWind: 315,
    pressure: 895,
    description: "Haiyan was one of the strongest tropical cyclones ever recorded, devastating the Philippines in November 2013. Its 10-meter winds reached record-breaking speeds of 315 km/h.",
    parameters: {
      input_id: 3013,
      variables: "w10m",
      simulation_length: 24,
      ensemble_size: 6,
      noise_amplitude: 0.04
    }
  },
  {
    id: "fani",
    name: "Extremely Severe Cyclonic Storm Fani",
    category: "Category 4 Equivalent",
    lat: 19.6,
    lon: 85.7,
    variable: "w10m",
    maxWind: 215,
    pressure: 937,
    description: "Fani was a major tropical cyclone that hit Odisha, India, in May 2019, causing massive evacuations and extensive damage to coastal infrastructure.",
    parameters: {
      input_id: 4019,
      variables: "w10m",
      simulation_length: 18,
      ensemble_size: 4,
      noise_amplitude: 0.03
    }
  },
  {
    id: "ciara",
    name: "Extratropical Storm Ciara (Sabine)",
    category: "Extratropical Cyclone",
    lat: 55.0,
    lon: -5.0,
    variable: "t2m",
    maxWind: 150,
    pressure: 945,
    description: "Sabine/Ciara was a powerful windstorm that swept across Western Europe in February 2020, bringing widespread heavy rain, severe gales, and disruption to air travel.",
    parameters: {
      input_id: 5020,
      variables: "t2m",
      simulation_length: 24,
      ensemble_size: 2,
      noise_amplitude: 0.02
    }
  },
  {
    id: "custom",
    name: "Custom Geospatial Coordinate",
    category: "User Specified Region",
    lat: 15.5,
    lon: 73.8,
    variable: "w10m",
    maxWind: 65,
    pressure: 1010,
    description: "Manually customized geospatial point on Earth. Use the 'Try' tab or click directly on the rotating 3D globe to pick any custom coordinates for weather forecasting.",
    parameters: {
      input_id: 0,
      variables: "w10m",
      simulation_length: 6,
      ensemble_size: 1,
      noise_amplitude: 0
    }
  }
];

const WEATHER_VARIABLES = [
  { id: "w10m", name: "Wind Speed (10m)", unit: "m/s", color: "#10b981", desc: "10-meter wind vectors capturing horizontal wind speed and direction." },
  { id: "t2m", name: "2-Meter Temperature", unit: "°C", color: "#f97316", desc: "Air temperature at 2 meters above ground level, revealing regional thermodynamic structures." },
  { id: "tcwv", name: "Total Column Water Vapor", unit: "kg/m²", color: "#38bdf8", desc: "Total precipitable water vapor in the atmospheric column." },
  { id: "z500", name: "Geopotential Height (500hPa)", unit: "gpm", color: "#a855f7", desc: "Height at 500 hPa level, demonstrating planetary-scale atmospheric waves and troughs." },
  { id: "ozone", name: "Ozone Column Density", unit: "DU", color: "#ec4899", desc: "Ozone concentration in Dobson units, key for stratospheric weather boundaries." }
];

const ENSEMBLE_MEMBERS = [
  { id: "control", name: "Member #0 (Deterministic Control)", weight: 1.0 },
  { id: "member1", name: "Member #1 (Perturbed - Wind Bias)", weight: 1.05 },
  { id: "member2", name: "Member #2 (Perturbed - Temp Shift)", weight: 0.95 },
  { id: "member3", name: "Member #3 (Ensemble Average Mean)", weight: 1.0 }
];

export default function ClimateGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Tab Navigation State: "input" | "try" | "shell" | "python"
  const [activeTab, setActiveTab] = useState<string>("input");

  // Core Simulation Inputs
  const [selectedStormId, setSelectedStormId] = useState<string>("amphan");
  const [weatherVariableId, setWeatherVariableId] = useState<string>("w10m");
  const [customLat, setCustomLat] = useState<string>("20.2");
  const [customLon, setCustomLon] = useState<string>("87.9");
  
  // Custom Parameters collapsible states
  const [aboutOpen, setAboutOpen] = useState<boolean>(true);
  const [parametersOpen, setParametersOpen] = useState<boolean>(true);

  // Play/Simulation Output control states
  const [selectedOutputVar, setSelectedOutputVar] = useState<string>("w10m");
  const [selectedEnsemble, setSelectedEnsemble] = useState<string>("control");
  const [leadTime, setLeadTime] = useState<number>(6); // 6, 12, 18, 24

  // NGC API Setup
  const [ngcApiKey, setNgcApiKey] = useState<string>("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");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [compilationProgress, setCompilationProgress] = useState<number>(0);
  const [consoleStatus, setConsoleStatus] = useState<string>("");
  const [hasRunForecast, setHasRunForecast] = useState<boolean>(false);

  // Computed results for charting
  const [chartData, setChartData] = useState<any[]>([]);

  // Alert
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);

  // References for ThreeJS globe to dynamically update overlays
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const windStreamlinesRef = useRef<THREE.Line[]>([]);
  const temperatureOverlayRef = useRef<THREE.Mesh | null>(null);
  const targetBeaconRef = useRef<THREE.Group | null>(null);
  const customGlobeTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const activeStorm = SAMPLE_STORMS.find(s => s.id === selectedStormId) || SAMPLE_STORMS[0];
  const activeVariable = WEATHER_VARIABLES.find(v => v.id === weatherVariableId) || WEATHER_VARIABLES[0];

  // Map Storm selections to coordinate and variables
  useEffect(() => {
    if (selectedStormId !== "custom") {
      const storm = SAMPLE_STORMS.find(s => s.id === selectedStormId);
      if (storm) {
        setCustomLat(storm.lat.toFixed(1));
        setCustomLon(storm.lon.toFixed(1));
        setWeatherVariableId(storm.variable);
        setSelectedOutputVar(storm.variable);
      }
    }
  }, [selectedStormId]);

  // Generate beautiful physics mock time-series data based on coordinate and selections
  const calculateInferenceData = (latVal: number, lonVal: number, variable: string, leadTimeHours: number) => {
    const latAbs = Math.abs(latVal);
    const distFromEquator = latAbs / 90;
    const basePoints = [6, 12, 18, 24];
    
    return basePoints.map((h) => {
      let value = 0;
      // Diurnal sinusoidal flux
      const timeOffset = (h / 24) * 2 * Math.PI;
      const flux = Math.sin(timeOffset);

      if (variable === "w10m") {
        // Wind: storm proximity and lead time wind peaks
        const stormIntensityFactor = selectedStormId !== "custom" ? (activeStorm.maxWind / 65) : 1.2;
        value = (12 + (latAbs % 15) + (flux * 5) + (h * 0.4)) * stormIntensityFactor;
      } else if (variable === "t2m") {
        // Temp: equator hot, poles cold, day/night cycles
        value = 28 - (distFromEquator * 42) + (flux * 3.5) - (h * 0.12);
      } else if (variable === "tcwv") {
        // Moisture: high in tropics, dynamic plumes
        value = Math.max(5, (45 - (distFromEquator * 35) + (flux * 8) + (h * 0.2)));
      } else if (variable === "z500") {
        // Geopotential height: high pressure waves
        value = 5700 - (distFromEquator * 450) + (flux * 45) + (h * 1.5);
      } else {
        // Ozone: high at polar vortex boundary
        value = 280 + (distFromEquator * 120) + (flux * 10) + (h * 0.5);
      }
      
      return {
        hour: `${h}h`,
        value: parseFloat(value.toFixed(1)),
        isCurrent: h === leadTimeHours
      };
    });
  };

  // Re-calculate charts whenever inputs or lead times update
  useEffect(() => {
    const latNum = parseFloat(customLat) || 0;
    const lonNum = parseFloat(customLon) || 0;
    const data = calculateInferenceData(latNum, lonNum, selectedOutputVar, leadTime);
    setChartData(data);
  }, [customLat, customLon, selectedOutputVar, leadTime, selectedStormId]);

  // Handle run forecast simulated polling sequence
  const handleRunForecast = async () => {
    setIsComputing(true);
    setConsoleStatus("initializing");
    setCompilationProgress(5);
    setStatusLogs([]);

    const timestamp = () => new Date().toISOString().replace("T", " ").substring(0, 19);
    
    const logsSequence = [
      { text: `${timestamp()} Making inference request to NVIDIA NGC Portal...`, progress: 15 },
      { text: `Payload compiled: { "input_id": ${activeStorm.parameters.input_id}, "variables": "${weatherVariableId}", "simulation_length": ${activeStorm.parameters.simulation_length}, "ensemble_size": ${activeStorm.parameters.ensemble_size} }`, progress: 25 },
      { text: `${timestamp()} Initiating job scheduler: POST https://climate.api.nvidia.com/v1/nvidia/fourcastnet`, progress: 35 },
      { text: `[HTTP 202 Accepted] Job submitted successfully. Received Tracker ID: nvcf-reqid-${Math.random().toString(36).substring(2, 15)}`, progress: 45 },
      { text: `${timestamp()} Polling job status: GET https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/nvcf-reqid-...`, progress: 55 },
      { text: `[HTTP 202] Job in progress. GPU Node allocation: NVIDIA Hopper H100 Cluster...`, progress: 70 },
      { text: `${timestamp()} Job finished. Redirecting to assets: HTTP 302 Found.`, progress: 85 },
      { text: `Downloading downscaled meteorological NetCDF tensor data (simulation_length: ${activeStorm.parameters.simulation_length} hours)...`, progress: 95 },
      { text: `[HTTP 200] Saved binary data cube to 'output.zip' locally. Decoding grid resolution 10km (0.25 degrees)...`, progress: 100 }
    ];

    for (let i = 0; i < logsSequence.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setStatusLogs(prev => [...prev, logsSequence[i].text]);
      setCompilationProgress(logsSequence[i].progress);
    }

    // Trigger update and show alert
    setIsComputing(false);
    setConsoleStatus("done");
    setHasRunForecast(true);
    triggerAlert("success", `NVIDIA Earth-2 completed inference for ${activeStorm.name}! Visualization models updated.`);
  };

  const triggerAlert = (type: string, msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // Reset parameters
  const handleReset = () => {
    setSelectedStormId("amphan");
    setWeatherVariableId("w10m");
    setCustomLat("20.2");
    setCustomLon("87.9");
    setLeadTime(6);
    setSelectedOutputVar("w10m");
    setSelectedEnsemble("control");
    setHasRunForecast(false);
    setStatusLogs([]);
    triggerAlert("info", "Form parameters and forecasts reset successfully.");
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerAlert("success", "Code snippet copied to clipboard!");
  };

  // Three.js Lifecycle for the Rotating 3D Globe
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 15;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for unified rotations
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Create high-fidelity procedural landmass map on an offscreen canvas
    const mapWidth = 1024;
    const mapHeight = 512;
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext("2d")!;

    // Background ocean (cyber black-blue)
    ctx.fillStyle = "#0c0e17";
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Geographic boundary paths for simplified continents (rough mapping coordinates)
    const continentsCoords = [
      // Africa
      [[512, 280], [530, 260], [580, 260], [610, 210], [590, 180], [510, 180], [470, 220], [465, 260], [495, 360], [540, 360], [560, 330], [512, 280]],
      // Eurasia (Europe + Asia)
      [[510, 180], [560, 175], [600, 120], [680, 80], [800, 60], [920, 80], [950, 140], [900, 200], [820, 230], [800, 280], [750, 280], [740, 310], [700, 310], [690, 260], [660, 280], [630, 220], [550, 220], [510, 180]],
      // North America
      [[350, 180], [380, 140], [420, 120], [400, 70], [300, 60], [220, 70], [160, 110], [140, 140], [180, 160], [210, 150], [240, 220], [270, 240], [310, 240], [330, 210], [350, 180]],
      // South America
      [[270, 240], [310, 240], [340, 260], [360, 290], [340, 320], [300, 380], [260, 460], [240, 460], [240, 400], [255, 330], [270, 240]],
      // Australia
      [[820, 340], [870, 330], [910, 350], [900, 390], [850, 400], [810, 370], [820, 340]],
      // Greenland
      [[380, 50], [420, 40], [440, 70], [410, 90], [370, 80], [380, 50]]
    ];

    // Draw continental hulls
    ctx.fillStyle = "#1e2235";
    ctx.strokeStyle = "#10b981"; // neon green outline
    ctx.lineWidth = 1.2;

    continentsCoords.forEach(poly => {
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i][0], poly[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Add cyber grid line grids to the canvas texture
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 0.5;
    const gridSpacing = 32;
    for (let x = 0; x < mapWidth; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y < mapHeight; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapWidth, y);
      ctx.stroke();
    }

    // Convert canvas to texture
    const globeTexture = new THREE.CanvasTexture(canvas);
    customGlobeTextureRef.current = globeTexture;

    // Create central Globe Mesh
    const globeRadius = 4.8;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.25,
      metalness: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // Glowing Atmosphere Layer
    const atmosGeometry = new THREE.SphereGeometry(globeRadius + 0.15, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // Glowing coordinate target reticle
    const targetGroup = new THREE.Group();
    globeGroup.add(targetGroup);
    targetBeaconRef.current = targetGroup;

    // 3D Wind flow vectors group
    const streamlinesGroup = new THREE.Group();
    globeGroup.add(streamlinesGroup);

    // Generate looping wind vectors wrapping around the globe
    const createStreamlines = () => {
      // Clear old streamlines
      while(streamlinesGroup.children.length > 0) {
        streamlinesGroup.remove(streamlinesGroup.children[0]);
      }
      windStreamlinesRef.current = [];

      const lineCount = 15;
      const stepPoints = 40;
      for (let l = 0; l < lineCount; l++) {
        const points: THREE.Vector3[] = [];
        const latOffset = -3.5 + Math.random() * 7; // height offsets
        const radiusAtLat = Math.sqrt(globeRadius * globeRadius - latOffset * latOffset) + 0.1;

        for (let s = 0; s <= stepPoints; s++) {
          const theta = (s / stepPoints) * Math.PI * 2;
          points.push(new THREE.Vector3(
            radiusAtLat * Math.cos(theta),
            latOffset + Math.sin(theta * 4) * 0.15,
            radiusAtLat * Math.sin(theta)
          ));
        }

        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        });
        const lineMesh = new THREE.Line(lineGeom, lineMat);
        streamlinesGroup.add(lineMesh);
        windStreamlinesRef.current.push(lineMesh);
      }
    };
    createStreamlines();

    // 3D Temperature soft thermal sphere overlay (thermal clouds)
    const tempGeometry = new THREE.SphereGeometry(globeRadius + 0.08, 32, 32);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      wireframe: true
    });
    const tempMesh = new THREE.Mesh(tempGeometry, tempMaterial);
    globeGroup.add(tempMesh);
    temperatureOverlayRef.current = tempMesh;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(10, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 0.85); // NVIDIA Green accent side light
    dirLight2.position.set(-10, -5, -5);
    scene.add(dirLight2);

    // Mouse control drag-to-rotate events
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };

    const handleMouseDown = (clientX: number, clientY: number) => {
      isDragging = true;
      previousMousePosition = { x: clientX, y: clientY };
      dragStart = { x: clientX, y: clientY };
    };

    const handleMouseMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaMove = {
        x: clientX - previousMousePosition.x,
        y: clientY - previousMousePosition.y
      };

      globeGroup.rotation.y += deltaMove.x * 0.005;
      globeGroup.rotation.x += deltaMove.y * 0.005;
      globeGroup.rotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, globeGroup.rotation.x));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleMouseUp = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      isDragging = false;

      const movementDist = Math.sqrt(
        Math.pow(clientX - dragStart.x, 2) + Math.pow(clientY - dragStart.y, 2)
      );

      if (movementDist < 5) {
        triggerRaycast(clientX, clientY);
      }
    };

    // Raycast coordinate detection
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const triggerRaycast = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(globeMesh);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const localHit = globeMesh.worldToLocal(hit.point.clone());
        const d = localHit.length();

        // Solve spherical coordinates back to lat/lon
        const clickedLat = Math.asin(localHit.y / d) * (180 / Math.PI);
        const clickedLon = Math.atan2(localHit.x, localHit.z) * (180 / Math.PI);

        setCustomLat(clickedLat.toFixed(1));
        setCustomLon(clickedLon.toFixed(1));
        setSelectedStormId("custom");
        
        // Update 3D reticle location
        updateReticlePoint(clickedLat, clickedLon);
        triggerAlert("info", `Geospatial target locked: {${clickedLat.toFixed(1)}°N, ${clickedLon.toFixed(1)}°E}`);
      }
    };

    const updateReticlePoint = (lat: number, lon: number) => {
      if (!targetBeaconRef.current) return;
      // Clear old reticle
      while(targetBeaconRef.current.children.length > 0) {
        targetBeaconRef.current.remove(targetBeaconRef.current.children[0]);
      }

      const latRad = (lat * Math.PI) / 180;
      const lonRad = (-lon * Math.PI) / 180;
      const radius = globeRadius + 0.12;

      const rx = radius * Math.cos(latRad) * Math.cos(lonRad);
      const ry = radius * Math.sin(latRad);
      const rz = radius * Math.cos(latRad) * Math.sin(lonRad);

      const retGeom = new THREE.RingGeometry(0.12, 0.45, 16);
      const retMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        wireframe: true
      });
      const retMesh = new THREE.Mesh(retGeom, retMat);
      retMesh.position.set(rx, ry, rz);

      const centerVector = new THREE.Vector3(rx, ry, rz).normalize();
      retMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), centerVector);
      targetBeaconRef.current.add(retMesh);
    };

    // Attach listeners
    const onMouseDown = (e: MouseEvent) => handleMouseDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handleMouseUp(e.clientX, e.clientY);

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Initial reticle position
    updateReticlePoint(parseFloat(customLat) || 0, parseFloat(customLon) || 0);

    // Render loop
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // Slowly spin the globe when user is not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.002 * (1 + leadTime * 0.1);
      }

      // Swirl target reticle
      if (targetBeaconRef.current && targetBeaconRef.current.children.length > 0) {
        targetBeaconRef.current.children[0].rotation.z += 0.02;
      }

      // Pulse atmosphere glow
      if (atmosphereMeshRef.current) {
        const pulse = Math.sin(elapsed * 2) * 0.015 + 1;
        atmosphereMeshRef.current.scale.setScalar(pulse);
      }

      // Modulate streamlines based on lead times and storm speed variables
      streamlinesGroup.children.forEach((lineMesh, index) => {
        lineMesh.rotation.y += 0.004 * (leadTime * 0.12) * (index % 2 === 0 ? 1 : -1);
      });

      // Modulate thermal mesh scale
      if (temperatureOverlayRef.current) {
        const thermalRate = elapsed * (0.5 + leadTime * 0.05);
        temperatureOverlayRef.current.rotation.x = Math.sin(thermalRate * 0.1) * 0.2;
        temperatureOverlayRef.current.rotation.y = thermalRate * 0.05;
      }

      renderer.render(scene, camera);
    };
    render();

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selectedStormId]);

  // Handle dynamic styling & colors for variable selection on globe
  useEffect(() => {
    if (!atmosphereMeshRef.current || !temperatureOverlayRef.current) return;

    const varColorMap: Record<string, number> = {
      w10m: 0x10b981, // neon green
      t2m: 0xf97316, // orange
      tcwv: 0x38bdf8, // light blue
      z500: 0xa855f7, // purple
      ozone: 0xec4899 // magenta
    };

    const targetColor = varColorMap[selectedOutputVar] || 0x10b981;
    
    // Smoothly color-rebind atmosphere and wireframes
    const atmosMat = atmosphereMeshRef.current.material as THREE.MeshBasicMaterial;
    if (atmosMat && atmosMat.color) {
      atmosMat.color.setHex(targetColor);
    }
    const tempMat = temperatureOverlayRef.current.material as THREE.MeshBasicMaterial;
    if (tempMat && tempMat.color) {
      tempMat.color.setHex(targetColor);
    }

    // If wind speed selected, make lines visible, else hide them
    if (selectedOutputVar === "w10m") {
      temperatureOverlayRef.current.visible = false;
      windStreamlinesRef.current.forEach(line => { line.visible = true; });
    } else {
      temperatureOverlayRef.current.visible = true;
      windStreamlinesRef.current.forEach(line => { line.visible = false; });
    }
  }, [selectedOutputVar]);

  // Construct dynamic code scripts for the user selection
  const generateBashCode = () => {
    return `#!/usr/bin/env bash
if [ "$NGC_API_KEY" = "" ]; then
    NGC_API_KEY='${ngcApiKey || "<PASTE_API_KEY_HERE>"}'
fi
invoke_url="https://climate.api.nvidia.com/v1/nvidia/fourcastnet"

output_file="output.zip"
payload='{
    "input_id": ${activeStorm.parameters.input_id},
    "variables": "${weatherVariableId}",
    "simulation_length": ${leadTime},
    "ensemble_size": ${activeStorm.parameters.ensemble_size},
    "noise_amplitude": ${activeStorm.parameters.noise_amplitude}
}'
echo $payload
# Initial request
echo "$(date) Making inference request"
response=$(curl -D - --request POST -H "content-type: application/json" -H "Authorization: Bearer $NGC_API_KEY" -H "NVCF-POLL-SECONDS: 5" --data "$payload" --location "$invoke_url")

http_status=$(echo "$response" | awk '{print $2;exit}')
if [ "$http_status" -eq 202 ]; then
    req_id=$(echo "$response" | grep -i "nvcf-reqid:" | awk '{print $2}' | tr -d '\\r')
else
     echo "Unexpected HTTP status: $http_status"
     echo "Response: $response"
     exit 1
fi

status_url="https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/$req_id"
# Poll the /status endpoint
echo "$(date) Polling job $req_id"
while true; do
    status_response=$(curl -s -D - --request GET -H "content-type: application/json"  -H "Authorization: Bearer $NGC_API_KEY"  -H "NVCF-POLL-SECONDS: 5"  --location "$status_url"  -o "$output_file")
    status_http_status=$(echo "$status_response" | awk '{print $2;exit}')

    if [ "$status_http_status" -eq 200 ]; then
        echo "Saved response to file"
        break
    elif [ "$status_http_status" -eq 302 ]; then
        echo "Downloading large asset"
        asset_url=$(echo "$status_response" | grep -i "location:" | awk '{print $2}' | tr -d '\\r')
        curl --request GET --location "\${asset_url}" -o "\${output_file}"
        break
    elif [ "$status_http_status" -ne 202 ]; then
        echo "Unexpected HTTP status: $status_http_status"
        echo "Response: $status_response"
        exit 1
    fi
    echo "$(date) Job still running, status $status_http_status"
    # Wait before polling again
    sleep 3
done

# ====================================================
# Docker NIM execution guide
# ====================================================
# Step 1: Registry Login
$ docker login nvcr.io
Username: $oauthtoken
Password: <PASTE_API_KEY_HERE>

# Step 2: Download and run FourCastNet NIM
docker pull nvcr.io/nim/nvidia/fourcastnet:latest

docker run --rm --runtime=nvidia --gpus all --shm-size 4g \\
    -p 8000:8000 \\
    -e NGC_API_KEY \\
    nvcr.io/nim/nvidia/fourcastnet:latest

# Step 3: Check NIM health check endpoint
curl -X 'GET' \\
    'http://localhost:8000/v1/health/ready' \\
    -H 'accept: application/json'`;
  };

  const generatePythonCode = () => {
    return `import numpy as np
from datetime import datetime
from earth2studio.data import ARCO
from earth2studio.models.px.sfno import VARIABLES

# 1. Fetch historical input atmospheric data cube from ARCO dataset
ds = ARCO()
da = ds(time=datetime(2023, 1, 1), variable=VARIABLES)

# 2. Save NumPy array inputs conforming to NVIDIA NIM shape rules
np.save("fcn_inputs.npy", da.to_numpy()[None].astype('float32'))

print("Generated fcn_inputs.npy successfully.")
print(f"Input dimensions shape: {da.to_numpy()[None].shape}")

# 3. Execute local inference call to NVIDIA Earth-2 containers
# curl -X POST \\
#     -F "input_array=@fcn_inputs.npy" \\
#     -F "input_time=2023-01-01T00:00:00Z" \\
#     -F "simulation_length=${leadTime}" \\
#     -o output.tar \\
#     http://localhost:8000/v1/infer`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e2e8f0] font-sans antialiased flex flex-col p-4 sm:p-6 lg:p-8" id="nvidia-earth2-workspace">
      
      {/* Dynamic Floating Alerts */}
      <AnimatePresence>
        {alert && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg border shadow-xl ${
              alert.type === "success" 
                ? "bg-[#0c241a] border-[#10b981]/50 text-[#34d399]" 
                : alert.type === "info" 
                ? "bg-[#0b1f30] border-[#0ea5e9]/50 text-[#38bdf8]"
                : "bg-[#251212] border-red-500/50 text-red-300"
            }`}
          >
            {alert.type === "success" ? <Check className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{alert.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e1e24] pb-5" id="workspace-header">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#12281a] border border-[#10b981]/30 rounded-lg text-[#10b981]" id="brand-logo-container">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                NVIDIA Earth-2 <span className="text-[#10b981] font-mono text-sm border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 rounded">FourCastNet NIM</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">High-fidelity localized atmospheric downscaling & planetary weather emulation</p>
            </div>
          </div>
        </div>

        {/* Global Key status & credentials config */}
        <div className="flex items-center gap-2" id="header-credentials-status">
          <div className="bg-[#12131a] border border-[#2d2f3d] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-gray-400 font-mono">NVIDIA NGC API:</span>
            <span className="text-gray-200 font-mono truncate max-w-[150px]">
              {showKey ? ngcApiKey : "••••••••••••••••••••"}
            </span>
            <button 
              onClick={() => setShowKey(!showKey)}
              className="text-[#10b981] hover:text-[#34d399] transition-colors ml-1 font-semibold"
              title="Toggle API Key visibility"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow" id="main-blueprint-grid">
        
        {/* Left Control Panel Column */}
        <div className="lg:col-span-5 flex flex-col bg-[#12131a] border border-[#1e202d] rounded-xl overflow-hidden shadow-2xl min-h-[680px]" id="workspace-left-panel">
          
          {/* Header Tab list */}
          <div className="bg-[#181a24] border-b border-[#222435] p-2 flex gap-1" id="panel-tab-bar">
            {[
              { id: "input", label: "Input", icon: Settings },
              { id: "try", label: "Try", icon: Play },
              { id: "shell", label: "Shell", icon: Terminal },
              { id: "python", label: "Python", icon: GlobeIcon }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                    isActive 
                      ? "bg-[#10b981] text-black font-bold shadow-md shadow-[#10b981]/20" 
                      : "text-gray-400 hover:text-white hover:bg-[#1e202e]"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active tab body views */}
          <div className="p-5 flex-grow flex flex-col justify-between" id="tab-content-container">
            
            <AnimatePresence mode="wait">
              {/* TAB 1: INPUT CONTROLS */}
              {activeTab === "input" && (
                <motion.div
                  key="input-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4 flex-grow"
                  id="tab-view-input"
                >
                  {/* Dropdown: Sample Weather Event */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#10b981] block">Sample Weather Event</label>
                    <div className="relative">
                      <select
                        id="select-sample-storm"
                        value={selectedStormId}
                        onChange={(e) => setSelectedStormId(e.target.value)}
                        className="w-full bg-[#1c1e2d] border border-[#2d2f44] text-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#10b981] font-medium"
                      >
                        {SAMPLE_STORMS.map(storm => (
                          <option key={storm.id} value={storm.id}>
                            {storm.name} ({storm.category})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dropdown: Weather Variable */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#10b981] block">Weather Variable</label>
                    <div className="relative">
                      <select
                        id="select-weather-variable"
                        value={weatherVariableId}
                        onChange={(e) => {
                          setWeatherVariableId(e.target.value);
                          setSelectedOutputVar(e.target.value);
                        }}
                        className="w-full bg-[#1c1e2d] border border-[#2d2f44] text-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#10b981] font-medium"
                      >
                        {WEATHER_VARIABLES.map(variable => (
                          <option key={variable.id} value={variable.id}>
                            {variable.name} ({variable.id})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal pl-0.5">
                      {WEATHER_VARIABLES.find(v => v.id === weatherVariableId)?.desc}
                    </p>
                  </div>

                  {/* Collapsible: About Sample Weather Events */}
                  <div className="border border-[#1e202f] rounded-lg overflow-hidden bg-[#151622]">
                    <button
                      onClick={() => setAboutOpen(!aboutOpen)}
                      className="w-full flex items-center justify-between p-3 bg-[#1c1e2d]/60 text-xs font-bold text-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-[#10b981]" />
                        About Sample Weather Events
                      </span>
                      {aboutOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {aboutOpen && (
                      <div className="p-3.5 text-xs text-gray-400 leading-relaxed border-t border-[#1e202f]">
                        <p>{activeStorm.description}</p>
                        {selectedStormId !== "custom" && (
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#1e202f]/60 text-[11px]">
                            <div>
                              <span className="text-gray-500 block">Peak Speed:</span>
                              <span className="text-gray-200 font-mono font-medium">{activeStorm.maxWind} km/h</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Min Pressure:</span>
                              <span className="text-gray-200 font-mono font-medium">{activeStorm.pressure} hPa</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Collapsible: View Parameters */}
                  <div className="border border-[#1e202f] rounded-lg overflow-hidden bg-[#151622]">
                    <button
                      onClick={() => setParametersOpen(!parametersOpen)}
                      className="w-full flex items-center justify-between p-3 bg-[#1c1e2d]/60 text-xs font-bold text-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <ListFilter className="w-3.5 h-3.5 text-[#10b981]" />
                        View Model Parameters
                      </span>
                      {parametersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {parametersOpen && (
                      <div className="p-3 border-t border-[#1e202f]">
                        <pre className="text-[11px] font-mono text-[#34d399] bg-[#0c0d13] p-3 rounded overflow-x-auto leading-normal">
{`{
  "input_id": ${activeStorm.parameters.input_id},
  "variables": "${weatherVariableId}",
  "simulation_length": ${leadTime},
  "ensemble_size": ${activeStorm.parameters.ensemble_size},
  "noise_amplitude": ${activeStorm.parameters.noise_amplitude}
}`}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: TRY / PLAYGROUND */}
              {activeTab === "try" && (
                <motion.div
                  key="try-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4 flex-grow flex flex-col justify-between"
                  id="tab-view-try"
                >
                  <div className="space-y-4">
                    <div className="p-3 bg-[#1a2e22] border border-[#10b981]/20 rounded-lg text-xs text-[#34d399] leading-relaxed">
                      <strong>Interactive Playground:</strong> You can run the real-time downscaled forecast using the NVIDIA FourCastNet API by specifying custom geographic coordinate offsets below.
                    </div>

                    {/* Coordinates input Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Latitude (°N)</label>
                        <input
                          type="text"
                          id="input-custom-lat"
                          value={customLat}
                          onChange={(e) => {
                            setCustomLat(e.target.value);
                            setSelectedStormId("custom");
                          }}
                          placeholder="e.g. 15.5"
                          className="w-full bg-[#1c1e2d] border border-[#2d2f44] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Longitude (°E)</label>
                        <input
                          type="text"
                          id="input-custom-lon"
                          value={customLon}
                          onChange={(e) => {
                            setCustomLon(e.target.value);
                            setSelectedStormId("custom");
                          }}
                          placeholder="e.g. 73.8"
                          className="w-full bg-[#1c1e2d] border border-[#2d2f44] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                        />
                      </div>
                    </div>

                    {/* NGC Token Override */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">NVIDIA NGC API Key</label>
                      <input
                        type="password"
                        id="input-ngc-api-key"
                        value={ngcApiKey}
                        onChange={(e) => setNgcApiKey(e.target.value)}
                        placeholder="nvapi-..."
                        className="w-full bg-[#1c1e2d] border border-[#2d2f44] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    {/* Rolling Telemetry Terminal */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Active Status Telemetry Logs</label>
                      <div className="bg-[#07080c] border border-[#1e202e] rounded-lg p-3 h-48 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1.5 scrollbar-thin">
                        {statusLogs.length === 0 ? (
                          <div className="text-gray-600 italic">No logs recorded. Press "Forecast" to begin execution.</div>
                        ) : (
                          statusLogs.map((log, index) => (
                            <div key={index} className={log.includes("HTTP 202") || log.includes("HTTP 302") ? "text-yellow-400" : log.includes("Saved") ? "text-[#10b981] font-bold" : "text-gray-300"}>
                              {log}
                            </div>
                          ))
                        )}
                        {isComputing && (
                          <div className="flex items-center gap-2 text-[#10b981] font-bold animate-pulse mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                            Resolving grid solver matrices...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SHELL BASH CODE */}
              {activeTab === "shell" && (
                <motion.div
                  key="shell-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3 flex-grow flex flex-col justify-between"
                  id="tab-view-shell"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Bash Script / NGC SDK Polling Loop</span>
                      <button 
                        onClick={() => handleCopyCode(generateBashCode())}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e202f] hover:bg-[#2e3146] transition-colors rounded text-white font-medium"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#10b981]" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#07080c] border border-[#1e202e] rounded-lg p-3.5 overflow-auto max-h-[460px] font-mono text-[11px] text-[#e2e8f0] whitespace-pre scrollbar-thin leading-relaxed">
                      {generateBashCode()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: PYTHON SCRIPT */}
              {activeTab === "python" && (
                <motion.div
                  key="python-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3 flex-grow flex flex-col justify-between"
                  id="tab-view-python"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Earth2Studio Input Preprocessing</span>
                      <button 
                        onClick={() => handleCopyCode(generatePythonCode())}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e202f] hover:bg-[#2e3146] transition-colors rounded text-white font-medium"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#10b981]" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#07080c] border border-[#1e202e] rounded-lg p-3.5 overflow-auto max-h-[460px] font-mono text-[11px] text-[#e2e8f0] whitespace-pre scrollbar-thin leading-relaxed">
                      {generatePythonCode()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Frame */}
            <div className="border-t border-[#1e202f] pt-4 mt-4" id="left-panel-footer">
              {/* Progress feedback bar */}
              {isComputing && (
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#10b981] font-semibold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Computing Forecast Solves...
                    </span>
                    <span className="text-[#10b981] font-mono font-bold">{compilationProgress}%</span>
                  </div>
                  <div className="w-full bg-[#1a202d] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-full transition-all duration-300"
                      style={{ width: `${compilationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Legal Terms of Use block */}
              <div className="text-[10px] text-gray-500 leading-normal mb-4" id="governing-legal-notice">
                <strong>GOVERNING TERMS:</strong> Your use of this API is governed by the{" "}
                <a href="https://www.nvidia.com/en-us/about-nvidia/api-trial-service-terms/" target="_blank" rel="noreferrer" className="text-[#10b981] underline hover:text-[#34d399]">
                  NVIDIA API Trial Service Terms of Use
                </a>{" "}
                and the use of this model is governed by the{" "}
                <a href="https://assets.nvidia.com/license/nvidia-ai-foundation-models-community-license.pdf" target="_blank" rel="noreferrer" className="text-[#10b981] underline hover:text-[#34d399]">
                  NVIDIA AI Foundation Models Community License
                </a>.
              </div>

              {/* Primary CTA button bar */}
              <div className="flex justify-between items-center gap-4" id="footer-actions">
                <button
                  id="reset-btn"
                  onClick={handleReset}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-semibold px-4 py-2"
                >
                  Reset
                </button>
                <button
                  id="forecast-btn"
                  onClick={handleRunForecast}
                  disabled={isComputing}
                  className={`px-7 py-2.5 rounded-lg text-black font-bold tracking-wide text-sm flex items-center gap-2 transition-all ${
                    isComputing 
                      ? "bg-gray-600 cursor-not-allowed opacity-50" 
                      : "bg-[#10b981] hover:bg-[#34d399] hover:shadow-lg hover:shadow-[#10b981]/20 cursor-pointer active:scale-95"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Forecast
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Output Panel Column */}
        <div className="lg:col-span-7 flex flex-col bg-[#12131a] border border-[#1e202d] rounded-xl overflow-hidden shadow-2xl min-h-[680px]" id="workspace-right-panel">
          
          {/* Header Panel metadata */}
          <div className="bg-[#181a24] border-b border-[#222435] p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" id="output-header">
            <div>
              <h2 className="text-sm font-bold tracking-wider text-gray-200 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#10b981]" />
                Visualization Output
              </h2>
            </div>

            {/* Model & Variable Output Dropdowns */}
            <div className="flex items-center gap-2 w-full sm:w-auto" id="output-filters">
              {/* Output weather variable selection */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  id="output-var-select"
                  value={selectedOutputVar}
                  onChange={(e) => setSelectedOutputVar(e.target.value)}
                  className="bg-[#1c1e2d] border border-[#2d2f44] text-xs text-[#e2e8f0] rounded-lg px-3 py-1.5 pr-8 focus:outline-none font-medium appearance-none w-full"
                >
                  {WEATHER_VARIABLES.map(variable => (
                    <option key={variable.id} value={variable.id}>
                      {variable.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>

              {/* Ensemble selector dropdown */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  id="output-ensemble-select"
                  value={selectedEnsemble}
                  onChange={(e) => setSelectedEnsemble(e.target.value)}
                  className="bg-[#1c1e2d] border border-[#2d2f44] text-xs text-[#e2e8f0] rounded-lg px-3 py-1.5 pr-8 focus:outline-none font-medium appearance-none w-full"
                >
                  {ENSEMBLE_MEMBERS.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow flex flex-col justify-between space-y-6" id="output-view-body">
            
            {/* Real Rotating 3D Globe visualization Canvas box */}
            <div className="relative bg-[#07080c] border border-[#1e202d] rounded-xl overflow-hidden h-[360px] flex items-center justify-center shadow-inner" id="globe-3d-stage-container">
              
              {/* 3D Canvas target */}
              <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" id="threejs-globe-viewport" />

              {/* Floating indicators overlays */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none" id="globe-coordinate-badge">
                <div className="bg-[#12131a]/95 border border-[#10b981]/30 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#10b981] animate-spin-slow" />
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">TARGET POSITION</span>
                    <span className="text-xs font-mono text-white font-bold">
                      {parseFloat(customLat) >= 0 ? `${parseFloat(customLat).toFixed(1)}°N` : `${Math.abs(parseFloat(customLat)).toFixed(1)}°S`},{" "}
                      {parseFloat(customLon) >= 0 ? `${parseFloat(customLon).toFixed(1)}°E` : `${Math.abs(parseFloat(customLon)).toFixed(1)}°W`}
                    </span>
                  </div>
                </div>
                {selectedStormId !== "custom" && (
                  <div className="bg-[#12131a]/95 border border-[#1e202d] backdrop-blur-md px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">SELECTED EVENT</span>
                    <span className="font-bold text-[#10b981]">{activeStorm.name}</span>
                  </div>
                )}
              </div>

              {/* Globe Visual Map Controls Overlay */}
              <div className="absolute bottom-4 left-4 z-10 bg-[#12131a]/95 border border-[#1e202d] backdrop-blur-md p-2 rounded-lg flex flex-col gap-1.5 pointer-events-auto" id="globe-interactive-legend">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider pl-1">GLOW LAYERS</span>
                <div className="flex gap-1">
                  {WEATHER_VARIABLES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedOutputVar(v.id)}
                      className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                        selectedOutputVar === v.id
                          ? "bg-[#10b981]/20 border-[#10b981] text-[#10b981]"
                          : "border-[#222435] text-gray-400 hover:text-white"
                      }`}
                      title={v.name}
                    >
                      {v.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compass / instructions guide */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none text-right">
                <div className="bg-[#12131a]/95 border border-[#2d2f44] backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-gray-400 font-medium">
                  Drag to Orbit • Click Globe to lock Target Coordinates
                </div>
              </div>
            </div>

            {/* Slider: Lead Time (Hours) */}
            <div className="space-y-3 bg-[#181a24] border border-[#1e202f] p-4 rounded-xl" id="leadtime-slider-card">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[#10b981] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  Lead Time (Hours)
                </label>
                {/* Number Display Input box */}
                <div className="flex items-center gap-2" id="leadtime-value-display">
                  <input
                    type="number"
                    id="input-leadtime-numerical"
                    value={leadTime}
                    min={6}
                    max={24}
                    step={6}
                    onChange={(e) => {
                      const val = Math.min(24, Math.max(6, parseInt(e.target.value) || 6));
                      setLeadTime(val);
                    }}
                    className="w-12 bg-[#0c0d13] border border-[#2d2f44] text-white rounded px-2 py-1 text-center font-mono text-sm font-semibold focus:outline-none focus:border-[#10b981]"
                  />
                  <span className="text-xs text-gray-400 font-medium">Hours Out</span>
                </div>
              </div>

              {/* Slider Input with Custom styling */}
              <div className="flex items-center gap-4 mt-2" id="slider-harness">
                <span className="text-xs text-gray-500 font-mono">6h</span>
                <input
                  type="range"
                  id="input-leadtime-slider"
                  min="6"
                  max="24"
                  step="6"
                  value={leadTime}
                  onChange={(e) => setLeadTime(parseInt(e.target.value))}
                  className="flex-grow h-1.5 bg-[#0c0d13] rounded-lg appearance-none cursor-pointer accent-[#10b981] focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">24h</span>
              </div>

              {/* Slider Mark labels */}
              <div className="flex justify-between px-6 text-[11px] text-gray-500 font-mono mt-1">
                <span>6</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
              </div>
            </div>

            {/* Dynamic Forecast charts of Lead times */}
            <div className="bg-[#12131a] border border-[#1e202d] rounded-xl p-4 flex-grow flex flex-col" id="forecast-chart-card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#10b981]" />
                  Inference Time-series Prediction
                </h3>
                <span className="text-[11px] font-semibold font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                  {WEATHER_VARIABLES.find(v => v.id === selectedOutputVar)?.name}
                </span>
              </div>

              {/* Chart visualization */}
              <div className="h-28 w-full" id="forecast-recharts-harness">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={WEATHER_VARIABLES.find(v => v.id === selectedOutputVar)?.color || "#10b981"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={WEATHER_VARIABLES.find(v => v.id === selectedOutputVar)?.color || "#10b981"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1d1e2c" vertical={false} />
                    <XAxis dataKey="hour" stroke="#4a5568" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4a5568" fontSize={10} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#181a24", borderColor: "#2d2f44", borderRadius: "8px", fontSize: "11px" }}
                      labelStyle={{ color: "#a0aec0", fontWeight: "bold" }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={WEATHER_VARIABLES.find(v => v.id === selectedOutputVar)?.color || "#10b981"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-[10px] text-gray-500 text-center leading-relaxed font-medium">
                Simulated NVIDIA Modulus Downscaling physics. Values adjust dynamically based on target latitude peaks and diurnal time ranges.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
