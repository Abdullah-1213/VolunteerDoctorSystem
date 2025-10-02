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

function App() {
  return (
    <>
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
        <Route path="/video-call/:roomId" element={<VideoCall />} />
      </Routes>
    </>
  );
}

export default App;