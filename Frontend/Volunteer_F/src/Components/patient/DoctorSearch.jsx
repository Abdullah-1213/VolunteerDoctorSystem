// File: src/components/patient/DoctorSearch.jsx

import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import {
  User,
  Heart,
  Brain,
  Baby,
  Shield,
  Bone,
  Smile,
  Radio,
  Cross,
  Mic,
  User2,
  Activity,
  Search,
  MapPin,
  Star,
  Filter,
  Stethoscope,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";

// --- Configuration ---
const SPECIALIZATIONS = [
  { name: "General Physician", icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
  { name: "Cardiologist", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
  { name: "Dermatologist", icon: Shield, color: "text-orange-600", bg: "bg-orange-100" },
  { name: "Dentist", icon: Smile, color: "text-teal-600", bg: "bg-teal-100" },
  { name: "Neurologist", icon: Brain, color: "text-violet-600", bg: "bg-violet-100" },
  { name: "Orthopedic", icon: Bone, color: "text-slate-600", bg: "bg-slate-100" },
  { name: "Pediatrician", icon: Baby, color: "text-sky-600", bg: "bg-sky-100" },
  { name: "Psychiatrist", icon: User2, color: "text-indigo-600", bg: "bg-indigo-100" },
  { name: "Gynecologist", icon: Heart, color: "text-pink-600", bg: "bg-pink-100" },
  { name: "ENT", icon: Mic, color: "text-amber-600", bg: "bg-amber-100" },
  { name: "Radiologist", icon: Radio, color: "text-gray-600", bg: "bg-gray-100" },
  { name: "Oncologist", icon: Cross, color: "text-emerald-600", bg: "bg-emerald-100" },
];

// --- Helpers ---
const getInitials = (name) => {
  if (!name) return "DR";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

// --- Sub-Components ---

const DoctorSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse flex flex-col gap-4 h-[280px]">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="h-12 bg-slate-100 rounded-lg" />
      <div className="h-12 bg-slate-100 rounded-lg" />
    </div>
    <div className="h-12 bg-slate-100 rounded-lg mt-auto" />
  </div>
);

const DoctorCard = ({ doc, onClick }) => {
  return (
    <div
      onClick={() => onClick(doc.id)}
      className="
        group relative flex flex-col justify-between h-full 
        bg-white rounded-2xl border border-slate-200 p-5 
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:border-emerald-300 active:scale-[0.98]
        cursor-pointer
      "
    >
      <div className="flex gap-4 mb-4">

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-bold text-lg text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
            {doc.full_name || "Dr. Unknown"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-full">
              {doc.specialization || "General"}
            </span>
          </div>
      
        </div>
      </div>
      <div className="mt-auto">
        <button className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-slate-900 text-white group-hover:bg-emerald-600 transition-all duration-300 shadow-md group-hover:shadow-emerald-200">
          Book Appointment
          <ChevronRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const DoctorSearch = ({ onSelect }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSpec, setActiveSpec] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (spec = null) => {
    setLoading(true);
    try {
      const url = spec && spec !== "All"
        ? `doctors/?specialization=${encodeURIComponent(spec)}`
        : `doctors/`;
      const res = await api.get(url);
      setDoctors(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecSelect = (specName) => {
    setActiveSpec(specName);
    fetchDoctors(specName);
  };

  const displayedDoctors = useMemo(() => {
    return doctors.filter(doc => 
      doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full relative">
      
      {/* === MOBILE HEADER (Sticky) === 
        Contains Search + Horizontal Scroll Chips
      */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-2 pb-3 -mx-4 px-4 border-b border-slate-100 shadow-sm">
        {/* Mobile Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 text-emerald-500" size={18} />
          <input 
            type="text" 
            placeholder="Search doctors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" ref={scrollRef}>
          <button
            onClick={() => handleSpecSelect("All")}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
              ${activeSpec === "All" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}
            `}
          >
            All
          </button>
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec.name}
              onClick={() => handleSpecSelect(spec.name)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                ${activeSpec === spec.name 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200" 
                  : "bg-white text-slate-600 border-slate-200"}
              `}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {/* === DESKTOP SIDEBAR (Hidden on Mobile) === 
      */}
      <div className="hidden md:block w-64 flex-shrink-0 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Filter size={12} /> Specializations
          </div>
          <div className="space-y-1 mt-1 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            <button
              onClick={() => handleSpecSelect("All")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSpec === "All" ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className={`p-1.5 rounded-md ${activeSpec === "All" ? "bg-white/20" : "bg-slate-100"}`}>
                <Stethoscope size={14} />
              </div>
              View All
            </button>
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec.name}
                onClick={() => handleSpecSelect(spec.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSpec === spec.name ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className={`p-1.5 rounded-md ${spec.bg} ${spec.color}`}>
                  <spec.icon size={14} />
                </div>
                <span className="truncate">{spec.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT (Results) === 
      */}
      <div className="flex-1 min-w-0">
        <div className="hidden md:flex mb-6 items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{activeSpec === "All" ? "Top Specialists" : `${activeSpec}s`}</h2>
                <p className="text-sm text-slate-500">{loading ? "Searching..." : `Found ${displayedDoctors.length} doctors`}</p>
            </div>
            <div className="flex gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
               <SlidersHorizontal size={14} />
               Sort
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 content-start pb-20 md:pb-0">
            <AnimatePresence>
                {loading ? (
                    [...Array(6)].map((_, i) => <DoctorSkeleton key={i} />)
                ) : displayedDoctors.length > 0 ? (
                    displayedDoctors.map((doc) => (
                        <div key={doc.id} className="h-full">
                           <DoctorCard doc={doc} onClick={(id) => {
                                if (onSelect) onSelect(id);
                                navigate(`/book-appointment/${id}`);
                           }} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600">No doctors found</h3>
                        <p className="text-slate-400 max-w-xs mt-1">Try adjusting your filters.</p>
                        <button onClick={() => {setActiveSpec("All"); setSearchTerm(""); fetchDoctors(null);}} className="mt-4 text-emerald-600 font-medium hover:underline">
                            Reset Filters
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;