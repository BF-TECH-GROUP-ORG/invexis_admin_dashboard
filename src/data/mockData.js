// Mock Sales Data by Tier (Daily, Weekly, Monthly, Yearly)
export const salesDataDaily = [
  { label: "12:00 AM", Basic: 15, Pro: 22, Mid: 18 },
  { label: "04:00 AM", Basic: 18, Pro: 28, Mid: 22 },
  { label: "08:00 AM", Basic: 22, Pro: 35, Mid: 28 },
  { label: "12:00 PM", Basic: 28, Pro: 42, Mid: 35 },
  { label: "04:00 PM", Basic: 25, Pro: 38, Mid: 30 },
  { label: "08:00 PM", Basic: 32, Pro: 45, Mid: 38 },
  { label: "11:59 PM", Basic: 20, Pro: 30, Mid: 25 },
];

export const salesDataWeekly = [
  { label: "Monday", Basic: 120, Pro: 180, Mid: 150 },
  { label: "Tuesday", Basic: 135, Pro: 195, Mid: 165 },
  { label: "Wednesday", Basic: 128, Pro: 185, Mid: 158 },
  { label: "Thursday", Basic: 152, Pro: 215, Mid: 185 },
  { label: "Friday", Basic: 165, Pro: 235, Mid: 200 },
  { label: "Saturday", Basic: 190, Pro: 270, Mid: 230 },
  { label: "Sunday", Basic: 145, Pro: 205, Mid: 175 },
];

export const salesDataMonthly = [
  { label: "Jan", Basic: 850, Pro: 1250, Mid: 1050 },
  { label: "Feb", Basic: 920, Pro: 1380, Mid: 1150 },
  { label: "Mar", Basic: 1050, Pro: 1520, Mid: 1280 },
  { label: "Apr", Basic: 1180, Pro: 1680, Mid: 1420 },
  { label: "May", Basic: 1250, Pro: 1820, Mid: 1550 },
  { label: "Jun", Basic: 1420, Pro: 2050, Mid: 1750 },
  { label: "Jul", Basic: 1380, Pro: 1950, Mid: 1680 },
  { label: "Aug", Basic: 1520, Pro: 2180, Mid: 1850 },
  { label: "Sep", Basic: 1650, Pro: 2320, Mid: 1950 },
  { label: "Oct", Basic: 1780, Pro: 2450, Mid: 2100 },
  { label: "Nov", Basic: 1920, Pro: 2680, Mid: 2280 },
  { label: "Dec", Basic: 2150, Pro: 2950, Mid: 2520 },
];

export const salesDataYearly = [
  { label: "2019", Basic: 8500, Pro: 12500, Mid: 10500 },
  { label: "2020", Basic: 10200, Pro: 15300, Mid: 12800 },
  { label: "2021", Basic: 12800, Pro: 18500, Mid: 15500 },
  { label: "2022", Basic: 15200, Pro: 21800, Mid: 18500 },
  { label: "2023", Basic: 18500, Pro: 26200, Mid: 22100 },
  { label: "2024", Basic: 22000, Pro: 31500, Mid: 26800 },
];

// Top 20 Best-Selling Companies
export const topSellingCompanies = [
  { name: "Tech Innovations Ltd", sales: 12500 },
  { name: "Digital Solutions Inc", sales: 11800 },
  { name: "Cloud Systems Corp", sales: 11200 },
  { name: "DataFlow Analytics", sales: 10900 },
  { name: "Nexus Technologies", sales: 10500 },
  { name: "Prime Digital Group", sales: 10200 },
  { name: "Quantum Leap Systems", sales: 9800 },
  { name: "Global Tech Partners", sales: 9500 },
  { name: "Future Forward Inc", sales: 9200 },
  { name: "Innovation Hub Ltd", sales: 8900 },
  { name: "Smart Solutions Co", sales: 8500 },
  { name: "Digital Ventures LLC", sales: 8200 },
  { name: "NextGen Technologies", sales: 7900 },
  { name: "Enterprise Solutions", sales: 7600 },
  { name: "CloudBase Systems", sales: 7300 },
  { name: "Synergy Digital", sales: 7000 },
  { name: "Summit Tech Group", sales: 6700 },
  { name: "Vertex Solutions", sales: 6400 },
  { name: "Horizon Digital", sales: 6100 },
  { name: "Catalyst Innovations", sales: 5800 },
];

// Trending Data (Limited to 5 for dashboard)
export const trendingData = [
  {
    id: 1,
    label: "E-Commerce",
    companies: "TechHub Ltd",
    tiers: "Pro",
    category: "Technology",
    growth: "+45%",
  },
  {
    id: 2,
    label: "Fintech Solutions",
    companies: "Digital Systems",
    tiers: "Pro",
    category: "Finance",
    growth: "+38%",
  },
  {
    id: 3,
    label: "SaaS Platform",
    companies: "Cloud Corp",
    tiers: "Pro",
    category: "Software",
    growth: "+52%",
  },
  {
    id: 4,
    label: "B2B Services",
    companies: "Enterprise Solutions",
    tiers: "Mid",
    category: "Business",
    growth: "+28%",
  },
  {
    id: 5,
    label: "Analytics Tools",
    companies: "DataFlow Inc",
    tiers: "Mid",
    category: "Analytics",
    growth: "+35%",
  },
];

// Company Status Data
export const companyStatusData = [
  { name: "Active", value: 156 },
  { name: "Inactive", value: 42 },
];

// Tier Distribution Data
export const tierData = [
  { name: "Basic", value: 85 },
  { name: "Pro", value: 71 },
  { name: "Mid", value: 42 },
];

// Stats for metric cards
export const statsData = [
  {
    title: "Total Companies",
    value: "198",
    icon: "Building2",
    bgColor: "#fff8f5",
    color: "#ff782d",
  },
  {
    title: "Total Shops",
    value: "584",
    icon: "Store",
    bgColor: "#faf5ff",
    color: "#a855f7",
  },
  {
    title: "Total Users",
    value: "9,432",
    icon: "Users",
    bgColor: "#eff6ff",
    color: "#3b82f6",
  },
  {
    title: "Total Revenue",
    value: "$284,920",
    icon: "DollarSign",
    bgColor: "#fff8f5",
    color: "#ff782d",
  },
];

// Recent Companies
export const recentCompanies = [
  { name: "Ino Tech House", location: "Kigali / Gasabo / Kimironko" },
  { name: "Digital Innovations Ltd", location: "Kigali / Nyarugenge / Gisozi" },
  { name: "Cloud Services Corp", location: "Kigali / Kicukiro / Gatenga" },
  { name: "Prime Solutions Inc", location: "Kigali / Gasabo / Rusororo" },
  { name: "NextGen Technologies", location: "Kigali / Nyarugenge / Gitega" },
];
