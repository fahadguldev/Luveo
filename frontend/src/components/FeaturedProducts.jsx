import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import AlertMessage from "./Alert";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
  { value: "newest",     label: "New In"         },
  { value: "price-low",  label: "Price: Low–High" },
  { value: "price-high",  label: "Price: High–Low" },
  { value: "popular",    label: "Top Rated"       },
];

const FeaturedProducts = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [userId, setUserId]         = useState(null);
  const [globalAlert, setGlobalAlert] = useState({ message: "", type: "" });
  const [sortBy, setSortBy]         = useState("newest");
  const [showGuestSign, setShowGuestSign] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserId(u.id ?? u.user?.id);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/product/get-products?featured=true&limit=7`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setError("Unable to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addToCart = useCallback(async (productId) => {
    if (!userId) { setShowGuestSign(true); return; }
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/product/add-to-cart`, { productId, userId });
      setGlobalAlert({ message: res.data.message, type: "success" });
    } catch (e) {
      setGlobalAlert({ message: e.response?.data?.message || e.message, type: "error" });
    }
  }, [userId]);

  const handleGuestAcct = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`);
      const user = res.data?.newUser;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price-low":  return arr.sort((a, b) => a.price - b.price);
      case "price-high": return arr.sort((a, b) => b.price - a.price);
      case "popular":    return arr.sort((a, b) => (b.reviewCount || 0) * (b.rating || 0) - (a.reviewCount || 0) * (a.rating || 0));
      default:           return arr.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
    }
  }, [products, sortBy]);

  return (
    <section style={{ padding: "0 clamp(20px, 5vw, 80px) 80px", background: "var(--prada-off-white)" }}>
      {globalAlert.message && (
        <div style={{ marginBottom: 24 }}>
          <AlertMessage message={globalAlert.message} type={globalAlert.type} onClose={() => setGlobalAlert({ message: "", type: "" })} />
        </div>
      )}

      {showGuestSign && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", padding: 32, maxWidth: 360, width: "90%", textAlign: "center", borderRadius: "var(--radius-md)" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Sign in</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--prada-gray)", marginBottom: 24 }}>
              Create a guest account to add items to your cart.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setShowGuestSign(false)} className="btn-prada-outline">Cancel</button>
              <button onClick={handleGuestAcct} className="btn-prada-solid">Continue as Guest</button>
            </div>
          </div>
        </div>
      )}

      {/* Sort bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 24,
        marginBottom: 36,
        maxWidth: 1440,
        margin: "0 auto 36px",
      }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--prada-gray)", textTransform: "uppercase" }}>
          {sortedProducts.length} Items Selected
        </span>
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "var(--prada-black)", marginRight: "8px" }}>Sort By:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: sortBy === opt.value ? 700 : 500,
                letterSpacing: "0.05em",
                color: sortBy === opt.value ? "var(--prada-black)" : "var(--prada-gray)",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: sortBy === opt.value ? "rgba(0,0,0,0.05)" : "transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--prada-gray)", fontWeight: "600", marginBottom: 40 }}>
          {error}
        </p>
      )}

      {/* Product Grid */}
      <div 
      
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "clamp(24px, 3vw, 40px)",
      }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCard key={`sk-${i}`} loading />)
          : sortedProducts.length > 0
            ? sortedProducts.map(p => (
                <ProductCard key={p._id} product={p} loading={false} onAddToCart={addToCart} />
              ))
            : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: "600", textTransform: "uppercase", color: "var(--prada-gray)" }}>
                  No products available
                </p>
              </div>
            )
        }
      </div>
    </section>
  );
};

export default FeaturedProducts;