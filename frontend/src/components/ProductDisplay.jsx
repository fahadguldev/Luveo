// import { useState, useEffect, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaShoppingCart, FaExpand, FaCheck, FaAngleUp, FaAngleDown } from 'react-icons/fa';

// import Reviews from "./random/Reviews";
// import AlertMessage from "./Alert";
// import { setColorSelection } from "../store/cartSlice";

// const ProductDisplay = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [product, setProduct] = useState(null);
//     const [selectedColor, setSelectedColor] = useState(null);
//     const [quantity, setQuantity] = useState(1);
//     const [isFullScreenImage, setIsFullScreenImage] = useState(false);

//     // Status states
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [userId, setUserId] = useState(null);
//     const [isAddingToCart, setIsAddingToCart] = useState(false);
//     const [isBuyingNow, setIsBuyingNow] = useState(false);

//     // Image gallery state
//     const [selectedImageIndex, setSelectedImageIndex] = useState(0);

//     // Alert state
//     const [alertProps, setAlertProps] = useState({ message: "", type: "success", visible: false });

//     // Initialize user
//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             try {
//                 const user = JSON.parse(storedUser);
//                 setUserId(user?.id || user?._id || "");
//             } catch (e) { console.error(e); }
//         }
//     }, []);

//     // Fetch product
//     const getProduct = useCallback(async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/product/get-product/${id}`);
//             const productData = response.data.product;
//             setProduct(productData);
//             if(productData.colors?.length > 0) setSelectedColor(productData.colors[0].hex);
//             setLoading(false);
//         } catch (error) {
//             console.error("Error fetching product:", error);
//             setError("Failed to load product data");
//             setLoading(false);
//         }
//     }, [id]);

//     useEffect(() => { if (id) getProduct(); }, [id, getProduct]);

//     // Scroll to top when product loads
//     useEffect(() => {
//         window.scrollTo(0, 0);
//     }, [id]);

//     // Reset image index when color changes
//     useEffect(() => {
//         setSelectedImageIndex(0);
//     }, [selectedColor]);

//     // Helpers
//     const showNotification = (message, type = "success") => setAlertProps({ message, type, visible: true });
//     const handleCloseAlert = () => setAlertProps(prev => ({ ...prev, visible: false }));

//     const ensureUserId = async () => {
//         if (userId) return userId;

//         try {
//             const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`);
//             const user = response.data?.newUser;
//             const id = user?.id || user?._id;

//             if (!id) throw new Error("Unable to create guest account");

//             localStorage.setItem("user", JSON.stringify(user));
//             setUserId(id);
//             return id;
//         } catch (error) {
//             showNotification("Error creating guest account", "error");
//             throw error;
//         }
//     };

//     const addToCart = async (productId, buyNow = false) => {
//         if (buyNow) setIsBuyingNow(true); else setIsAddingToCart(true);

//         try {
//             const ensuredUserId = await ensureUserId();
//             await axios.post(`${import.meta.env.VITE_BACKEND_URL}/product/add-to-cart`, { productId, userId: ensuredUserId });

//             // Store the selected color in Redux so checkout can read it
//             const selectedColorObj = product.colors?.find(c => c.hex === selectedColor);
//             if (selectedColorObj) {
//                 dispatch(setColorSelection({
//                     productId,
//                     color: { name: selectedColorObj.name, hex: selectedColorObj.hex }
//                 }));
//             }

//             showNotification(
//                 buyNow ? "Product purchased successfully! Redirecting..." : "Added to cart successfully!",
//                 "success"
//             );
//             navigate(buyNow ? '/checkout' : '/profile');
//         } catch (error) {
//             showNotification(error.response?.data?.message || "Error adding to cart", "error");
//         } finally {
//             setIsAddingToCart(false); setIsBuyingNow(false);
//         }
//     };

//     // Images of the currently selected color
//     const currentImages = product?.colors?.find(c => c.hex === selectedColor)?.images || [];

//     const handlePrevImage = () => {
//        setSelectedImageIndex(prev => prev > 0 ? prev - 1 : currentImages.length - 1);
//     };

//     const handleNextImage = () => {
//        setSelectedImageIndex(prev => prev < currentImages.length - 1 ? prev + 1 : 0);
//     };

//     if (loading) return <div className="min-h-screen flex items-center justify-center p-8"><div className="w-12 h-12 border-2 border-t-black border-gray-200 rounded-full animate-spin"></div></div>;
//     if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-sans tracking-widest uppercase">{error}</div>;
//     if (!product) return <div className="min-h-screen flex items-center justify-center font-sans tracking-widest uppercase text-gray-500">Product not found</div>;

//     const discountPercentage = Math.round(((product.price - product.discountPrice) / product.price) * 100);

//     return (
//         <div className="bg-[#f7f7f7] min-h-screen pb-20 pt-32 md:pt-36">
//             {/* Alerts & Modals */}
//             {alertProps.visible && (
//                 <AlertMessage message={alertProps.message} type={alertProps.type} onClose={handleCloseAlert} duration={4000} showCloseButton />
//             )}

//             {/* Main Product Layout */}
//             <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-[clamp(40px,6vw,100px)] px-[clamp(20px,4vw,60px)] py-10 items-start">

//                 {/* ── Left Column: Media Gallery ── */}
//                 <div className="flex gap-6 h-[calc(100vh-120px)] sticky top-32 md:top-40">

//                     {/* Vertical Thumbnails */}
//                     <div className="flex flex-col gap-3 w-20 flex-shrink-0">
//                         <button onClick={handlePrevImage} className="bg-transparent border-none cursor-pointer py-2 text-[#0f0f0f] opacity-60 hover:opacity-100 transition-opacity">
//                             <FaAngleUp size={24} />
//                         </button>

//                         <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto hide-scrollbar">
//                            {currentImages.map((img, idx) => (
//                                <button
//                                   key={idx}
//                                   onClick={() => setSelectedImageIndex(idx)}
//                                   className={`w-full aspect-square bg-white p-2 rounded-md transition border ${selectedImageIndex === idx ? "border-[#0f0f0f]" : "border-[#e5e5e5] hover:border-gray-400"}`}
//                                >
//                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
//                                </button>
//                            ))}
//                         </div>

//                         <button onClick={handleNextImage} className="bg-transparent border-none cursor-pointer py-2 text-[#0f0f0f] opacity-60 hover:opacity-100 transition-opacity">
//                             <FaAngleDown size={24} />
//                         </button>
//                     </div>

//                     {/* Main Stage */}
//                     <div className="flex-1 bg-white rounded-2xl relative overflow-hidden flex items-center justify-center p-10 border border-black/5">
//                         <AnimatePresence mode="wait">
//                             <motion.img
//                                 key={`${selectedColor}-${selectedImageIndex}`}
//                                 initial={{ opacity: 0, x: 20 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 exit={{ opacity: 0, x: -20 }}
//                                 transition={{ duration: 0.3 }}
//                                 src={currentImages[selectedImageIndex]}
//                                 alt={product.name}
//                                 className="w-full h-full object-contain max-h-[75vh]"
//                             />
//                         </AnimatePresence>

//                         <button
//                             onClick={() => setIsFullScreenImage(true)}
//                             className="absolute top-4 right-4 bg-white border border-[#e5e5e5] p-3 rounded-full text-[#0f0f0f] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition"
//                         >
//                             <FaExpand />
//                         </button>
//                     </div>
//                 </div>


//                 {/* ── Right Column: Sticky Product Info ── */}
//                 <div className="pt-5">
//                     <div className="bg-white rounded-2xl px-[clamp(24px,4vw,40px)] py-[clamp(24px,4vw,40px)] shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative">

//                         {/* SALE Badge */}
//                         {product.price > product.discountPrice && (
//                             <div className="absolute -top-3 right-8 bg-[#e53945] text-white px-3.5 py-1.5 rounded-full font-sans text-sm font-bold tracking-[0.05em]">
//                                 SALE
//                             </div>
//                         )}

//                         {/* Reviews summary */}
//                         <div className="flex items-center gap-2 mb-4">
//                             <div className="flex gap-0.5 text-black text-base">
//                                 {Array(5).fill(0).map((_, i) => <span key={i}>★</span>)}
//                             </div>
//                             <span className="font-sans text-xs text-[#7a7a7a] underline cursor-pointer">
//                                 30 Reviews
//                             </span>
//                         </div>

//                         {/* Title & Tagline */}
//                         <h1 className="font-serif text-[clamp(2rem,3vw,2.5rem)] font-extrabold text-[#0f0f0f] mb-2 leading-tight">
//                             {product.name}
//                         </h1>
//                         <p className="font-sans text-base text-[#7a7a7a] mb-6">
//                             {product.tagline}
//                         </p>

//                         {/* Price */}
//                         <div className="flex items-baseline gap-4 mb-8">
//                             <span className="font-sans text-3xl font-extrabold text-[#0f0f0f]">
//                                 Rs.{product.discountPrice?.toLocaleString()}
//                             </span>
//                             {product.price > product.discountPrice && (
//                                 <span className="font-sans text-xl font-semibold text-[#bdbdbd] line-through">
//                                     Rs.{product.price?.toLocaleString()}
//                                 </span>
//                             )}
//                         </div>

//                         {/* Color Selector */}
//                         {product.colors?.length > 0 && (
//                             <div className="mb-8">
//                                 <p className="font-sans text-sm font-semibold mb-3 text-[#0f0f0f]">
//                                     Color: <span className="font-normal text-[#7a7a7a]">{product.colors.find(c => c.hex === selectedColor)?.name}</span>
//                                 </p>
//                                 <div className="flex gap-3">
//                                     {product.colors.map(color => (
//                                         <button
//                                             key={color._id}
//                                             onClick={() => setSelectedColor(color.hex)}
//                                             className={`w-9 h-9 rounded-full border-2 border-white transition outline ${selectedColor === color.hex ? "outline-2 outline-[#0f0f0f]" : "outline-1 outline-[#e5e5e5] hover:outline-gray-400"}`}
//                                             style={{ background: color.hex }}
//                                             title={color.name}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Fake Stock Indicator (Matches Waldor styling) */}
//                         <div className="mb-8">
//                             <p className="font-sans text-sm font-bold italic text-[#e53945] mb-2">
//                                 {product.stock > 0 ? `${Math.min(product.stock, 18)} in stock` : "Out of stock"}
//                             </p>
//                             <div className="h-1 bg-[#e0e0e0] w-full rounded overflow-hidden">
//                                 <div className={`h-full bg-[#4CAF50] ${product.stock > 0 ? "w-[70%]" : "w-0"}`} />
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col gap-4 mb-8">
//                             <button
//                                 onClick={() => addToCart(product._id, false)}
//                                 disabled={isAddingToCart || isBuyingNow || product.stock <= 0}
//                                 className="w-full py-4 rounded-lg bg-[#0f0f0f] text-white font-sans text-base font-bold transition hover:bg-[#1a1a1a] disabled:opacity-70 disabled:cursor-not-allowed"
//                             >
//                                 {isAddingToCart ? "Adding..." : "Add To Cart"}
//                             </button>

//                             <button
//                                 onClick={() => addToCart(product._id, true)}
//                                 disabled={isAddingToCart || isBuyingNow || product.stock <= 0}
//                                 className="w-full py-4 rounded-lg bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] text-[#0f0f0f] font-sans text-base font-bold border border-[#d4d4d4] transition hover:from-[#ebebeb] hover:to-[#d5d5d5] disabled:opacity-70 disabled:cursor-not-allowed"
//                             >
//                                 {isBuyingNow ? "Processing..." : "Buy It Now"}
//                             </button>
//                         </div>

//                         {/* Features / Pitch */}
//                         <p className="font-sans text-sm text-[#0f0f0f] leading-6 mb-6">
//                             The simplicity paradox — do less, deliver more. {product.tagline} Perfects the user flow and integrates seamlessly into your daily carry.
//                         </p>

//                         <a href="#product-details" className="font-sans text-sm text-[#0f0f0f] underline font-semibold">
//                             Show More
//                         </a>
//                     </div>
//                 </div>
//             </div>

//             <div id="product-details" className="py-10" />

//             {/* Bottom Content Area */}
//             <div className="max-w-[1080px] mx-auto px-[clamp(20px,4vw,40px)]">

//                 {/* Product Overview & Specs Accordion style */}
//                 <div className="bg-white rounded-2xl p-10 mb-14 border border-[#e5e5e5]">
//                      <h2 className="font-serif text-[1.8rem] font-bold mb-6 text-[#0f0f0f]">Features & Specs</h2>
//                      <p className="font-sans text-base leading-7 text-[#7a7a7a] mb-8">
//                          {product.description}
//                      </p>

//                      {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
//                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 border-t border-[#e5e5e5] pt-8">
//                              {Object.entries(product.technicalSpecs).map(([key, value]) => (
//                                  <div key={key}>
//                                      <p className="font-sans text-xs font-bold text-[#0f0f0f] capitalize mb-1">
//                                          {key.replace(/([A-Z])/g, ' $1')}
//                                      </p>
//                                      <p className="font-sans text-sm text-[#7a7a7a]">
//                                          {value}
//                                      </p>
//                                  </div>
//                              ))}
//                          </div>
//                      )}
//                 </div>

//                 {/* Reviews Section */}
//                 <Reviews selectedProduct={product.name}/>
//             </div>

//             {/* Full Screen Image Modal */}
//             {isFullScreenImage && (
//                 <div className="fixed inset-0 bg-white/95 z-[1000] flex items-center justify-center p-10">
//                     <button
//                         className="absolute top-6 right-6 bg-transparent border-none text-3xl cursor-pointer text-[#0f0f0f]"
//                         onClick={() => setIsFullScreenImage(false)}
//                     >
//                         ×
//                     </button>
//                     <img
//                         src={currentImages[selectedImageIndex]}
//                         alt={product.name}
//                         className="max-w-full max-h-full object-contain"
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProductDisplay;
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpand, FaAngleUp, FaAngleDown, FaAngleLeft, FaAngleRight, FaTimes } from 'react-icons/fa';

import Reviews from "./random/Reviews";
import AlertMessage from "./Alert";
import { setColorSelection } from "../store/cartSlice";

const ProductDisplay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [alertProps, setAlertProps] = useState({ message: "", type: "success", visible: false });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserId(user?.id || user?._id || "");
            } catch (e) { console.error(e); }
        }
    }, []);

    const getProduct = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/product/get-product/${id}`);
            const productData = response.data.product;
            setProduct(productData);
            if (productData.colors?.length > 0) setSelectedColor(productData.colors[0].hex);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching product:", error);
            setError("Failed to load product data");
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { if (id) getProduct(); }, [id, getProduct]);

    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    useEffect(() => { setSelectedImageIndex(0); }, [selectedColor]);

    const showNotification = (message, type = "success") => setAlertProps({ message, type, visible: true });
    const handleCloseAlert = () => setAlertProps(prev => ({ ...prev, visible: false }));

    const ensureUserId = async () => {
        if (userId) return userId;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`);
            const user = response.data?.newUser;
            const id = user?.id || user?._id;
            if (!id) throw new Error("Unable to create guest account");
            localStorage.setItem("user", JSON.stringify(user));
            setUserId(id);
            return id;
        } catch (error) {
            showNotification("Error creating guest account", "error");
            throw error;
        }
    };

    const addToCart = async (productId, buyNow = false) => {
        if (buyNow) setIsBuyingNow(true); else setIsAddingToCart(true);
        try {
            const ensuredUserId = await ensureUserId();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/product/add-to-cart`, { productId, userId: ensuredUserId });
            const selectedColorObj = product.colors?.find(c => c.hex === selectedColor);
            if (selectedColorObj) {
                dispatch(setColorSelection({
                    productId,
                    color: { name: selectedColorObj.name, hex: selectedColorObj.hex }
                }));
            }
            showNotification(
                buyNow ? "Product purchased successfully! Redirecting..." : "Added to cart successfully!",
                "success"
            );
            navigate(buyNow ? '/checkout' : '/profile');
        } catch (error) {
            showNotification(error.response?.data?.message || "Error adding to cart", "error");
        } finally {
            setIsAddingToCart(false); setIsBuyingNow(false);
        }
    };

    const currentImages = product?.colors?.find(c => c.hex === selectedColor)?.images || [];

    const handlePrevImage = () => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : currentImages.length - 1);
    const handleNextImage = () => setSelectedImageIndex(prev => prev < currentImages.length - 1 ? prev + 1 : 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-12 h-12 border-2 border-t-black border-gray-200 rounded-full animate-spin" />
        </div>
    );
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-sans tracking-widest uppercase">{error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-sans tracking-widest uppercase text-gray-500">Product not found</div>;

    const discountPercentage = Math.round(((product.price - product.discountPrice) / product.price) * 100);

    return (
        <div className="bg-[#f7f7f7] min-h-screen pb-20 pt-24 md:pt-32 lg:pt-36">

            {alertProps.visible && (
                <AlertMessage message={alertProps.message} type={alertProps.type} onClose={handleCloseAlert} duration={4000} showCloseButton />
            )}

            {/* ── Main Product Layout ── */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[clamp(20px,4vw,60px)] py-6 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 md:gap-[clamp(32px,5vw,80px)] items-start">

                    {/* ── Left Column: Media Gallery ── */}
                    <div>

                        {/* ─ Mobile Layout: Main image with side nav arrows ─ */}
                        <div className="md:hidden">
                            <div className="relative bg-white rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-black/5 aspect-square">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={`${selectedColor}-${selectedImageIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25 }}
                                        src={currentImages[selectedImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </AnimatePresence>

                                {/* Prev / Next arrows */}
                                {currentImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white border border-[#e5e5e5] p-2.5 rounded-full shadow-sm text-[#0f0f0f] active:scale-95 transition"
                                        >
                                            <FaAngleLeft size={16} />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-[#e5e5e5] p-2.5 rounded-full shadow-sm text-[#0f0f0f] active:scale-95 transition"
                                        >
                                            <FaAngleRight size={16} />
                                        </button>
                                    </>
                                )}

                                {/* Expand button */}
                                <button
                                    onClick={() => setIsFullScreenImage(true)}
                                    className="absolute top-3 right-3 bg-white border border-[#e5e5e5] p-2.5 rounded-full text-[#0f0f0f] shadow-sm active:scale-95 transition"
                                >
                                    <FaExpand size={14} />
                                </button>
                            </div>

                            {/* Dot indicator */}
                            {currentImages.length > 1 && (
                                <div className="flex justify-center gap-1.5 mt-3">
                                    {currentImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`rounded-full transition-all ${selectedImageIndex === idx ? "w-4 h-1.5 bg-[#0f0f0f]" : "w-1.5 h-1.5 bg-[#d0d0d0]"}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Horizontal thumbnail strip */}
                            {currentImages.length > 1 && (
                                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                                    {currentImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`flex-shrink-0 w-16 h-16 bg-white p-1.5 rounded-lg border transition ${selectedImageIndex === idx ? "border-[#0f0f0f]" : "border-[#e5e5e5]"}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─ Desktop Layout: Vertical thumbnails + sticky stage ─ */}
                        <div className="hidden md:flex gap-4 lg:gap-6 sticky top-32 lg:top-40" style={{ height: 'calc(100vh - 160px)' }}>

                            {/* Vertical Thumbnails */}
                            <div className="flex flex-col gap-3 w-16 lg:w-20 flex-shrink-0">
                                <button
                                    onClick={handlePrevImage}
                                    className="bg-transparent border-none cursor-pointer py-2 text-[#0f0f0f] opacity-60 hover:opacity-100 transition-opacity flex justify-center"
                                >
                                    <FaAngleUp size={20} />
                                </button>

                                <div className="flex flex-col gap-2 flex-1 overflow-y-auto hide-scrollbar">
                                    {currentImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`w-full aspect-square bg-white p-1.5 lg:p-2 rounded-md transition border ${selectedImageIndex === idx ? "border-[#0f0f0f]" : "border-[#e5e5e5] hover:border-gray-400"}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNextImage}
                                    className="bg-transparent border-none cursor-pointer py-2 text-[#0f0f0f] opacity-60 hover:opacity-100 transition-opacity flex justify-center"
                                >
                                    <FaAngleDown size={20} />
                                </button>
                            </div>

                            {/* Main Stage */}
                            <div className="flex-1 bg-white rounded-2xl relative overflow-hidden flex items-center justify-center p-6 lg:p-10 border border-black/5">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={`${selectedColor}-${selectedImageIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        src={currentImages[selectedImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-contain max-h-[70vh]"
                                    />
                                </AnimatePresence>

                                <button
                                    onClick={() => setIsFullScreenImage(true)}
                                    className="absolute top-4 right-4 bg-white border border-[#e5e5e5] p-3 rounded-full text-[#0f0f0f] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition"
                                >
                                    <FaExpand />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Product Info ── */}
                    <div className="pt-0 md:pt-5">
                        <div className="bg-white rounded-2xl px-5 py-6 sm:px-7 sm:py-8 lg:px-[clamp(24px,4vw,40px)] lg:py-[clamp(24px,4vw,40px)] shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative">

                            {/* SALE Badge */}
                            {product.price > product.discountPrice && (
                                <div className="absolute -top-3 right-6 sm:right-8 bg-[#e53945] text-white px-3 py-1.5 rounded-full font-sans text-xs sm:text-sm font-bold tracking-[0.05em]">
                                    SALE
                                </div>
                            )}

                            {/* Reviews summary */}
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="flex gap-0.5 text-black text-sm sm:text-base">
                                    {Array(5).fill(0).map((_, i) => <span key={i}>★</span>)}
                                </div>
                                <span className="font-sans text-xs text-[#7a7a7a] underline cursor-pointer">30 Reviews</span>
                            </div>

                            {/* Title & Tagline */}
                            <h1 className="font-serif text-[clamp(1.6rem,5vw,2.5rem)] font-extrabold text-[#0f0f0f] mb-2 leading-tight">
                                {product.name}
                            </h1>
                            <p className="font-sans text-sm sm:text-base text-[#7a7a7a] mb-5 sm:mb-6">
                                {product.tagline}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#0f0f0f]">
                                    Rs.{product.discountPrice?.toLocaleString()}
                                </span>
                                {product.price > product.discountPrice && (
                                    <span className="font-sans text-lg sm:text-xl font-semibold text-[#bdbdbd] line-through">
                                        Rs.{product.price?.toLocaleString()}
                                    </span>
                                )}
                                {product.price > product.discountPrice && (
                                    <span className="font-sans text-sm font-bold text-[#e53945]">
                                        -{discountPercentage}%
                                    </span>
                                )}
                            </div>

                            {/* Color Selector */}
                            {product.colors?.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <p className="font-sans text-sm font-semibold mb-3 text-[#0f0f0f]">
                                        Color: <span className="font-normal text-[#7a7a7a]">{product.colors.find(c => c.hex === selectedColor)?.name}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                        {product.colors.map(color => (
                                            <button
                                                key={color._id}
                                                onClick={() => setSelectedColor(color.hex)}
                                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white transition outline ${selectedColor === color.hex ? "outline-2 outline-[#0f0f0f]" : "outline-1 outline-[#e5e5e5] hover:outline-gray-400"}`}
                                                style={{ background: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock Indicator */}
                            <div className="mb-6 sm:mb-8">
                                <p className="font-sans text-sm font-bold italic text-[#e53945] mb-2">
                                    {product.stock > 0 ? `${Math.min(product.stock, 18)} in stock` : "Out of stock"}
                                </p>
                                <div className="h-1 bg-[#e0e0e0] w-full rounded overflow-hidden">
                                    <div className={`h-full bg-[#4CAF50] ${product.stock > 0 ? "w-[70%]" : "w-0"}`} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <button
                                    onClick={() => addToCart(product._id, false)}
                                    disabled={isAddingToCart || isBuyingNow || product.stock <= 0}
                                    className="w-full py-3.5 sm:py-4 rounded-lg bg-[#0f0f0f] text-white font-sans text-sm sm:text-base font-bold transition hover:bg-[#1a1a1a] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isAddingToCart ? "Adding..." : "Add To Cart"}
                                </button>

                                <button
                                    onClick={() => addToCart(product._id, true)}
                                    disabled={isAddingToCart || isBuyingNow || product.stock <= 0}
                                    className="w-full py-3.5 sm:py-4 rounded-lg bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] text-[#0f0f0f] font-sans text-sm sm:text-base font-bold border border-[#d4d4d4] transition hover:from-[#ebebeb] hover:to-[#d5d5d5] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isBuyingNow ? "Processing..." : "Buy It Now"}
                                </button>
                            </div>

                            {/* Pitch copy */}
                            <p className="font-sans text-xs sm:text-sm text-[#0f0f0f] leading-6 mb-4 sm:mb-6">
                                The simplicity paradox — do less, deliver more. {product.tagline} Perfects the user flow and integrates seamlessly into your daily carry.
                            </p>

                            <a href="#product-details" className="font-sans text-sm text-[#0f0f0f] underline font-semibold">
                                Show More
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div id="product-details" className="py-6 md:py-10" />

            {/* ── Bottom Content Area ── */}
            <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-[clamp(20px,4vw,40px)]">

                {/* Features & Specs */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 mb-10 sm:mb-14 border border-[#e5e5e5]">
                    <h2 className="font-serif text-2xl sm:text-[1.8rem] font-bold mb-4 sm:mb-6 text-[#0f0f0f]">Features & Specs</h2>
                    <p className="font-sans text-sm sm:text-base leading-7 text-[#7a7a7a] mb-6 sm:mb-8">
                        {product.description}
                    </p>

                    {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
                        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-[#e5e5e5] pt-6 sm:pt-8">
                            {Object.entries(product.technicalSpecs).map(([key, value]) => (
                                <div key={key}>
                                    <p className="font-sans text-xs font-bold text-[#0f0f0f] capitalize mb-1">
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </p>
                                    <p className="font-sans text-sm text-[#7a7a7a]">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <Reviews selectedProduct={product.name} />
            </div>

            {/* ── Full Screen Image Modal ── */}
            <AnimatePresence>
                {isFullScreenImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-white/95 z-[1000] flex items-center justify-center p-6 sm:p-10"
                        onClick={() => setIsFullScreenImage(false)}
                    >
                        <button
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white border border-[#e5e5e5] p-2.5 sm:p-3 rounded-full text-[#0f0f0f] shadow-sm z-10 active:scale-95 transition"
                            onClick={() => setIsFullScreenImage(false)}
                        >
                            <FaTimes size={16} />
                        </button>

                        {/* Prev/Next in fullscreen */}
                        {currentImages.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white border border-[#e5e5e5] p-3 rounded-full text-[#0f0f0f] shadow-sm z-10 active:scale-95 transition"
                                    onClick={e => { e.stopPropagation(); handlePrevImage(); }}
                                >
                                    <FaAngleLeft size={18} />
                                </button>
                                <button
                                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white border border-[#e5e5e5] p-3 rounded-full text-[#0f0f0f] shadow-sm z-10 active:scale-95 transition"
                                    onClick={e => { e.stopPropagation(); handleNextImage(); }}
                                >
                                    <FaAngleRight size={18} />
                                </button>
                            </>
                        )}

                        <motion.img
                            key={selectedImageIndex}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            src={currentImages[selectedImageIndex]}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                            onClick={e => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDisplay;