"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VenueCard from '@/components/VenueCard';
import venuesData from '@/data/dummy/venues.json';
import fieldsData from '@/data/dummy/fields.json';
import venuePhotosData from '@/data/dummy/venue_photos.json';
import Footer from '@/components/Footer';

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

// Dummy Data
const banners = [
  { id: 1, title: 'Booking Lapangan Mudah', subtitle: 'Temukan dan booking lapangan olahraga favoritmu', image: 'https://picsum.photos/id/1018/1200/800' },
  { id: 2, title: 'Venue Terlengkap', subtitle: 'Ratusan venue olahraga siap untuk kamu', image: 'https://picsum.photos/id/1019/1200/800' },
  { id: 3, title: 'Harga Terjangkau', subtitle: 'Dapatkan harga terbaik untuk lapangan impianmu', image: 'https://picsum.photos/id/1013/1200/800' }
  // { id: 3, title: 'Harga Terjangkau', subtitle: 'Dapatkan harga terbaik untuk lapangan impianmu', image: 'https://placehold.co/1200x400/0d47a1/ffffff?text=Harga+Terjangkau' }
];

// Extract unique sport types from fields data to create categories
const categories = Array.from(
  new Map(
    fieldsData.map((field) => [
      field.sport_type,
      {
        id: fieldsData.findIndex((f) => f.sport_type === field.sport_type) + 1,
        name: field.sport_type.charAt(0) + field.sport_type.slice(1).toLowerCase(),
        icon: '⚽',
        // image: field.field_photo_url,
        image: `https://placehold.co/300x200/0d47a1/ffffff?text=${field.sport_type.charAt(0) + field.sport_type.slice(1).toLowerCase()}`,
      },
    ])
  ).values()
);

// Transform venues data to match component structure
interface VenuePhoto {
  id: number;
  venue_id: number;
  photo_url: string;
  created_at: string;
}

const getVenueImages = (venueId: number) => {
  return venuePhotosData
    .filter((photo: VenuePhoto) => photo.venue_id === venueId)
    .map((photo: VenuePhoto) => photo.photo_url);
};

const venues = venuesData.slice(0, 5).map((venue) => ({
  id: venue.id,
  name: venue.venue_name,
  location: venue.city,
  hours: `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}`,
  images: getVenueImages(venue.id),
  category: 'Olahraga',
}));

// Use all venues as recommendations
const recommendations = venuesData.map((venue) => ({
  id: venue.id,
  name: venue.venue_name,
  location: venue.city,
  hours: `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}`,
  images: getVenueImages(venue.id),
}));

const ArenaKita = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Jika user yang sedang login adalah admin, langsung arahkan ke dashboard admin
  useEffect(() => {
    try {
      const role = Cookies.get('userRole');
      // Jika admin -> dashboard admin, jika owner -> dashboard owner
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'owner') {
        router.push('/dashboard/owner');
      }
    } catch {
      // ignore
    }
  }, [router]);

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

  const scrollCategory = (direction: 'next' | 'prev') => {
    const container = document.getElementById('category-container');
    if (container) {
      const scrollAmount = direction === 'next' ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollVenue = (direction: 'next' | 'prev') => {
    const container = document.getElementById('venue-container');
    if (container) {
      const scrollAmount = direction === 'next' ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb', color: '#1a1a1a' }}>
      <Navbar />

      {/* Banner Carousel */}
      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-8">
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
              <div className="absolute inset-0 bg-[#00000079] bg-opacity-40 flex items-center justify-center">
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

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
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
                className={`w-2 h-2 md:w-2 md:h-2 rounded-full transition-all ${
                  idx === bannerIndex ? 'bg-white' : 'bg-white opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* <div className="mx-auto px-4 md:px-8 lg:px-[150px] "></div> */}

      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-8">

        {/* Kategori */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Kategori</h2>
          <div className="relative -mx-4 md:-mx-8 lg:mx-0">
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
                    className="flex-none w-40 md:w-48 h-24 md:h-32 rounded-lg overflow-hidden shadow-lg cursor-pointer transition relative flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* <div className="absolute inset-0 bg-[#00000079]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-bold text-base md:text-lg text-white text-center px-2">{category.name}</h3>
                    </div> */}
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Venue Terdekat</h2>
          <div className="relative -mx-4 md:-mx-8 lg:mx-0">
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
                  <div key={venue.id} className="flex-none w-64 md:w-72">
                    <VenueCard venue={venue} />
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Rekomendasi Venue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recommendations.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          
          <div className="text-center mt-6 md:mt-20">
            <button
              className="px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-white hover:opacity-90 transition text-sm md:text-base"
              style={{ backgroundColor: '#f97316' }}
            >
              Lihat Semua Venue
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArenaKita;