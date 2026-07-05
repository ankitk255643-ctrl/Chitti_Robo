import React, { useState, useEffect, useRef } from "react";
import {
  Rotate3d,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Save,
  Download,
  CheckCircle,
  HelpCircle,
  Info,
  BookOpen,
  ArrowRight,
  Maximize2,
  Minimize2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Database,
  Search,
  Check,
  Award,
  PenTool,
  Compass
} from "lucide-react";

// Types for Simulation Maker
interface Variable {
  name: string;
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  unit: string;
}

interface Toggle {
  name: string;
  label: string;
  defaultValue: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface SimulationData {
  id?: string;
  title: string;
  subtitle: string;
  conceptSummary: string;
  formulaSection: {
    formula: string;
    explanation: string;
  };
  learningOutcomes: string[];
  realWorldUseCases: string[];
  variables: Variable[];
  toggles: Toggle[];
  quizQuestions: QuizQuestion[];
  observationPrompts: string[];
  simulationType: string;
  customRenderInstructions?: string;
  created_at?: string;
}

// Preset list of standard simulations
const PRESETS: Record<string, SimulationData> = {
  electromagnetic_induction: {
    title: "Electromagnetic Induction",
    subtitle: "Faraday's & Lenz's Law of Magnetic Flux",
    conceptSummary: "Electromagnetic induction is the production of an electromotive force (EMF) across an electrical conductor in a changing magnetic field. Discovered by Michael Faraday, this principle serves as the baseline for generators, induction cooktops, and electric motors.\n\nAccording to Lenz's Law, the direction of the induced current is always such that it opposes the change in magnetic flux that produced it. This opposing nature is represented by the negative sign in Faraday's mathematical equation.",
    formulaSection: {
      formula: "EMF = -N * (ΔΦ / Δt)",
      explanation: "EMF is the induced electromotive force (in Volts), N is the number of turns in the coil, and ΔΦ/Δt is the rate of change of magnetic flux (in Webers per second)."
    },
    learningOutcomes: [
      "Understand how magnetic flux changes create electric current.",
      "Observe Lenz's Law in action as current direction reverses.",
      "Correlate the speed of magnet motion to the magnitude of induced EMF."
    ],
    realWorldUseCases: [
      "Hydroelectric Generators: Converting rotating turbine kinetic energy into grid electricity.",
      "Wireless Smartphone Charging: Magnetic coils in charger transferring power to the device.",
      "Induction Cooktops: Direct heating of magnetic pots using high-frequency magnetic fields."
    ],
    variables: [
      { name: "magnet_speed", label: "Magnet Travel Speed", min: 0.5, max: 4, defaultValue: 2, step: 0.1, unit: "cm/s" },
      { name: "coil_turns", label: "Coil Turns (N)", min: 2, max: 8, defaultValue: 5, step: 1, unit: "turns" },
      { name: "magnet_strength", label: "Magnet Field Strength (B)", min: 10, max: 100, defaultValue: 50, step: 5, unit: "mT" }
    ],
    toggles: [
      { name: "show_field_lines", label: "Show Magnetic Field Lines", defaultValue: true },
      { name: "show_current_flow", label: "Show Electron Flow Dots", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "What happens to the induced current when the magnet stops moving inside the coil?",
        options: [
          "It stays at its maximum positive value.",
          "It reverses its direction immediately.",
          "It drops to zero.",
          "The coil bursts into a spark."
        ],
        correctAnswerIndex: 2,
        explanation: "Since induced current requires a CHANGING magnetic flux (ΔΦ/Δt), when the magnet is stationary, ΔΦ is zero, meaning no EMF is produced and current falls to zero."
      },
      {
        question: "How does increasing the number of turns (N) in the copper coil affect the induced voltage?",
        options: [
          "It decreases the voltage proportionally.",
          "It increases the induced voltage proportionally.",
          "It has no effect on the voltage.",
          "It turns the coil into an insulator."
        ],
        correctAnswerIndex: 1,
        explanation: "According to Faraday's law, EMF is directly proportional to N. More turns cut through more magnetic field lines, stacking the induced potential."
      }
    ],
    observationPrompts: [
      "Describe the galvanometer needle's deflection when you drag the magnet in, versus pulling it out.",
      "Compare the current wave height (EMF amplitude) on the graph when magnet speed is set to maximum."
    ],
    simulationType: "electromagnetic_induction"
  },
  magnetic_field_wire: {
    title: "Magnetic Field Around Wire",
    subtitle: "Ampere's Law & Right-Hand Grip Rule",
    conceptSummary: "When an electric current flows through a long straight conductor, a magnetic field is generated in circular rings surrounding the wire. The field strength is strongest near the wire and falls off rapidly as the distance increases.\n\nThe direction of these concentric circular field lines is determined by the Right-Hand Rule: if you point your right thumb in the direction of conventional current, your curled fingers show the direction of the magnetic field vector (B).",
    formulaSection: {
      formula: "B = (μ₀ * I) / (2 * π * r)",
      explanation: "B is the magnetic field strength (Tesla), I is the current (Amperes), r is the distance from the wire (meters), and μ₀ is the permeability of free space (4π × 10⁻⁷ T·m/A)."
    },
    learningOutcomes: [
      "Learn the inverse-distance relation of electromagnetism.",
      "Practice using the Right-Hand Rule by switching current direction.",
      "See how magnetic fields stack with higher electric currents."
    ],
    realWorldUseCases: [
      "High-voltage Power Cables: Creating magnetic fields in surrounding transmission corridors.",
      "Electromagnets: Coiling wire to stack concentric fields into a powerful unified beam.",
      "Coaxial Audio Cable Shielding: Cancelling external magnetic noise using opposing return paths."
    ],
    variables: [
      { name: "wire_current", label: "Electric Current (I)", min: -10, max: 10, defaultValue: 5, step: 0.5, unit: "A" },
      { name: "compass_distance", label: "Compass Orbit Distance (r)", min: 2, max: 12, defaultValue: 6, step: 0.2, unit: "cm" },
      { name: "field_line_density", label: "Field Ring Count", min: 3, max: 8, defaultValue: 5, step: 1, unit: "rings" }
    ],
    toggles: [
      { name: "reverse_current", label: "Reverse Flow Flow", defaultValue: false },
      { name: "show_compass", label: "Enable Test Compass Needle", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "If the electric current in a wire flows straight upward, which direction do the magnetic field lines circle?",
        options: [
          "Clockwise (looking from top)",
          "Counter-clockwise (looking from top)",
          "Straight upward alongside the current",
          "Straight downward opposing the current"
        ],
        correctAnswerIndex: 1,
        explanation: "By the Right-Hand Rule, point your thumb upward. Your curled fingers circle in a counter-clockwise direction."
      }
    ],
    observationPrompts: [
      "Move the compass slider close to the wire and observe the compass deflection speed and strength.",
      "Set current to a negative value. Describe what happens to the circular vector arrows."
    ],
    simulationType: "magnetic_field_wire"
  },
  electric_circuit: {
    title: "Electric Circuit",
    subtitle: "Ohm's Law & Electron Loop Dynamics",
    conceptSummary: "An electric circuit is a closed path that allows electrons to travel continuously, powering electronic components. The three key variables in any basic circuit are Voltage (the driving electrical pressure), Current (the rate of charge flow), and Resistance (the friction opposing the flow).\n\nOhm's Law mathematically binds these three variables. Increasing resistance drops current, while increasing voltage raises current proportionally.",
    formulaSection: {
      formula: "I = V / R",
      explanation: "I is the current (Amperes), V is the electrical potential or voltage (Volts), and R is the circuit resistance (Ohms)."
    },
    learningOutcomes: [
      "Master Ohm's Law visually by altering voltage and resistance.",
      "Understand the roles of conductors, resistors, and energy sources.",
      "Observe lightbulb luminosity change with power fluctuations."
    ],
    realWorldUseCases: [
      "Household Dimmer Switches: Adding variable resistance to reduce lightbulb current.",
      "Fuse Systems: Breaking circuit pathways when high currents risk melting wires.",
      "Battery Powered Flashlights: Simple circuit with a cell source, conductive wires, and a bulb resistive load."
    ],
    variables: [
      { name: "battery_voltage", label: "Battery Voltage (V)", min: 1.5, max: 24, defaultValue: 12, step: 0.5, unit: "V" },
      { name: "resistor_ohms", label: "Resistor Resistance (R)", min: 5, max: 100, defaultValue: 20, step: 1, unit: "Ω" }
    ],
    toggles: [
      { name: "circuit_switch", label: "Close Pathway Switch", defaultValue: true },
      { name: "show_val_labels", label: "Show Digital Probe Voltages", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "If you double the resistance in a closed circuit while holding voltage constant, what happens to the current?",
        options: [
          "It doubles.",
          "It stays the same.",
          "It is cut in half.",
          "It drops to absolute zero."
        ],
        correctAnswerIndex: 2,
        explanation: "Since I = V / R, current and resistance are inversely proportional. Doubling R halves the current."
      }
    ],
    observationPrompts: [
      "Describe the glowing brightness of the lightbulb as you decrease the resistance to its minimum value.",
      "Open the circuit switch and explain why the scrolling current chart drops instantly to zero."
    ],
    simulationType: "electric_circuit"
  },
  solar_system: {
    title: "Solar System Gravity Field",
    subtitle: "Keplerian Orbits & Gravitational Vectors",
    conceptSummary: "Orbits are a delicate balance between a planet's forward momentum (inertia) and the pull of gravity pulling it toward a massive star. If the velocity is too low, the planet spirals into the star; if too fast, it escapes orbit into deep space.\n\nKepler's laws describe how orbits form ellipses rather than perfect circles, with planets moving faster when closer to their host star.",
    formulaSection: {
      formula: "F = G * (M * m) / r²",
      explanation: "F is the gravitational force, G is the gravitational constant, M is the Sun's mass, m is the planet's mass, and r is the distance between them."
    },
    learningOutcomes: [
      "Examine how stellar mass distorts orbit speeds.",
      "Visualize gravity as a pulling vector pointing inward.",
      "Understand why closer planets complete orbits much faster."
    ],
    realWorldUseCases: [
      "Artificial Satellites: Positioning communication satellites in geostationary orbits.",
      "Space Probe Sling-shots: Utilizing planetary gravity to accelerate probes like Voyager.",
      "Exoplanet Detection: Analyzing shifts in star colors caused by orbiting planets pulling them."
    ],
    variables: [
      { name: "sun_mass", label: "Stellar Core Mass (M)", min: 10, max: 200, defaultValue: 100, step: 5, unit: "M☉" },
      { name: "orbit_speed_multiplier", label: "Orbit Speed Offset", min: 0.2, max: 3, defaultValue: 1, step: 0.1, unit: "x" },
      { name: "planet_count", label: "Active Planets", min: 1, max: 4, defaultValue: 3, step: 1, unit: "bodies" }
    ],
    toggles: [
      { name: "show_orbits", label: "Draw Orbit Pathways", defaultValue: true },
      { name: "show_gravity_vectors", label: "Draw Force Vectors", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "Why do planets closer to the central star have much shorter orbital years?",
        options: [
          "They are smaller in size.",
          "Gravity is weaker there, so they drift.",
          "They experience stronger gravitational pull requiring higher speeds to stay in orbit, and have shorter paths.",
          "They are pushed by solar wind currents."
        ],
        correctAnswerIndex: 2,
        explanation: "Nearer orbits have stronger gravity due to smaller distance (1/r²). Planets must travel faster to prevent falling in, plus their path circumference is shorter."
      }
    ],
    observationPrompts: [
      "Increase the Central Star Mass to maximum and describe what happens to the speeds of all orbiting planets.",
      "Observe the length of the green gravity vector lines as a planet moves from its closest orbit point to its furthest."
    ],
    simulationType: "solar_system"
  },
  projectile_motion: {
    title: "Projectile Motion Launcher",
    subtitle: "2D Kinematics, Gravity & Air Friction",
    conceptSummary: "A projectile is an object launched into flight that moves under the influence of gravity and air resistance. By splitting the motion into horizontal (x) and vertical (y) vectors, we find that gravity only accelerates the object downward, while horizontal speed remains constant (ignoring air resistance).\n\nThe combination of uniform horizontal speed and accelerating vertical falling speed creates a perfect parabolic curve trajectory.",
    formulaSection: {
      formula: "y = x * tan(θ) - (g * x²) / (2 * v₀² * cos²(θ))",
      explanation: "y is height, x is distance, θ is the launch angle, v₀ is initial velocity, and g is gravitational acceleration (9.8 m/s²)."
    },
    learningOutcomes: [
      "Discover the optimum launch angle for maximum distance range.",
      "Observe how gravity creates horizontal-vertical independence.",
      "Examine the effect of mass and air drag on terminal drift."
    ],
    realWorldUseCases: [
      "Ballistic Sports: Golfers and basketball players throwing at precise angles for ideal arc paths.",
      "Rockets & Satellites: Calculating launch paths to clear mountainous terrain.",
      "Rescue Cargo Drops: Dropping supply crates from planes taking into account forward inertia."
    ],
    variables: [
      { name: "launch_angle", label: "Launcher Angle (θ)", min: 10, max: 90, defaultValue: 45, step: 1, unit: "°" },
      { name: "launch_speed", label: "Initial Velocity (v₀)", min: 10, max: 60, defaultValue: 35, step: 1, unit: "m/s" },
      { name: "gravity_accel", label: "Gravity Level (g)", min: 2, max: 25, defaultValue: 9.8, step: 0.1, unit: "m/s²" },
      { name: "air_resistance", label: "Air Drag Coefficient", min: 0, max: 5, defaultValue: 0, step: 0.1, unit: "Cd" }
    ],
    toggles: [
      { name: "show_vectors", label: "Draw Active Velocity Vectors", defaultValue: true },
      { name: "draw_grid", label: "Show Coordinate Metric Grid", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "Assuming no air resistance, which launch angle achieves the maximum horizontal travel distance on flat ground?",
        options: [
          "30 degrees",
          "45 degrees",
          "60 degrees",
          "90 degrees"
        ],
        correctAnswerIndex: 1,
        explanation: "Mathematically, the range formula involves sin(2θ). This term reaches its absolute maximum of 1 when 2θ = 90, meaning θ = 45 degrees."
      }
    ],
    observationPrompts: [
      "Set Angle to 90 degrees. Explain why horizontal displacement is zero while vertical height is maximized.",
      "Turn on Air Drag and compare the shape of the parabolic arc to the clean symmetry of the vacuum arc."
    ],
    simulationType: "projectile_motion"
  },
  wave_motion: {
    title: "Transverse Wave Lab",
    subtitle: "Sine Oscillation & Medium Displacement",
    conceptSummary: "Waves transport energy through a medium without transporting physical matter. In a transverse wave, individual particles of the medium oscillate perpendicular to the direction of wave travel.\n\nBy adjusting frequency (how many crests pass per second) and amplitude (the height of the crests), we can manipulate the wave energy level.",
    formulaSection: {
      formula: "v = f * λ",
      explanation: "v is wave velocity (m/s), f is frequency (Hertz), and λ is the wavelength (meters)."
    },
    learningOutcomes: [
      "Understand wavelength, amplitude, and frequency parameters.",
      "See how damping absorbs wave energy over travel distance.",
      "Analyze wave velocity calculations."
    ],
    realWorldUseCases: [
      "Seismic S-Waves: Shear ground ripples travelling sideways from earthquake epicenters.",
      "Violin Strings: Stretched strings vibrating up and down to push surrounding air waves.",
      "Stadium Crowd Waves: Fans standing up and sitting down, creating a moving energy ripple."
    ],
    variables: [
      { name: "wave_freq", label: "Oscillator Frequency (f)", min: 0.5, max: 5, defaultValue: 2, step: 0.1, unit: "Hz" },
      { name: "wave_amp", label: "Wave Amplitude (A)", min: 10, max: 50, defaultValue: 30, step: 1, unit: "cm" },
      { name: "wave_damping", label: "Medium Damping Friction", min: 0, max: 5, defaultValue: 1, step: 0.1, unit: "μ" },
      { name: "wave_tension", label: "Medium Tension (v)", min: 1, max: 10, defaultValue: 5, step: 0.5, unit: "N" }
    ],
    toggles: [
      { name: "show_ruler", label: "Overlay Measurement Grid", defaultValue: false },
      { name: "highlight_particle", label: "Highlight Center Wave Node", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "In a transverse wave, how do the individual particles of the string move?",
        options: [
          "They travel along with the wave crests down the line.",
          "They move up and down in place, perpendicular to wave motion.",
          "They spin in miniature circles.",
          "They remain completely static."
        ],
        correctAnswerIndex: 1,
        explanation: "Transverse waves displace the medium perpendicular to the wave travel vector. The particles just go up and down while energy travels right."
      }
    ],
    observationPrompts: [
      "Set Damping to maximum. Describe what happens to the wave crest heights at the far right end of the lab.",
      "Increase Tension. What effect does this have on the wave speed and total wavelength?"
    ],
    simulationType: "wave_motion"
  },
  pendulum: {
    title: "Chaotic & Simple Pendulum",
    subtitle: "Kinetic-Potential Energy Conservation",
    conceptSummary: "A pendulum consists of a mass suspended from a pivot that swings back and forth. This classic system is a prime example of energy conservation: at the highest point of swing, kinetic energy is zero and gravitational potential energy is at its maximum; at the lowest point, potential energy is zero and kinetic energy peaks.",
    formulaSection: {
      formula: "T ≈ 2 * π * √(L / g)",
      explanation: "T is the period of swing (seconds), L is string length (meters), and g is gravity (m/s²). Note mass has no effect on period!"
    },
    learningOutcomes: [
      "Prove why a pendulum's mass does not affect its period.",
      "Observe energy trade-offs between speed and altitude.",
      "See damping draw energy out of a mechanical system."
    ],
    realWorldUseCases: [
      "Grandfather Clocks: Utilizing a constant pendulum period to tick gear intervals.",
      "Wrecking Balls: Stacking kinetic momentum into demolition work.",
      "Seismometers: Heavy hanging pendulums remaining static while the earth moves around them."
    ],
    variables: [
      { name: "rod_length", label: "Pendulum Length (L)", min: 2, max: 12, defaultValue: 8, step: 0.2, unit: "m" },
      { name: "bob_mass", label: "Bob Weight (m)", min: 1, max: 15, defaultValue: 5, step: 0.5, unit: "kg" },
      { name: "gravity_strength", label: "Local Gravity (g)", min: 2, max: 25, defaultValue: 9.8, step: 0.1, unit: "m/s²" },
      { name: "air_damping", label: "Air Joint Friction", min: 0, max: 3, defaultValue: 0.2, step: 0.05, unit: "b" }
    ],
    toggles: [
      { name: "show_forces", label: "Draw Vector Force Arrows", defaultValue: true },
      { name: "show_trace", label: "Trace Trajectory Path", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "How does doubling the bob mass (m) affect the time it takes for one full swing (period T)?",
        options: [
          "It doubles the period.",
          "It reduces the period by half.",
          "It has absolutely no effect on the period.",
          "It causes the pendulum to swing in circles."
        ],
        correctAnswerIndex: 2,
        explanation: "As seen in T = 2π√(L/g), the mass variable 'm' is absent. Gravity accelerates all masses at the exact same rate, leaving period dependent purely on length and gravity."
      }
    ],
    observationPrompts: [
      "Watch the bottom live graph. At which physical position of the bob does the Kinetic Energy reach its peak value?",
      "Reduce gravity to 2 m/s². Describe the change in speed of the swing cycle."
    ],
    simulationType: "pendulum"
  },
  reflection_refraction: {
    title: "Reflection & Refraction",
    subtitle: "Snell's Law & Optic Boundaries",
    conceptSummary: "When light travels from one medium to another (e.g., from air into glass), its speed changes, causing the light beam to bend. This bending is called Refraction.\n\nSnell's Law predicts the bending angle based on the refractive index of both materials. Additionally, some light bounces back at the exact boundary surface, obeying the Law of Reflection (angle of incidence = angle of reflection).",
    formulaSection: {
      formula: "n₁ * sin(θ₁) = n₂ * sin(θ₂)",
      explanation: "n₁ and n₂ are the refractive indices of mediums 1 and 2, θ₁ is the angle of incidence, and θ₂ is the angle of refraction."
    },
    learningOutcomes: [
      "Observe Snell's Law bending rays at boundaries.",
      "Understand Total Internal Reflection angles.",
      "See the relation of optical density and light speed."
    ],
    realWorldUseCases: [
      "Eyeglass Lenses: Bending incoming light to focus precisely on the eye's retina.",
      "Fiber Optic Cables: Trapping laser signals inside glass tubes using total internal reflection.",
      "Mirages: Hot desert air bending light rays upward to mimic watery sky reflections on sand."
    ],
    variables: [
      { name: "incidence_angle", label: "Incidence Angle (θ₁)", min: 0, max: 85, defaultValue: 45, step: 1, unit: "°" },
      { name: "index_n1", label: "Index of Air (n₁)", min: 1, max: 2.5, defaultValue: 1, step: 0.1, unit: "n" },
      { name: "index_n2", label: "Index of Block (n₂)", min: 1, max: 2.5, defaultValue: 1.5, step: 0.1, unit: "n" }
    ],
    toggles: [
      { name: "draw_normal", label: "Draw Central Normal Line", defaultValue: true },
      { name: "show_degrees", label: "Show Numeric Protractor", defaultValue: true }
    ],
    quizQuestions: [
      {
        question: "When a light ray passes from a less dense medium (Air, n=1.0) into a denser medium (Glass, n=1.5), which direction does it bend?",
        options: [
          "It bends away from the normal line.",
          "It bends toward the normal line.",
          "It does not bend at all.",
          "It reflects backward completely."
        ],
        correctAnswerIndex: 1,
        explanation: "Since n₂ > n₁, the angle θ₂ must be smaller than θ₁ to balance Snell's equation (n₁sinθ₁ = n₂sinθ₂). A smaller angle means the ray bends closer (toward) the normal."
      }
    ],
    observationPrompts: [
      "Set n₁ higher than n₂ (e.g. n₁=2.0, n₂=1.0). Slowly increase the incident angle. At what critical angle does the refracted ray disappear, creating Total Internal Reflection?",
      "Observe how the reflected ray behaves compared to the incident angle slider."
    ],
    simulationType: "reflection_refraction"
  }
};

export default function SimulationMaker() {
  const [activeTab, setActiveTab] = useState<string>("presets");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [researchMode, setResearchMode] = useState<boolean>(true);
  const [builderMode, setBuilderMode] = useState<boolean>(true);
  const [simulation, setSimulation] = useState<SimulationData>(PRESETS.electromagnetic_induction);
  const [savedSimulations, setSavedSimulations] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [rotateAngle, setRotateAngle] = useState<number>(0.5); // Radians rotation
  const [isDraggingObj, setIsDraggingObj] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student interaction states
  const [observationText, setObservationText] = useState<string>("");
  const [observationChecked, setObservationChecked] = useState<boolean>(false);
  const [observationFeedback, setObservationFeedback] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Physics animation variables
  const [time, setTime] = useState<number>(0);
  const [variablesState, setVariablesState] = useState<Record<string, number>>({});
  const [togglesState, setTogglesState] = useState<Record<string, boolean>>({});
  
  // Real-time scrolling chart data log
  const [graphPoints, setGraphPoints] = useState<{ t: number; v1: number; v2: number; v3: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load saved simulations on mount
  useEffect(() => {
    fetchSavedSimulations();
  }, []);

  // Sync variables state when simulation changes
  useEffect(() => {
    if (simulation) {
      const initialVars: Record<string, number> = {};
      simulation.variables.forEach(v => {
        initialVars[v.name] = v.defaultValue;
      });
      setVariablesState(initialVars);

      const initialToggles: Record<string, boolean> = {};
      simulation.toggles.forEach(t => {
        initialToggles[t.name] = t.defaultValue;
      });
      setTogglesState(initialToggles);

      // Reset interaction states
      setObservationText("");
      setObservationChecked(false);
      setObservationFeedback("");
      setSelectedAnswers({});
      setQuizScore(null);
      setGraphPoints([]);
      setTime(0);
    }
  }, [simulation]);

  // Animation cycle & graph capture
  useEffect(() => {
    let animationId: number;

    const tick = () => {
      if (isPlaying) {
        setTime(prev => {
          const nextTime = prev + 0.05;
          // Calculate active dynamic values to feed the graph
          updateGraphData(nextTime);
          return nextTime;
        });
      }
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, variablesState, togglesState, simulation]);

  // Fetch saved simulations
  const fetchSavedSimulations = async () => {
    try {
      const response = await fetch("/api/simulation/saved");
      const data = await response.json();
      if (data.success) {
        setSavedSimulations(data.savedSimulations);
      }
    } catch (e) {
      console.error("Failed to load saved simulations", e);
    }
  };

  // Helper to dynamically update the live scrolling graph data based on physics type
  const updateGraphData = (currTime: number) => {
    let val1 = 0;
    let val2 = 0;
    let val3 = 0;

    const vState = variablesState;
    const type = simulation.simulationType;

    if (type === "electromagnetic_induction") {
      const speed = vState["magnet_speed"] || 2;
      const turns = vState["coil_turns"] || 5;
      const strength = vState["magnet_strength"] || 50;

      // Magnet position oscillates
      const magnetX = Math.sin(currTime * speed) * 8; 
      // EMF is derivative of flux, proportional to speed, turns, strength
      const emf = Math.cos(currTime * speed) * (speed * (turns / 5) * (strength / 50) * 8);
      const flux = Math.sin(currTime * speed) * (turns / 5) * (strength / 50) * 10;

      val1 = emf;      // Green: EMF
      val2 = flux;     // Cyan: Flux
      val3 = magnetX;  // Blue: Position
    } else if (type === "magnetic_field_wire") {
      const current = vState["wire_current"] || 5;
      const dist = vState["compass_distance"] || 6;
      // B field falls off with distance
      const bField = (4 * Math.PI * 10 * current) / (2 * Math.PI * dist);
      
      val1 = current;
      val2 = dist;
      val3 = bField * 20;
    } else if (type === "electric_circuit") {
      const vol = vState["battery_voltage"] || 12;
      const res = vState["resistor_ohms"] || 20;
      const cur = togglesState["circuit_switch"] ? (vol / res) : 0;

      val1 = vol;
      val2 = res / 4;
      val3 = cur * 10;
    } else if (type === "solar_system") {
      const sun = vState["sun_mass"] || 100;
      const speed = vState["orbit_speed_multiplier"] || 1;
      
      val1 = sun / 10;
      val2 = speed * 10;
      val3 = Math.sin(currTime) * 15;
    } else if (type === "projectile_motion") {
      const speed = vState["launch_speed"] || 35;
      const angleRad = ((vState["launch_angle"] || 45) * Math.PI) / 180;
      const g = vState["gravity_accel"] || 9.8;
      
      // Projectile trajectory over active run
      const t = currTime % 8;
      const x = speed * Math.cos(angleRad) * t;
      const y = Math.max(0, speed * Math.sin(angleRad) * t - 0.5 * g * t * t);

      val1 = x / 5;
      val2 = y;
      val3 = Math.sqrt(speed * speed - 2 * g * y);
    } else if (type === "wave_motion") {
      const f = vState["wave_freq"] || 2;
      const a = vState["wave_amp"] || 30;

      val1 = Math.sin(currTime * f * 2) * a;
      val2 = Math.cos(currTime * f * 2) * a;
      val3 = f * 10;
    } else if (type === "pendulum") {
      const len = vState["rod_length"] || 8;
      const damp = vState["air_damping"] || 0.2;
      const angle = Math.sin(currTime * Math.sqrt(9.8 / len)) * Math.exp(-damp * currTime * 0.05);

      val1 = angle * 50; // Angle oscillation
      val2 = (1 - Math.cos(angle)) * 30; // PE
      val3 = Math.cos(angle * 2) * 20; // KE
    } else if (type === "reflection_refraction") {
      const angle = vState["incidence_angle"] || 45;
      const n1 = vState["index_n1"] || 1;
      const n2 = vState["index_n2"] || 1.5;
      const sinR = (n1 * Math.sin((angle * Math.PI) / 180)) / n2;
      const angleR = Math.asin(Math.min(1, Math.max(-1, sinR))) * (180 / Math.PI);

      val1 = angle;
      val2 = angleR;
      val3 = (angle - angleR) * 2;
    } else {
      // Custom / Fallback oscillation
      val1 = Math.sin(currTime) * 25;
      val2 = Math.cos(currTime * 1.5) * 20;
      val3 = Math.sin(currTime * 0.5) * 15;
    }

    setGraphPoints(prev => {
      const points = [...prev, { t: currTime, v1: val1, v2: val2, v3: val3 }];
      if (points.length > 50) points.shift(); // Max 50 scrolling metrics
      return points;
    });
  };

  // Generate dynamic Simulation based on user prompt
  const handleGenerateSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPrompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/simulation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt, researchMode })
      });
      const data = await response.json();
      if (data.success && data.simulation) {
        setSimulation(data.simulation);
        setActiveTab("simulation");
        setCurrentPrompt("");
      } else {
        throw new Error(data.error || "Simulation pipeline returned an error structure.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to trigger automated simulation maker.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Load a preset or saved model
  const handleLoadSimulation = (sim: SimulationData) => {
    setSimulation(sim);
    setActiveTab("simulation");
  };

  // Save current simulation to Dashboard database
  const handleSaveSimulation = async () => {
    try {
      const response = await fetch("/api/simulation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation })
      });
      const data = await response.json();
      if (data.success) {
        setSavedSimulations(data.savedSimulations);
        alert(`Successfully saved "${simulation.title}" to My Simulations dashboard!`);
      }
    } catch (e) {
      alert("Failed to save simulation.");
    }
  };

  // Delete saved simulation from database
  const handleDeleteSimulation = async (id: string) => {
    if (!confirm("Are you sure you want to remove this saved simulation?")) return;
    try {
      const response = await fetch("/api/simulation/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setSavedSimulations(data.savedSimulations);
      }
    } catch (e) {
      alert("Failed to delete simulation.");
    }
  };

  // Check Student's submitted Observation
  const handleCheckObservation = () => {
    if (!observationText.trim()) return;
    setObservationChecked(true);
    
    // Simulate smart tutor observation analysis
    setTimeout(() => {
      let isCorrect = false;
      const textLower = observationText.toLowerCase();

      if (simulation.simulationType === "electromagnetic_induction") {
        if (textLower.includes("needle") || textLower.includes("current") || textLower.includes("reverse") || textLower.includes("direction") || textLower.includes("fast") || textLower.includes("zero")) {
          isCorrect = true;
        }
      } else if (simulation.simulationType === "magnetic_field_wire") {
        if (textLower.includes("circle") || textLower.includes("direction") || textLower.includes("strength") || textLower.includes("close") || textLower.includes("distance")) {
          isCorrect = true;
        }
      } else if (simulation.simulationType === "electric_circuit") {
        if (textLower.includes("glow") || textLower.includes("bright") || textLower.includes("resistance") || textLower.includes("voltage") || textLower.includes("electrons")) {
          isCorrect = true;
        }
      } else {
        if (textLower.length > 25) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        setObservationFeedback(
          "Excellent observation skills! You correctly identified the critical physical variables and relations. Keep playing with other values to master this concept."
        );
      } else {
        setObservationFeedback(
          "Good attempt, but make sure to describe what happens to the vectors, graph lines, or current flows specifically when you alter the sliders."
        );
      }
    }, 800);
  };

  // Submit multiple choice quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    simulation.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizScore(score);
  };

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive sizing
    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.fillStyle = "#090f24";
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate system or grid if toggled
    const isGridOn = togglesState["draw_grid"] || false;
    if (isGridOn) {
      ctx.strokeStyle = "rgba(0, 242, 254, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }
    }

    ctx.save();
    // Center origin
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);

    // Apply rotation angle (pseudo 3D)
    const angle = rotateAngle;

    const type = simulation.simulationType;
    const vState = variablesState;
    const tState = togglesState;

    // PHYSICS DRAWING ALGORITHMS
    if (type === "electromagnetic_induction") {
      // Variables
      const speed = vState["magnet_speed"] || 2;
      const turns = vState["coil_turns"] || 5;
      const str = vState["magnet_strength"] || 50;

      // Magnet travels horizontally
      const magnetX = Math.sin(time * speed) * 120;
      const coilX = 50;

      // Draw lines if enabled
      if (tState["show_field_lines"]) {
        ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
        ctx.lineWidth = 1.5;
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          // Draw curved magnetic loops around magnetX
          ctx.ellipse(magnetX - 40, i * 15, 90, Math.abs(i) * 20 + 20, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw Galvanometer / Meter
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillStyle = "#0c1535";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-130, -90, 45, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Tick markers
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(-130 + Math.cos(a) * 40, -90 + Math.sin(a) * 40);
        ctx.lineTo(-130 + Math.cos(a) * 45, -90 + Math.sin(a) * 45);
        ctx.stroke();
      }

      // Galvanometer Needle deflects proportional to negative derivative of cos (EMF)
      const emf = Math.cos(time * speed) * (speed * (turns / 5) * (str / 50) * 1.5);
      const needleAngle = -Math.PI / 2 + Math.min(Math.PI / 3, Math.max(-Math.PI / 3, emf));

      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-130, -90);
      ctx.lineTo(-130 + Math.cos(needleAngle) * 38, -90 + Math.sin(needleAngle) * 38);
      ctx.stroke();

      // Circle hub
      ctx.fillStyle = "#00f2fe";
      ctx.beginPath();
      ctx.arc(-130, -90, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#a5b4fc";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("GALVANOMETER", -168, -58);

      // Draw the coil structure
      ctx.strokeStyle = "#ea580c"; // Copper wire orange
      ctx.lineWidth = 3.5;
      const ringRadius = 45;
      const spacing = 15;

      for (let n = 0; n < turns; n++) {
        const ringX = coilX + (n - turns / 2) * spacing;
        ctx.beginPath();
        // 3D oval projection
        ctx.ellipse(ringX, 0, ringRadius * 0.4, ringRadius, angle, 0, Math.PI * 2);
        ctx.stroke();

        // Draw electron dots in coil if toggled
        if (tState["show_current_flow"]) {
          ctx.fillStyle = "#00f2fe";
          const electronCount = 4;
          for (let e = 0; e < electronCount; e++) {
            const electronAngle = time * speed * 2 + (e * Math.PI * 2) / electronCount;
            // Projecting circular motion on ellipse
            const ex = ringX + Math.cos(electronAngle) * ringRadius * 0.4 * Math.sin(angle) - Math.sin(electronAngle) * ringRadius * Math.cos(angle);
            const ey = Math.cos(electronAngle) * ringRadius * 0.4 * Math.cos(angle) + Math.sin(electronAngle) * ringRadius * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Wire Connectors to Galvanometer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(coilX - (turns / 2) * spacing, ringRadius);
      ctx.bezierCurveTo(coilX - 50, ringRadius + 40, -130, -30, -130, -45);
      ctx.moveTo(coilX + (turns / 2) * spacing, ringRadius);
      ctx.bezierCurveTo(coilX + 50, ringRadius + 60, -100, -30, -130, -45);
      ctx.stroke();

      // Draw Bar Magnet (3D shaded bar)
      ctx.fillStyle = "#dc2626"; // North Red
      ctx.fillRect(magnetX - 60, -18, 60, 36);
      ctx.fillStyle = "#1d4ed8"; // South Blue
      ctx.fillRect(magnetX, -18, 60, 36);

      // Polar labels
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText("N", magnetX - 45, 6);
      ctx.fillText("S", magnetX + 25, 6);

      // Border outline
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(magnetX - 60, -18, 120, 36);

    } else if (type === "magnetic_field_wire") {
      const current = vState["wire_current"] || 5;
      const compassD = vState["compass_distance"] || 6;
      const count = vState["field_line_density"] || 5;

      // Draw Wire Passing 3D plane
      ctx.fillStyle = "#0b1530";
      ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-160, 50);
      ctx.lineTo(160, 50);
      ctx.lineTo(110, -50);
      ctx.lineTo(-210, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Wire
      ctx.strokeStyle = "#ca8a04"; // Copper
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, -140);
      ctx.lineTo(0, 140);
      ctx.stroke();

      // Current Flow indicator arrows
      if (Math.abs(current) > 0.1) {
        ctx.strokeStyle = "#facc15";
        ctx.fillStyle = "#facc15";
        ctx.lineWidth = 2.5;
        const dir = current > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(0, dir * 80);
        ctx.lineTo(0, dir * 110);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, dir * 110);
        ctx.lineTo(-6, dir * 102);
        ctx.lineTo(6, dir * 102);
        ctx.fill();
      }

      // Concentric Field Rings
      ctx.strokeStyle = "rgba(0, 242, 254, 0.35)";
      ctx.lineWidth = 1.2;
      for (let r = 1; r <= count; r++) {
        const radius = r * 28;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Vector direction arrows
        if (current !== 0) {
          const arrowAngle = time + r;
          const arrowX = Math.cos(arrowAngle) * radius;
          const arrowY = Math.sin(arrowAngle) * radius * 0.4;
          
          ctx.fillStyle = "#00f2fe";
          ctx.beginPath();
          ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Compass Needle
      if (tState["show_compass"]) {
        const compassRad = compassD * 12;
        const cx = Math.cos(time * 0.5) * compassRad;
        const cy = Math.sin(time * 0.5) * compassRad * 0.4;

        ctx.fillStyle = "#111827";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Needle rotation follows magnetic field vector
        // Tangent angle to circle is phase + PI/2
        const fieldAngle = (time * 0.5) + (current > 0 ? Math.PI / 2 : -Math.PI / 2);

        // North tip (red)
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(fieldAngle) * 16, cy + Math.sin(fieldAngle) * 16);
        ctx.stroke();

        // South tip (white)
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.cos(fieldAngle) * 16, cy - Math.sin(fieldAngle) * 16);
        ctx.stroke();
      }

    } else if (type === "electric_circuit") {
      const vol = vState["battery_voltage"] || 12;
      const res = vState["resistor_ohms"] || 20;
      const isOpen = !tState["circuit_switch"];

      // Circuit Pathway coordinates
      const cx = -140;
      const cy = -80;
      const cw = 280;
      const ch = 160;

      // Draw Wire pathway
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx, cy, cw, ch);

      // Battery at bottom
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-40, cy + ch - 12, 80, 24);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.strokeRect(-40, cy + ch - 12, 80, 24);

      // Battery poles
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(35, cy + ch - 8, 12, 16);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-47, cy + ch - 8, 12, 16);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("BATT", -12, cy + ch + 4);

      // Resistor at top
      ctx.fillStyle = "#854d0e";
      ctx.fillRect(-50, cy - 8, 100, 16);
      ctx.strokeStyle = "#fbbf24";
      ctx.strokeRect(-50, cy - 8, 100, 16);
      
      // Resistor bands
      ctx.fillStyle = "#ef4444"; ctx.fillRect(-35, cy - 8, 6, 16);
      ctx.fillStyle = "#3b82f6"; ctx.fillRect(-15, cy - 8, 6, 16);
      ctx.fillStyle = "#22c55e"; ctx.fillRect(15, cy - 8, 6, 16);

      // Lightbulb on right
      const rx = cx + cw;
      const ry = 0;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.fill();

      // Glowing effect if closed
      if (!isOpen) {
        const glowRad = Math.min(60, (vol / res) * 10 + 15);
        const gradient = ctx.createRadialGradient(rx, ry, 5, rx, ry, glowRad);
        gradient.addColorStop(0, "rgba(253, 224, 71, 0.6)");
        gradient.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(rx, ry, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Switch on left
      const lx = cx;
      const ly = 0;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      if (isOpen) {
        // Lever open angled up
        ctx.lineTo(lx + 25, ly - 20);
      } else {
        // Closed flat down
        ctx.lineTo(lx, ly + 30);
      }
      ctx.stroke();

      // Electron dots moving along wire loop
      if (!isOpen) {
        const currentSpeed = (vol / res) * 4;
        const perimeter = (cw + ch) * 2;
        const electronCount = 20;

        ctx.fillStyle = "#facc15";
        for (let i = 0; i < electronCount; i++) {
          const dist = (time * currentSpeed * 20 + (i * perimeter) / electronCount) % perimeter;
          let ex = cx;
          let ey = cy;

          if (dist < cw) {
            ex = cx + dist;
            ey = cy;
          } else if (dist < cw + ch) {
            ex = cx + cw;
            ey = cy + (dist - cw);
          } else if (dist < cw * 2 + ch) {
            ex = cx + cw - (dist - (cw + ch));
            ey = cy + ch;
          } else {
            ex = cx;
            ey = cy + ch - (dist - (cw * 2 + ch));
          }

          ctx.beginPath();
          ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (type === "solar_system") {
      const sun = vState["sun_mass"] || 100;
      const speed = vState["orbit_speed_multiplier"] || 1;
      const pCount = vState["planet_count"] || 3;

      // Draw Sun
      const sunGlow = Math.min(65, 20 + (sun / 2));
      const sunGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, sunGlow);
      sunGradient.addColorStop(0, "#fef08a");
      sunGradient.addColorStop(0.3, "#facc15");
      sunGradient.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(0, 0, sunGlow, 0, Math.PI * 2);
      ctx.fill();

      // Planet configurations
      const colors = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7"];
      const radii = [70, 115, 160, 200];
      const orbitPeriods = [0.03, 0.015, 0.008, 0.004];

      for (let p = 0; p < pCount; p++) {
        const r = radii[p];
        const period = orbitPeriods[p] * sun * speed;
        const angleOrbit = time * period;

        const px = Math.cos(angleOrbit) * r;
        const py = Math.sin(angleOrbit) * r * 0.55; // 3D angled plane

        // Orbit trail
        if (tState["show_orbits"]) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw planet
        ctx.fillStyle = colors[p];
        ctx.beginPath();
        ctx.arc(px, py, 9 + p * 2, 0, Math.PI * 2);
        ctx.fill();

        // Gravity vector arrow pointing sun-ward
        if (tState["show_gravity_vectors"]) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px * 0.7, py * 0.7);
          ctx.stroke();
        }
      }

    } else if (type === "projectile_motion") {
      const angle = vState["launch_angle"] || 45;
      const speed = vState["launch_speed"] || 35;
      const g = vState["gravity_accel"] || 9.8;

      const angleRad = (angle * Math.PI) / 180;

      // Cannon Position (bottom left)
      const cx = -180;
      const cy = 80;

      // Draw Ground
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-240, cy);
      ctx.lineTo(240, cy);
      ctx.stroke();

      // Launch trajectory path
      ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      
      const step = 0.2;
      for (let t = 0; t < 12; t += step) {
        const px = cx + speed * Math.cos(angleRad) * t;
        const py = cy - (speed * Math.sin(angleRad) * t - 0.5 * g * t * t);
        if (py > cy) break;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Cannon Barrel
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angleRad);
      ctx.fillStyle = "#475569";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.fillRect(0, -10, 45, 20);
      ctx.strokeRect(0, -10, 45, 20);
      ctx.restore();

      // Cannon Base
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(cx, cy, 14, Math.PI, 0);
      ctx.fill();

      // Animated Bullet
      const cycleTime = (time * 1.5) % 6;
      const bx = cx + speed * Math.cos(angleRad) * cycleTime;
      const by = cy - (speed * Math.sin(angleRad) * cycleTime - 0.5 * g * cycleTime * cycleTime);

      if (by <= cy) {
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fill();

        // Velocity Vectors
        if (tState["show_vectors"]) {
          const vx = speed * Math.cos(angleRad);
          const vy = speed * Math.sin(angleRad) - g * cycleTime;

          ctx.strokeStyle = "#22c55e"; // Horizontal (Green)
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + vx * 1.5, by);
          ctx.stroke();

          ctx.strokeStyle = "#ef4444"; // Vertical (Red)
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx, by - vy * 1.5);
          ctx.stroke();
        }
      }

    } else if (type === "wave_motion") {
      const f = vState["wave_freq"] || 2;
      const a = vState["wave_amp"] || 30;
      const damp = vState["wave_damping"] || 1;
      const tension = vState["wave_tension"] || 5;

      const particleCount = 40;
      ctx.fillStyle = "#38bdf8";

      for (let i = 0; i < particleCount; i++) {
        const x = -200 + (i * 400) / particleCount;
        const phaseDelay = (i * Math.PI * 2) / 15;
        // Damping reduces amp over distance
        const decay = Math.exp((-damp * i) / 50);
        const y = Math.sin(time * f * 3 - phaseDelay) * a * decay;

        // Highlight center node
        if (i === 20 && tState["highlight_particle"]) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#38bdf8";
        } else {
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw join lines
        if (i > 0) {
          const prevX = -200 + ((i - 1) * 400) / particleCount;
          const prevDecay = Math.exp((-damp * (i - 1)) / 50);
          const prevY = Math.sin(time * f * 3 - ((i - 1) * Math.PI * 2) / 15) * a * prevDecay;
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }

    } else if (type === "pendulum") {
      const len = vState["rod_length"] || 8;
      const bobM = vState["bob_mass"] || 5;
      const damp = vState["air_damping"] || 0.2;

      const px = 0;
      const py = -100;
      const drawLen = len * 22;

      // Oscillating Angle θ
      const angleOsc = Math.sin(time * Math.sqrt(9.8 / len)) * Math.exp(-damp * time * 0.05) * 0.8;

      const bx = px + Math.sin(angleOsc) * drawLen;
      const by = py + Math.cos(angleOsc) * drawLen;

      // Draw suspension string
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Pivot block
      ctx.fillStyle = "#475569";
      ctx.fillRect(-15, py - 6, 30, 12);

      // Trajectory trace
      if (tState["show_trace"]) {
        ctx.strokeStyle = "rgba(168, 85, 247, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, drawLen, Math.PI / 2 - 0.9, Math.PI / 2 + 0.9);
        ctx.stroke();
      }

      // Bob sphere
      const bobRadius = 10 + bobM * 1.5;
      const bobGrad = ctx.createRadialGradient(bx, by, 2, bx, by, bobRadius);
      bobGrad.addColorStop(0, "#a78bfa");
      bobGrad.addColorStop(1, "#6d28d9");
      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bx, by, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Force vectors
      if (tState["show_forces"]) {
        // Gravity (Red Arrow Downward)
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by + 45);
        ctx.stroke();

        // Tension (Blue Arrow pointing back to pivot)
        ctx.strokeStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - Math.sin(angleOsc) * 45, by - Math.cos(angleOsc) * 45);
        ctx.stroke();
      }

    } else if (type === "reflection_refraction") {
      const angleIn = vState["incidence_angle"] || 45;
      const n1 = vState["index_n1"] || 1;
      const n2 = vState["index_n2"] || 1.5;

      const angleInRad = (angleIn * Math.PI) / 180;
      const boundaryY = 0;

      // Draw Glass Slab at bottom
      ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 2;
      ctx.fillRect(-200, boundaryY, 400, 120);

      // Normal Line (Dashed)
      if (tState["draw_normal"]) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(0, -140);
        ctx.lineTo(0, 130);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Incident Ray (Incoming from top left)
      const l1 = 150;
      const ix = -Math.sin(angleInRad) * l1;
      const iy = -Math.cos(angleInRad) * l1;

      ctx.strokeStyle = "#facc15"; // Yellow laser beam
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(0, boundaryY);
      ctx.stroke();

      // Reflected Ray (Bounces back to top right)
      const rx = Math.sin(angleInRad) * l1;
      const ry = -Math.cos(angleInRad) * l1;
      ctx.strokeStyle = "rgba(250, 204, 21, 0.35)"; // Fainter
      ctx.beginPath();
      ctx.moveTo(0, boundaryY);
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Refracted Ray (Snell's Law: sinR = (n1 * sinI) / n2)
      const sinR = (n1 * Math.sin(angleInRad)) / n2;
      const angleRRad = Math.asin(Math.min(1, Math.max(-1, sinR)));
      const l2 = 120;
      const r_out_x = Math.sin(angleRRad) * l2;
      const r_out_y = Math.cos(angleRRad) * l2;

      ctx.strokeStyle = "#38bdf8"; // Bending laser
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, boundaryY);
      ctx.lineTo(r_out_x, r_out_y);
      ctx.stroke();

      // Text markers
      if (tState["show_degrees"]) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px sans-serif";
        ctx.fillText(`θ₁ = ${angleIn}°`, ix - 15, iy - 8);
        const degR = Math.round(angleRRad * (180 / Math.PI));
        ctx.fillText(`θ₂ = ${degR}°`, r_out_x + 10, r_out_y + 15);
      }

    } else {
      // 16. Fallback or general dynamic interactive particle render
      ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
      ctx.fillStyle = "#00f2fe";
      ctx.lineWidth = 1;

      const particleCount = 25;
      for (let i = 0; i < particleCount; i++) {
        const offsetAngle = (i * Math.PI * 2) / particleCount;
        const radius = 80 + Math.sin(time + i) * 30;
        const px = Math.cos(offsetAngle + time * 0.15) * radius;
        const py = Math.sin(offsetAngle + time * 0.15) * radius * 0.55;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(0, 242, 254, 0.1)";
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [time, rotateAngle, zoom, variablesState, togglesState, simulation]);

  // Handle Drag on Canvas to Rotate Pseudo-3D view
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDraggingObj(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingObj || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    setRotateAngle(prev => prev + dx * 0.01);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDraggingObj(false);
    dragStartRef.current = null;
  };

  const activePresets = Object.values(PRESETS).filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col space-y-6 text-gray-100" id="simulation-maker-hub">
      {/* Top Header Card */}
      <div className="glassmorphism rounded-2xl p-6 border border-cyan-500/25 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-7 h-7 text-cyan-400 animate-spin-slow" />
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight">Simulation Maker</h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">LAB STATION</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xl">
            Turn any science topic into an interactive 2D/3D learning model. Research theories, test variables dynamically, and analyze live parameters.
          </p>
        </div>

        {/* Dashboard Tabs switch */}
        <div className="flex items-center gap-2 bg-[#0a0f24] p-1.5 rounded-xl border border-gray-900 z-10">
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition duration-200 cursor-pointer ${
              activeTab === "presets" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-gray-400 hover:text-white"
            }`}
          >
            Science Presets
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition duration-200 cursor-pointer ${
              activeTab === "simulation" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-gray-400 hover:text-white"
            }`}
          >
            Active Lab
          </button>
          <button
            onClick={() => setActiveTab("my_sims")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition duration-200 cursor-pointer ${
              activeTab === "my_sims" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-gray-400 hover:text-white"
            }`}
          >
            My Saved Simulations ({savedSimulations.length})
          </button>
        </div>
      </div>

      {/* AI Simulation Generator Input */}
      <div className="glassmorphism rounded-2xl p-5 border border-purple-500/15">
        <form onSubmit={handleGenerateSimulation} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI DYNAMIC SIMULATION CREATOR
            </span>

            {/* AI Generator Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={researchMode}
                  onChange={(e) => setResearchMode(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-800 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                />
                AI Deep Research Mode
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={builderMode}
                  onChange={(e) => setBuilderMode(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-800 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                />
                Dynamic Logic Builder
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder='Describe any science or engineering topic... e.g., "3D simulation of induced magnetic field" or "solar system orbits"'
                disabled={isGenerating}
                className="w-full bg-[#050814] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition pr-10"
              />
              <PenTool className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-600" />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-mono font-bold text-white hover:opacity-90 shadow-lg cursor-pointer transition disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ANALYZING CONCEPT...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  GENERATE MODEL
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-rose-400 text-[11px] font-mono bg-rose-950/20 px-3 py-1.5 rounded border border-rose-900/25">
              Error: {errorMessage}
            </p>
          )}
        </form>
      </div>

      {/* VIEWPORT CONTROLS */}
      {activeTab === "presets" && (
        <div className="space-y-4">
          {/* Preset templates search */}
          <div className="flex justify-between items-center bg-[#070b19] p-4 rounded-xl border border-gray-900/60">
            <h2 className="text-sm font-mono font-bold text-white">Select a Science Simulation</h2>
            <div className="relative w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter preset topics..."
                className="w-full bg-[#050814] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-600" />
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activePresets.map((preset) => (
              <div
                key={preset.simulationType}
                onClick={() => handleLoadSimulation(preset)}
                className="group relative cursor-pointer bg-[#0a1024]/60 border border-gray-900 hover:border-cyan-500/40 p-5 rounded-2xl transition duration-300 flex flex-col justify-between h-48 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/30 border border-cyan-900/40 px-2 py-0.5 rounded-full">
                    {preset.simulationType.replace("_", " ")}
                  </span>
                  <h3 className="text-base font-display font-semibold text-white tracking-tight group-hover:text-cyan-400 transition leading-snug">
                    {preset.title}
                  </h3>
                  <p className="text-gray-500 text-[11px] line-clamp-3 leading-relaxed">
                    {preset.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-900/40 pt-3 mt-3">
                  <span className="text-[10px] text-gray-500 font-mono">2D/3D Interactive</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 group-hover:translate-x-1.5 transition-transform duration-200">
                    OPEN LAB <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE LAB WORKSPACE */}
      {activeTab === "simulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Concepts, formulas, outcomes */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Theory Card */}
            <div className="glassmorphism rounded-2xl p-5 border border-gray-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-bold text-white tracking-wider uppercase">Topic Explanation</h2>
              </div>
              <h3 className="text-base font-display font-semibold text-cyan-400">{simulation.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{simulation.conceptSummary}</p>
            </div>

            {/* Formula Card */}
            <div className="glassmorphism rounded-2xl p-5 border border-cyan-500/10 bg-cyan-950/5 space-y-3">
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">Governing Mathematical Formula</span>
              <div className="bg-[#050917] rounded-xl p-3 text-center border border-gray-900 shadow-inner">
                <code className="text-sm font-mono font-bold text-white text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{simulation.formulaSection.formula}</code>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{simulation.formulaSection.explanation}</p>
            </div>

            {/* Learning Outcomes */}
            <div className="glassmorphism rounded-2xl p-5 border border-gray-900 space-y-3">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Learning Outcomes</span>
              <ul className="space-y-2">
                {simulation.learningOutcomes.map((o, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-[11px] text-gray-400 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center panel: 3D Canvas rendering window */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glassmorphism rounded-2xl border border-cyan-500/20 overflow-hidden bg-[#070c1e] flex flex-col relative">
              
              {/* Canvas Header */}
              <div className="bg-[#080d24] px-4 py-3 border-b border-gray-900/60 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase">{simulation.title} Viewport</span>
                </div>

                {/* Simulation Canvas Controls */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                    title="Zoom Out"
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer text-xs font-mono font-bold"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono text-gray-500">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(1.8, prev + 0.1))}
                    title="Zoom In"
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer text-xs font-mono font-bold"
                  >
                    +
                  </button>
                  <div className="w-px h-4 bg-gray-800" />
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-md hover:bg-gray-800 text-cyan-400 transition cursor-pointer"
                    title={isPlaying ? "Pause Lab" : "Play Lab"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setTime(0);
                      setRotateAngle(0.5);
                      setZoom(1);
                      setGraphPoints([]);
                      // Reset variables
                      const resV: Record<string, number> = {};
                      simulation.variables.forEach(v => resV[v.name] = v.defaultValue);
                      setVariablesState(resV);
                    }}
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                    title="Reset Coordinates"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Canvas */}
              <div className="relative aspect-video w-full flex items-center justify-center bg-[#050917]">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full block cursor-grab active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                />

                {/* 3D Drag HUD indicator overlay */}
                <div className="absolute bottom-3 left-3 bg-[#000]/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-gray-800/40 text-[9px] font-mono text-gray-400 pointer-events-none flex items-center gap-1.5">
                  <Rotate3d className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                  <span>DRAG CANVAS TO ROTATE CAMERA VIEW</span>
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handleSaveSimulation}
                    className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 p-1.5 rounded-lg shadow transition text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" /> SAVE
                  </button>
                </div>
              </div>

              {/* Live scrolling graph / metrics */}
              <div className="bg-[#050814] p-4 border-t border-gray-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">LIVE DATA OSCILLOSCOPE GRAPH</span>
                  <div className="flex gap-4 text-[9px] font-mono text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> EMF / Primary</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> Flux / Secondary</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> Position / Delta</span>
                  </div>
                </div>

                {/* Live Scrolling Bar/Chart preview box */}
                <div className="h-14 w-full bg-[#03050c] rounded-lg border border-gray-900 relative flex items-end overflow-hidden px-1">
                  {graphPoints.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 font-mono">Waiting for stream vectors...</div>
                  ) : (
                    <div className="w-full h-full flex items-center relative">
                      {/* Drawing line overlay using SVG is cleaner for high performance */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        {/* Map Points to SVG polyline coordinates */}
                        <path
                          d={`M ${graphPoints.map((pt, idx) => `${(idx / 50) * 580}, ${28 + pt.v1}`).join(" L ")}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                        />
                        <path
                          d={`M ${graphPoints.map((pt, idx) => `${(idx / 50) * 580}, ${28 + pt.v2}`).join(" L ")}`}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="1"
                        />
                        <path
                          d={`M ${graphPoints.map((pt, idx) => `${(idx / 50) * 580}, ${28 + pt.v3}`).join(" L ")}`}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Real World Applications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {simulation.realWorldUseCases.map((uc, i) => {
                const parts = uc.split(":");
                return (
                  <div key={i} className="glassmorphism rounded-xl p-4 border border-gray-900 space-y-1.5">
                    <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">CASE {i + 1}</span>
                    <h4 className="text-xs font-semibold text-white">{parts[0]}</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{parts[1] || ""}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Sliders, values, triggers */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Parameters Controls */}
            <div className="glassmorphism rounded-2xl p-5 border border-gray-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Variables Sliders</h2>
              </div>

              {simulation.variables.map((variable) => {
                const val = variablesState[variable.name] ?? variable.defaultValue;
                return (
                  <div key={variable.name} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">{variable.label}</span>
                      <span className="text-cyan-400 font-bold">{val} {variable.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={variable.min}
                      max={variable.max}
                      step={variable.step}
                      value={val}
                      onChange={(e) => {
                        const nextVal = parseFloat(e.target.value);
                        setVariablesState(prev => ({
                          ...prev,
                          [variable.name]: nextVal
                        }));
                      }}
                      className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                );
              })}

              {simulation.toggles.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-gray-900/60">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Visual Layer Settings</span>
                  {simulation.toggles.map((toggle) => {
                    const isChecked = togglesState[toggle.name] ?? toggle.defaultValue;
                    return (
                      <label key={toggle.name} className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setTogglesState(prev => ({
                              ...prev,
                              [toggle.name]: e.target.checked
                            }));
                          }}
                          className="rounded bg-gray-900 border-gray-800 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                        />
                        {toggle.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quiz Section */}
            <div className="glassmorphism rounded-2xl p-5 border border-gray-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Concept Quiz</h2>
              </div>

              {simulation.quizQuestions.slice(0, 2).map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 border-b border-gray-950 pb-3 last:border-0 last:pb-0">
                  <p className="text-[11px] font-semibold text-gray-300 leading-snug">{qIdx + 1}. {q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (quizScore !== null) return; // Locked once graded
                            setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                          }}
                          className={`w-full text-left p-2 rounded text-[10px] font-mono transition ${
                            isSelected
                              ? "bg-purple-950/40 text-purple-400 border border-purple-800/40"
                              : "bg-gray-950/20 text-gray-400 hover:bg-gray-950/40 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizScore !== null && (
                    <div className="text-[10px] font-mono leading-relaxed p-1.5 rounded bg-gray-950/30">
                      {selectedAnswers[qIdx] === q.correctAnswerIndex ? (
                        <span className="text-emerald-400 font-bold block">✓ Correct!</span>
                      ) : (
                        <span className="text-rose-400 font-bold block">✗ Incorrect (Correct: {q.options[q.correctAnswerIndex]})</span>
                      )}
                      <span className="text-gray-500 mt-0.5 block">{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}

              {quizScore === null ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-xs font-mono text-white font-bold transition cursor-pointer"
                >
                  Grade Quiz
                </button>
              ) : (
                <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 text-center space-y-1">
                  <span className="text-xs text-gray-400 block">Graded Result</span>
                  <span className="text-lg font-display font-bold text-purple-400 block">Score: {quizScore} / 2</span>
                  <button
                    onClick={() => {
                      setQuizScore(null);
                      setSelectedAnswers({});
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Reset Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Scientific Observation Field */}
            <div className="glassmorphism rounded-2xl p-5 border border-gray-900 space-y-3">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Observation Journal</span>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Task: Write down what happens as you increase the primary parameters.
              </p>
              <textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                placeholder="Type your notes or observation details here..."
                rows={3}
                className="w-full bg-[#050814] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
              />
              <button
                onClick={handleCheckObservation}
                disabled={!observationText.trim()}
                className="w-full py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/30 hover:bg-cyan-900 text-[10px] font-mono font-bold transition cursor-pointer disabled:opacity-40"
              >
                Submit Observation
              </button>

              {observationChecked && observationFeedback && (
                <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-lg p-2.5 space-y-1 animate-fade-in">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block">✓ Tutor Feedback</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{observationFeedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY SAVED SIMULATIONS DASHBOARD */}
      {activeTab === "my_sims" && (
        <div className="space-y-4">
          <div className="bg-[#070b19] p-4 rounded-xl border border-gray-900/60 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono font-bold text-white">Student Personal Lab Dashboard</h2>
          </div>

          {savedSimulations.length === 0 ? (
            <div className="glassmorphism rounded-2xl p-12 text-center border border-gray-900 space-y-3">
              <Compass className="w-10 h-10 text-gray-700 mx-auto animate-pulse" />
              <h3 className="text-base font-semibold text-gray-400">Your Simulations Sandbox is empty.</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Enter any scientific topic or idea in the generator above to research the concepts and save customized simulations to your personal desk.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-[#0a1024]/60 border border-gray-900 hover:border-purple-500/40 p-5 rounded-2xl transition duration-300 flex flex-col justify-between h-44 group relative"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-950/30 border border-purple-900/40 px-2 py-0.5 rounded-full">
                        {sim.simulationType}
                      </span>
                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-rose-500 rounded transition"
                        title="Remove simulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-base font-display font-semibold text-white group-hover:text-purple-400 transition leading-snug">
                      {sim.title}
                    </h3>
                    <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                      {sim.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-900/40 pt-3 mt-3">
                    <span className="text-[10px] text-gray-600 font-mono">
                      Created: {new Date(sim.created_at || "").toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleLoadSimulation(sim)}
                      className="flex items-center gap-1 text-[10px] font-mono font-bold text-purple-400 group-hover:translate-x-1 transition-transform"
                    >
                      LAUNCH MODEL <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
