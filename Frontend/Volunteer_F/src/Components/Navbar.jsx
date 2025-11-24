import { Link } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className=" bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4">

        {/* Logo */}
        <div className="flex items-center space-x-2 text-white text-2xl font-bold">
          <FaUserMd className="text-yellow-500 text-4xl" />
          <span>DoctorHelp</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-8 text-lg">
          {[
            { name: "Home", path: "/" },
            { name: "Video Consultation", path: "/" },
            { name: "Doctors", path: "/" },
            { name: "Drug Database", path: "/" },
            { name: "AI Chatbot", path: "/" },
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

        {/* Desktop Auth */}
        <div className="hidden lg:flex space-x-4">
          <Link
            to="/choice/signup"
            className="px-5 py-2 bg-yellow-300 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition"
          >
            Sign Up
          </Link>
          <Link
            to="/choice/login"
            className="px-5 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden focus:outline-none"
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-[64px] right-0 w-full bg-blue-600 bg-opacity-95 backdrop-blur-lg text-center transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
      >
        {[
          { name: "Home", path: "/" },
          { name: "Dashboard", path: "/" },
          { name: "Patients", path: "/" },
          { name: "Drug Database", path: "/" },
          { name: "AI Chatbot", path: "/" },
        ].map((item, index) => (
          <Link
            key={index}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className="block py-4 text-lg border-b border-blue-700 hover:bg-blue-700 transition"
          >
            {item.name}
          </Link>
        ))}

        <div className="py-4">
          <Link
            to="/choice/signup"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 mx-4 bg-yellow-300 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition"
          >
            Sign Up
          </Link>
          <Link
            to="/choice/login"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 mx-4 mt-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
