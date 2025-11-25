export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="mt-8 md:mt-16 py-8 md:py-12" style={{ backgroundColor: "#0d47a1" }}>
        <div className="mx-auto px-4 md:px-8 lg:px-[150px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">ArenaKita</h3>
              <p className="text-blue-200 text-sm md:text-base">Platform booking lapangan olahraga terpercaya di Indonesia</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Tentang Kami</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li>
                  <a href="#" className="hover:text-white">
                    Tentang ArenaKita
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Karir
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Bantuan</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li>
                  <a href="#" className="hover:text-white">
                    Pertanyaan Umum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Hubungi Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Syarat & Ketentuan
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Ikuti Kami</h4>
              <ul className="space-y-2 text-blue-200 text-sm md:text-base">
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-300 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-blue-200 text-sm md:text-base">
            <p>&copy; 2025 ArenaKita. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
