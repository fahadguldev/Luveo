import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Lock,
} from "lucide-react";
import { clearColorSelections } from "../store/cartSlice";

const validateForm = (data) => {
  const errors = {};
  if (!data.name.trim()) errors.name = "Full name is required";
  if (!data.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Normalize local phone number if entered with leading 0
  let phone = data.phone.trim();
  if (phone.startsWith("0") && phone.length === 11) {
    phone = phone.replace(/^0/, "+92");
  }

  if (!phone) {
    errors.phone = "Phone / WhatsApp number is required";
  } else if (!/^\+?[0-9\s-()]{7,16}$/.test(phone)) {
    errors.phone = "Please enter a valid mobile number";
  }
  if (!data.address.trim()) errors.address = "Complete street address is required";
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.province.trim()) errors.province = "Province is required";
  return errors;
};

export const Checkout = () => {
  const dispatch = useDispatch();
  const colorSelections = useSelector((state) => state.cart.colorSelections);

  const [cartProducts, setCartProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Lahore",
    province: "Punjab",
    postalCode: "54000",
    country: "Pakistan",
    orderNotes: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  // Calculate order total when cart products change
  useEffect(() => {
    if (cartProducts.length > 0) {
      const total = cartProducts.reduce((sum, product) => {
        const price = product.discountPrice || product.price || 0;
        return sum + price * (product.quantity || 1);
      }, 0);
      setOrderTotal(total);
    } else {
      setOrderTotal(0);
    }
  }, [cartProducts]);

  // Fetch user data & cart products
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem("user");
      let currentUserId = null;
      let userData = null;

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          userData = parsed.user || parsed;
          currentUserId = userData.id || userData._id;
          setUserId(currentUserId);
        } catch (e) {
          console.error(e);
        }
      }

      // Check saved shipping info
      const savedShipping = JSON.parse(
        localStorage.getItem("shippingAddress") || "{}"
      );
      if (savedShipping.name) {
        setFormData((prev) => ({
          ...prev,
          name: savedShipping.name || prev.name,
          phone: savedShipping.phone || prev.phone,
          address: savedShipping.address || prev.address,
          city: savedShipping.city || prev.city,
          province: savedShipping.province || prev.province,
          email: savedShipping.email || prev.email,
        }));
      } else if (userData) {
        setFormData((prev) => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          address: userData.address || prev.address,
          city: userData.city || prev.city,
          province: userData.province || prev.province,
        }));
      }

      // Fetch user profile from backend
      if (currentUserId) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/profile/${currentUserId}`
        );
        const profile = response.data?.user;
        if (profile) {
          setCartProducts(profile.cart || []);
        }
      }
    } catch {
      // Fallback: check localStorage cart
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (savedCart.length > 0) {
          setCartProducts(savedCart);
        }
      } catch (e) {
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const fetchUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        loading: false,
        error: "Geolocation is not supported by your browser",
        success: false,
      });
      return;
    }

    setLocationStatus({ loading: true, error: null, success: false });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lon }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en-US,en",
                "User-Agent": "LuveoLeatherStore",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const a = data.address;
              setFormData((prev) => ({
                ...prev,
                address:
                  [a.road, a.house_number, a.suburb].filter(Boolean).join(", ") ||
                  prev.address,
                city: a.city || a.town || a.village || prev.city,
                province: a.state || prev.province,
                postalCode: a.postcode || prev.postalCode,
              }));
            }
          }
        } catch {
          // ignore geocode error
        } finally {
          setLocationStatus({ loading: false, error: null, success: true });
        }
      },
      () => {
        setLocationStatus({
          loading: false,
          error: "Location access denied or unavailable",
          success: false,
        });
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("shippingAddress", JSON.stringify(formData));
    const randomRef = `LUV-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(randomRef);

    try {
      const orderData = {
        ...formData,
        userId: userId || "64e0f1e00000000000000001",
        orderedProducts: cartProducts.map((p) => {
          const sel = colorSelections[p._id];
          const color = sel
            ? p.colors?.find((c) => c.hex === sel.hex)
            : p.colors?.[0];
          return {
            productId: p._id,
            productName: p.name,
            productColor: color?.name || "",
            productColorHex: color?.hex || "",
            productQuantity: p.quantity || 1,
            productPrice: p.discountPrice || p.price,
            productImg: color?.images || p.img || [],
          };
        }),
        orderTotal,
        orderDate: new Date().toISOString(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkout`,
        orderData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.success) {
        setSubmitSuccess(true);
        dispatch(clearColorSelections());
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch {
      // Fallback local save if offline
      try {
        const localOrders = JSON.parse(
          localStorage.getItem("luveo_orders") || "[]"
        );
        localOrders.push({
          orderId: randomRef,
          items: cartProducts,
          total: orderTotal,
          date: new Date().toLocaleDateString(),
          customer: formData,
        });
        localStorage.setItem("luveo_orders", JSON.stringify(localOrders));
        setSubmitSuccess(true);
        dispatch(clearColorSelections());
        window.dispatchEvent(new Event("cart-updated"));
      } catch {
        setError("Unable to process order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-3 border-[#9B5A2B] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs uppercase tracking-widest font-bold text-[#8C867C]">
          Preparing Atelier Checkout...
        </p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E2D6] shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFECE5] border border-[#C6833E]/40 text-[#9B5A2B] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#9B5A2B]">
            Order Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D0C0B] mt-1 font-[var(--font-display)]">
            Thank You, {formData.name}!
          </h2>
          <p className="text-sm text-[#736E66] mt-2">
            Your piece is being prepared for dispatch. Your reference is{" "}
            <span className="font-bold text-[#0D0C0B]">{confirmedOrderId}</span>.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] text-left text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-[#0D0C0B]">
              <span>Payment Mode:</span>
              <span className="text-[#9B5A2B]">Cash on Delivery</span>
            </div>
            <div className="flex justify-between text-[#736E66]">
              <span>Total Payable:</span>
              <span className="font-bold text-[#0D0C0B]">
                Rs. {orderTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#736E66]">
              <span>Delivery Time:</span>
              <span>2 – 4 Working Days</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/923136852594?text=Hello! I placed order ${confirmedOrderId} for Rs. ${orderTotal}. Could you confirm my dispatch timeline?`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5D] transition"
            >
              <span>WhatsApp Atelier Concierge</span>
            </a>
            <Link
              to="/"
              className="w-full py-3 rounded-xl bg-[#0D0C0B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2A2621] transition"
            >
              Return to Atelier Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 sm:pt-36 pb-20 px-4 sm:px-8 lg:px-12 text-[#0D0C0B]">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAE4D7] text-[#9B5A2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Atelier Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D0C0B] tracking-tight font-[var(--font-display)]">
            Complete Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#736E66] mt-1">
            Complimentary shipping & Open Parcel Cash on Delivery across Pakistan.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          {/* ── Left: Shipping & Delivery Form ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1] mb-6">
              <h2 className="text-lg font-bold text-[#0D0C0B] font-[var(--font-display)]">
                Delivery Details
              </h2>
              <button
                type="button"
                onClick={fetchUserLocation}
                disabled={locationStatus.loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B5A2B] bg-[#FAF5EE] px-3 py-1.5 rounded-xl border border-[#EBDDC8] hover:bg-[#F2ECE0] transition cursor-pointer disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {locationStatus.loading ? "Detecting..." : "Auto-Fill Location"}
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Alexander Khan"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none ${
                    errors.name
                      ? "border-red-500"
                      : "border-[#E3DDCF] focus:border-[#9B5A2B]"
                  }`}
                />
                {errors.name && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="alex@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none ${
                      errors.email
                        ? "border-red-500"
                        : "border-[#E3DDCF] focus:border-[#9B5A2B]"
                    }`}
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none ${
                      errors.phone
                        ? "border-red-500"
                        : "border-[#E3DDCF] focus:border-[#9B5A2B]"
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                  Street Address & House # *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="House 42, Street 7, Block B, DHA Phase 5"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none ${
                    errors.address
                      ? "border-red-500"
                      : "border-[#E3DDCF] focus:border-[#9B5A2B]"
                  }`}
                />
                {errors.address && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* City, Province, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none ${
                      errors.city
                        ? "border-red-500"
                        : "border-[#E3DDCF] focus:border-[#9B5A2B]"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-semibold text-[#0D0C0B] outline-none cursor-pointer"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Pakistan"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DDCF] bg-[#EFECE5] text-xs font-bold text-[#736E66] outline-none opacity-80"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#736E66] block mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  name="orderNotes"
                  rows={2}
                  placeholder="Call before arrival / Ring door bell"
                  value={formData.orderNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B]"
                />
              </div>

              {/* Cash On Delivery Assurance Pill */}
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E8DCBF] flex items-start gap-3 mt-2">
                <Truck className="w-5 h-5 text-[#9B5A2B] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#0D0C0B] block">
                    Cash on Delivery (COD) with Open Parcel Privilege
                  </span>
                  <span className="text-[#736E66] mt-0.5 block">
                    Open your delivery parcel and inspect the 100% full-grain leather craftsmanship before paying the courier.
                  </span>
                </div>
              </div>

              {/* Mobile-Visible Confirm Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || cartProducts.length === 0}
                className="mt-3 w-full py-4 px-6 rounded-2xl bg-[#0D0C0B] text-white font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-3 hover:bg-[#2A2621] transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#C6833E]" />
                <span>
                  {isSubmitting
                    ? "Placing Atelier Order..."
                    : `Confirm COD Order · Rs. ${orderTotal.toLocaleString()}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* ── Right: Order Summary Sidebar ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-5">
            <h2 className="text-lg font-bold text-[#0D0C0B] font-[var(--font-display)] pb-3 border-b border-[#F0EBE1]">
              Order Summary ({cartProducts.length})
            </h2>

            {/* Cart Items List */}
            <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {cartProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8C867C]">
                  Your cart is currently empty.
                </div>
              ) : (
                cartProducts.map((item, idx) => {
                  const sel = colorSelections[item._id];
                  const color = sel
                    ? item.colors?.find((c) => c.hex === sel.hex)
                    : item.colors?.[0];
                  const img =
                    color?.images?.[0] ||
                    item.img?.[0] ||
                    item.images?.[0] ||
                    "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=600";
                  const price = item.discountPrice || item.price || 0;

                  return (
                    <div
                      key={item._id || idx}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#F0EBE1]"
                    >
                      <img
                        src={img}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-[#E8E2D6] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#0D0C0B] truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-[#8C867C] block">
                          Tone: {color?.name || "Natural Tan"} · Qty: {item.quantity || 1}
                        </span>
                        <span className="text-xs font-extrabold text-[#0D0C0B] mt-0.5 block">
                          Rs. {(price * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subtotals & Breakdown */}
            <div className="pt-4 border-t border-[#F0EBE1] flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-[#736E66]">
                <span>Atelier Subtotal:</span>
                <span className="font-semibold text-[#0D0C0B]">
                  Rs. {orderTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#736E66]">
                <span>Shipping (All Pakistan):</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-[#736E66]">
                <span>Payment Method:</span>
                <span className="font-semibold text-[#0D0C0B]">
                  Cash on Delivery
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#F0EBE1] text-base font-extrabold text-[#0D0C0B]">
                <span>Total Amount:</span>
                <span>Rs. {orderTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="pt-4 border-t border-[#F0EBE1] flex flex-col gap-2 text-[11px] text-[#8C867C]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9B5A2B]" />
                <span>100% Certified Full-Grain Cowhide Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9B5A2B]" />
                <span>Hand-burnished edges & 10-year stitch warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
