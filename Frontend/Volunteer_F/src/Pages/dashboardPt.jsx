// File: src/pages/PatientDashboard.jsx
import React, { useState } from 'react';
import DoctorSearch from '../Components/patient/DoctorSearch';
import BookAppointment from '../Components/patient/BookAppointment';
import MyAppointments from '../Components/patient/MyAppointments';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const PatientDashboard = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token") || localStorage.getItem("role") !== "patient") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "patient") {
    navigate("/login");
  }
}, [navigate]);

  return (
    <div>
      <h2>Patient Dashboard</h2>
      <DoctorSearch onSelect={setSelectedDoctor} />
      {selectedDoctor && <BookAppointment doctorId={selectedDoctor} />}
      <MyAppointments />
    </div>
  );
};

export default PatientDashboard;