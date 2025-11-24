// import Home from './Pages/Home'
// import ChoicePage from "./Pages/Choice";
// import DoctorSignup from './Pages/SignupDr';
// import Login from './Pages/LoginDr';
// import LoginPatient from './Pages/LoginPAt';
// import SignupPatient from './Pages/SignupPat';
// import './index.css'
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import DoctorDashboard from './Pages/dashboardDr';
// import PatientDashboard from './Pages/dashboardPt';
// import VideoCall from './Pages/VideoCall';
// function App() {

//   return (
//     <>
//       <Router>
//         <Routes>
//                {/* Reused for both signup and login */}
//           <Route path="/choice/:action" element={<ChoicePage />} />
//           <Route path="/:action" element={<ChoicePage />} />
//           <Route path="/" element={<Home />} />
//           <Route path="/signup/doctor" element={<DoctorSignup />} />
//            <Route path="/login/doctor" element={<Login />} />
//            <Route path="/login/patient" element={<LoginPatient />} />
//            <Route path="/signup/patient" element={<SignupPatient />} />
//            <Route path="/dashboard-dr/*" element={<DoctorDashboard />} />
//            <Route path="/dashboard-pt/*" element={<PatientDashboard />} />
//            <Route path="/video-call/:roomId" element={<VideoCall />} />
//         </Routes>
//       </Router>
//     </>
//   )
// }

// export default App
import Home from './Pages/Home';
import ChoicePage from './Pages/Choice';
import DoctorSignup from './Pages/SignupDr';
import Login from './Pages/LoginDr';
import LoginPatient from './Pages/LoginPAt';
import SignupPatient from './Pages/SignupPat';
import './index.css';
import { Routes, Route } from 'react-router-dom';
import DoctorDashboard from './Pages/dashboardDr';
import PatientDashboard from './Pages/dashboardPt';
import VideoCall from './Pages/VideoCall';
import BookAppointment from './Components/patient/BookAppointment';
import MyAppointments from './Components/patient/MyAppointments';
import DrugSearch from './Pages/DrugSearch';
import HighRiskPregnancyPrediction from './Pages/PregnancyPrediction';
import VerifyOTP from "./Pages/VerifyOTP";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Reused for both signup and login */}
        <Route path="/choice/:action" element={<ChoicePage />} />
        <Route path="/:action" element={<ChoicePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup/doctor" element={<DoctorSignup />} />
        <Route path="/login/doctor" element={<Login />} />
        <Route path="/login/patient" element={<LoginPatient />} />
        <Route path="/signup/patient" element={<SignupPatient />} />
        <Route path="/dashboard-dr/*" element={<DoctorDashboard />} />
        <Route path="/dashboard-pt/*" element={<PatientDashboard />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/video-call/:roomId" element={<VideoCall />} />
        <Route path="/my-appointments" element={<MyAppointments />} /> 
        <Route path="/drug-search" element={<DrugSearch />} />
        <Route path="/high-risk-pregnancy" element={<HighRiskPregnancyPrediction />} />

        <Route path="/book-appointment/:doctorId" element={<BookAppointmentWrapper />} />
      </Routes>
    </>
  );
}

export default App;

// Wrapper to extract doctorId from route params and pass to component
import { useParams } from "react-router-dom";
const BookAppointmentWrapper = () => {
  const { doctorId } = useParams();
  return <BookAppointment doctorId={doctorId} />;
};