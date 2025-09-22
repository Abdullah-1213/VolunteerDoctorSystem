import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import SetAvailability from "../Components/doctor/SetAvailability";
import FreeSlotsView from "../Components/doctor/FreeSlotsView";
import DoctorAppointments from "../Components/doctor/DoctorAppointments";

const sidebarItems = [
  {
    title: "Set Availability",
    desc: "Manage your working hours",
    icon: CalendarIcon,
    key: "availability",
  },
  {
    title: "Available Slots",
    desc: "View your free slots",
    icon: ClipboardDocumentListIcon,
    key: "slots",
  },
  {
    title: "Appointments",
    desc: "Check booked appointments",
    icon: UserIcon,
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
  const [activeTab, setActiveTab] = useState(null); // default dashboard cards
  const doctorData = getDoctorInfo();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doctor") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(null); // back press → default dashboard
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`z-50 lg:w-64 w-64 bg-white shadow-lg p-5 h-screen fixed top-0 left-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } lg:translate-x-0`}
      >
        {/* Close Button for Mobile */}
        <button
          className="absolute top-5 right-5 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>

        {/* Doctor Profile */}
        <div className="text-center mt-10">
          <UserCircleIcon className="h-20 w-20 mx-auto text-blue-500" />
          <h2 className="text-lg font-semibold mt-2 text-gray-800">
            {doctorData.name}
          </h2>
          <p className="text-sm text-gray-500">{doctorData.specialty}</p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-4">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                window.history.pushState({}, ""); // browser back support
              }}
              className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-all shadow-sm ${
                activeTab === item.key
                  ? "bg-blue-200 text-blue-800 font-semibold"
                  : "bg-white hover:bg-blue-100 text-gray-700"
              }`}
            >
              <item.icon className="h-6 w-6 text-blue-500" />
              <span>{item.title}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-3 bg-red-100 text-red-500 rounded-lg w-full transition-all hover:bg-red-500 hover:text-white"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 px-6 py-10 bg-gradient-to-r from-blue-50 to-gray-100">
        {/* Mobile Menu Button */}
        <button className="lg:hidden mb-4" onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>

        {/* If no tab selected -> show feature cards */}
        {!activeTab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {sidebarItems.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  window.history.pushState({}, "");
                }}
                className="cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-md bg-white hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* If tab selected -> show component */}
        {activeTab && (
          <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[400px] mt-6">
            {activeTab === "availability" && <SetAvailability />}
            {activeTab === "slots" && <FreeSlotsView />}
            {activeTab === "appointments" && <DoctorAppointments />}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
