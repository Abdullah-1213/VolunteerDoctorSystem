// File: src/pages/PatientDashboard.jsx
import React, { useState } from 'react';
import DoctorSearch from '../Components/patient/DoctorSearch';
import BookAppointment from '../Components/patient/BookAppointment';
import MyAppointments from '../Components/patient/MyAppointments';

const PatientDashboard = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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