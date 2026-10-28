import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { label: "MagFlap™ Wallets", path: "/products/magnetic-wallet" },
  { label: "Artisan Belts", path: "/products/leather-belts" },
  { label: "Classic Bifolds", path: "/products/men-wallets" },
  { label: "Travel & Long", path: "/products/long-wallet" },
  { label: "All Goods", path: "/all-products" },
];

const ANNOUNCEMENTS = [
  "Complimentary express delivery across Pakistan on orders over Rs. 3,000",
  "Crafted with 100% Certified Full-Grain Cowhide",
  "10-Year Atelier Craftsmanship Guarantee",
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  // Redux cart count
  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#0D0C0B] text-[#FAF8F5] text-[11px] sm:text-xs font-semibold tracking-wider text-center py-2 px-4 border-b border-[#24211E] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={announcementIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 max-w-xl mx-auto"
          >
            <Sparkles className="w-3 h-3 text-[#C6833E] shrink-0" />
            <span className="truncate">{ANNOUNCEMENTS[announcementIdx]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Main Navigation Bar ── */}
      <header
        className={`transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#FAF8F5]/90 backdrop-blur-xl border-[#E8E2D6] shadow-[0_4px_24px_rgba(0,0,0,0.06)] py-3"
            : "bg-[#FAF8F5] border-[#E8E2D6]/80 py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-[#0D0C0B] hover:text-[#9B5A2B] transition cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              to="/"
              className="group flex flex-col items-start select-none no-underline"
            >
              <span className="font-[var(--font-display)] text-2xl sm:text-[1.75rem] font-extrabold tracking-[0.22em] uppercase text-[#0D0C0B] leading-none group-hover:text-[#9B5A2B] transition-colors">
                LUVEO
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#8C867C] mt-1 hidden sm:block">
                Leather Atelier
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200 py-1 ${
                    isActive
                      ? "text-[#0D0C0B]"
                      : "text-[#6B655C] hover:text-[#0D0C0B]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#9B5A2B] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#0D0C0B] hover:text-[#9B5A2B] transition rounded-full hover:bg-black/5 cursor-pointer"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile */}
            <Link
              to="/profile"
              className="p-2 text-[#0D0C0B] hover:text-[#9B5A2B] transition rounded-full hover:bg-black/5 cursor-pointer"
              aria-label="User account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Link with Badge */}
            <Link
              to="/checkout"
              className="relative p-2 text-[#0D0C0B] hover:text-[#9B5A2B] transition rounded-full hover:bg-black/5 cursor-pointer"
              aria-label={`View cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#9B5A2B] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Search Dropdown Drawer ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[#E8E2D6] bg-white px-4 sm:px-8 py-5"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-2xl mx-auto flex items-center gap-3 relative"
              >
                <Search className="w-5 h-5 text-[#8C867C] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search wallets, belts, cardholders, travel folios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow py-2 text-sm sm:text-base font-medium text-[#0D0C0B] placeholder:text-[#A39D93] outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-[#8C867C] hover:text-[#0D0C0B] transition text-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Navigation Sheet ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF8F5] border-r border-[#E8E2D6] p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D6]">
                  <div>
                    <span className="font-[var(--font-display)] text-2xl font-extrabold tracking-[0.2em] uppercase text-[#0D0C0B]">
                      LUVEO
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8C867C] font-semibold">
                      Leather Atelier
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-[#0D0C0B] hover:text-[#9B5A2B]"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-4 mt-8">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-2 text-base font-bold text-[#0D0C0B] uppercase tracking-wide hover:text-[#9B5A2B] transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#A39D93]" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Guarantee Badge */}
              <div className="pt-6 border-t border-[#E8E2D6]">
                <div className="flex items-center gap-3 text-xs text-[#6B655C]">
                  <ShieldCheck className="w-4 h-4 text-[#9B5A2B]" />
                  <span>100% Certified Full-Grain Cowhide</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
