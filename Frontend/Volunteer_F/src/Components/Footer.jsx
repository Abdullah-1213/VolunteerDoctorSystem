import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* --- Top Section: Brand & Newsletter --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white text-2xl font-bold">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Stethoscope size={24} className="text-white" />
              </div>
              <span>Doctor<span className="text-blue-500">Help</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bridging the gap between patients and volunteer doctors. 
              Secure, AI-powered, and accessible healthcare for everyone, everywhere.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section (Span 8) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-blue-400 transition">Home</Link></li>
                <li><Link to="/features" className="hover:text-blue-400 transition">Features</Link></li>
                <li><Link to="/ai-chat" className="hover:text-blue-400 transition">AI Health Bot</Link></li>
                <li><Link to="/drugs" className="hover:text-blue-400 transition">Drug Database</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-white font-semibold mb-4">For Users</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/doctors" className="hover:text-blue-400 transition">Find Doctors</Link></li>
                <li><Link to="/choice/signup" className="hover:text-blue-400 transition">Patient Signup</Link></li>
                <li><Link to="/choice/signup" className="hover:text-blue-400 transition">Volunteer Signup</Link></li>
                <li><Link to="/video" className="hover:text-blue-400 transition">Consultation</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/help" className="hover:text-blue-400 transition">Help Center</Link></li>
                <li><Link to="/faqs" className="hover:text-blue-400 transition">FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 transition">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>support@drhelp.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>Lahore, Pakistan</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        

        {/* --- Bottom Section: Copyright --- */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} DoctorHelp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;