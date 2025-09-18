import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import SetAvailability from "../Components/doctor/SetAvailability";
import FreeSlotsView from "../Components/doctor/FreeSlotsView";
import DoctorAppointments from "../Components/doctor/DoctorAppointments";

const sidebarItems = [
  {
    title: "Set Availability",
    icon: CalendarIcon,
    key: "availability",
  },
  {
    title: "Available Slots",
    icon: ClipboardDocumentListIcon,
    key: "slots",
  },
  {
    title: "Appointments",
    icon: UserCircleIcon,
    key: "appointments",
  },
];

// Helper function to safely get doctor info from localStorage
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
  const [activeTab, setActiveTab] = useState("availability");

  const doctorData = getDoctorInfo();

  useEffect(() => {
    // Basic check to redirect if no doctor data found
    if (!localStorage.getItem("access_token") || !localStorage.getItem("user_name")) {
      navigate("/login");
    }
  }, [navigate]);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "doctor") {
      navigate("/login");
    }
  }, [navigate]);

const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("role");
  localStorage.removeItem("doctor_data");
  navigate("/login");
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 flex flex-col transition-transform duration-300 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} lg:translate-x-0`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden self-end mb-8"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="text-center mb-10">
          <UserCircleIcon className="mx-auto h-24 w-24 text-blue-400" />
          <h2 className="mt-3 text-2xl font-bold text-gray-900">{doctorData.name}</h2>
          <p className="text-gray-500">{doctorData.specialty}</p>
        </div>

        <nav className="flex flex-col space-y-3 flex-grow">
          {sidebarItems.map(({ title, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition
                ${activeTab === key ? "bg-blue-200 text-blue-800 font-semibold" : ""}`}
            >
              <Icon className="h-6 w-6" />
              <span>{title}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          <XMarkIcon className="h-6 w-6" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 p-8 bg-gradient-to-r from-blue-50 to-gray-100">
        {/* Mobile menu button */}
        <button
          className="lg:hidden mb-6 self-start"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-7 w-7 text-gray-700 hover:text-gray-900" />
        </button>

        <h1 className="text-4xl font-extrabold mb-8 text-blue-800">
          {sidebarItems.find((i) => i.key === activeTab)?.title || "Dashboard"}
        </h1>

        <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[400px] overflow-auto">
          {activeTab === "availability" && <SetAvailability />}
          {activeTab === "slots" && <FreeSlotsView />}
          {activeTab === "appointments" && <DoctorAppointments />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
