import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ShoppingBag, Star, Zap, Check } from "lucide-react";
import AlertMessage from "./Alert";
import QuickOrderDrawer from "./QuickOrderDrawer";

export const ProductCard = ({ product, loading }) => {
  const [userId, setUserId] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserId(user?.id || user?._id || "");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showAlert = (message, type = "success") =>
    setAlert({ show: true, message, type });
  const hideAlert = () => setAlert((prev) => ({ ...prev, show: false }));

  const ensureUserId = async () => {
    if (userId) return userId;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`
      );
      const user = res.data?.newUser;
      const id = user?.id || user?._id;
      if (!id) throw new Error("Unable to create guest account");
      localStorage.setItem("user", JSON.stringify(user));
      setUserId(id);
      return id;
    } catch (e) {
      showAlert("Error creating guest account", "error");
      throw e;
    }
  };

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);

    try {
      const ensuredUserId = await ensureUserId();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/product/add-to-cart`,
        { productId: product._id, userId: ensuredUserId }
      );
      showAlert(res.data.message || "Added to cart", "success");
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      showAlert(e.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleInstantBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickOrderOpen(true);
  };

  if (loading) return <SkeletonCard />;

  const colors = product?.colors || [
    { hex: "#0F0F10", name: "Obsidian Black" },
    { hex: "#8A4F2A", name: "Cognac Brown" },
    { hex: "#42281D", name: "Espresso" },
  ];

  const activeColor = colors[selectedColorIdx] || colors[0];
  const primaryImage =
    activeColor?.images?.[0] ||
    product?.img?.[0] ||
    product?.images?.[0] ||
    "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=600";

  const hasDiscount = product.price > product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <>
      {alert.show && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          onClose={hideAlert}
          duration={3500}
          showCloseButton
        />
      )}

      {/* Instant 2-Click Order Drawer */}
      <QuickOrderDrawer
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={product}
        selectedColorHex={activeColor?.hex}
      />

      <div className="group relative flex flex-col w-full bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E2D6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#D6CEBF] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
        {/* Badges Overlay */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && discountPercent > 0 && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#9B5A2B] text-white px-2.5 py-1 rounded-full shadow-sm">
              Save {discountPercent}%
            </span>
          )}
          {product.stock <= 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Product Image Stage */}
        <Link
          to={`/product/${product._id}`}
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#F0EBE1] flex items-center justify-center p-4 group-hover:bg-[#F5F1E8] transition-colors"
        >
          <img
            src={primaryImage}
            alt={product.name || "Leather Product"}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Product Info */}
        <div className="pt-4 flex flex-col flex-grow justify-between gap-3">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-[#8C867C] font-medium mb-1">
              <span className="uppercase tracking-wider text-[11px] text-[#9B5A2B] font-bold">
                {product.category || "Full-Grain Leather"}
              </span>
              <div className="flex items-center gap-1 text-[#4A453E]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-[11px] font-extrabold text-[#0D0C0B]">
                  {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <Link
              to={`/product/${product._id}`}
              className="block group-hover:text-[#9B5A2B] transition-colors"
            >
              <h3 className="text-base sm:text-lg font-bold text-[#0D0C0B] tracking-tight leading-snug line-clamp-1 font-[var(--font-display)]">
                {product.name || "Luveo Full-Grain Leather"}
              </h3>
            </Link>
          </div>

          {/* Color Swatches */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {colors.slice(0, 5).map((color, idx) => {
                const isSelected = selectedColorIdx === idx;
                return (
                  <button
                    key={`${color.hex}-${idx}`}
                    type="button"
                    title={color.name || "Color"}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#0D0C0B] ring-offset-white scale-110"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#8C867C] font-medium">
              COD Available
            </span>
          </div>

          {/* Pricing */}
          <div className="pt-2 border-t border-[#F2ECE1] flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-[#0D0C0B]">
              Rs. {(product.discountPrice || product.price)?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#A39D93] line-through font-medium">
                Rs. {product.price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* ── Clear, High-Contrast Action Buttons (Always Visible!) ── */}
          <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
            {/* Primary CTA: "Buy Now" (Instant 2-Click Checkout) */}
            <button
              type="button"
              onClick={handleInstantBuy}
              className="py-3 px-4 rounded-xl bg-[#0D0C0B] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 hover:bg-[#2A2621] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-[#D8AF72] fill-[#D8AF72]" />
              <span>Buy Now</span>
            </button>

            {/* Secondary CTA: "Add to Cart" Button */}
            <button
              type="button"
              onClick={addToCart}
              disabled={isAddingToCart}
              title="Add to cart"
              className={`p-3 rounded-xl border border-[#E3DDCF] transition-all cursor-pointer flex items-center justify-center ${
                addedSuccess
                  ? "bg-[#25D366] text-white border-[#25D366]"
                  : "bg-[#FAF8F5] text-[#0D0C0B] hover:bg-[#EFECE5]"
              }`}
            >
              {addedSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-5 border border-[#E8E2D6] flex flex-col gap-4 animate-pulse">
    <div className="w-full aspect-square bg-[#EFECE6] rounded-2xl" />
    <div className="h-4 w-1/3 bg-[#EFECE6] rounded-md" />
    <div className="h-5 w-4/5 bg-[#EFECE6] rounded-md" />
    <div className="h-4 w-1/2 bg-[#EFECE6] rounded-md mt-2" />
  </div>
);

export default ProductCard;
