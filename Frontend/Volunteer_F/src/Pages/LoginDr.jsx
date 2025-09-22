import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const DoctorLogin = () => {
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
      const response = await fetch("https://d0eeddd93c30.ngrok-free.app/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password,role: "doctor"  }),
      });

      const data = await response.json();
      console.log("Doctor Login response:", data);

      if (response.ok) {
        if (data.role === "doctor" && !data.is_verified) {
          alert("Account not verified yet");
          setIsLoading(false);
          return;
        }

        // Save tokens and user info separately
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("role", data.role);

        // Save doctor_data if exists (specialty etc)
        if (data.doctor_data) {
          localStorage.setItem("doctor_data", JSON.stringify(data.doctor_data));
        } else {
          localStorage.removeItem("doctor_data");
        }

        // Navigate
        if (data.role === "doctor") {
          navigate("/dashboard-dr");
        } else if (data.role === "patient") {
          alert("Please use the Patient login page");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 p-4">
        <div className="flex w-full max-w-5xl rounded-2xl shadow-xl bg-white overflow-hidden">
          <div className="hidden md:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 p-6 flex-col justify-between text-white">
            <div>
              <Link to="/" className="text-3xl font-extrabold">
                Volunteer Doctor<span className="text-yellow-300">System</span>
              </Link>
              <h1 className="text-xl font-semibold mt-10 text-white">
                Welcome Back to Volunteer Doctor System
              </h1>
              <p className="mt-2 text-blue-100 text-xs">
                Log in to connect with your patients and manage your schedule.
              </p>
              <button
                onClick={() => navigate("/about")}
                className="mt-4 px-4 py-2 bg-yellow-300 text-blue-800 rounded-lg hover:bg-yellow-400 transition font-semibold text-sm"
              >
                Learn More
              </button>
            </div>
            <div className="text-center">
              <p className="text-yellow-300 text-sm font-medium">Your Health, Our Priority</p>
              <p className="text-blue-200 text-xs mt-1">Empowering doctors to make a difference.</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Doctor Login</h2>
              <p className="text-center text-gray-600 mb-4 text-sm">
                Don’t have an account?{" "}
                <Link to="/signup/doctor" className="text-blue-600 font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-gray-600 mb-1 text-sm">Email</label>
                  <input
                    type="email"
                    className={`w-full p-2.5 border ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    value={email}
                    onChange={handleEmailChange}
                    required
                    aria-invalid={formErrors.email ? "true" : "false"}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  <div className="h-5">
                    {formErrors.email && (
                      <p id="email-error" className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col relative">
                  <label className="block text-gray-600 mb-1 text-sm">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-2.5 border ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    aria-invalid={formErrors.password ? "true" : "false"}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-9 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <div className="h-5">
                    {formErrors.password && (
                      <p id="password-error" className="text-red-500 text-xs mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold text-sm flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
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

export default DoctorLogin;
