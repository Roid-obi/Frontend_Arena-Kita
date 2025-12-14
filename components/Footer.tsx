import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/image/Logo.png";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="mt-8 md:mt-16 bg-gradient-to-br from-[#0d47a1] to-[#1565c0]">
        <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <Image src={Logo} alt="ArenaKita Logo" width={40} height={40} className="" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">ArenaKita</h3>
              </div>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-4">
                Platform booking lapangan olahraga terpercaya di Indonesia. Temukan dan booking lapangan favoritmu dengan mudah.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all duration-200 group">
                  <Facebook size={20} className="text-white group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all duration-200 group">
                  <Instagram size={20} className="text-white group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all duration-200 group">
                  <Twitter size={20} className="text-white group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base md:text-lg">Navigasi Cepat</h4>
              <ul className="space-y-3 text-blue-100 text-sm md:text-base">
                <li>
                  <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Cara Booking
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Mitra Venue
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base md:text-lg">Bantuan & Dukungan</h4>
              <ul className="space-y-3 text-blue-100 text-sm md:text-base">
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base md:text-lg">Hubungi Kami</h4>
              <ul className="space-y-3 text-blue-100 text-sm md:text-base">
                <li className="flex items-start space-x-2">
                  <Mail size={18} className="mt-1 flex-shrink-0" />
                  <span>support@arenakita.com</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Phone size={18} className="mt-1 flex-shrink-0" />
                  <span>+62 812-3456-7890</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin size={18} className="mt-1 flex-shrink-0" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-blue-100 text-sm text-center md:text-left">&copy; 2025 ArenaKita. All rights reserved.</p>
              <div className="flex space-x-6 text-blue-100 text-sm">
                <Link href="#" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Syarat Layanan
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
