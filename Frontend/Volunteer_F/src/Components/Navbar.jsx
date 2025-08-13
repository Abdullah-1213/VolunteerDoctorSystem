import { Link } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";
import ChoicePage from "../Pages/Choice";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-1">
        {/* Logo */}
     
        <div className="flex items-center space-x-2 text-white text-2xl font-bold">
          <FaUserMd className="text-yellow-500 text-4xl" />
          <span>Volunteer Doctor</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-lg">
          {[
            { name: "Home", path: "/" },
            { name: "Video Consultation", path: "/doctor-dashboard" },
            { name: "Doctors", path: "/patient-management" },
            { name: "Drug Database", path: "/drug-database" },
            { name: "AI Chatbot", path: "/ai-chat" },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="hover:text-yellow-300 transition duration-300"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <Link
            to="/choice/signup"
            className="px-5 py-2 bg-yellow-300 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition duration-300"
          >
            Sign Up
          </Link>
          <Link
            to="/choice/login"
            className="px-5 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition duration-300"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 w-full bg-blue-600 bg-opacity-90 backdrop-blur-lg text-center transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        {[
          { name: "Home", path: "/" },
          { name: "Dashboard", path: "/doctor-dashboard" },
          { name: "Patients", path: "/patient-management" },
          { name: "Drug Database", path: "/drug-database" },
          { name: "AI Chatbot", path: "/ai-chat" },
        ].map((item, index) => (
          <Link
            key={index}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className="block py-4 text-lg hover:bg-blue-700 transition duration-300"
          >
            {item.name}
          </Link>
        ))}

        <div className="py-4">
          <Link
            to="/signup"
            className="block px-6 py-3 mx-4 bg-yellow-300 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition duration-300"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="block px-6 py-3 mx-4 mt-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
