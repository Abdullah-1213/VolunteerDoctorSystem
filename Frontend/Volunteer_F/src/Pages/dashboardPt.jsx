// File: src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  UserCircleIcon,
  MagnifyingGlassCircleIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import MyPrescriptions from "../Components/patient/MyPrescriptions";

import DoctorSearch from "../Components/patient/DoctorSearch";
import BookAppointment from "../Components/patient/BookAppointment";
import MyAppointments from "../Components/patient/MyAppointments";

const sidebarItems = [
  {
    title: "Find Doctor",
    desc: "Search & Book Appointments",
    icon: MagnifyingGlassCircleIcon,
    path: "search",
  },
  {
    title: "My Appointments",
    desc: "View your booked appointments",
    icon: ClipboardDocumentListIcon,
    path: "appointments",
  },
  {
    title: "My Prescriptions",
    desc: "View prescriptions given by doctors",
    icon: ClipboardDocumentListIcon, // ya koi aur icon jo pasand ho
    path: "prescriptions",
  },
];

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  // Auth check
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`z-50 lg:w-64 w-64 bg-white shadow-lg p-5 h-screen fixed top-0 left-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-5 right-5 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>

        {/* Patient profile */}
        <div className="text-center mt-10">
          <UserCircleIcon className="h-20 w-20 mx-auto text-green-500" />
          <h2 className="text-lg font-semibold mt-2 text-gray-800">
            {localStorage.getItem("user_name") || "Patient"}
          </h2>
          <p className="text-sm text-gray-500">
            {localStorage.getItem("user_email") || "patient@email.com"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={`/dashboard-pt/${item.path}`}
              className="flex items-center space-x-2 p-3 rounded-lg w-full transition-all shadow-sm bg-white hover:bg-green-100 text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-6 w-6 text-green-500" />
              <span>{item.title}</span>
            </Link>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 px-6 py-10 bg-gradient-to-r from-green-50 to-gray-100">
        {/* Mobile menu button */}
        <button className="lg:hidden mb-4" onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>

        {/* Nested Routes */}
        <Routes>
          {/* Default view -> feature cards */}
          <Route
            path=""
            element={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/dashboard-pt/${item.path}`}
                    className="cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-md bg-white hover:shadow-xl hover:scale-105"
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <item.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </Link>
                ))}
              </div>
            }
            
          />

          {/* Find Doctor & Book Appointment */}
          <Route
            path="search"
            element={
              <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[400px]">
                <DoctorSearch onSelect={setSelectedDoctor} />
                {selectedDoctor && (
                  <BookAppointment doctorId={selectedDoctor} />
                )}
              </div>
            }
          />

          {/* My Appointments */}
          <Route
            path="appointments"
            element={
              <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[400px]">
                <MyAppointments />
              </div>
            }
          />
          
              {/* Prescriptions */}
            <Route
              path="prescriptions"
              element={
                <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[400px]">
                  <MyPrescriptions />
                </div>
              }
            />
        </Routes>
      </div>
    </div>
  );
};

export default PatientDashboard;
