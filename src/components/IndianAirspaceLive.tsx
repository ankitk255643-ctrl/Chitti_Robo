import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plane, 
  Radar, 
  RefreshCw, 
  X, 
  Search, 
  Compass, 
  Navigation, 
  Activity, 
  Info, 
  Globe, 
  Sliders, 
  Eye, 
  EyeOff, 
  MapPin, 
  Server,
  ArrowUpDown
} from "lucide-react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WORLD_COUNTRIES, CountryData, Airport } from "../data/countries";

// Fix React 19 / Leaflet global styles or overlay errors
const BOUNDS = {
  lamin: 6.0,
  lomin: 68.0,
  lamax: 37.0,
  lomax: 98.0
};

// Major Indian Cities
interface City {
  name: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Guwahati", lat: 26.1158, lon: 91.7086 }
];

interface FlightRoute {
  departure: string;
  departureName: string;
  departureCity: string;
  departureLat: number;
  departureLon: number;
  arrival: string;
  arrivalName: string;
  arrivalCity: string;
  arrivalLat: number;
  arrivalLon: number;
}

const INDIAN_AIRPORTS: { code: string; name: string; city: string; lat: number; lon: number; }[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", lat: 28.5562, lon: 77.1000 },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", lat: 19.0896, lon: 72.8656 },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", lat: 13.1986, lon: 77.7066 },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai", lat: 12.9941, lon: 80.1709 },
  { code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", lat: 22.6547, lon: 88.4467 },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", lat: 17.2403, lon: 78.4294 },
  { code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", lat: 23.0772, lon: 72.6347 },
  { code: "PNQ", name: "Pune Airport", city: "Pune", lat: 18.5821, lon: 73.9197 },
  { code: "JAI", name: "Jaipur International Airport", city: "Jaipur", lat: 26.8242, lon: 75.8122 },
  { code: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow", lat: 26.7606, lon: 80.8893 },
  { code: "COK", name: "Cochin International Airport", city: "Kochi", lat: 10.1520, lon: 76.4019 },
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati", lat: 26.1061, lon: 91.5859 },
  { code: "GOI", name: "Dabolim Airport", city: "Goa", lat: 15.3808, lon: 73.8314 },
  { code: "PAT", name: "Jay Prakash Narayan Airport", city: "Patna", lat: 25.5913, lon: 85.0879 },
  { code: "BBI", name: "Biju Patnaik Airport", city: "Bhubaneswar", lat: 20.2444, lon: 85.8178 },
  { code: "SXR", name: "Srinagar International Airport", city: "Srinagar", lat: 33.9872, lon: 74.7744 },
  { code: "IXL", name: "Kushok Bakula Rimpochee Airport", city: "Leh", lat: 34.1359, lon: 77.5464 },
  { code: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar", lat: 31.7096, lon: 74.7997 },
  { code: "TRV", name: "Trivandrum International Airport", city: "Thiruvananthapuram", lat: 8.4821, lon: 76.9200 },
  { code: "IXZ", name: "Veer Savarkar International Airport", city: "Port Blair", lat: 11.6410, lon: 92.7297 },
  { code: "IMF", name: "Bir Tikendrajit International Airport", city: "Imphal", lat: 24.7600, lon: 93.8964 },
  { code: "IXB", name: "Bagdogra International Airport", city: "Siliguri", lat: 26.6812, lon: 88.3286 },
  { code: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur", lat: 21.0922, lon: 79.0582 },
  { code: "BHO", name: "Raja Bhoj Airport", city: "Bhopal", lat: 23.2875, lon: 77.3375 },
  { code: "IXE", name: "Mangaluru International Airport", city: "Mangaluru", lat: 12.9613, lon: 74.8901 },
  { code: "VTZ", name: "Visakhapatnam Airport", city: "Visakhapatnam", lat: 17.7212, lon: 83.2244 },
  { code: "IXR", name: "Birsa Munda Airport", city: "Ranchi", lat: 23.3142, lon: 85.3218 },
  { code: "RPR", name: "Swami Vivekananda Airport", city: "Raipur", lat: 21.1804, lon: 81.7387 },
  { code: "STV", name: "Surat International Airport", city: "Surat", lat: 21.1141, lon: 72.7417 },
  { code: "IDR", name: "Devi Ahilyabai Holkar Airport", city: "Indore", lat: 22.7217, lon: 75.8011 },
  { code: "DED", name: "Jolly Grant Airport", city: "Dehradun", lat: 30.1897, lon: 78.1803 },
  { code: "IXC", name: "Shaheed Bhagat Singh International Airport", city: "Chandigarh", lat: 30.6733, lon: 76.7885 }
];

const getDeterministicRoute = (icao24: string, callsign: string, airportsList: { code: string; name: string; city: string; lat: number; lon: number }[]): FlightRoute => {
  const str = icao24 + callsign;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const depIdx = hash % airportsList.length;
  const arrIdx = (hash + 1 + (hash % (airportsList.length - 1))) % airportsList.length;
  
  const departure = airportsList[depIdx];
  const arrival = airportsList[arrIdx];
  
  return {
    departure: departure.code,
    departureName: departure.name,
    departureCity: departure.city,
    departureLat: departure.lat,
    departureLon: departure.lon,
    arrival: arrival.code,
    arrivalName: arrival.name,
    arrivalCity: arrival.city,
    arrivalLat: arrival.lat,
    arrivalLon: arrival.lon
  };
};

interface Aircraft {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude: number; // baro altitude in meters
  geoAltitude: number; // geo altitude in meters
  onGround: boolean;
  velocity: number; // speed in m/s
  heading: number; // true track in degrees
  verticalRate: number; // m/s
  squawk: string;
  lastContact: number; // unix timestamp
  isDemo?: boolean;
  route?: FlightRoute;
}

// React Leaflet Map dynamic zoom / view manager
function MapController({ focusedFlight, countryCenter, countryZoom }: { focusedFlight: Aircraft | null; countryCenter: [number, number]; countryZoom: number }) {
  const map = useMap();
  const lastIcao = useRef<string | null>(null);

  useEffect(() => {
    if (focusedFlight) {
      if (focusedFlight.icao24 !== lastIcao.current) {
        lastIcao.current = focusedFlight.icao24;
        map.setView([focusedFlight.latitude, focusedFlight.longitude], Math.max(map.getZoom(), 6), {
          animate: true,
          duration: 1.5
        });
      }
    } else {
      lastIcao.current = null;
    }
  }, [focusedFlight, map]);

  useEffect(() => {
    if (!focusedFlight) {
      map.setView(countryCenter, countryZoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [countryCenter, countryZoom, focusedFlight, map]);

  return null;
}

export default function IndianAirspaceLive() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    WORLD_COUNTRIES.find((c) => c.code === "IN") || WORLD_COUNTRIES[0]
  );
  const [flights, setFlights] = useState<Aircraft[]>([]);
  const [trails, setTrails] = useState<Record<string, [number, number][]>>({});
  const [selectedFlight, setSelectedFlight] = useState<Aircraft | null>(null);
  
  // Dynamically resolve selected flight to reflect live real-time state updates
  const activeSelectedFlight = selectedFlight
    ? (flights.find(f => f.icao24 === selectedFlight.icao24) || selectedFlight)
    : null;
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<"live" | "demo" | "rate_limited">("live");
  
  // GeoJSON state containers
  const [indiaGeoJson, setIndiaGeoJson] = useState<any>(null);
  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "india" | "air" | "ground" | "high" | "low" | "fast">("all");
  const [sortBy, setSortBy] = useState<"altitude" | "velocity" | "contact" | "callsign">("altitude");
  
  // Toggles
  const [mapTheme, setMapTheme] = useState<"dark" | "light-outline">("light-outline");
  const [showStateBoundaries, setShowStateBoundaries] = useState(true);
  const [showCityLabels, setShowCityLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [rotateIcons, setRotateIcons] = useState(true);

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(30);

  // Load GeoJSON maps locally with root fallback paths
  useEffect(() => {
    // Fetch outer boundary
    fetch("/data/india.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Fallback path needed");
        return res.json();
      })
      .catch(() => fetch("/public/data/india.geojson").then((res) => res.json()))
      .then((data) => setIndiaGeoJson(data))
      .catch((e) => console.warn("Failed loading India outer boundary GeoJSON:", e));

    // Fetch state lines
    fetch("/data/india-states.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Fallback path needed");
        return res.json();
      })
      .catch(() => fetch("/public/data/india-states.geojson").then((res) => res.json()))
      .then((data) => setStatesGeoJson(data))
      .catch((e) => console.warn("Failed loading India states GeoJSON:", e));
  }, []);

  // Fetch aircraft states from free OpenSky network
  const fetchAirspaceData = async () => {
    setLoading(true);
    try {
      const b = selectedCountry.bounds;
      const url = `/api/airspace/states?lamin=${b.lamin}&lomin=${b.lomin}&lamax=${b.lamax}&lomax=${b.lomax}`;
      const response = await fetch(url);
      
      if (response.status === 429) {
        throw new Error("rate_limited");
      }
      if (!response.ok) {
        throw new Error("api_error");
      }

      const data = await response.json();

      if (data && data.states) {
        const parsedFlights: Aircraft[] = data.states
          .map((state: any) => {
            const lon = state[5];
            const lat = state[6];
            if (lon === null || lat === null) return null;

            const callsign = (state[1] || "UNK").trim();
            const route = getDeterministicRoute(state[0], callsign, selectedCountry.airports);

            return {
              icao24: state[0],
              callsign,
              originCountry: state[2] || selectedCountry.name,
              lastContact: state[4] !== null ? parseInt(state[4]) : Math.floor(Date.now() / 1000),
              longitude: parseFloat(lon),
              latitude: parseFloat(lat),
              altitude: state[7] !== null ? parseFloat(state[7]) : 0,
              onGround: !!state[8],
              velocity: state[9] !== null ? parseFloat(state[9]) : 0,
              heading: state[10] !== null ? parseFloat(state[10]) : 0,
              verticalRate: state[11] !== null ? parseFloat(state[11]) : 0,
              geoAltitude: state[13] !== null ? parseFloat(state[13]) : 0,
              squawk: state[14] || "0000",
              route
            };
          })
          .filter((f: any): f is Aircraft => f !== null);

        setFlights(parsedFlights);
        setApiStatus("live");

        // Update trails history maps
        setTrails((currentTrails) => {
          const nextTrails = { ...currentTrails };
          parsedFlights.forEach((flight) => {
            const currentHistory = nextTrails[flight.icao24] || [];
            const nextHistory = [...currentHistory, [flight.latitude, flight.longitude] as [number, number]];
            // Keep last 10 points
            if (nextHistory.length > 10) nextHistory.shift();
            nextTrails[flight.icao24] = nextHistory;
          });
          return nextTrails;
        });

      } else {
        generateDemoFlights();
      }
    } catch (err: any) {
      console.warn("OpenSky API failed, initiating dynamic simulation environment.", err);
      setApiStatus(err.message === "rate_limited" ? "rate_limited" : "demo");
      generateDemoFlights();
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
      setCountdown(30);
    }
  };

  // Tactical Flight Simulator when API is offline
  const generateDemoFlights = () => {
    const carriers = ["AIC", "IND", "SEJ", "VTI", "IAD", "GOW", "LLR", "GOA", "SIA", "UAE", "QTR", "ETH", "DLH"];
    const countries = [selectedCountry.name, selectedCountry.name, "United Arab Emirates", "Singapore", "United Kingdom", "Germany", "France", "United States"];
    const countryAirports = selectedCountry.airports;
    
    setFlights((currentFlights) => {
      // If we already have demo flights, just update their positions, otherwise create fresh ones
      const hasDemos = currentFlights.length > 0 && currentFlights.every(f => f.isDemo);
      
      if (hasDemos) {
        return currentFlights.map((f) => {
          if (f.route) {
            const dy = f.route.arrivalLat - f.latitude;
            const dx = f.route.arrivalLon - f.longitude;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.12) {
              // Reached destination! Pick new destination from selected country's airports
              const nextDep = countryAirports.find(a => a.code === f.route?.arrival) || countryAirports[0];
              let nextArr = countryAirports[Math.floor(Math.random() * countryAirports.length)];
              while (nextArr.code === nextDep.code) {
                nextArr = countryAirports[Math.floor(Math.random() * countryAirports.length)];
              }

              const newRoute: FlightRoute = {
                departure: nextDep.code,
                departureName: nextDep.name,
                departureCity: nextDep.city,
                departureLat: nextDep.lat,
                departureLon: nextDep.lon,
                arrival: nextArr.code,
                arrivalName: nextArr.name,
                arrivalCity: nextArr.city,
                arrivalLat: nextArr.lat,
                arrivalLon: nextArr.lon
              };

              // Compute heading for new leg
              const newDy = newRoute.arrivalLat - nextDep.lat;
              const newDx = newRoute.arrivalLon - nextDep.lon;
              let angle = Math.atan2(newDx, newDy) * (180 / Math.PI);
              if (angle < 0) angle += 360;

              return {
                ...f,
                latitude: nextDep.lat,
                longitude: nextDep.lon,
                heading: Math.round(angle),
                route: newRoute,
                lastContact: Math.floor(Date.now() / 1000)
              };
            }

            // Move along the route line
            // Speed factor is calibrated to provide smooth visual movement
            const degPerSec = (f.velocity / 111000) * 2.5;
            const nextLat = f.latitude + (dy / dist) * degPerSec;
            const nextLon = f.longitude + (dx / dist) * degPerSec;

            let angle = Math.atan2(dx, dy) * (180 / Math.PI);
            if (angle < 0) angle += 360;

            return {
              ...f,
              latitude: nextLat,
              longitude: nextLon,
              heading: Math.round(angle),
              lastContact: Math.floor(Date.now() / 1000)
            };
          }

          // Fallback if no route
          const rad = (f.heading * Math.PI) / 180;
          const distPerSec = f.velocity;
          const latChange = (distPerSec * Math.cos(rad) * 2) / 111000;
          const lonChange = (distPerSec * Math.sin(rad) * 2) / (111000 * Math.cos((f.latitude * Math.PI) / 180));
          
          let nextLat = f.latitude + latChange;
          let nextLon = f.longitude + lonChange;

          const b = selectedCountry.bounds;
          if (nextLat > b.lamax || nextLat < b.lamin || nextLon > b.lomax || nextLon < b.lomin) {
            nextLat = selectedCountry.center[0] + (Math.random() - 0.5) * (b.lamax - b.lamin) * 0.4;
            nextLon = selectedCountry.center[1] + (Math.random() - 0.5) * (b.lomax - b.lomin) * 0.4;
          }

          return {
            ...f,
            latitude: nextLat,
            longitude: nextLon,
            lastContact: Math.floor(Date.now() / 1000)
          };
        });
      }

      // Generate 45 synthetic flights covering the selected country
      const demos: Aircraft[] = Array.from({ length: 45 }).map((_, i) => {
        const carrier = carriers[Math.floor(Math.random() * carriers.length)];
        const num = 100 + Math.floor(Math.random() * 899);
        const callsign = `${carrier}${num}`;
        const icao24 = `syn-${i}-${callsign.toLowerCase()}`;
        const route = getDeterministicRoute(icao24, callsign, countryAirports);

        // Pre-distribute flights nicely along their flight paths
        const pct = 0.1 + Math.random() * 0.8;
        const lat = route.departureLat + (route.arrivalLat - route.departureLat) * pct;
        const lon = route.departureLon + (route.arrivalLon - route.departureLon) * pct;

        // Calculate heading to arrival
        const dy = route.arrivalLat - lat;
        const dx = route.arrivalLon - lon;
        let angle = Math.atan2(dx, dy) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        const heading = Math.round(angle);

        return {
          icao24,
          callsign,
          originCountry: countries[Math.floor(Math.random() * countries.length)],
          latitude: lat,
          longitude: lon,
          altitude: 4500 + Math.floor(Math.random() * 7000),
          geoAltitude: 4600 + Math.floor(Math.random() * 7000),
          onGround: false,
          velocity: 180 + Math.floor(Math.random() * 120),
          heading,
          verticalRate: Math.random() > 0.75 ? (Math.random() > 0.5 ? 4.5 : -3.5) : 0,
          squawk: ["1200", "2000", "7700", "0142"][Math.floor(Math.random() * 4)],
          lastContact: Math.floor(Date.now() / 1000),
          isDemo: true,
          route
        };
      });

      // Populate trails for demos
      setTrails((currentTrails) => {
        const nextTrails = { ...currentTrails };
        demos.forEach((d) => {
          nextTrails[d.icao24] = [[d.latitude, d.longitude]];
        });
        return nextTrails;
      });

      return demos;
    });
  };

  // Initial and Auto-refresh loaders
  useEffect(() => {
    fetchAirspaceData();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchAirspaceData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedCountry]);

  // Countdown timer
  useEffect(() => {
    const clock = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Soft local interval to interpolate aircraft positions in real-time
  useEffect(() => {
    const simInterval = setInterval(() => {
      setFlights((currentFlights) => {
        return currentFlights.map((f) => {
          const rad = (f.heading * Math.PI) / 180;
          // Velocity is in m/s. Move by distance travelled in 2 seconds.
          const distance = f.velocity * 2;
          const latDelta = (distance * Math.cos(rad)) / 111000;
          const lonDelta = (distance * Math.sin(rad)) / (111000 * Math.cos((f.latitude * Math.PI) / 180));

          let nextLat = f.latitude + latDelta;
          let nextLon = f.longitude + lonDelta;

          // Out of bounds wraps or stays inside bounds
          const b = selectedCountry.bounds;
          if (nextLat > b.lamax || nextLat < b.lamin || nextLon > b.lomax || nextLon < b.lomin) {
            nextLat = selectedCountry.center[0] + (Math.random() - 0.5) * (b.lamax - b.lamin) * 0.4;
            nextLon = selectedCountry.center[1] + (Math.random() - 0.5) * (b.lomax - b.lomin) * 0.4;
          }

          // Append to trail in real-time
          if (showTrails) {
            setTrails((curr) => {
              const hist = curr[f.icao24] || [];
              const nextHist = [...hist, [nextLat, nextLon] as [number, number]];
              if (nextHist.length > 10) nextHist.shift();
              return { ...curr, [f.icao24]: nextHist };
            });
          }

          return {
            ...f,
            latitude: nextLat,
            longitude: nextLon
          };
        });
      });
    }, 2000);

    return () => clearInterval(simInterval);
  }, [showTrails, selectedCountry]);

  // Handle Map flight selection click
  const handleFlightSelect = (f: Aircraft) => {
    setSelectedFlight(f);
  };

  // CSS Styles for glowing elements
  const indiaOuterStyle = mapTheme === "light-outline" ? {
    fillColor: "#ffffff",
    fillOpacity: 0.05,
    color: "#000000",  // Clean solid black country border
    weight: 2.8,       // Defined outline
    opacity: 1.0,      // Solid line
    dashArray: ""
  } : {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "#ffffff",  // Neutral crisp white border
    weight: 2.5,       // Clear boundary line
    opacity: 0.9,      // Clean visible solid line
    dashArray: ""
  };

  const stateBoundaryStyle = mapTheme === "light-outline" ? {
    fillColor: "transparent",
    color: "#6b7280",  // Clean neutral grey state lines
    weight: 1.0,
    opacity: 0.85,
    dashArray: ""      // Solid, clean state lines
  } : {
    fillColor: "transparent",
    color: "#4b5563",  // Thin neutral slate-grey state lines
    weight: 1.0,
    opacity: 0.6,
    dashArray: "2, 4"
  };

  // Custom Div Icons to prevent default Leaflet asset lookup breaks
  const generateAircraftIcon = (heading: number, isSelected: boolean) => {
    const rot = rotateIcons ? heading : 0;
    const isLight = mapTheme === "light-outline";
    const bgClass = isSelected
      ? (isLight ? "bg-blue-600 text-white scale-125 shadow-[0_0_15px_rgba(37,99,235,0.8)]" : "bg-cyan-400 text-slate-950 scale-125 shadow-[0_0_15px_rgba(34,211,238,0.95)]")
      : isLight
        ? "bg-slate-900 text-cyan-400 border border-slate-700 hover:scale-110 shadow-md"
        : "bg-[#040819]/90 text-cyan-400 border border-cyan-500/40 hover:scale-110 hover:text-white";

    return L.divIcon({
      className: "custom-leaflet-aircraft-div",
      html: `
        <div class="relative flex items-center justify-center">
          ${isSelected ? `<div class="absolute w-8 h-8 rounded-full border-2 ${isLight ? "border-blue-500" : "border-cyan-400"} animate-ping" style="animation-duration: 1.5s;"></div>` : ""}
          <div class="absolute w-6 h-6 rounded-full ${isLight ? "bg-blue-500/10 border border-blue-400/20" : "bg-cyan-500/10 border border-cyan-400/20"} animate-pulse"></div>
          <div class="p-1 rounded-full flex items-center justify-center transition-all ${bgClass}" style="transform: rotate(${rot}deg);">
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 20.19a2.1 2.1 0 1 1 0-3l3 3-3 3Z"/>
              <path d="m2 22 3-3"/>
              <path d="M13 15.5H3.5a2 2 0 1 1 0-4H13"/>
              <path d="m14 11.5 5.23-5.23a2.5 2.5 0 0 1 3.54 3.54L17.54 15"/>
              <path d="m13 15.5 1 5a2 2 0 1 0 4-1l-2.5-4"/>
              <path d="M13 11.5 10.5 4a2 2 0 1 0-4 1l1.5 5"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const generateCityIcon = (name: string) => {
    return L.divIcon({
      className: "custom-leaflet-city-div",
      html: `
        <div class="flex items-center gap-1">
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.85)]"></div>
          <span class="text-[8px] font-mono font-bold text-gray-400 bg-[#030614]/90 border border-gray-800/40 px-1 py-0.5 rounded leading-none select-none">${name}</span>
        </div>
      `,
      iconSize: [100, 20],
      iconAnchor: [3, 10]
    });
  };

  // Filter flights list
  const filteredFlights = flights.filter((f) => {
    const matchesSearch = 
      f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.icao24.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.originCountry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterType) {
      case "india":
        return f.originCountry.toLowerCase() === selectedCountry.name.toLowerCase();
      case "air":
        return !f.onGround;
      case "ground":
        return f.onGround;
      case "high":
        return f.altitude > 9000; // in-meters (> 30k feet approx)
      case "low":
        return f.altitude > 0 && f.altitude <= 3000; // in-meters (< 10k feet approx)
      case "fast":
        return f.velocity > 200; // > 390 knots approx
      default:
        return true;
    }
  });

  // Sort flights list
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case "velocity":
        return b.velocity - a.velocity;
      case "contact":
        return b.lastContact - a.lastContact;
      case "callsign":
        return a.callsign.localeCompare(b.callsign);
      default:
        return b.altitude - a.altitude;
    }
  });

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[calc(100vh-4rem)] lg:min-h-screen bg-[#020512] text-white relative font-sans select-none overflow-hidden">
      
      {/* Background neon glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,48,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,48,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Control Deck Sidebar Panel */}
      <div className="w-full xl:w-[410px] bg-[#05091d]/90 border-r border-gray-900 flex flex-col p-4 md:p-5 gap-4 z-10 shrink-0 shadow-2xl relative">
        
        {/* Title Header */}
        <div className="bg-[#070d28]/95 border border-indigo-950/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
              <Radar className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-base shrink-0">{selectedCountry.flag}</span>
                <span className="truncate max-w-[150px] uppercase font-mono">{selectedCountry.name} RADAR</span>
                <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">LIVE</span>
              </h1>
              <p className="text-[10px] font-mono text-gray-500 mt-0.5 truncate">Airspace tracker over {selectedCountry.name}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-900/60 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${apiStatus === "live" ? "bg-cyan-500 animate-ping" : "bg-amber-500 animate-ping"}`} />
              STATUS: {apiStatus === "live" ? "LIVE ADS-B" : apiStatus === "rate_limited" ? "RATE LIMITED" : "SIMULATION"}
            </span>
            <button 
              onClick={fetchAirspaceData}
              disabled={loading}
              className="text-cyan-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "SCANNING..." : `SCAN (${countdown}s)`}</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Hub */}
        <div className="bg-[#070d28]/95 border border-indigo-950/50 rounded-2xl p-4 shadow-xl space-y-3.5">
          {/* Country Monitor Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Monitor Airspace Region (129 Countries)
            </label>
            <div className="relative">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = WORLD_COUNTRIES.find((c) => c.code === e.target.value);
                  if (country) {
                    setSelectedCountry(country);
                    setSelectedFlight(null); // Reset selection
                  }
                }}
                className="w-full bg-[#030614]/90 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer appearance-none pr-10"
              >
                {WORLD_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code} className="bg-[#030614] text-white">
                    {country.flag} {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-cyan-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Target Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search Callsign, ICAO, Country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030614]/90 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 text-white transition-all"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Operational Filters</label>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "All" },
                { id: "india", label: `${selectedCountry.name} Origin` },
                { id: "air", label: "In Air" },
                { id: "ground", label: "On Ground" },
                { id: "high", label: "High Alt" },
                { id: "low", label: "Low Alt" },
                { id: "fast", label: "Fast" }
              ].map((filt) => (
                <button
                  key={filt.id}
                  onClick={() => setFilterType(filt.id as any)}
                  className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                    filterType === filt.id 
                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]" 
                      : "bg-[#030614]/70 text-gray-400 border-transparent hover:bg-gray-800/40 hover:text-white"
                  }`}
                >
                  {filt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-900/60">
            <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-gray-500" /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#030614] border border-gray-800 rounded-lg px-2 py-1 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-cyan-500/30"
            >
              <option value="altitude">Highest Altitude</option>
              <option value="velocity">Fastest Speed</option>
              <option value="contact">Latest Contact</option>
              <option value="callsign">Callsign A-Z</option>
            </select>
          </div>
        </div>

        {/* Display Toggles Panel */}
        <div className="bg-[#070d28]/95 border border-indigo-950/50 rounded-2xl p-3.5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-gray-400 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-indigo-400" /> Visual Overlays:</span>
          </div>
          
          <div className="flex flex-col gap-1.5 border-b border-indigo-950/30 pb-2.5">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Map Style Theme</span>
            <div className="grid grid-cols-2 gap-1 bg-[#030614] p-0.5 rounded-lg border border-indigo-950/30">
              <button
                type="button"
                onClick={() => setMapTheme("dark")}
                className={`py-1 px-2 rounded font-mono text-[9px] transition-all ${
                  mapTheme === "dark"
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Slate Tactical
              </button>
              <button
                type="button"
                onClick={() => setMapTheme("light-outline")}
                className={`py-1 px-2 rounded font-mono text-[9px] transition-all ${
                  mapTheme === "light-outline"
                    ? "bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pristine Outline
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
              <input 
                type="checkbox" 
                checked={showStateBoundaries} 
                onChange={() => setShowStateBoundaries(!showStateBoundaries)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-0 bg-[#030614]" 
              />
              State Boundaries
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
              <input 
                type="checkbox" 
                checked={showCityLabels} 
                onChange={() => setShowCityLabels(!showCityLabels)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-0 bg-[#030614]" 
              />
              City Labels
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
              <input 
                type="checkbox" 
                checked={showTrails} 
                onChange={() => setShowTrails(!showTrails)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-0 bg-[#030614]" 
              />
              Flight Trails
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
              <input 
                type="checkbox" 
                checked={rotateIcons} 
                onChange={() => setRotateIcons(!rotateIcons)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-0 bg-[#030614]" 
              />
              Rotate Plane Icons
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white col-span-2">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="rounded border-gray-800 text-cyan-500 focus:ring-0 bg-[#030614]" 
              />
              Auto Scan (Refresh 30s)
            </label>
          </div>
        </div>

        {/* Live Flights Feed / List */}
        <div className="bg-[#070d28]/95 border border-indigo-950/50 rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[250px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-900/60 mb-3 shrink-0">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              Target Scan Feed ({sortedFlights.length})
            </span>
            <span className="text-[9px] font-mono bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded border border-cyan-900/20">
              {flights.length} ON RADAR
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {sortedFlights.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Compass className="w-8 h-8 text-gray-600 mb-2 animate-spin" style={{ animationDuration: "12s" }} />
                <p className="text-xs font-mono">No target craft in range.</p>
              </div>
            ) : (
              sortedFlights.map((f) => {
                const isSelected = selectedFlight?.icao24 === f.icao24;
                return (
                  <button
                    key={f.icao24}
                    onClick={() => handleFlightSelect(f)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)]" 
                        : "bg-[#040817]/40 border-gray-900 hover:bg-[#12193b]/30 hover:border-cyan-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${isSelected ? "bg-cyan-500/20 border-cyan-400 text-cyan-400" : "bg-gray-950/60 border-gray-900 text-gray-500 group-hover:text-cyan-400"} transition`}>
                        <Plane 
                          className="w-3.5 h-3.5" 
                          style={{ transform: `rotate(${rotateIcons ? f.heading : 0}deg)` }} 
                        />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          {f.callsign}
                          {f.route && (
                            <span className="text-[9px] px-1 bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 rounded">
                              {f.route.departure}➔{f.route.arrival}
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500 block truncate">{f.originCountry} • ICAO {f.icao24}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 block">
                        {Math.round(f.altitude * 3.28084).toLocaleString()} ft
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 block">
                        {Math.round(f.velocity * 1.94384)} kts
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Main Map Canvas Block */}
      <div className="flex-1 min-h-[500px] bg-[#030614] relative flex flex-col p-4 md:p-6 shadow-inner z-10">
        
        {/* Full Screen Live Map Overlay Container */}
        <div className="flex-1 w-full rounded-3xl overflow-hidden border border-gray-900/80 relative bg-[#01040d] shadow-2xl">
          
          <MapContainer 
            center={[21.0, 78.0]} 
            zoom={5} 
            scrollWheelZoom={true}
            zoomControl={true}
            className="h-full w-full bg-[#020512]"
            id="react-leaflet-india-aviation-container"
          >
            {/* Base Tile Layer based on selected theme */}
            <TileLayer
              url={
                mapTheme === "light-outline"
                  ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Dynamic Map Controller */}
            <MapController 
              focusedFlight={activeSelectedFlight} 
              countryCenter={selectedCountry.center}
              countryZoom={selectedCountry.zoom}
            />

            {/* Selected Flight Route Path (Departure ➔ Current ➔ Arrival) */}
            {activeSelectedFlight && activeSelectedFlight.route && (
              <>
                {/* Completed route section */}
                <Polyline
                  positions={[
                    [activeSelectedFlight.route.departureLat, activeSelectedFlight.route.departureLon],
                    [activeSelectedFlight.latitude, activeSelectedFlight.longitude]
                  ]}
                  color={mapTheme === "light-outline" ? "#2563eb" : "#3b82f6"} 
                  weight={2.5}
                  opacity={0.8}
                  dashArray="4, 4"
                />
                {/* Remaining route section */}
                <Polyline
                  positions={[
                    [activeSelectedFlight.latitude, activeSelectedFlight.longitude],
                    [activeSelectedFlight.route.arrivalLat, activeSelectedFlight.route.arrivalLon]
                  ]}
                  color={mapTheme === "light-outline" ? "#16a34a" : "#10b981"} 
                  weight={2.5}
                  opacity={0.8}
                  dashArray="1, 5"
                />

                {/* Departure Airport Pin Marker */}
                <Marker
                  position={[activeSelectedFlight.route.departureLat, activeSelectedFlight.route.departureLon]}
                  icon={L.divIcon({
                    className: "custom-leaflet-airport-div",
                    html: `
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <span class="text-[9px] font-mono font-bold bg-slate-900 border border-blue-900/40 text-blue-400 px-1 rounded mt-0.5 shadow-md whitespace-nowrap">
                          DEP: ${activeSelectedFlight.route.departure}
                        </span>
                      </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                  })}
                />

                {/* Arrival Airport Pin Marker */}
                <Marker
                  position={[activeSelectedFlight.route.arrivalLat, activeSelectedFlight.route.arrivalLon]}
                  icon={L.divIcon({
                    className: "custom-leaflet-airport-div",
                    html: `
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <span class="text-[9px] font-mono font-bold bg-slate-900 border border-emerald-900/40 text-emerald-400 px-1 rounded mt-0.5 shadow-md whitespace-nowrap animate-pulse">
                          ARR: ${activeSelectedFlight.route.arrival}
                        </span>
                      </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                  })}
                />
              </>
            )}

            {/* Recent Flight Movement Trails */}
            {showTrails && Object.entries(trails).map(([icao24, positions]) => {
              // Ensure we only draw trails for active flights on map
              const flightExists = flights.some(f => f.icao24 === icao24);
              const posArray = positions as [number, number][];
              if (!flightExists || posArray.length < 2) return null;
              
              const isSelected = activeSelectedFlight?.icao24 === icao24;
              const isLight = mapTheme === "light-outline";
              return (
                <Polyline 
                   key={`trail-${icao24}`} 
                   positions={posArray} 
                   color={isSelected ? (isLight ? "#2563eb" : "#22d3ee") : (isLight ? "#4b5563" : "#818cf8")} 
                   weight={isSelected ? 2.5 : 1.5} 
                   opacity={isSelected ? 0.9 : 0.4}
                   dashArray={isSelected ? "1, 3" : "2, 4"}
                />
              );
            })}

            {/* Major Cities Overlay Pins */}
            {showCityLabels && CITIES.map((city) => (
              <Marker
                key={`city-${city.name}`}
                position={[city.lat, city.lon]}
                icon={generateCityIcon(city.name)}
              />
            ))}

            {/* Active Flying Aircraft Marker Plots */}
            {filteredFlights.map((f) => {
              const isSelected = activeSelectedFlight?.icao24 === f.icao24;
              return (
                <Marker
                  key={f.icao24}
                  position={[f.latitude, f.longitude]}
                  icon={generateAircraftIcon(f.heading, isSelected)}
                  eventHandlers={{
                    click: () => handleFlightSelect(f)
                  }}
                >
                  {/* Tooltip Hover display info */}
                  <Tooltip direction="top" offset={[0, -5]} opacity={0.9} className="custom-leaflet-tooltip">
                    <div className="bg-[#030614]/95 border border-[#1e295d] p-1.5 rounded text-[10px] font-mono text-white shadow-xl leading-relaxed">
                      <span className="font-bold text-cyan-400">{f.callsign}</span>
                      <br />
                      Alt: <span className="text-emerald-400 font-semibold">{Math.round(f.altitude * 3.28084).toLocaleString()} ft</span>
                      <br />
                      Speed: <span className="text-cyan-400 font-semibold">{Math.round(f.velocity * 1.94384)} kts</span>
                    </div>
                  </Tooltip>

                  {/* Standard Click Popup */}
                  <Popup className="custom-leaflet-popup">
                    <div className="bg-[#030614]/95 border border-[#1e295d] p-2.5 rounded text-[11px] font-mono text-white max-w-xs leading-relaxed">
                      <span className="font-extrabold text-xs text-white block border-b border-gray-800 pb-1 mb-1.5 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                        {f.callsign}
                      </span>
                      Origin: <span className="text-gray-300 font-semibold">{f.originCountry}</span>
                      <br />
                      Altitude: <span className="text-emerald-400 font-semibold">{Math.round(f.altitude * 3.28084).toLocaleString()} ft</span>
                      <br />
                      Speed: <span className="text-cyan-400 font-semibold">{Math.round(f.velocity * 1.94384)} kts</span>
                      <br />
                      Track / Heading: <span className="text-indigo-400 font-semibold">{Math.round(f.heading)}°</span>
                      <br />
                      Squawk Code: <span className="text-amber-400 font-semibold">{f.squawk}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          </MapContainer>

          {/* Compass Rose Info overlay */}
          <div className="absolute top-4 left-4 z-[999] bg-slate-950/85 border border-gray-900/80 p-2.5 rounded-xl text-[9px] font-mono text-gray-400 flex flex-col gap-1 shadow-2xl pointer-events-none">
            <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Tactical Plotting Bounds
            </div>
            <span>NORTH-MAX: {selectedCountry.bounds.lamax.toFixed(1)}°N</span>
            <span>SOUTH-MIN: {selectedCountry.bounds.lamin.toFixed(1)}°N</span>
            <span>WEST-MIN: {selectedCountry.bounds.lomin.toFixed(1)}°E</span>
            <span>EAST-MAX: {selectedCountry.bounds.lomax.toFixed(1)}°E</span>
          </div>

          <div className="absolute top-4 right-4 z-[999] bg-slate-950/85 border border-gray-900/80 p-2 rounded-lg text-[9px] font-mono text-cyan-400 shadow-2xl pointer-events-none flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>COVERAGE: 100% SECURE ADS-B</span>
          </div>

        </div>

        {/* Live warnings / Delay Notice */}
        <div className="mt-3.5 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-gray-550 gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Live data may be delayed, incomplete, or unavailable depending on ADS-B coverage.</span>
          </div>
          <div className="bg-cyan-950/20 px-2.5 py-0.5 rounded border border-cyan-900/30 text-[10px] text-cyan-400">
            TOTAL ACTIVE RADAR TARGETS: {sortedFlights.length}
          </div>
        </div>

        {/* Selected Flight Visual Telemetry Teleplot Board */}
        <AnimatePresence>
          {activeSelectedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-6 left-6 right-6 bg-[#060b21]/95 border border-[#1e295d] rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-[999] backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              id="selected-flight-detailed-telemetry-overlay"
            >
              <button 
                onClick={() => setSelectedFlight(null)}
                className="absolute top-3 right-3 p-1 rounded-full bg-[#030614] border border-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                title="Dismiss inspector"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 shrink-0">
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/35 text-cyan-400 shrink-0 rounded-2xl">
                  <Plane 
                    className="w-8 h-8 animate-pulse" 
                    style={{ transform: `rotate(${activeSelectedFlight.heading}deg)` }} 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-black text-white">{activeSelectedFlight.callsign}</span>
                    <span className="text-[10px] font-mono bg-indigo-950/50 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded uppercase font-bold">
                      ICAO: {activeSelectedFlight.icao24}
                    </span>
                    {activeSelectedFlight.isDemo && (
                      <span className="text-[8px] font-mono bg-amber-950/40 text-amber-400 border border-amber-800/30 px-1.5 rounded uppercase font-extrabold tracking-widest animate-pulse">
                        SIMULATION
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-gray-400 mt-1">Origin Country: <span className="text-white font-semibold">{activeSelectedFlight.originCountry}</span></p>
                </div>
              </div>

              {/* Real Route Progress Tracker */}
              {activeSelectedFlight.route && (
                <div className="flex-1 flex flex-col justify-center px-4 py-2 border border-[#1e295d]/60 bg-[#030614]/50 rounded-xl font-mono max-w-sm w-full">
                  <div className="flex justify-between w-full text-[10px] font-bold text-gray-300 mb-1">
                    <span className="text-blue-400" title={activeSelectedFlight.route.departureName}>{activeSelectedFlight.route.departure}</span>
                    <span className="text-emerald-400" title={activeSelectedFlight.route.arrivalName}>{activeSelectedFlight.route.arrival}</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-gray-900 rounded-full overflow-hidden flex items-center border border-gray-800/40">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(10, Math.min(90, (() => {
                          const route = activeSelectedFlight.route!;
                          const totalDist = Math.hypot(route.arrivalLat - route.departureLat, route.arrivalLon - route.departureLon);
                          const currentDist = Math.hypot(activeSelectedFlight.latitude - route.departureLat, activeSelectedFlight.longitude - route.departureLon);
                          return (currentDist / totalDist) * 100;
                        })()))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between w-full text-[8px] text-gray-500 mt-1">
                    <span className="truncate max-w-[120px]" title={activeSelectedFlight.route.departureName}>{activeSelectedFlight.route.departureCity}</span>
                    <span className="truncate max-w-[120px]" title={activeSelectedFlight.route.arrivalName}>{activeSelectedFlight.route.arrivalCity}</span>
                  </div>
                </div>
              )}

              {/* Grid visual blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 max-w-xl lg:max-w-md xl:max-w-xl shrink-0">
                <div className="bg-[#030614]/60 border border-gray-900/60 p-2 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">ALTITUDE</span>
                  <span className="text-xs font-mono font-bold text-white block">
                    {Math.round(activeSelectedFlight.altitude * 3.28084).toLocaleString()} ft
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 block">
                    Geo Alt: {Math.round(activeSelectedFlight.geoAltitude ? activeSelectedFlight.geoAltitude * 3.28084 : activeSelectedFlight.altitude * 3.28084).toLocaleString()} ft
                  </span>
                </div>

                <div className="bg-[#030614]/60 border border-gray-900/60 p-2 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">VELOCITY</span>
                  <span className="text-xs font-mono font-bold text-white block">
                    {Math.round(activeSelectedFlight.velocity * 1.94384)} kts
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 block">
                    {Math.round(activeSelectedFlight.velocity * 3.6)} km/h
                  </span>
                </div>

                <div className="bg-[#030614]/60 border border-gray-900/60 p-2 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">COORDINATES</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                    {activeSelectedFlight.latitude.toFixed(4)}°N
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 block">
                    {activeSelectedFlight.longitude.toFixed(4)}°E
                  </span>
                </div>

                <div className="bg-[#030614]/60 border border-gray-900/60 p-2 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">TRACK / SQUAWK</span>
                  <span className="text-xs font-mono font-bold text-white block flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-cyan-400" style={{ transform: `rotate(${activeSelectedFlight.heading}deg)` }} />
                    {activeSelectedFlight.heading}°
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 block">
                    Squawk {activeSelectedFlight.squawk}
                  </span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
