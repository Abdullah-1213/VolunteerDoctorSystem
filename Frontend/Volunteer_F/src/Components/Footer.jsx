import { FaUserMd, FaFacebookF, FaTwitter, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6 px-6 custom:px-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-blue-700 pb-8">

        {/* Logo and About */}
        <div>
          <div className="flex items-center space-x-2 text-white text-2xl font-bold mb-4">
            <FaUserMd className="text-yellow-400 text-4xl" />
            <span>Volunteer Doctor</span>
          </div>
          <p className="text-sm text-gray-300">
            Volunteer Doctor System is a free platform for connecting patients and doctors, enabling remote consultations, prescription sharing, and healthcare insights powered by AI.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><a href="#" className="hover:text-yellow-400">Home</a></li>
            <li><a href="#" className="hover:text-yellow-400">Features</a></li>
            <li><a href="#" className="hover:text-yellow-400">Doctors</a></li>
            <li><a href="#" className="hover:text-yellow-400">Patients</a></li>
            <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-center"><FaEnvelope className="mr-2" /> support@volunteerdr.com</li>
            <li className="flex items-center"><FaPhone className="mr-2" /> +92 300 1234567</li>
            <li className="flex items-center"><FaMapMarkerAlt className="mr-2" /> Lahore, Pakistan</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4 text-blue-100">
            <a href="#" className="hover:text-yellow-400"><FaFacebookF size={20} /></a>
            <a href="#" className="hover:text-yellow-400"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-yellow-400"><FaLinkedinIn size={20} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-400 mt-6">
        © {new Date().getFullYear()} Volunteer Doctor. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
