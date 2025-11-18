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
} from "@heroicons/react/24/outline";

import SetAvailability from "../Components/doctor/SetAvailability";
import FreeSlotsView from "../Components/doctor/FreeSlotsView";
import DoctorAppointments from "../Components/doctor/DoctorAppointments";
import DrugSearch from "./DrugSearch";
import DecisionSupport from "./DecisionSupport";
import PatientVitals from "../Components/PatientVitals/PatientVitals";
import PatientVitalsGraph from "./PatientVitalsGraph";
import ChatWithAI from "./ChatWithAI";

// Sidebar groups for better UX
const sidebarGroups = [
  {
    title: "Patient Management",
    color: "green",
    items: [
      { title: "Add Patient Record", key: "add-patient", icon: HeartIcon },
      { title: "Visualize Vitals", key: "visualize", icon: ChartBarIcon },
    ],
  },
  {
    title: "Scheduling",
    color: "blue",
    items: [
      { title: "Set Availability", key: "availability", icon: CalendarIcon },
      { title: "Available Slots", key: "slots", icon: ClipboardDocumentListIcon },
      { title: "Appointments", key: "appointments", icon: UserIcon },
    ],
  },
  {
    title: "Tools & Support",
    color: "yellow",
    items: [
      { title: "Drug Search", key: "drugs", icon: MagnifyingGlassIcon },
      { title: "Decision Support", key: "prediction", icon: LightBulbIcon },
      { title: "Chat with AI", key: "chat", icon: ChatBubbleLeftEllipsisIcon },
    ],
  },
];

// Get doctor info from localStorage
const getDoctorInfo = () => {
  try {
    const docData = JSON.parse(localStorage.getItem("doctor_data"));
    const name = localStorage.getItem("user_name");
    return {
      name: name || "Doctor",
      specialty: docData?.specialty || "Specialty",
    };
  } catch {
    return { name: "Doctor", specialty: "Specialty" };
  }
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null); // track sidebar group
  const doctorData = getDoctorInfo();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doctor") navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handle popstate to reset active tab
  useEffect(() => {
    const handlePopState = () => setActiveTab(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sidebar */}
      <aside
        className={`z-50 lg:w-64 w-64 bg-white/90 backdrop-blur-md shadow-xl p-5 h-screen fixed top-0 left-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } lg:translate-x-0 border-r border-blue-100`}
      >
        {/* Close Button (Mobile) */}
        <button className="absolute top-5 right-5 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Profile */}
        <div className="text-center mt-8">
          <UserCircleIcon className="h-16 w-16 mx-auto text-blue-500 drop-shadow-sm" />
          <h2 className="text-base font-semibold mt-2 text-gray-800">{doctorData.name}</h2>
          <p className="text-sm text-gray-500">{doctorData.specialty}</p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-8 space-y-4 overflow-y-auto max-h-[75vh] pr-2 scrollbar-thin scrollbar-thumb-blue-200">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group.title}</p>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setActiveGroup(group.color);
                    window.history.pushState({}, "");
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-md w-full text-sm transition-all duration-200 ${
                    activeTab === item.key
                      ? `bg-${group.color}-100 text-${group.color}-800 font-semibold border-l-4 border-${group.color}-500`
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <item.icon className={`h-5 w-5 text-${group.color}-500 flex-shrink-0`} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2.5 mt-3 bg-red-100 text-red-500 rounded-md w-full text-sm transition-all hover:bg-red-500 hover:text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 px-6 py-6 transition-all">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <span className="text-sm text-gray-500 hidden sm:block">
            Welcome back, {doctorData.name} 👋
          </span>
        </div>

        {/* Dashboard Cards for Home */}
        {!activeTab && (
          <div className="space-y-6">
            {sidebarGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-gray-600 font-semibold mb-2">{group.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setActiveGroup(group.color);
                        window.history.pushState({}, "");
                      }}
                      className={`cursor-pointer rounded-xl p-3 sm:p-5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-200 border border-gray-100`}
                    >
                      <div
                        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-${group.color}-100 mb-2 sm:mb-3`}
                      >
                        <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 text-${group.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm text-center leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Tab Content */}
        {activeTab && (
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 min-h-[400px] mt-6 animate-fadeIn border-t-4 border-${activeGroup}-500`}
          >
            {activeTab === "availability" && <SetAvailability />}
            {activeTab === "slots" && <FreeSlotsView />}
            {activeTab === "appointments" && <DoctorAppointments />}
            {activeTab === "drugs" && <DrugSearch />}
            {activeTab === "prediction" && <DecisionSupport />}
            {activeTab === "add-patient" && <PatientVitals />}
            {activeTab === "visualize" && <PatientVitalsGraph />}
            {activeTab === "chat" && <ChatWithAI />}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
