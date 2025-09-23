import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const PatientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? "" : "Invalid email address.";
  };

  const validatePassword = (password) => {
    return password.length >= 6 ? "" : "Password should be at least 6 characters.";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormErrors({ ...formErrors, email: validateEmail(e.target.value) });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormErrors({ ...formErrors, password: validatePassword(e.target.value) });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFormErrors(errors);
    if (errors.email || errors.password) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://2df08321545f.ngrok-free.app/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password ,role: "patient"  }),
      });

      const data = await response.json();
      console.log("Patient Login response:", data);

      if (response.ok) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("role", data.role);

        // Navigate according to role for safety, though this is patient login:
        if (data.role === "patient") {
          navigate("/dashboard-pt");
        } else if (data.role === "doctor") {
          alert("Use Doctor login page")
        } else {
          alert("Unknown user role.");
        }
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-gray-100 p-4">
        <div className="flex w-full max-w-5xl rounded-2xl shadow-xl bg-white overflow-hidden">
          <div className="hidden md:flex w-1/2 bg-gradient-to-b from-green-600 to-green-800 p-6 flex-col justify-between text-white">
            <div>
              <Link to="/" className="text-3xl font-extrabold">
                Volunteer Doctor<span className="text-yellow-300">System</span>
              </Link>
              <h1 className="text-xl font-semibold mt-10 text-white">
                Welcome Back Patient!
              </h1>
              <p className="mt-2 text-green-100 text-xs">
                Log in to access consultations, prescriptions, and support.
              </p>
              <button
                onClick={() => navigate("/about")}
                className="mt-4 px-4 py-2 bg-yellow-300 text-green-800 rounded-lg hover:bg-yellow-400 transition font-semibold text-sm"
              >
                Learn More
              </button>
            </div>
            <div className="text-center">
              <p className="text-yellow-300 text-sm font-medium">Your Health, Our Priority</p>
              <p className="text-green-200 text-xs mt-1">Patient-centered care at your fingertips.</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Patient Login</h2>
              <p className="text-center text-gray-600 mb-4 text-sm">
                Don’t have an account?{" "}
                <Link to="/signup/patient" className="text-green-600 font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    className={`w-full p-2.5 border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-lg text-sm focus:ring-2 focus:ring-green-500`}
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div className="flex flex-col relative">
                  <label className="text-sm text-gray-600 mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-2.5 border ${formErrors.password ? "border-red-500" : "border-gray-300"} rounded-lg text-sm focus:ring-2 focus:ring-green-500`}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-9 text-gray-500 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm flex justify-center items-center"
                >
                  {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientLogin;
