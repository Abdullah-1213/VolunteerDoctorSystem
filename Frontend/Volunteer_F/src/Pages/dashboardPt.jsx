import React, { useState, useEffect } from "react";
import {
  UserCircleIcon,
  MagnifyingGlassCircleIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronRightIcon,
  SparklesIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Import Sub-components
import MyPrescriptions from "../Components/patient/MyPrescriptions";
import DoctorSearch from "../Components/patient/DoctorSearch";
import BookAppointment from "../Components/patient/BookAppointment";
import MyAppointments from "../Components/patient/MyAppointments";

// --- Configuration ---
const MENU_ITEMS = [
  {
    title: "Find Doctor",
    desc: "Search specialists & book visits",
    icon: MagnifyingGlassCircleIcon,
    path: "search",
    color: "emerald"
  },
  {
    title: "My Appointments",
    desc: "Track upcoming & past visits",
    icon: ClipboardDocumentListIcon,
    path: "appointments",
    color: "blue"
  },
  {
    title: "My Prescriptions",
    desc: "Digital records of your meds",
    icon: DocumentTextIcon,
    path: "prescriptions",
    color: "violet"
  },
];

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current active route for sidebar highlighting
  const currentPath = location.pathname.split("/").pop(); 
  const isHome = location.pathname.endsWith("/dashboard-pt") || location.pathname.endsWith("/dashboard-pt/");

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "patient") {
      navigate("/login/patient");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login/patient");
  };

  const getUserName = () => {
    return localStorage.getItem("user_name") || "Patient";
  };

  // Helper to get title based on route
  const getPageTitle = () => {
    const item = MENU_ITEMS.find(i => i.path === currentPath);
    return item ? item.title : "Dashboard";
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
            DoctorHelp<span className="text-slate-400 font-normal">Patient</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden ml-auto text-slate-400 hover:text-slate-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Snippet */}
        <div className="p-6 pb-2">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                    <UserCircleIcon className="w-full h-full" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Welcome</p>
                    <h3 className="text-sm font-bold text-gray-800 truncate">{getUserName()}</h3>
                </div>
            </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <Link
            to="/dashboard-pt"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isHome 
                ? "bg-slate-100 text-slate-900" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
            `}
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard Home
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</p>
          </div>

          {MENU_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={`/dashboard-pt/${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                />
                {item.title}
                {isActive && <ChevronRightIcon className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500">
              <span className="hidden sm:inline">Portal</span>
              <ChevronRightIcon className="w-3 h-3 mx-2 text-slate-300" />
              <span className="font-semibold text-emerald-600">
                {isHome ? "Overview" : getPageTitle()}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
             User ID: {localStorage.getItem("user_id") || "#--"}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto h-full">

            <Routes>
              {/* 1. Dashboard Home (Cards View) */}
              <Route
                path=""
                element={
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
                      <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Hello, {getUserName()}!</h1>
                        <p className="text-emerald-50 max-w-xl">
                          Manage your health journey here. Find specialists, track appointments, and view your medical history all in one place.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Quick Action Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MENU_ITEMS.map((item) => (
                            <Link
                            key={item.path}
                            to={`/dashboard-pt/${item.path}`}
                            className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 relative overflow-hidden"
                            >
                            <div className={`
                                w-12 h-12 rounded-lg mb-4 flex items-center justify-center transition-colors
                                bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100
                            `}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {item.desc}
                            </p>

                            <div className="flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Open <ChevronRightIcon className="w-3 h-3 ml-1" />
                            </div>
                            </Link>
                        ))}
                        </div>
                    </div>
                  </div>
                }
              />

              {/* 2. Find Doctor Route */}
              <Route
                path="search"
                element={
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 min-h-[500px]">
                    <div className="p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Find a Specialist</h2>
                        <DoctorSearch onSelect={setSelectedDoctor} />
                        
                        {/* Render Booking Form below if doctor selected */}
                        {selectedDoctor && (
                            <div className="mt-8 border-t border-slate-100 pt-8 animate-in slide-in-from-bottom-4 duration-500">
                                <BookAppointment doctorId={selectedDoctor} />
                            </div>
                        )}
                    </div>
                  </div>
                }
              />

              {/* 3. My Appointments Route */}
              <Route
                path="appointments"
                element={
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
                     <div className="p-10">
                        <MyAppointments />
                     </div>
                  </div>
                }
              />

              {/* 4. Prescriptions Route */}
              <Route
                path="prescriptions"
                element={
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
                     <div className="p-10">
                        <MyPrescriptions />
                     </div>
                  </div>
                }
              />
            </Routes>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;