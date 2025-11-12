'use client';
import React, { useState } from 'react';

// SVG Icons Components
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// Dummy Data
const banners = [
  { id: 1, title: 'Booking Lapangan Mudah', subtitle: 'Temukan dan booking lapangan olahraga favoritmu', image: 'https://placehold.co/1200x400/0d47a1/ffffff?text=Booking+Lapangan+Mudah' },
  { id: 2, title: 'Venue Terlengkap', subtitle: 'Ratusan venue olahraga siap untuk kamu', image: 'https://placehold.co/1200x400/f97316/ffffff?text=Venue+Terlengkap' },
  { id: 3, title: 'Harga Terjangkau', subtitle: 'Dapatkan harga terbaik untuk lapangan impianmu', image: 'https://placehold.co/1200x400/0d47a1/ffffff?text=Harga+Terjangkau' }
];

const categories = [
  { id: 1, name: 'Futsal', icon: '⚽', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Futsal' },
  { id: 2, name: 'Badminton', icon: '🏸', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Badminton' },
  { id: 3, name: 'Basketball', icon: '🏀', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Basketball' },
  { id: 4, name: 'Tenis', icon: '🎾', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Tenis' },
  { id: 5, name: 'Voli', icon: '🏐', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Voli' },
  { id: 6, name: 'Renang', icon: '🏊', image: 'https://placehold.co/300x200/0d47a1/ffffff?text=Renang' }
];

const venues = [
  { id: 1, name: 'Arena Futsal Sentral', location: 'Jakarta Pusat', hours: '08:00 - 23:00', image: 'https://placehold.co/400x300/f97316/ffffff?text=Arena+Futsal', category: 'Futsal' },
  { id: 2, name: 'Badminton Hall Premium', location: 'Jakarta Selatan', hours: '06:00 - 22:00', image: 'https://placehold.co/400x300/f97316/ffffff?text=Badminton+Hall', category: 'Badminton' },
  { id: 3, name: 'Basketball Court 88', location: 'Jakarta Barat', hours: '07:00 - 21:00', image: 'https://placehold.co/400x300/f97316/ffffff?text=Basketball+Court', category: 'Basketball' },
  { id: 4, name: 'Tennis Center Elite', location: 'Jakarta Timur', hours: '06:00 - 20:00', image: 'https://placehold.co/400x300/f97316/ffffff?text=Tennis+Center', category: 'Tenis' },
  { id: 5, name: 'Futsal Arena Pro', location: 'Jakarta Utara', hours: '09:00 - 24:00', image: 'https://placehold.co/400x300/f97316/ffffff?text=Futsal+Pro', category: 'Futsal' }
];

const recommendations = [
  { id: 1, name: 'Sport Center Mega', location: 'Tangerang', hours: '08:00 - 22:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Sport+Center' },
  { id: 2, name: 'Lapangan Hijau Indah', location: 'Bekasi', hours: '07:00 - 23:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Lapangan+Hijau' },
  { id: 3, name: 'Arena Olahraga Mandiri', location: 'Depok', hours: '06:00 - 21:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Arena+Mandiri' },
  { id: 4, name: 'Champion Sport Hall', location: 'Bogor', hours: '08:00 - 22:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Champion+Hall' },
  { id: 5, name: 'Victory Sports Complex', location: 'Jakarta Pusat', hours: '07:00 - 23:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Victory+Complex' },
  { id: 6, name: 'Prime Athletic Center', location: 'Jakarta Selatan', hours: '06:00 - 22:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Prime+Center' },
  { id: 7, name: 'Golden Arena Sport', location: 'Jakarta Barat', hours: '08:00 - 23:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Golden+Arena' },
  { id: 8, name: 'Star Sport Venue', location: 'Jakarta Timur', hours: '07:00 - 22:00', image: 'https://placehold.co/400x300/0d47a1/ffffff?text=Star+Venue' }
];

const ArenaKita = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prev) => (prev + 1) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };
  
  const prevBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const scrollCategory = (direction) => {
    const container = document.getElementById('category-container');
    if (container) {
      const scrollAmount = direction === 'next' ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollVenue = (direction) => {
    const container = document.getElementById('venue-container');
    if (container) {
      const scrollAmount = direction === 'next' ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb', color: '#1a1a1a' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: '#0d47a1' }}>
        <div className="mx-auto px-4 md:px-8 lg:px-[120px] py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-white">ArenaKita</div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari venue atau olahraga..."
                  className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#f9fafb', color: '#1a1a1a' }}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <SearchIcon />
                </div>
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-blue-800 transition text-white">
                <ShoppingCartIcon />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-2 rounded-lg hover:bg-blue-800 transition text-white"
                >
                  <UserIcon />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    {isLoggedIn ? (
                      <>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                          <DashboardIcon />
                          <span>Dashboard</span>
                        </button>
                        <button
                          onClick={() => setIsLoggedIn(false)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOutIcon />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsLoggedIn(true)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Login
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
                          Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner Carousel */}
      <div className="mx-auto px-4 md:px-8 lg:px-[120px] py-4 md:py-8">
        <div className="relative h-64 md:h-96 overflow-hidden rounded-2xl shadow-xl">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === bannerIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">{banner.title}</h1>
                  <p className="text-sm md:text-xl">{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={prevBanner}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-1 md:p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition"
          >
            <ChevronLeftIcon />
          </button>
          
          <button
            onClick={nextBanner}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-1 md:p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition"
          >
            <ChevronRightIcon />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setBannerIndex(idx);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                  idx === bannerIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-8 lg:px-[120px] py-4 md:py-8">
        {/* Kategori */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Kategori</h2>
          <div className="relative -mx-4 md:-mx-8 lg:-mx-0">
            <div className="px-4 md:px-8 lg:px-0">
              <div
                id="category-container"
                className="flex space-x-4 overflow-x-auto py-6 px-2"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex-none w-40 md:w-48 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <img src={category.image} alt={category.name} className="w-full h-24 md:h-32 object-cover" />
                    <div className="p-3 md:p-4 bg-white text-center">
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-sm md:text-base">{category.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => scrollCategory('prev')}
              className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronLeftIcon />
            </button>
            
            <button
              onClick={() => scrollCategory('next')}
              className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </section>

        {/* Terdekat */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Terdekat</h2>
          <div className="relative -mx-4 md:-mx-8 lg:-mx-0">
            <div className="px-4 md:px-8 lg:px-0">
              <div
                id="venue-container"
                className="flex space-x-4 overflow-x-auto py-6 px-2"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="flex-none w-64 md:w-72 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition transform hover:scale-105 bg-white"
                  >
                    <img src={venue.image} alt={venue.name} className="w-full h-40 md:h-48 object-cover" />
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-base md:text-lg mb-2">{venue.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <div className="mr-1"><MapPinIcon /></div>
                        <span className="text-xs md:text-sm">{venue.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="mr-1"><ClockIcon /></div>
                        <span className="text-xs md:text-sm">{venue.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => scrollVenue('prev')}
              className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronLeftIcon />
            </button>
            
            <button
              onClick={() => scrollVenue('next')}
              className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </section>

        {/* Rekomendasi */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Rekomendasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map((venue) => (
              <div
                key={venue.id}
                className="rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition transform hover:scale-105 bg-white"
              >
                <img src={venue.image} alt={venue.name} className="w-full h-40 md:h-48 object-cover" />
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-base md:text-lg mb-2">{venue.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <div className="mr-1"><MapPinIcon /></div>
                    <span className="text-xs md:text-sm">{venue.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="mr-1"><ClockIcon /></div>
                    <span className="text-xs md:text-sm">{venue.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6 md:mt-8">
            <button
              className="px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-white hover:opacity-90 transition text-sm md:text-base"
              style={{ backgroundColor: '#f97316' }}
            >
              Lihat Semua Venue
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 md:mt-16 py-8 md:py-12" style={{ backgroundColor: '#0d47a1' }}>
        <div className="mx-auto px-4 md:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">ArenaKita</h3>
              <p className="text-blue-200 text-sm md:text-base">Platform booking lapangan olahraga terpercaya di Indonesia</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Tentang Kami</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li><a href="#" className="hover:text-white">Tentang ArenaKita</a></li>
                <li><a href="#" className="hover:text-white">Karir</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Bantuan</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Ikuti Kami</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-blue-200 text-sm md:text-base">
            <p>&copy; 2025 ArenaKita. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArenaKita;