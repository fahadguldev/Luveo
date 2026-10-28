import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const AccountIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

const navItems = [
  { label: "New Arrivals", path: "/" },
  { label: "Men",          path: "/products/men" },
  { label: "Women",        path: "/products/women" },
  { label: "Gifting",      path: "/products/gifting" },
  { label: "Explore All",  path: "/all-products" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <div className="absolute inset-x-0 top-0 z-50">
      {/* ── Announcement Bar ── */}
      <div className="bg-[var(--prada-black)] text-[var(--prada-white)] text-xs tracking-[0.05em] text-center py-2.5 px-4 font-[var(--font-sans)] font-semibold">
        Complimentary shipping on all orders · <span className="text-[var(--brand-accent)]">Shop the Sale</span>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`border-b border-[var(--prada-border)] transition-all duration-300 ${
          scrolled ? "bg-[rgba(253,253,253,0.98)] backdrop-blur" : "bg-[var(--prada-white)]"
        }`}
      >
        <div className="flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] px-4 sm:px-6 md:px-10 py-3 md:py-4 max-w-[1440px] mx-auto gap-4 md:gap-6">
          {/* Left — Logo */}
          <Link
            to="/"
            className="font-[var(--font-serif)] text-[clamp(1.5rem,2.5vw,2rem)] font-bold tracking-[0.15em] uppercase text-[var(--prada-black)] select-none"
          >
            LuvEo
          </Link>

          {/* Centre — Nav links */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
            {navItems.map(item => (
              <NavLink key={item.label} to={item.path} label={item.label} />
            ))}
          </nav>

          {/* Right — Action icons */}
          <div className="flex items-center justify-end gap-4 md:gap-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className={`text-[var(--prada-black)] transition-opacity duration-200 flex ${
                searchOpen ? "opacity-50" : "opacity-100"
              }`}
            >
              <SearchIcon />
            </button>

            <Link
              to="/profile"
              aria-label="Account"
              className="text-[var(--prada-black)] flex transition-opacity duration-200 hover:opacity-60"
            >
              <AccountIcon />
            </Link>

            <Link
              to="/checkout"
              aria-label="Cart"
              className="text-[var(--prada-black)] flex transition-opacity duration-200 hover:opacity-60"
            >
              <CartIcon />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
              className="md:hidden text-[var(--prada-black)] flex transition-opacity duration-200 hover:opacity-70"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-[var(--prada-border)] px-4 sm:px-6 py-4 bg-[var(--prada-white)] space-y-3">
            {navItems.map(item => (
              <Link
                key={item.label}
                to={item.path}
                className="block font-[var(--font-sans)] text-sm font-semibold tracking-[0.05em] uppercase text-[var(--prada-black)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* ── Search Bar (dropdown) ── */}
        {searchOpen && (
          <div className="border-t border-[var(--prada-border)] px-10 py-5 bg-[var(--prada-white)]">
            <form onSubmit={handleSearchSubmit} className="max-w-[600px] mx-auto relative">
              <input
                autoFocus
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-0 border-b-2 border-[var(--prada-black)] outline-none text-base tracking-[0.05em] py-2.5 font-[var(--font-sans)] bg-transparent text-[var(--prada-black)] pr-8"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[1.5rem] text-[var(--prada-gray)] hover:opacity-70"
              >
                ×
              </button>
            </form>
          </div>
        )}
      </header>
    </div>
  );
};

/* Animated underline nav link */
const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="font-[var(--font-sans)] text-sm font-semibold tracking-[0.05em] uppercase text-[var(--prada-black)] pb-1 border-b-2 border-transparent hover:border-[var(--prada-black)] transition-colors duration-200 whitespace-nowrap"
  >
    {label}
  </Link>
);

export default Navbar;