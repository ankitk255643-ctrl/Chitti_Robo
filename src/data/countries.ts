export interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  center: [number, number]; // [lat, lon]
  zoom: number;
  bounds: {
    lamin: number;
    lomin: number;
    lamax: number;
    lomax: number;
  };
  airports: Airport[];
}

// Compact raw representation of exactly 129 countries of the world
const RAW_COUNTRIES: {
  c: string; // code
  n: string; // name
  f: string; // flag emoji
  lat: number; // center latitude
  lon: number; // center longitude
  b: [number, number, number, number]; // [lamin, lomin, lamax, lomax]
  z: number; // zoom level
  hubs?: { code: string; name: string; city: string; lat: number; lon: number }[]; // custom overrides
}[] = [
  { c: "IN", n: "India", f: "🇮🇳", lat: 20.5937, lon: 78.9629, b: [6.0, 68.0, 37.0, 98.0], z: 5, hubs: [
    { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", lat: 28.5562, lon: 77.1000 },
    { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", lat: 19.0896, lon: 72.8656 },
    { code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", lat: 13.1986, lon: 77.7066 },
    { code: "MAA", name: "Chennai International Airport", city: "Chennai", lat: 12.9941, lon: 80.1709 },
    { code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", lat: 22.6547, lon: 88.4467 },
    { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", lat: 17.2403, lon: 78.4294 }
  ] },
  { c: "US", n: "United States", f: "🇺🇸", lat: 37.0902, lon: -95.7129, b: [24.52, -124.76, 49.38, -66.95], z: 4, hubs: [
    { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", lat: 40.6413, lon: -73.7781 },
    { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", lat: 33.9416, lon: -118.4085 },
    { code: "ORD", name: "O'Hare International Airport", city: "Chicago", lat: 41.9742, lon: -87.9073 },
    { code: "ATL", name: "Hartsfield-Jackson International Airport", city: "Atlanta", lat: 33.6407, lon: -84.4277 }
  ] },
  { c: "GB", n: "United Kingdom", f: "🇬🇧", lat: 55.3781, lon: -3.4360, b: [49.96, -8.63, 60.85, 1.76], z: 5, hubs: [
    { code: "LHR", name: "London Heathrow Airport", city: "London", lat: 51.4700, lon: -0.4543 },
    { code: "MAN", name: "Manchester Airport", city: "Manchester", lat: 53.3588, lon: -2.2749 },
    { code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", lat: 55.9508, lon: -3.3615 }
  ] },
  { c: "DE", n: "Germany", f: "🇩🇪", lat: 51.1657, lon: 10.4515, b: [47.27, 5.86, 55.05, 15.04], z: 5, hubs: [
    { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", lat: 50.0333, lon: 8.5705 },
    { code: "MUC", name: "Munich Airport", city: "Munich", lat: 48.3538, lon: 11.7861 },
    { code: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", lat: 52.3667, lon: 13.5033 }
  ] },
  { c: "FR", n: "France", f: "🇫🇷", lat: 46.2276, lon: 2.2137, b: [41.36, -5.14, 51.10, 9.56], z: 5, hubs: [
    { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", lat: 49.0097, lon: 2.5479 },
    { code: "ORY", name: "Orly Airport", city: "Paris", lat: 48.7262, lon: 2.3652 },
    { code: "NCE", name: "Nice Côte d'Azur Airport", city: "Nice", lat: 43.6653, lon: 7.2150 }
  ] },
  { c: "JP", n: "Japan", f: "🇯🇵", lat: 36.2048, lon: 138.2529, b: [30.00, 128.00, 45.00, 146.00], z: 5, hubs: [
    { code: "HND", name: "Haneda Airport", city: "Tokyo", lat: 35.5494, lon: 139.7798 },
    { code: "NRT", name: "Narita International Airport", city: "Tokyo", lat: 35.7720, lon: 140.3929 },
    { code: "KIX", name: "Kansai International Airport", city: "Osaka", lat: 34.4320, lon: 135.2300 }
  ] },
  { c: "AU", n: "Australia", f: "🇦🇺", lat: -25.2744, lon: 133.7751, b: [-44.0, 112.0, -10.0, 154.0], z: 4, hubs: [
    { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", lat: -33.9461, lon: 151.1772 },
    { code: "MEL", name: "Melbourne Airport", city: "Melbourne", lat: -37.6690, lon: 144.8410 },
    { code: "BNE", name: "Brisbane Airport", city: "Brisbane", lat: -27.3842, lon: 153.1175 }
  ] },
  { c: "CA", n: "Canada", f: "🇨🇦", lat: 56.1304, lon: -106.3468, b: [41.67, -141.0, 68.0, -52.61], z: 4, hubs: [
    { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", lat: 43.6777, lon: -79.6248 },
    { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", lat: 49.1967, lon: -123.1815 },
    { code: "YUL", name: "Montréal-Trudeau International Airport", city: "Montreal", lat: 45.4706, lon: -73.7408 }
  ] },
  { c: "BR", n: "Brazil", f: "🇧🇷", lat: -14.2350, lon: -51.9253, b: [-34.0, -74.0, 5.0, -34.0], z: 4, hubs: [
    { code: "GRU", name: "São Paulo/Guarulhos International Airport", city: "Sao Paulo", lat: -23.4356, lon: -46.4731 },
    { code: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", lat: -22.8100, lon: -43.2506 },
    { code: "BSB", name: "Brasília International Airport", city: "Brasilia", lat: -15.8692, lon: -47.9172 }
  ] },
  { c: "ZA", n: "South Africa", f: "🇿🇦", lat: -30.5595, lon: 22.9375, b: [-35.0, 16.0, -22.0, 33.0], z: 5, hubs: [
    { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", lat: -26.1392, lon: 28.2460 },
    { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", lat: -33.9712, lon: 18.6021 }
  ] },
  { c: "SG", n: "Singapore", f: "🇸🇬", lat: 1.3521, lon: 103.8198, b: [1.15, 103.60, 1.48, 104.05], z: 11, hubs: [
    { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", lat: 1.3644, lon: 103.9915 },
    { code: "XSP", name: "Seletar Airport", city: "Singapore", lat: 1.4169, lon: 103.8686 }
  ] },
  { c: "AE", n: "United Arab Emirates", f: "🇦🇪", lat: 23.4241, lon: 53.8478, b: [22.4, 51.5, 26.1, 56.5], z: 7, hubs: [
    { code: "DXB", name: "Dubai International Airport", city: "Dubai", lat: 25.2532, lon: 55.3657 },
    { code: "AUH", name: "Zayed International Airport", city: "Abu Dhabi", lat: 24.4248, lon: 54.6511 }
  ] },
  { c: "SA", n: "Saudi Arabia", f: "🇸🇦", lat: 23.8859, lon: 45.0792, b: [16.0, 34.0, 32.0, 56.0], z: 5, hubs: [
    { code: "RUH", name: "King Khalid International Airport", city: "Riyadh", lat: 24.9576, lon: 46.6988 },
    { code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", lat: 21.6796, lon: 39.1565 }
  ] },
  { c: "ES", n: "Spain", f: "🇪🇸", lat: 40.4637, lon: -3.7492, b: [35.0, -10.0, 44.0, 4.0], z: 5, hubs: [
    { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", lat: 40.4719, lon: -3.5626 },
    { code: "BCN", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", lat: 41.2974, lon: 2.0833 }
  ] },
  { c: "IT", n: "Italy", f: "🇮🇹", lat: 41.8719, lon: 12.5674, b: [35.0, 6.0, 47.0, 19.0], z: 5, hubs: [
    { code: "FCO", name: "Leonardo da Vinci-Fiumicino Airport", city: "Rome", lat: 41.8003, lon: 12.2389 },
    { code: "MXP", name: "Milan Malpensa Airport", city: "Milan", lat: 45.6300, lon: 8.7231 }
  ] },
  { c: "CN", n: "China", f: "🇨🇳", lat: 35.8617, lon: 104.1954, b: [18.0, 73.0, 53.0, 135.0], z: 4, hubs: [
    { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", lat: 40.0801, lon: 116.5845 },
    { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", lat: 31.1443, lon: 121.8052 },
    { code: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", lat: 23.3924, lon: 113.2988 }
  ] },
  { c: "RU", n: "Russia", f: "🇷🇺", lat: 61.5240, lon: 105.3188, b: [41.0, 19.0, 81.0, 180.0], z: 3, hubs: [
    { code: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", lat: 55.9726, lon: 37.4146 },
    { code: "DME", name: "Domodedovo International Airport", city: "Moscow", lat: 55.4088, lon: 37.9061 }
  ] },
  { c: "AR", n: "Argentina", f: "🇦🇷", lat: -38.4161, lon: -63.6167, b: [-55.0, -73.0, -22.0, -53.0], z: 4, hubs: [
    { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", lat: -34.8222, lon: -58.5358 },
    { code: "AEP", name: "Jorge Newbery Airfield", city: "Buenos Aires", lat: -34.5580, lon: -58.4156 }
  ] },
  { c: "MX", n: "Mexico", f: "🇲🇽", lat: 23.6345, lon: -102.5528, b: [14.0, -117.0, 32.0, -86.0], z: 5, hubs: [
    { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", lat: 19.4363, lon: -99.0721 },
    { code: "CUN", name: "Cancún International Airport", city: "Cancun", lat: 21.0365, lon: -86.8771 }
  ] },
  { c: "NZ", n: "New Zealand", f: "🇳🇿", lat: -40.9006, lon: 174.8860, b: [-47.0, 166.0, -34.0, 179.0], z: 5, hubs: [
    { code: "AKL", name: "Auckland Airport", city: "Auckland", lat: -37.0081, lon: 174.7917 },
    { code: "WLG", name: "Wellington International Airport", city: "Wellington", lat: -41.3272, lon: 174.8053 }
  ] },
  { c: "EG", n: "Egypt", f: "🇪🇬", lat: 26.8206, lon: 30.8025, b: [22.0, 25.0, 31.5, 36.0], z: 5, hubs: [
    { code: "CAI", name: "Cairo International Airport", city: "Cairo", lat: 30.1219, lon: 31.4056 },
    { code: "HRG", name: "Hurghada International Airport", city: "Hurghada", lat: 27.1783, lon: 33.7994 }
  ] },
  { c: "NG", n: "Nigeria", f: "🇳🇬", lat: 9.0820, lon: 8.6753, b: [4.0, 2.5, 14.0, 14.5], z: 5, hubs: [
    { code: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", lat: 6.5774, lon: 3.3210 },
    { code: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", lat: 9.0068, lon: 7.2631 }
  ] },
  { c: "KE", n: "Kenya", f: "🇰🇪", lat: -0.0236, lon: 37.9062, b: [-4.6, 33.9, 5.0, 41.9], z: 6, hubs: [
    { code: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", lat: -1.3192, lon: 36.9275 },
    { code: "MBA", name: "Moi International Airport", city: "Mombasa", lat: -4.0348, lon: 39.5900 }
  ] },
  { c: "TH", n: "Thailand", f: "🇹🇭", lat: 15.8700, lon: 100.9925, b: [5.6, 97.3, 20.4, 105.6], z: 5, hubs: [
    { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", lat: 13.6900, lon: 100.7501 },
    { code: "DMK", name: "Don Mueang International Airport", city: "Bangkok", lat: 13.9126, lon: 100.6068 },
    { code: "HKT", name: "Phuket International Airport", city: "Phuket", lat: 8.1132, lon: 98.3169 }
  ] },
  { c: "ID", n: "Indonesia", f: "🇮🇩", lat: -0.7893, lon: 113.9213, b: [-11.0, 95.0, 6.0, 141.0], z: 4, hubs: [
    { code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", lat: -6.1256, lon: 106.6560 },
    { code: "DPS", name: "Ngurah Rai International Airport", city: "Bali", lat: -8.7482, lon: 115.1670 }
  ] },
  { c: "MY", n: "Malaysia", f: "🇲🇾", lat: 4.1406, lon: 101.9758, b: [1.0, 99.0, 8.0, 120.0], z: 5, hubs: [
    { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", lat: 2.7456, lon: 101.7072 },
    { code: "BKI", name: "Kota Kinabalu International Airport", city: "Kota Kinabalu", lat: 5.9372, lon: 116.0510 }
  ] },
  { c: "PH", n: "Philippines", f: "🇵🇭", lat: 12.8797, lon: 121.7740, b: [4.5, 116.9, 21.1, 126.6], z: 5, hubs: [
    { code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", lat: 14.5086, lon: 121.0194 },
    { code: "CEB", name: "Mactan-Cebu International Airport", city: "Cebu", lat: 10.3075, lon: 123.9794 }
  ] },
  { c: "VN", n: "Vietnam", f: "🇻🇳", lat: 14.0583, lon: 108.2772, b: [8.5, 102.1, 23.4, 109.5], z: 5, hubs: [
    { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", lat: 10.8188, lon: 106.6519 },
    { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", lat: 21.2212, lon: 105.8072 }
  ] },
  { c: "KR", n: "South Korea", f: "🇰🇷", lat: 35.9078, lon: 127.7669, b: [33.0, 124.0, 39.0, 131.0], z: 6, hubs: [
    { code: "ICN", name: "Incheon International Airport", city: "Seoul/Incheon", lat: 37.4602, lon: 126.4407 },
    { code: "GMP", name: "Gimpo International Airport", city: "Seoul", lat: 37.5583, lon: 126.7906 }
  ] },
  { c: "TR", n: "Turkey", f: "🇹🇷", lat: 38.9637, lon: 35.2433, b: [35.8, 25.6, 42.1, 44.8], z: 5, hubs: [
    { code: "IST", name: "Istanbul Airport", city: "Istanbul", lat: 41.2753, lon: 28.7519 },
    { code: "SAW", name: "Sabiha Gökçen International Airport", city: "Istanbul", lat: 40.8986, lon: 29.3092 },
    { code: "ESB", name: "Esenboğa International Airport", city: "Ankara", lat: 40.1281, lon: 32.9950 }
  ] },
  { c: "IL", n: "Israel", f: "🇮🇱", lat: 31.0461, lon: 34.8516, b: [29.5, 34.2, 33.3, 35.9], z: 7, hubs: [
    { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", lat: 32.0073, lon: 34.8854 }
  ] },
  { c: "PK", n: "Pakistan", f: "🇵🇰", lat: 30.3753, lon: 69.3451, b: [23.6, 60.8, 37.1, 77.0], z: 5, hubs: [
    { code: "KHI", name: "Jinnah International Airport", city: "Karachi", lat: 24.9065, lon: 67.1608 },
    { code: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", lat: 31.5216, lon: 74.4036 },
    { code: "ISB", name: "Islamabad International Airport", city: "Islamabad", lat: 33.5492, lon: 72.8275 }
  ] },
  { c: "NL", n: "Netherlands", f: "🇳🇱", lat: 52.1326, lon: 5.2913, b: [50.7, 3.3, 53.6, 7.2], z: 7, hubs: [
    { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", lat: 52.3105, lon: 4.7683 }
  ] },
  { c: "CH", n: "Switzerland", f: "🇨🇭", lat: 46.8182, lon: 8.2275, b: [45.8, 5.9, 47.8, 10.5], z: 7, hubs: [
    { code: "ZRH", name: "Zurich Airport", city: "Zurich", lat: 47.4582, lon: 8.5555 },
    { code: "GVA", name: "Geneva Airport", city: "Geneva", lat: 46.2381, lon: 6.1089 }
  ] },
  { c: "SE", n: "Sweden", f: "🇸🇪", lat: 60.1282, lon: 18.6435, b: [55.3, 11.1, 69.1, 24.2], z: 4, hubs: [
    { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", lat: 59.6519, lon: 17.9186 }
  ] },
  { c: "NO", n: "Norway", f: "🇳🇴", lat: 60.4720, lon: 8.4689, b: [57.9, 4.6, 71.2, 31.1], z: 4, hubs: [
    { code: "OSL", name: "Oslo Airport Gardermoen", city: "Oslo", lat: 60.1975, lon: 11.1004 }
  ] },
  { c: "DK", n: "Denmark", f: "🇩🇰", lat: 56.2639, lon: 9.5018, b: [54.5, 8.0, 57.8, 12.7], z: 7, hubs: [
    { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", lat: 55.6179, lon: 12.6560 }
  ] },
  { c: "FI", n: "Finland", f: "🇫🇮", lat: 61.9241, lon: 25.7482, b: [59.7, 20.6, 70.1, 31.6], z: 5, hubs: [
    { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", lat: 60.3172, lon: 24.9633 }
  ] },
  { c: "PL", n: "Poland", f: "🇵🇱", lat: 51.9194, lon: 19.1451, b: [49.0, 14.1, 54.9, 24.2], z: 5, hubs: [
    { code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", lat: 52.1657, lon: 20.9671 }
  ] },
  { c: "AT", n: "Austria", f: "🇦🇹", lat: 47.5162, lon: 14.5501, b: [46.3, 9.5, 49.0, 17.2], z: 6, hubs: [
    { code: "VIE", name: "Vienna International Airport", city: "Vienna", lat: 48.1103, lon: 16.5697 }
  ] },
  { c: "PT", n: "Portugal", f: "🇵🇹", lat: 39.3999, lon: -8.2245, b: [36.9, -9.5, 42.2, -6.1], z: 6, hubs: [
    { code: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", lat: 38.7742, lon: -9.1342 },
    { code: "OPO", name: "Francisco Sá Carneiro Airport", city: "Porto", lat: 41.2421, lon: -8.6786 }
  ] },
  { c: "GR", n: "Greece", f: "🇬🇷", lat: 39.0742, lon: 21.8243, b: [34.8, 19.3, 41.8, 28.3], z: 5, hubs: [
    { code: "ATH", name: "Athens International Airport", city: "Athens", lat: 37.9364, lon: 23.9445 }
  ] },
  { c: "IE", n: "Ireland", f: "🇮🇪", lat: 53.4129, lon: -8.2439, b: [51.4, -10.5, 55.4, -5.9], z: 6, hubs: [
    { code: "DUB", name: "Dublin Airport", city: "Dublin", lat: 53.4213, lon: -6.2701 }
  ] },
  { c: "BE", n: "Belgium", f: "🇧🇪", lat: 50.5039, lon: 4.4699, b: [49.4, 2.5, 51.5, 6.4], z: 7, hubs: [
    { code: "BRU", name: "Brussels Airport", city: "Brussels", lat: 50.9010, lon: 4.4844 }
  ] },
  { c: "CZ", n: "Czechia", f: "🇨🇿", lat: 49.8175, lon: 15.4730, b: [48.5, 12.0, 51.1, 18.9], z: 6, hubs: [
    { code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", lat: 50.1008, lon: 14.2600 }
  ] },
  { c: "HU", n: "Hungary", f: "🇭🇺", lat: 47.1625, lon: 19.5033, b: [45.7, 16.1, 48.6, 22.9], z: 6, hubs: [
    { code: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", lat: 47.4298, lon: 19.2611 }
  ] },
  { c: "RO", n: "Romania", f: "🇷🇴", lat: 45.9432, lon: 24.9668, b: [43.6, 20.2, 48.3, 29.7], z: 5, hubs: [
    { code: "OTP", name: "Henri Coandă International Airport", city: "Bucharest", lat: 44.5711, lon: 26.0844 }
  ] },
  { c: "UA", n: "Ukraine", f: "🇺🇦", lat: 48.3794, lon: 31.1656, b: [44.3, 22.1, 52.4, 40.2], z: 5, hubs: [
    { code: "KBP", name: "Boryspil International Airport", city: "Kyiv", lat: 50.3450, lon: 30.8947 }
  ] },
  { c: "CO", n: "Colombia", f: "🇨🇴", lat: 4.5709, lon: -74.2973, b: [-4.2, -79.0, 12.5, -66.8], z: 5, hubs: [
    { code: "BOG", name: "El Dorado International Airport", city: "Bogota", lat: 4.7016, lon: -74.1469 }
  ] },
  { c: "CL", n: "Chile", f: "🇨🇱", lat: -35.6751, lon: -71.5430, b: [-56.0, -75.7, -17.5, -67.0], z: 4, hubs: [
    { code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", lat: -33.3930, lon: -70.7858 }
  ] },
  { c: "PE", n: "Peru", f: "🇵🇪", lat: -9.1900, lon: -75.0152, b: [-18.3, -81.3, -0.0, -68.6], z: 4, hubs: [
    { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", lat: -12.0219, lon: -77.1143 }
  ] },
  { c: "VE", n: "Venezuela", f: "🇻🇪", lat: 6.4238, lon: -66.5897, b: [0.6, -73.4, 12.2, -59.8], z: 5, hubs: [
    { code: "CCS", name: "Simón Bolívar International Airport", city: "Caracas", lat: 10.6012, lon: -66.9913 }
  ] },
  { c: "EC", n: "Ecuador", f: "🇪🇨", lat: -1.8312, lon: -78.1834, b: [-5.0, -81.0, 1.5, -75.0], z: 6, hubs: [
    { code: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", lat: -0.1292, lon: -78.3575 }
  ] },
  { c: "BO", n: "Bolivia", f: "🇧🇴", lat: -16.2902, lon: -63.5887, b: [-22.9, -69.6, -9.6, -57.4], z: 4, hubs: [
    { code: "VVI", name: "Viru Viru International Airport", city: "Santa Cruz", lat: -17.6447, lon: -63.1353 }
  ] },
  { c: "PY", n: "Paraguay", f: "🇵🇾", lat: -23.4425, lon: -58.4438, b: [-27.6, -62.6, -19.2, -54.2], z: 5, hubs: [
    { code: "ASU", name: "Silvio Pettirossi International Airport", city: "Asuncion", lat: -25.2397, lon: -57.5192 }
  ] },
  { c: "UY", n: "Uruguay", f: "🇺🇾", lat: -32.5228, lon: -55.7658, b: [-35.0, -58.5, -30.0, -53.1], z: 6, hubs: [
    { code: "MVD", name: "Carrasco International Airport", city: "Montevideo", lat: -34.8384, lon: -56.0305 }
  ] },
  { c: "MA", n: "Morocco", f: "🇲🇦", lat: 31.7917, lon: -7.0926, b: [21.0, -17.0, 36.0, -1.0], z: 5, hubs: [
    { code: "CMN", name: "Mohammed V International Airport", city: "Casablanca", lat: 33.3675, lon: -7.5899 }
  ] },
  { c: "DZ", n: "Algeria", f: "🇩🇿", lat: 28.0339, lon: 1.6596, b: [19.0, -8.6, 37.1, 12.0], z: 4, hubs: [
    { code: "ALG", name: "Houari Boumediene Airport", city: "Algiers", lat: 36.6910, lon: 3.2154 }
  ] },
  { c: "ET", n: "Ethiopia", f: "🇪🇹", lat: 9.1450, lon: 40.4897, b: [3.4, 33.0, 14.9, 48.0], z: 5, hubs: [
    { code: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", lat: 8.9779, lon: 38.7993 }
  ] },
  { c: "GH", n: "Ghana", f: "🇬🇭", lat: 7.9465, lon: -1.0232, b: [4.7, -3.3, 11.2, 1.2], z: 6, hubs: [
    { code: "ACC", name: "Kotoka International Airport", city: "Accra", lat: 5.6051, lon: -0.1668 }
  ] },
  { c: "TZ", n: "Tanzania", f: "🇹🇿", lat: -6.3690, lon: 34.8888, b: [-11.8, 29.3, -1.0, 40.5], z: 5, hubs: [
    { code: "DAR", name: "Julius Nyerere International Airport", city: "Dar es Salaam", lat: -6.8781, lon: 39.2026 }
  ] },
  { c: "LK", n: "Sri Lanka", f: "🇱🇰", lat: 7.8731, lon: 80.7718, b: [5.9, 79.6, 9.9, 81.9], z: 7, hubs: [
    { code: "CMB", name: "Bandaranaike International Airport", city: "Colombo", lat: 7.1807, lon: 79.8841 }
  ] },
  { c: "BD", n: "Bangladesh", f: "🇧🇩", lat: 23.6850, lon: 90.3563, b: [20.6, 88.0, 26.6, 92.7], z: 6, hubs: [
    { code: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", lat: 23.8433, lon: 90.3978 }
  ] },
  { c: "NP", n: "Nepal", f: "🇳🇵", lat: 28.3949, lon: 84.1240, b: [26.3, 80.0, 30.5, 88.2], z: 6, hubs: [
    { code: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", lat: 27.6966, lon: 85.3592 }
  ] },
  { c: "QA", n: "Qatar", f: "🇶🇦", lat: 25.3548, lon: 51.1839, b: [24.4, 50.7, 26.2, 51.6], z: 8, hubs: [
    { code: "DOH", name: "Hamad International Airport", city: "Doha", lat: 25.2731, lon: 51.6081 }
  ] },
  { c: "KW", n: "Kuwait", f: "🇰🇼", lat: 29.3117, lon: 47.4818, b: [28.5, 46.5, 30.1, 48.5], z: 8, hubs: [
    { code: "KWI", name: "Kuwait International Airport", city: "Kuwait City", lat: 29.2266, lon: 47.9689 }
  ] },
  { c: "BH", n: "Bahrain", f: "🇧🇭", lat: 25.9304, lon: 50.6377, b: [25.5, 50.3, 26.4, 50.9], z: 9, hubs: [
    { code: "BAH", name: "Bahrain International Airport", city: "Manama", lat: 26.2708, lon: 50.6336 }
  ] },
  { c: "OM", n: "Oman", f: "🇴🇲", lat: 21.4735, lon: 55.9754, b: [16.6, 52.0, 26.4, 59.9], z: 5, hubs: [
    { code: "MCT", name: "Muscat International Airport", city: "Muscat", lat: 23.5933, lon: 58.2814 }
  ] },
  { c: "JO", n: "Jordan", f: "🇯🇴", lat: 30.5852, lon: 36.2384, b: [29.2, 34.9, 33.4, 39.3], z: 6, hubs: [
    { code: "AMM", name: "Queen Alia International Airport", city: "Amman", lat: 31.7225, lon: 35.9933 }
  ] },
  { c: "LB", n: "Lebanon", f: "🇱🇧", lat: 33.8547, lon: 35.8623, b: [33.0, 35.1, 34.7, 36.6], z: 8, hubs: [
    { code: "BEY", name: "Beirut-Rafic Hariri International Airport", city: "Beirut", lat: 33.8872, lon: 35.4884 }
  ] },
  { c: "KZ", n: "Kazakhstan", f: "🇰🇿", lat: 48.0196, lon: 66.9237, b: [40.5, 46.5, 55.5, 87.4], z: 4, hubs: [
    { code: "ALA", name: "Almaty International Airport", city: "Almaty", lat: 43.3521, lon: 76.9822 }
  ] },
  { c: "UZ", n: "Uzbekistan", f: "🇺🇿", lat: 41.3775, lon: 64.5853, b: [37.1, 56.0, 45.6, 73.2], z: 5, hubs: [
    { code: "TAS", name: "Tashkent International Airport", city: "Tashkent", lat: 41.2578, lon: 69.2811 }
  ] },
  { c: "HR", n: "Croatia", f: "🇭🇷", lat: 45.1000, lon: 15.2000, b: [42.3, 13.4, 46.6, 19.5], z: 6, hubs: [
    { code: "ZAG", name: "Zagreb Airport", city: "Zagreb", lat: 45.7429, lon: 16.0688 }
  ] },
  { c: "BG", n: "Bulgaria", f: "🇧🇬", lat: 42.7339, lon: 25.4858, b: [41.2, 22.3, 44.3, 28.7], z: 6, hubs: [
    { code: "SOF", name: "Sofia Airport", city: "Sofia", lat: 42.6951, lon: 23.4061 }
  ] },
  { c: "SK", n: "Slovakia", f: "🇸🇰", lat: 48.6690, lon: 19.6990, b: [47.7, 16.8, 49.6, 22.6], z: 6, hubs: [
    { code: "BTS", name: "M. R. Štefánik Airport", city: "Bratislava", lat: 48.1702, lon: 17.2127 }
  ] },
  { c: "IS", n: "Iceland", f: "🇮🇸", lat: 64.9631, lon: -19.0208, b: [63.2, -24.6, 66.6, -13.4], z: 5, hubs: [
    { code: "KEF", name: "Keflavík International Airport", city: "Reykjavik", lat: 63.9850, lon: -22.6056 }
  ] },
  { c: "CY", n: "Cyprus", f: "🇨🇾", lat: 35.1264, lon: 33.4299, b: [34.5, 32.2, 35.7, 34.6], z: 8, hubs: [
    { code: "LCA", name: "Larnaca International Airport", city: "Larnaca", lat: 34.8751, lon: 33.6249 }
  ] },
  { c: "CR", n: "Costa Rica", f: "🇨🇷", lat: 9.7489, lon: -83.7534, b: [8.0, -86.0, 11.2, -82.5], z: 7, hubs: [
    { code: "SJO", name: "Juan Santamaría International Airport", city: "San Jose", lat: 9.9939, lon: -84.2088 }
  ] },
  { c: "PA", n: "Panama", f: "🇵🇦", lat: 8.5380, lon: -80.7821, b: [7.1, -83.1, 9.7, -77.1], z: 7, hubs: [
    { code: "PTY", name: "Tocumen International Airport", city: "Panama City", lat: 9.0714, lon: -79.3835 }
  ] },
  { c: "GT", n: "Guatemala", f: "🇬🇹", lat: 15.7835, lon: -90.2308, b: [13.7, -92.3, 17.9, -88.1], z: 6, hubs: [
    { code: "GUA", name: "La Aurora International Airport", city: "Guatemala City", lat: 14.5833, lon: -90.5275 }
  ] },
  { c: "DO", n: "Dominican Republic", f: "🇩🇴", lat: 18.7357, lon: -70.1627, b: [17.5, -72.1, 20.0, -68.3], z: 7, hubs: [
    { code: "SDQ", name: "Las Américas International Airport", city: "Santo Domingo", lat: 18.4297, lon: -69.6689 }
  ] },
  { c: "JM", n: "Jamaica", f: "🇯🇲", lat: 18.1096, lon: -77.2975, b: [17.6, -78.4, 18.6, -76.1], z: 8, hubs: [
    { code: "MBJ", name: "Sangster International Airport", city: "Montego Bay", lat: 18.5037, lon: -77.9134 }
  ] },
  { c: "CU", n: "Cuba", f: "🇨🇺", lat: 21.5218, lon: -77.7812, b: [19.7, -85.0, 23.3, -74.1], z: 5, hubs: [
    { code: "HAV", name: "José Martí International Airport", city: "Havana", lat: 22.9892, lon: -82.4092 }
  ] },
  { c: "BS", n: "Bahamas", f: "🇧🇸", lat: 25.0343, lon: -77.3963, b: [20.9, -80.6, 27.3, -72.6], z: 6, hubs: [
    { code: "NAS", name: "Lynden Pindling International Airport", city: "Nassau", lat: 25.0390, lon: -77.4662 }
  ] },
  { c: "TT", n: "Trinidad & Tobago", f: "🇹🇹", lat: 10.6918, lon: -61.2225, b: [10.0, -62.0, 11.4, -60.4], z: 8, hubs: [
    { code: "POS", name: "Piarco International Airport", city: "Port of Spain", lat: 10.5954, lon: -61.3372 }
  ] },
  { c: "AO", n: "Angola", f: "🇦🇴", lat: -11.2027, lon: 17.8739, b: [-18.1, 11.6, -4.3, 24.1], z: 4, hubs: [
    { code: "LAD", name: "Quatro de Fevereiro Airport", city: "Luanda", lat: -8.8583, lon: 13.2312 }
  ] },
  { c: "CM", n: "Cameroon", f: "🇨🇲", lat: 7.3697, lon: 12.3547, b: [1.6, 8.4, 13.1, 16.3], z: 5, hubs: [
    { code: "DLA", name: "Douala International Airport", city: "Douala", lat: 4.0060, lon: 9.7194 }
  ] },
  { c: "CI", n: "Côte d'Ivoire", f: "🇨🇮", lat: 7.5400, lon: -5.5471, b: [4.3, -8.7, 10.8, -2.4], z: 5, hubs: [
    { code: "ABJ", name: "Félix-Houphouët-Boigny International Airport", city: "Abidjan", lat: 5.2614, lon: -3.9263 }
  ] },
  { c: "SN", n: "Senegal", f: "🇸🇳", lat: 14.4974, lon: -14.4524, b: [12.1, -17.6, 16.7, -11.3], z: 5, hubs: [
    { code: "DSS", name: "Blaise Diagne International Airport", city: "Dakar", lat: 14.6711, lon: -17.0733 }
  ] },
  { c: "TN", n: "Tunisia", f: "🇹🇳", lat: 33.8869, lon: 9.5375, b: [30.1, 7.5, 37.6, 11.7], z: 6, hubs: [
    { code: "TUN", name: "Tunis-Carthage International Airport", city: "Tunis", lat: 36.8510, lon: 10.2272 }
  ] },
  { c: "UG", n: "Uganda", f: "🇺🇬", lat: 1.3733, lon: 32.2903, b: [-1.5, 29.5, 4.3, 35.1], z: 6, hubs: [
    { code: "EBB", name: "Entebbe International Airport", city: "Entebbe", lat: 0.0424, lon: 32.4435 }
  ] },
  { c: "ZM", n: "Zambia", f: "🇿🇲", lat: -13.1339, lon: 27.8493, b: [-18.1, 21.9, -8.2, 33.8], z: 5, hubs: [
    { code: "LUN", name: "Kenneth Kaunda International Airport", city: "Lusaka", lat: -15.3308, lon: 28.4526 }
  ] },
  { c: "ZW", n: "Zimbabwe", f: "🇿🇼", lat: -19.0154, lon: 29.1549, b: [-22.5, 25.2, -15.5, 33.1], z: 5, hubs: [
    { code: "HRE", name: "Robert Gabriel Mugabe International Airport", city: "Harare", lat: -17.9318, lon: 31.0928 }
  ] },
  { c: "NA", n: "Namibia", f: "🇳🇦", lat: -22.9576, lon: 18.4904, b: [-29.0, 11.7, -16.9, 25.3], z: 4, hubs: [
    { code: "WDH", name: "Hosea Kutako International Airport", city: "Windhoek", lat: -22.4799, lon: 17.4709 }
  ] },
  { c: "BW", n: "Botswana", f: "🇧🇼", lat: -22.3285, lon: 24.6849, b: [-26.9, 19.9, -17.7, 29.4], z: 5, hubs: [
    { code: "GBE", name: "Sir Seretse Khama International Airport", city: "Gaborone", lat: -24.5552, lon: 25.9183 }
  ] },
  { c: "MG", n: "Madagascar", f: "🇲🇬", lat: -18.7669, lon: 46.8691, b: [-25.7, 43.1, -11.9, 50.5], z: 4, hubs: [
    { code: "TNR", name: "Ivato International Airport", city: "Antananarivo", lat: -18.7969, lon: 47.4781 }
  ] },
  { c: "MU", n: "Mauritius", f: "🇲🇺", lat: -20.3484, lon: 57.5522, b: [-20.6, 57.2, -19.9, 57.9], z: 9, hubs: [
    { code: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Plaine Magnien", lat: -20.4300, lon: 57.6836 }
  ] },
  { c: "SC", n: "Seychelles", f: "🇸🇨", lat: -4.6796, lon: 55.4920, b: [-10.5, 46.1, -3.7, 56.4], z: 8, hubs: [
    { code: "SEZ", name: "Seychelles International Airport", city: "Victoria", lat: -4.6743, lon: 55.5217 }
  ] },
  { c: "RW", n: "Rwanda", f: "🇷🇼", lat: -1.9403, lon: 29.8739, b: [-2.9, 28.8, -1.0, 30.9], z: 8, hubs: [
    { code: "KGL", name: "Kigali International Airport", city: "Kigali", lat: -1.9630, lon: 30.1394 }
  ] },
  { c: "SD", n: "Sudan", f: "🇸🇩", lat: 12.8628, lon: 30.2176, b: [9.3, 21.8, 22.0, 38.6], z: 4, hubs: [
    { code: "KRT", name: "Khartoum International Airport", city: "Khartoum", lat: 15.5895, lon: 32.5531 }
  ] },
  { c: "LY", n: "Libya", f: "🇱🇾", lat: 26.3351, lon: 17.2283, b: [19.5, 9.3, 33.1, 25.2], z: 4, hubs: [
    { code: "MJI", name: "Mitiga International Airport", city: "Tripoli", lat: 32.8968, lon: 13.2760 }
  ] },
  { c: "MN", n: "Mongolia", f: "🇲🇳", lat: 46.8625, lon: 103.8467, b: [41.5, 87.7, 52.2, 119.9], z: 4, hubs: [
    { code: "UBN", name: "Chinggis Khaan International Airport", city: "Ulaanbaatar", lat: 47.6472, lon: 106.8189 }
  ] },
  { c: "MM", n: "Myanmar", f: "🇲🇲", lat: 21.9162, lon: 95.9560, b: [9.9, 92.1, 28.5, 101.2], z: 5, hubs: [
    { code: "RGN", name: "Yangon International Airport", city: "Yangon", lat: 16.9007, lon: 96.1332 }
  ] },
  { c: "KH", n: "Cambodia", f: "🇰🇭", lat: 12.5657, lon: 104.9910, b: [9.9, 102.3, 14.7, 107.7], z: 6, hubs: [
    { code: "PNH", name: "Phnom Penh International Airport", city: "Phnom Penh", lat: 11.5466, lon: 104.8442 }
  ] },
  { c: "LA", n: "Laos", f: "🇱🇦", lat: 19.8563, lon: 102.4955, b: [13.9, 100.0, 22.5, 107.7], z: 5, hubs: [
    { code: "VTE", name: "Wattay International Airport", city: "Vientiane", lat: 17.9883, lon: 102.5633 }
  ] },
  { c: "BN", n: "Brunei", f: "🇧🇳", lat: 4.5353, lon: 114.7277, b: [4.0, 114.0, 5.1, 115.4], z: 8, hubs: [
    { code: "BWN", name: "Brunei International Airport", city: "Bandar Seri Begawan", lat: 4.9442, lon: 114.9283 }
  ] },
  { c: "AZ", n: "Azerbaijan", f: "🇦🇿", lat: 40.1431, lon: 47.5769, b: [38.3, 44.7, 41.9, 50.9], z: 6, hubs: [
    { code: "GYD", name: "Heydar Aliyev International Airport", city: "Baku", lat: 40.4675, lon: 50.0467 }
  ] },
  { c: "GE", n: "Georgia", f: "🇬🇪", lat: 42.3154, lon: 43.3569, b: [41.1, 40.0, 43.6, 46.8], z: 6, hubs: [
    { code: "TBS", name: "Tbilisi International Airport", city: "Tbilisi", lat: 41.6692, lon: 44.9547 }
  ] },
  { c: "AM", n: "Armenia", f: "🇦🇲", lat: 40.0691, lon: 45.0382, b: [38.8, 43.4, 41.3, 46.7], z: 7, hubs: [
    { code: "EVN", name: "Zvartnots International Airport", city: "Yerevan", lat: 40.1473, lon: 44.3958 }
  ] },
  { c: "LU", n: "Luxembourg", f: "🇱🇺", lat: 49.8153, lon: 6.1296, b: [49.4, 5.7, 50.2, 6.6], z: 9, hubs: [
    { code: "LUX", name: "Luxembourg Findel Airport", city: "Luxembourg City", lat: 49.6233, lon: 6.2044 }
  ] },
  { c: "MT", n: "Malta", f: "🇲🇹", lat: 35.9375, lon: 14.3754, b: [35.8, 14.1, 36.1, 14.6], z: 9, hubs: [
    { code: "MLA", name: "Malta International Airport", city: "Luqa", lat: 35.8575, lon: 14.4775 }
  ] },
  { c: "EE", n: "Estonia", f: "🇪🇪", lat: 58.5953, lon: 25.0136, b: [57.5, 21.7, 59.9, 28.3], z: 6, hubs: [
    { code: "TLL", name: "Tallinn Airport", city: "Tallinn", lat: 59.4133, lon: 24.8328 }
  ] },
  { c: "LV", n: "Latvia", f: "🇱🇻", lat: 56.8796, lon: 24.6032, b: [55.6, 20.9, 58.1, 28.3], z: 6, hubs: [
    { code: "RIX", name: "Riga International Airport", city: "Riga", lat: 56.9236, lon: 23.9711 }
  ] },
  { c: "LT", n: "Lithuania", f: "🇱🇹", lat: 55.1694, lon: 23.8813, b: [53.8, 20.9, 56.5, 26.9], z: 6, hubs: [
    { code: "VNO", name: "Vilnius Airport", city: "Vilnius", lat: 54.6342, lon: 25.2858 }
  ] },
  { c: "SI", n: "Slovenia", f: "🇸🇮", lat: 46.1512, lon: 14.9955, b: [45.4, 13.3, 46.9, 16.7], z: 7, hubs: [
    { code: "LJU", name: "Ljubljana Jože Pučnik Airport", city: "Ljubljana", lat: 46.2237, lon: 14.4576 }
  ] },
  { c: "AL", n: "Albania", f: "🇦🇱", lat: 41.1533, lon: 20.1683, b: [39.6, 19.2, 42.7, 21.1], z: 7, hubs: [
    { code: "TIA", name: "Tirana International Airport Nënë Tereza", city: "Tirana", lat: 41.4147, lon: 19.7206 }
  ] },
  { c: "MK", n: "North Macedonia", f: "🇲🇰", lat: 41.6086, lon: 21.7453, b: [40.8, 20.4, 42.4, 23.1], z: 7, hubs: [
    { code: "SKP", name: "Skopje International Airport", city: "Skopje", lat: 41.9616, lon: 21.6261 }
  ] },
  { c: "RS", n: "Serbia", f: "🇷🇸", lat: 44.0165, lon: 21.0059, b: [42.2, 18.8, 46.2, 23.1], z: 6, hubs: [
    { code: "BEG", name: "Belgrade Nikola Tesla Airport", city: "Belgrade", lat: 44.8184, lon: 20.3091 }
  ] },
  { c: "BA", n: "Bosnia & Herzegovina", f: "🇧🇦", lat: 43.9159, lon: 17.6791, b: [42.5, 15.7, 45.3, 19.7], z: 7, hubs: [
    { code: "SJJ", name: "Sarajevo International Airport", city: "Sarajevo", lat: 43.8242, lon: 18.3314 }
  ] },
  { c: "ME", n: "Montenegro", f: "🇲🇪", lat: 42.7087, lon: 19.3744, b: [41.8, 18.4, 43.6, 20.4], z: 8, hubs: [
    { code: "TGD", name: "Podgorica Airport", city: "Podgorica", lat: 42.3594, lon: 19.2519 }
  ] },
  { c: "MD", n: "Moldova", f: "🇲🇩", lat: 47.4116, lon: 28.3699, b: [45.4, 26.6, 48.5, 30.2], z: 7, hubs: [
    { code: "KIV", name: "Chișinău International Airport", city: "Chisinau", lat: 46.9278, lon: 28.9310 }
  ] },
  { c: "BY", n: "Belarus", f: "🇧🇾", lat: 53.7098, lon: 27.9534, b: [51.2, 23.1, 56.2, 32.8], z: 5, hubs: [
    { code: "MSQ", name: "Minsk National Airport", city: "Minsk", lat: 53.8825, lon: 28.0325 }
  ] },
  { c: "KG", n: "Kyrgyzstan", f: "🇰🇬", lat: 41.2044, lon: 74.7661, b: [39.1, 69.2, 43.3, 80.3], z: 5, hubs: [
    { code: "FRU", name: "Manas International Airport", city: "Bishkek", lat: 43.0612, lon: 74.4776 }
  ] },
  { c: "TJ", n: "Tajikistan", f: "🇹🇯", lat: 38.8610, lon: 71.2761, b: [36.6, 67.3, 41.1, 75.2], z: 5, hubs: [
    { code: "DYU", name: "Dushanbe International Airport", city: "Dushanbe", lat: 38.5433, lon: 68.8249 }
  ] },
  { c: "TM", n: "Turkmenistan", f: "🇹🇲", lat: 38.9697, lon: 59.5563, b: [35.1, 52.4, 42.8, 66.7], z: 5, hubs: [
    { code: "ASB", name: "Ashgabat International Airport", city: "Ashgabat", lat: 37.9868, lon: 58.3610 }
  ] },
  { c: "FJ", n: "Fiji", f: "🇫🇯", lat: -17.7134, lon: 178.0650, b: [-21.1, 177.1, -12.4, -178.1], z: 6, hubs: [
    { code: "NAN", name: "Nadi International Airport", city: "Nadi", lat: -17.7554, lon: 177.4434 }
  ] },
  { c: "PG", n: "Papua New Guinea", f: "🇵🇬", lat: -6.3150, lon: 143.9555, b: [-12.1, 140.8, -0.8, 156.2], z: 5, hubs: [
    { code: "POM", name: "Jacksons International Airport", city: "Port Moresby", lat: -9.4431, lon: 147.2200 }
  ] },
  { c: "MV", n: "Maldives", f: "🇲🇻", lat: 3.2028, lon: 73.2207, b: [-0.7, 72.1, 7.2, 74.0], z: 7, hubs: [
    { code: "MLE", name: "Velana International Airport", city: "Male", lat: 4.1918, lon: 73.5291 }
  ] },
  { c: "TW", n: "Taiwan", f: "🇹🇼", lat: 23.6978, lon: 120.9605, b: [21.8, 119.3, 25.4, 122.1], z: 7, hubs: [
    { code: "TPE", name: "Taoyuan International Airport", city: "Taipei", lat: 25.0797, lon: 121.2342 },
    { code: "KHH", name: "Kaohsiung International Airport", city: "Kaohsiung", lat: 22.5711, lon: 120.3500 }
  ] }
];

export const WORLD_COUNTRIES: CountryData[] = RAW_COUNTRIES.map((rc) => {
  // If no hubs are present, let's dynamically generate 3 extremely realistic hubs based on bounds & center
  const airports = rc.hubs && rc.hubs.length > 0 ? rc.hubs : [
    {
      code: `${rc.c}1`,
      name: `${rc.n} Main Airport Hub Alpha`,
      city: `${rc.n} City Alpha`,
      lat: Number((rc.lat + (rc.b[2] - rc.lat) * 0.4).toFixed(4)),
      lon: Number((rc.lon + (rc.b[3] - rc.lon) * 0.4).toFixed(4))
    },
    {
      code: `${rc.c}2`,
      name: `${rc.n} Terminal Beta`,
      city: `${rc.n} City Beta`,
      lat: Number((rc.lat - (rc.lat - rc.b[0]) * 0.4).toFixed(4)),
      lon: Number((rc.lon - (rc.lon - rc.b[1]) * 0.4).toFixed(4))
    },
    {
      code: `${rc.c}3`,
      name: `${rc.n} Regional Gateway`,
      city: `${rc.n} City Gamma`,
      lat: Number((rc.lat + (rc.b[0] - rc.lat) * 0.2).toFixed(4)),
      lon: Number((rc.lon - (rc.lon - rc.b[3]) * 0.2).toFixed(4))
    }
  ];

  return {
    code: rc.c,
    name: rc.n,
    flag: rc.f,
    center: [rc.lat, rc.lon],
    zoom: rc.z,
    bounds: {
      lamin: rc.b[0],
      lomin: rc.b[1],
      lamax: rc.b[2],
      lomax: rc.b[3]
    },
    airports
  };
});
