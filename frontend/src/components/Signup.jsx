import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ShieldCheck, ArrowRight, UserPlus, Sparkles } from "lucide-react";

export const Signup = () => {
  const { user, loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuestAcct = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/guest-signup`
      );
      const guestUser = response.data?.newUser;
      if (guestUser) {
        localStorage.setItem("user", JSON.stringify(guestUser));
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating guest account:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);

    if (formData.password !== formData.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/signup`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/profile");
    } catch (error) {
      setSignupError(
        error.response?.data?.message ||
          "An error occurred during signup. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate("/profile");
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-3 border-[#9B5A2B] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs uppercase tracking-widest font-bold text-[#8C867C]">
          Authenticating Atelier Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 sm:pt-36 pb-20 px-4 sm:px-6 flex items-center justify-center text-[#0D0C0B]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D6] shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DCBF] text-[#9B5A2B] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Membership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D0C0B] tracking-tight font-[var(--font-display)]">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#736E66] mt-1.5">
            Join Luveo for order tracking, bespoke monogramming, and private drops.
          </p>
        </div>

        {signupError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {signupError}
          </div>
        )}

        {/* Quick Social & Guest Buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => loginWithRedirect({ screen_hint: "signup" })}
            className="w-full py-3.5 px-4 rounded-xl border border-[#E3DDCF] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#0D0C0B] uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestAcct}
            className="w-full py-3 px-4 rounded-xl border border-transparent bg-[#FAF5EE] hover:bg-[#F2ECE0] text-xs font-semibold text-[#9B5A2B] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Continue as Guest (No Password)</span>
          </button>
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-[#E8E2D6]" />
          <span className="flex-shrink mx-4 text-[#8C867C] text-[11px] uppercase tracking-wider font-semibold">
            Or with email
          </span>
          <div className="flex-grow border-t border-[#E8E2D6]" />
        </div>

        {/* Regular Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold uppercase tracking-wider text-[#736E66] mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Alexander Khan"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B] focus:ring-1 focus:ring-[#9B5A2B] transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#736E66] mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B] focus:ring-1 focus:ring-[#9B5A2B] transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-[#736E66] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B] focus:ring-1 focus:ring-[#9B5A2B] transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-[#736E66] mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E3DDCF] bg-[#FAF8F5] text-xs font-medium text-[#0D0C0B] outline-none focus:border-[#9B5A2B] focus:ring-1 focus:ring-[#9B5A2B] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#0D0C0B] text-white font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 hover:bg-[#2A2621] transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 text-[#C6833E]" />
            <span>{isSubmitting ? "Creating Membership..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F0EBE1] text-center text-xs text-[#736E66]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#9B5A2B] hover:text-[#0D0C0B] underline ml-1"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8C867C]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9B5A2B]" />
          <span>Your information is protected & never shared.</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
