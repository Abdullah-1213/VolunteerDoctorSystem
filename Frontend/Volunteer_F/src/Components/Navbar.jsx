import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Stethoscope, ChevronRight } from "lucide-react";

// Centralized Navigation Config
const NAV_LINKS = [
  { name: "Home", path: "" },
  { name: "Find Doctors", path: "" }, // Updated for clarity
  { name: "Video Consult", path: "" },
  { name: "Medicines", path: "" },
  { name: "AI Health Bot", path: "" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || isOpen
            ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
            : "bg-white/50 backdrop-blur-sm py-5" // Start slightly larger
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
              <Stethoscope size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">
              Doctor<span className="text-blue-600">Help</span>
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group"
              >
                {item.name}
                {/* Hover Underline Animation */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* --- DESKTOP AUTH BUTTONS --- */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/choice/login"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 px-4 py-2 rounded-full transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/choice/signup"
              className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1"
            >
              Get Started <ChevronRight size={16} />
            </Link>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[60px] left-0 w-full bg-white border-b border-slate-100 shadow-xl z-40 lg:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-lg font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all"
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 my-2"></div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/choice/login"
                  className="w-full text-center py-3 font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/choice/signup"
                  className="w-full text-center py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;