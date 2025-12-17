import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  LightBulbIcon,
  HeartIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  HomeIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import { Stethoscope} from "lucide-react";
// Import your components
import SetAvailability from "../Components/doctor/SetAvailability";
import FreeSlotsView from "../Components/doctor/FreeSlotsView";
import DoctorAppointments from "../Components/doctor/DoctorAppointments";
import DrugSearch from "./DrugSearch";
import DecisionSupport from "./DecisionSupport";
import PatientVitals from "../Components/PatientVitals/PatientVitals";
import PatientVitalsGraph from "./PatientVitalsGraph";
import ChatWithAI from "./ChatWithAI";

// --- Configuration ---
// Defined color mappings to ensure Tailwind picks them up without safelisting
const COLOR_VARIANTS = {
  emerald: {
    bgActive: "bg-emerald-50",
    textActive: "text-emerald-700",
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    ring: "ring-emerald-200"
  },
  blue: {
    bgActive: "bg-blue-50",
    textActive: "text-blue-700",
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    ring: "ring-blue-200"
  },
  violet: {
    bgActive: "bg-violet-50",
    textActive: "text-violet-700",
    iconBg: "bg-violet-100",
    icon: "text-violet-600",
    ring: "ring-violet-200"
  }
};

const SIDEBAR_GROUPS = [
  {
    title: "Patient Care",
    id: "patients",
    colorKey: "emerald",
    items: [
      { title: "Add Patient Record", key: "add-patient", icon: HeartIcon, desc: "Register new patient vitals & history" },
      { title: "Visualize Vitals", key: "visualize", icon: ChartBarIcon, desc: "Track patient health trends over time" },
    ],
  },
  {
    title: "Schedule & Visits",
    id: "scheduling",
    colorKey: "blue",
    items: [
      { title: "Set Availability", key: "availability", icon: CalendarIcon, desc: "Manage your working hours" },
      { title: "Available Slots", key: "slots", icon: ClipboardDocumentListIcon, desc: "View your open time slots" },
      { title: "My Appointments", key: "appointments", icon: UserIcon, desc: "Manage upcoming patient visits" },
    ],
  },
  {
    title: "Clinical Tools",
    id: "tools",
    colorKey: "violet",
    items: [
      { title: "Drug Database", key: "drugs", icon: MagnifyingGlassIcon, desc: "Search interactions and dosages" },
      { title: "AI Decision Support", key: "prediction", icon: LightBulbIcon, desc: "Get AI-assisted diagnostic suggestions" },
      { title: "AI Assistant", key: "chat", icon: ChatBubbleLeftEllipsisIcon, desc: "Chat with your medical AI copilot" },
    ],
  },
];

const getDoctorInfo = () => {
  try {
    const docData = JSON.parse(localStorage.getItem("doctor_data"));
    const name = localStorage.getItem("user_name");
    return {
      name: name || "Doctor",
      specialty: docData?.specialty || "General Practice",
    };
  } catch {
    return { name: "Doctor", specialty: "General Practice" };
  }
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [activeGroupColor, setActiveGroupColor] = useState("blue");
  const doctorData = getDoctorInfo();

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doctor") navigate("/login");
  }, [navigate]);

  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = () => setActiveTab(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleTabChange = (key, colorKey) => {
    setActiveTab(key);
    setActiveGroupColor(colorKey);
    setSidebarOpen(false); 
    window.history.pushState({}, ""); 
  };

  const getActiveTitle = () => {
    for (const group of SIDEBAR_GROUPS) {
      const item = group.items.find(i => i.key === activeTab);
      if (item) return item.title;
    }
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform duration-200 ease-linear
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            DoctorHelp<span className="text-slate-400 font-normal">Doctors</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden ml-auto text-slate-400"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Doctor Profile */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserCircleIcon className="w-full h-full" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-slate-700 text-sm truncate">{doctorData.name}</h4>
              <p className="text-xs text-slate-500 truncate">{doctorData.specialty}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-6 py-2">
          {SIDEBAR_GROUPS.map((group) => {
            const styles = COLOR_VARIANTS[group.colorKey];
            
            return (
              <div key={group.id}>
                <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.key;
                    
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleTabChange(item.key, group.colorKey)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          ${isActive 
                            ? `${styles.bgActive} ${styles.textActive} shadow-sm ring-1 ${styles.ring}` 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                        `}
                      >
                        <item.icon 
                          className={`w-5 h-5 ${isActive ? styles.icon : "text-slate-400"}`} 
                        />
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-200 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500">
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button 
                onClick={() => setActiveTab(null)}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              {activeTab && (
                <>
                  <ChevronRightIcon className="w-3 h-3 text-slate-300" />
                  <span className={`font-semibold ${COLOR_VARIANTS[activeGroupColor].textActive}`}>
                    {getActiveTitle()}
                  </span>
                </>
              )}
            </div>
          </div>

        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            
            {/* 1. DASHBOARD HOME (Grid View) */}
            {!activeTab && (
              <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-blue-600 rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Good Day, {doctorData.name}</h1>
                    <p className="text-blue-100 max-w-xl">
                      Select a tool below to manage patient care, scheduling, or access clinical decision support.
                    </p>
                  </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SIDEBAR_GROUPS.flatMap(group => group.items.map(item => ({...item, colorKey: group.colorKey}))).map((item) => {
                    const styles = COLOR_VARIANTS[item.colorKey];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleTabChange(item.key, item.colorKey)}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 cursor-pointer group"
                      >
                        <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${styles.iconBg} ${styles.icon}`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {item.desc}
                        </p>

                        <div className="flex items-center text-xs font-semibold text-blue-600">
                          Open Tool <ChevronRightIcon className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ACTIVE TOOL VIEW */}
            {activeTab && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                 {/* Content Wrapper */}
                 <div className="p-1">
                  {activeTab === "availability" && <SetAvailability />}
                  {activeTab === "slots" && <FreeSlotsView />}
                  {activeTab === "appointments" && <DoctorAppointments />}
                  {activeTab === "drugs" && <DrugSearch />}
                  {activeTab === "prediction" && <DecisionSupport />}
                  {activeTab === "add-patient" && <PatientVitals />}
                  {activeTab === "visualize" && <PatientVitalsGraph />}
                  {activeTab === "chat" && <ChatWithAI />}
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default DoctorDashboard;