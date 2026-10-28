import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import AlertMessage from "./Alert";

export const ProductCard = ({ product, loading }) => {
  const [userId, setUserId] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

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
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      showAlert(e.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setIsAddingToCart(false);
    }
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

  const secondaryImage =
    activeColor?.images?.[1] ||
    product?.img?.[1] ||
    product?.images?.[1] ||
    primaryImage;

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

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col w-full bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E2D6] transition-all duration-300 ease-out hover:border-[#D6CEBF] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
      >
        {/* Badges Overlay */}
        <div className="absolute top-7 left-7 z-20 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && discountPercent > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#9B5A2B] text-white px-2.5 py-1 rounded-full shadow-sm">
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
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#F0EBE1] flex items-center justify-center p-3 sm:p-5"
        >
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name || "Leather Product"}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 ease-out group-hover:scale-105"
          />

          {/* Quick Add Pill overlay on hover */}
          <AnimatePresence>
            {isHovered && product.stock > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-4 bottom-4 z-20 hidden sm:flex gap-2"
              >
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={isAddingToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0D0C0B] text-white text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-[#262420] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isAddingToCart ? "Adding..." : "Quick Add"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Product Details */}
        <div className="pt-4 sm:pt-5 flex flex-col flex-grow justify-between gap-3">
          <div>
            {/* Category / Leather Tag */}
            <div className="flex items-center justify-between text-xs text-[#8C867C] font-medium mb-1">
              <span className="uppercase tracking-wider text-[11px] text-[#9B5A2B] font-semibold">
                {product.category || "Full-Grain Leather"}
              </span>
              <div className="flex items-center gap-1 text-[#4A453E]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-[11px] font-bold">
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
          <div className="flex items-center gap-2">
            {colors.slice(0, 5).map((color, idx) => {
              const isSelected = selectedColorIdx === idx;
              return (
                <button
                  key={`${color.hex}-${idx}`}
                  type="button"
                  title={color.name || "Color swatch"}
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
            {colors.length > 5 && (
              <span className="text-[11px] text-[#8C867C] font-semibold ml-1">
                +{colors.length - 5}
              </span>
            )}
          </div>

          {/* Pricing & Mobile Quick Action */}
          <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-[#0D0C0B]">
                Rs.
                {(product.discountPrice || product.price)?.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#A39D93] line-through font-medium">
                  Rs.{product.price?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Mobile-visible quick add button */}
            <button
              type="button"
              onClick={addToCart}
              disabled={isAddingToCart}
              className="sm:hidden p-2 rounded-xl bg-[#0D0C0B] text-white hover:bg-[#262420] transition"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
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
