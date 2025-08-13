import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import giffyAnimation from "../assets/giffy.json";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    specialization: "",
    hospital_name: "",
    medical_license_number: "",
    license_file: null,
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value, updatedFormData = formData) => {
    switch (name) {
      case "full_name":
        return /^[a-zA-Z\s]+$/.test(value) ? "" : "Name contain only letters and spaces.";
      case "email":
        return /\S+@\S+\.\S+/.test(value) ? "" : "Invalid email address.";
      case "phone_number":
        return /^\d{11}$/.test(value) ? "" : "Phone number should be 11 digits.";
      case "specialization":
        return /^[a-zA-Z\s]+$/.test(value) ? "" : "Specialization should contain only letters.";
      case "hospital_name":
        return value.trim() ? "" : "Hospital/Clinic name is required.";
      case "medical_license_number":
        return /^[a-zA-Z0-9\-]+$/.test(value) ? "" : "License number must be alphanumeric.";
      case "password":
        return value.length >= 6 ? "" : "Password should be at least 6 characters.";
      case "confirmPassword":
        return value === updatedFormData.password ? "" : "Passwords do not match.";
      case "license_file":
        return value ? "" : "Please upload your license file.";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    const error = validateField(name, value, updatedForm);
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, license_file: file }));
    const error = validateField("license_file", file);
    setFormErrors((prevErrors) => ({ ...prevErrors, license_file: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(formData).forEach((key) => {
      errors[key] = validateField(key, formData[key]);
    });
    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword") {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("http://localhost:8000/api/doctor/signup/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "You signed up successfully! Wait for admin verification.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors ||
        "Signup failed. Please try again.";
      alert(errorMessage);
      console.error("Signup error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 p-4">
      <div className="flex w-full max-w-5xl rounded-2xl shadow-xl bg-white overflow-hidden">
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 p-6 flex-col justify-between text-white">
          <div>
            <Link to="/" className="text-3xl font-extrabold">
              Volunteer Doctor<span className="text-yellow-300">System</span>
            </Link>
            <h1 className="text-xl font-semibold mt-10 text-white">
              Join Our Doctor's Platform
            </h1>
            <p className="mt-2 text-blue-100 text-xs">
              Connect with patients and provide trusted care.
            </p>
            <div className="mt-6 flex justify-center">
              <Lottie animationData={giffyAnimation} loop={true} style={{ width: 300, height: 300 }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-yellow-300 text-sm font-medium">Your Health, Our Priority</p>
            <p className="text-blue-200 text-xs mt-1">Empowering doctors to make a difference.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Create Your Account</h2>
            <p className="text-center text-gray-600 mb-4 text-sm">
              Already have an account?{" "}
              <Link to="/login/doctor" className="text-blue-600 font-semibold hover:underline">
                Log In
              </Link>
            </p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "full_name", type: "text", placeholder: "Full Name" },
                { name: "email", type: "email", placeholder: "Email" },
                { name: "phone_number", type: "text", placeholder: "Phone Number" },
                { name: "specialization", type: "text", placeholder: "Specialization" },
                { name: "hospital_name", type: "text", placeholder: "Hospital/Clinic" },
                { name: "medical_license_number", type: "text", placeholder: "License Number" },
                { name: "license_file", type: "file", placeholder: "Upload License" },
                { name: "password", type: "password", placeholder: "Password" },
                { name: "confirmPassword", type: "password", placeholder: "Confirm Password" },
              ].map((field) => (
                <div
                  key={field.name}
                  className={`flex flex-col ${field.name === "license_file" ? "md:col-span-2" : ""}`}
                >
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={field.name === "license_file" ? handleFileChange : handleChange}
                    className={`w-full p-2.5 border ${formErrors[field.name] ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    required
                    aria-invalid={formErrors[field.name] ? "true" : "false"}
                    aria-describedby={formErrors[field.name] ? `${field.name}-error` : undefined}
                  />
                  <div className="h-5">
                    {formErrors[field.name] && (
                      <p id={`${field.name}-error`} className="text-red-500 text-xs mt-1">
                        {formErrors[field.name]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="md:col-span-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold text-sm mt-2"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;