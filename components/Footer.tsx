import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-white to-purple-100 text-purple-900 py-8 border-t border-purple-200 w-screen">
      <div className="container mx-auto px-5 max-w-screen-xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl"></span> ResuRabbit
          </h2>
          <p className="mt-2 text-sm">
            Call now: <a href="tel:+919591776078" className="text-purple-600">+91 9999999999</a>
          </p>
          <p className="mt-1 text-sm">
            456 Chandni Chowk Street, Near Red Fort, Old Delhi, New Delhi, Delhi 110006, India
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/about" className="hover:text-purple-600">About</Link></li>
            <li><Link href="/contact" className="hover:text-purple-600">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-purple-600">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Candidate</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/jobs" className="hover:text-purple-600">Browse Jobs</Link></li>
            <li><Link href="/employers" className="hover:text-purple-600">Browse Employers</Link></li>
            <li><Link href="/dashboard" className="hover:text-purple-600">Candidate Dashboard</Link></li>
            <li><Link href="/saved-jobs" className="hover:text-purple-600">Saved Jobs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Employers</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/post-job" className="hover:text-purple-600">Post a Job</Link></li>
            <li><Link href="/browse-candidates" className="hover:text-purple-600">Browse Candidates</Link></li>
            <li><Link href="/employer-dashboard" className="hover:text-purple-600">Employers Dashboard</Link></li>
            <li><Link href="/applications" className="hover:text-purple-600">Applications</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-purple-200 container mx-auto max-w-screen-xl px-4 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-purple-600">
        <p>&copy; 2025 ResuRabbit - Job Portal. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link href="#" className="hover:text-purple-800"><FaFacebookF /></Link>
          <Link href="#" className="hover:text-purple-800"><FaYoutube /></Link>
          <Link href="#" className="hover:text-purple-800"><FaInstagram /></Link>
          <Link href="#" className="hover:text-purple-800"><FaTwitter /></Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
