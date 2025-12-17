import { FaUserMd, FaUserInjured } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

function ChoicePage() {
  const navigate = useNavigate();
  const { action } = useParams(); // 'signup' or 'login'

  const handleChoice = (role) => {
    navigate(`/${action}/${role}`); // e.g., /signup/doctor or /login/patient
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-10">
          Who are you?
        </h1>

        <div className="flex justify-center gap-10">
          {/* Doctor */}
          <div
            onClick={() => handleChoice("doctor")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer w-40 md:w-52"
          >
            <div className="flex justify-center mb-4">
              <FaUserMd className="text-blue-600 text-5xl md:text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Doctor</h2>
          </div>

          {/* Patient */}
          <div
            onClick={() => handleChoice("patient")}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer w-40 md:w-52"
          >
            <div className="flex justify-center mb-4">
              <FaUserInjured className="text-green-600 text-5xl md:text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Patient</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoicePage;
