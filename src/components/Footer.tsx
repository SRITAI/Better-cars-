import { motion } from 'framer-motion';
import {
  MapPin, Phone, Mail, Instagram, Twitter, Youtube, Facebook, ArrowRight
} from 'lucide-react';
import Logo from './Logo';

const footerLinks = {
  'Buy Cars': ['Browse All Cars', 'Cars Under 5 Lakh', 'Cars Under 10 Lakh', 'Electric Cars', 'Luxury Cars', 'Cars by Brand'],
  'Sell Cars': ['Sell My Car', 'Free Doorstep Evaluation', 'Instant Price Check', 'Dealer Partner Program'],
  'Popular Brands': ['Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'Volkswagen'],
  'Company': ['About Us', 'BetterCars Assurance', 'Careers', 'Press', 'Blog', 'Investor Relations'],
};

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#060608] border-t border-white/5 text-white">
      {/* Newsletter Strip */}
      <div className="border-b border-white/5">
        <div className="container-width py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-xl mb-1">Get the best verified deals first</h3>
              <p className="text-white/40 text-sm">Subscribe for new car listings, price drop alerts, and exclusive offers.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 md:w-72 bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-3 rounded-xl text-sm outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all flex-shrink-0 shadow-lg shadow-orange-500/25"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-width py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="mb-5">
              <Logo variant="white" className="h-12 sm:h-14" showTagline />
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              India's premier automotive marketplace. Because everyone deserves a handpicked, verified pre-owned car with zero hidden surprises.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-6">
              {[
                { icon: Phone, text: '+91 98765 43210' },
                { icon: Mail, text: 'support@bettercars.in' },
                { icon: MapPin, text: 'Mumbai · Bengaluru · Delhi NCR' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-white/40 text-sm hover:text-white/80 transition-colors cursor-pointer">
                  <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-orange-500 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all shadow-sm"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/40 hover:text-orange-400 text-sm transition-colors hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-width py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} BetterCars India Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((link) => (
              <a key={link} href="#" className="text-white/25 hover:text-white/60 text-xs transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
