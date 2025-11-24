import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import Lottie from "lottie-react";
import giffyAnimation from "../assets/giffy.json";

const SignupPatient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const validateField = (name, value, updated = formData) => {
    switch (name) {
      case "full_name":
        return /^[a-zA-Z\s]+$/.test(value) ? "" : "Name must contain only letters and spaces.";
      case "email":
        return /\S+@\S+\.\S+/.test(value) ? "" : "Invalid email address.";
      case "phone_number":
        return /^\d{11}$/.test(value) ? "" : "Phone number should be 11 digits.";
      case "password":
        return value.length >= 6 ? "" : "Password should be at least 6 characters.";
      case "confirmPassword":
        return value === updated.password ? "" : "Passwords do not match.";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    const error = validateField(name, value, updated);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const errors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "address" && key !== "date_of_birth") {
        errors[key] = validateField(key, formData[key]);
      }
    });
    setFormErrors(errors);
    if (Object.values(errors).some((err) => err)) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/patient/signup/", {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address || null,
        date_of_birth: formData.date_of_birth || null,
        password: formData.password,
      });

      setUserId(response.data.user_id);
      setOtpModal(true);
      setOtpMessage("OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors ||
        "Signup failed. Please try again.";
      alert(errorMessage);
      console.error("Signup error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/otp/verify/", {
        user_id: userId,
        otp,
      });
      setOtpMessage(res.data.message);

      setTimeout(() => {
        setOtpModal(false);
        navigate("/login/patient");
      }, 1500);
    } catch (err) {
      setOtpMessage(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-gray-100 p-4">
      <div className="flex w-full max-w-5xl rounded-2xl shadow-xl bg-white overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-green-600 to-green-800 p-6 flex-col justify-between text-white">
          <div>
            <Link to="/" className="text-3xl font-extrabold">
              Doctor<span className="text-yellow-300">Help</span>
            </Link>
            <h1 className="text-xl font-semibold mt-10 text-white">Join as a Patient</h1>
            <p className="mt-2 text-green-100 text-xs">Connect with trusted doctors and get better care.</p>
            <div className="mt-6 flex justify-center">
              <Lottie animationData={giffyAnimation} loop={true} style={{ width: 300, height: 300 }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-yellow-300 text-sm font-medium">Care You Deserve</p>
            <p className="text-green-200 text-xs mt-1">Secure. Reliable. Efficient.</p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Create Your Account</h2>
            <p className="text-center text-gray-600 mb-4 text-sm">
              Already registered?{" "}
              <Link to="/login/patient" className="text-green-600 font-semibold hover:underline">
                Log In
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
              {[ 
                { name: "full_name", type: "text", placeholder: "Full Name" },
                { name: "email", type: "email", placeholder: "Email" },
                { name: "phone_number", type: "text", placeholder: "Phone Number" },
                { name: "address", type: "text", placeholder: "Address (Optional)" },
                { name: "date_of_birth", type: "date", placeholder: "Date of Birth (Optional)" },
                { name: "password", type: "password", placeholder: "Password" },
                { name: "confirmPassword", type: "password", placeholder: "Confirm Password" },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    className={`w-full p-2.5 border ${formErrors[field.name] ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
                    required={field.name !== "address" && field.name !== "date_of_birth"}
                  />
                  <div className="h-5">
                    {formErrors[field.name] && <p className="text-red-500 text-xs mt-1">{formErrors[field.name]}</p>}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold text-sm mt-2"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            {/* OTP Modal */}
            {otpModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                  <h3 className="text-lg font-bold mb-2">Verify OTP</h3>
                  <p className="text-sm mb-4">{otpMessage}</p>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPatient;
