import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Star,
  ShieldCheck,
  Truck,
  Zap,
  ShoppingBag,
  Check,
  RotateCcw,
} from "lucide-react";

import Reviews from "./random/Reviews";
import AlertMessage from "./Alert";
import QuickOrderDrawer from "./QuickOrderDrawer";
import { setColorSelection } from "../store/cartSlice";
import DUMMY_LEATHER_PRODUCTS from "../data/products.json";

export const ProductDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);

  const [alertProps, setAlertProps] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user?.id || user?._id || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/product/get-product/${id}`
      );
      const productData = response.data?.product;
      if (productData) {
        setProduct(productData);
        if (productData?.colors?.length > 0) {
          setSelectedColor(productData.colors[0].hex);
        }
        setError(null);
        setLoading(false);
        return;
      }
    } catch {
      // Backend unavailable or 404 - fallback to dummy catalog
    }

    const dummy = DUMMY_LEATHER_PRODUCTS.find((p) => p._id === id);
    if (dummy) {
      setProduct(dummy);
      if (dummy.colors?.length > 0) {
        setSelectedColor(dummy.colors[0].hex);
      }
      setError(null);
    } else {
      const fallback = DUMMY_LEATHER_PRODUCTS[0];
      if (fallback) {
        setProduct(fallback);
        if (fallback.colors?.length > 0) {
          setSelectedColor(fallback.colors[0].hex);
        }
        setError(null);
      } else {
        setError("Failed to load product data");
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) getProduct();
  }, [id, getProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor]);

  const showNotification = (message, type = "success") =>
    setAlertProps({ message, type, visible: true });
  const handleCloseAlert = () =>
    setAlertProps((prev) => ({ ...prev, visible: false }));

  const ensureUserId = async () => {
    if (userId) return userId;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`
      );
      const user = response.data?.newUser;
      const uid = user?.id || user?._id;
      if (!uid) throw new Error("Unable to create guest account");
      localStorage.setItem("user", JSON.stringify(user));
      setUserId(uid);
      return uid;
    } catch (e) {
      showNotification("Error creating guest account", "error");
      throw e;
    }
  };

  const addToCart = async (productId, redirect = false) => {
    setIsAddingToCart(true);
    try {
      const ensuredUserId = await ensureUserId();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/product/add-to-cart`,
        { productId, userId: ensuredUserId }
      );

      const selectedColorObj = product.colors?.find(
        (c) => c.hex === selectedColor
      );
      if (selectedColorObj) {
        dispatch(
          setColorSelection({
            productId,
            color: { name: selectedColorObj.name, hex: selectedColorObj.hex },
          })
        );
      }
      showNotification("Added to your shopping cart!", "success");
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
      window.dispatchEvent(new Event("cart-updated"));

      if (redirect) {
        navigate("/checkout");
      }
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Error adding to cart",
        "error"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-3 border-[#9B5A2B] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs uppercase tracking-widest font-bold text-[#8C867C]">
          Curating Atelier Piece...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-bold text-[#0D0C0B] uppercase tracking-wider mb-2">
          {error || "Product Not Found"}
        </p>
        <button
          onClick={() => navigate("/all-products")}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#0D0C0B] text-white text-xs font-bold uppercase tracking-wider"
        >
          Explore All Goods
        </button>
      </div>
    );
  }

  const currentColorObj =
    product.colors?.find((c) => c.hex === selectedColor) ||
    product.colors?.[0] ||
    null;

  const currentImages =
    currentColorObj?.images?.length > 0
      ? currentColorObj.images
      : product.img?.length > 0
      ? product.img
      : product.images?.length > 0
      ? product.images
      : [
          "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=800",
        ];

  const hasDiscount = product.price > product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : currentImages.length - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev < currentImages.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-28 sm:pt-36 pb-28 md:pb-20 text-[#0D0C0B]">
      {alertProps.visible && (
        <AlertMessage
          message={alertProps.message}
          type={alertProps.type}
          onClose={handleCloseAlert}
          duration={3500}
          showCloseButton
        />
      )}

      {/* 2-Click Instant Order Bottom Drawer */}
      <QuickOrderDrawer
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={product}
        selectedColorHex={selectedColor}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Breadcrumbs */}
        <div className="text-xs text-[#8C867C] font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
          <span
            onClick={() => navigate("/")}
            className="hover:text-[#0D0C0B] cursor-pointer"
          >
            Atelier
          </span>
          <span>/</span>
          <span
            onClick={() => navigate(`/products/${product.category || "all"}`)}
            className="hover:text-[#0D0C0B] cursor-pointer"
          >
            {product.category || "Leather Goods"}
          </span>
          <span>/</span>
          <span className="text-[#0D0C0B] truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        {/* Main Grid: Gallery on left, Info on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-14 items-start">
          {/* ── Left: Image Gallery ── */}
          <div className="flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#E8E2D6] flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
              {/* Badges */}
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                {hasDiscount && discountPercent > 0 && (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#9B5A2B] text-white px-3 py-1 rounded-full shadow-sm">
                    Save {discountPercent}%
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#0D0C0B] text-white px-3 py-1 rounded-full">
                  100% Full-Grain
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullScreenImage(true)}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-white/90 border border-[#E3DDCF] shadow-sm text-[#0D0C0B] hover:bg-white transition cursor-pointer"
                aria-label="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Navigation Arrows for Mobile & Desktop */}
              {currentImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 border border-[#E3DDCF] shadow-md text-[#0D0C0B] hover:bg-white active:scale-95 transition cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 border border-[#E3DDCF] shadow-md text-[#0D0C0B] hover:bg-white active:scale-95 transition cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Main Animated Photo (1:1 aspect-square filled) */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${selectedColor}-${selectedImageIndex}`}
                  src={currentImages[selectedImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white p-1 border transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-[#0D0C0B] ring-2 ring-[#0D0C0B]/20 scale-105"
                        : "border-[#E8E2D6] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Details & Actions ── */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-6">
              {/* Rating & Stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#0D0C0B]">4.9</span>
                  <span className="text-xs text-[#8C867C]">(48 reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>In Stock · Ready to Dispatch</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D0C0B] tracking-tight leading-tight font-[var(--font-display)]">
                  {product.name}
                </h1>
                {product.tagline && (
                  <p className="text-sm text-[#736E66] mt-2 font-normal">
                    {product.tagline}
                  </p>
                )}
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0D0C0B]">
                    Rs.{" "}
                    {(
                      product.discountPrice || product.price
                    )?.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base text-[#A39D93] line-through font-medium">
                      Rs. {product.price?.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9B5A2B]">
                  Free Delivery Across Pakistan
                </span>
              </div>

              {/* Color Swatch Selector */}
              {product.colors?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
                    <span className="text-[#736E66]">
                      Selected Tone:{" "}
                      <span className="text-[#0D0C0B]">
                        {currentColorObj?.name || "Natural Leather"}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color.hex;
                      return (
                        <button
                          key={color._id || color.hex}
                          type="button"
                          onClick={() => setSelectedColor(color.hex)}
                          className={`w-9 h-9 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-[#0D0C0B] ring-offset-white scale-110"
                              : "opacity-80 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Desktop Direct CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* 2-Click COD Instant Buy */}
                <button
                  type="button"
                  onClick={() => setIsQuickOrderOpen(true)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#0D0C0B] text-white font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2.5 hover:bg-[#2A2621] transition active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#D8AF72] fill-[#D8AF72]" />
                  <span>Instant 2-Click Order (COD)</span>
                </button>

                {/* Add To Cart */}
                <button
                  type="button"
                  onClick={() => addToCart(product._id, false)}
                  disabled={isAddingToCart}
                  className={`py-4 px-6 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    addedSuccess
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-[#FAF8F5] text-[#0D0C0B] border-[#E3DDCF] hover:bg-[#EFECE5]"
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Atelier Hallmark Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#F0EBE1]">
                <div className="flex items-center gap-2 text-xs text-[#524D45]">
                  <Truck className="w-4 h-4 text-[#9B5A2B] shrink-0" />
                  <span>Open Parcel Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#524D45]">
                  <ShieldCheck className="w-4 h-4 text-[#9B5A2B] shrink-0" />
                  <span>10-Year Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#524D45]">
                  <RotateCcw className="w-4 h-4 text-[#9B5A2B] shrink-0" />
                  <span>7-Day Return Guarantee</span>
                </div>
              </div>
            </div>

            {/* Product Specifications & Leather Craft Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              <h3 className="text-lg font-bold text-[#0D0C0B] font-[var(--font-display)]">
                Craftsmanship & Specs
              </h3>
              <p className="text-sm text-[#736E66] leading-relaxed">
                {product.description ||
                  "Handcrafted from thick, vegetable-tanned full-grain cowhide that breathes and develops a deep, rich patina with every journey. Stitched with bonded nylon thread and edges hand-finished with natural carnauba beeswax."}
              </p>

              {product.technicalSpecs && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F0EBE1] text-xs">
                  {Object.entries(product.technicalSpecs).map(([key, val]) => (
                    <div key={key}>
                      <span className="font-bold text-[#0D0C0B] capitalize block">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-[#736E66]">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <Reviews selectedProduct={product.name} />
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM ACTION BAR (Thumb Friendly) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E2D6] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C867C] block leading-none">
              Cash on Delivery
            </span>
            <span className="text-lg font-extrabold text-[#0D0C0B] leading-tight">
              Rs. {(product.discountPrice || product.price)?.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addToCart(product._id, false)}
              className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3DDCF] text-[#0D0C0B] active:scale-95"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsQuickOrderOpen(true)}
              className="py-3 px-5 rounded-xl bg-[#0D0C0B] text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#D8AF72] fill-[#D8AF72]" />
              <span>Instant Buy (COD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Lightbox Modal ── */}
      <AnimatePresence>
        {isFullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setIsFullScreenImage(false)}
          >
            <button
              type="button"
              onClick={() => setIsFullScreenImage(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentImages[selectedImageIndex]}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDisplay;
