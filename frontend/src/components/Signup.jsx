import React, { useState, useEffect, useCallback } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function SignUp({ backendUrl }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Determine backend URL - use prop first, then environment variable, then fallback
  const getBackendUrl = useCallback(() => {
    return backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }, [backendUrl]);

  // Handle OAuth success/errors from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      toast.success("Google sign-up successful!");
      setTimeout(() => navigate("/", { replace: true }), 1000); // Use replace to avoid going back to callback URL
    } else if (error) {
      switch (error) {
        case "oauth_failed":
          toast.error("Google sign-up failed. Please try again.");
          break;
        case "no_user":
          toast.error("Sign-up failed. Please try again.");
          break;
        case "callback_failed":
          toast.error("Sign-up process failed. Please try again.");
          break;
        case "user_exists":
          toast.error("Account already exists. Please login instead.");
          break;
        default:
          toast.error("Authentication error occurred.");
      }
    }

    // Clean up URL parameters after processing
    if (token || error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, navigate]);

  // Fade in and loading skeleton timers
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeIn(true), 100);
    const loadTimer = setTimeout(() => setIsLoading(false), 1500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  // Handle navigating to login with fade out effect
  const handleLoginHere = useCallback((e) => {
    e.preventDefault();
    setFadeOut(true);
    setTimeout(() => navigate("/login"), 500);
  }, [navigate]);

  // Validate form inputs
  const validateForm = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return false;
    }
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!trimmedPassword) {
      toast.error("Please enter a password");
      return false;
    }
    if (trimmedPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    // Added specific checks for password complexity as per your original code's toast messages
    if (!/(?=.*[a-z])/.test(trimmedPassword)) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/(?=.*[A-Z])/.test(trimmedPassword)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/(?=.*\d)/.test(trimmedPassword)) {
      toast.error("Password must contain at least one number");
      return false;
    }
    return true;
  }, [name, email, password]);

  // Handle form submission for sign up
  const handleSignupSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = `${getBackendUrl()}/api/auth/signup`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include", // Include cookies for cross-origin requests
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Signup failed.");
      }

      if (data.success || data.token) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        toast.success(data.message || "Signup successful! You can now log in."); // Changed message to suggest login
        setFadeOut(true);

        // Clear form after successful submission
        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => navigate("/login", { replace: true }), 1000); // Redirect to login
      } else {
        throw new Error(data.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        toast.error("An account with this email already exists. Please login instead.");
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password, validateForm, getBackendUrl, navigate]);

  // Redirect to backend Google OAuth endpoint
  const handleGoogleSignupRedirect = useCallback(() => {
    try {
      const googleAuthUrl = `${getBackendUrl()}/api/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google redirect error:", error);
      toast.error("Failed to initiate Google sign-up");
    }
  }, [getBackendUrl]);

  return (
    <>
      <Toaster position="top-center" />
      <div
        className={`h-screen w-screen flex items-center justify-center bg-gray-100 transition-all duration-500 ease-in-out ${
          fadeOut ? "opacity-0" : fadeIn ? "opacity-100" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="w-full h-screen bg-white shadow-md rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Illustration */}
          <div className="relative hidden md:flex items-center justify-center bg-[#e0f7fa]">
            <div
              className="absolute top-4 left-6 flex items-center space-x-2 text-lg font-bold cursor-pointer"
              onClick={() => navigate("/home")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/home"); // Added space key for accessibility
              }}
              aria-label="Go to home page"
            >
              <img src="logo.png" alt="CRM_platform logo" className="h-6 w-6 object-contain" /> {/* Added alt text */}
              <span>CRM_platform</span>
            </div>
            <DotLottieReact
              src="https://lottie.host/1d0c9454-36a8-43ca-b948-f3c318fecb2a/QIXtsTAiD1.lottie"
              loop
              autoplay
              style={{ width: "80%", height: "80%" }}
              aria-label="Illustration of a person interacting with a CRM system" // More descriptive aria-label
            />
          </div>

          {/* Right Form */}
          <div className="p-10 md:p-20 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-5 animate-pulse" aria-busy="true" aria-live="polite">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div> {/* Added for password field */}
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Sign Up</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Already have an account?{" "}
                  <button
                    onClick={handleLoginHere}
                    className="text-red-500 font-semibold hover:underline focus:outline-none focus:underline"
                    aria-label="Navigate to login page"
                    type="button"
                  >
                    Login here!
                  </button>
                </p>

                <form onSubmit={handleSignupSubmit} className="space-y-5" noValidate>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="flex items-center border-b border-gray-300 py-2 focus-within:border-red-500 transition-colors">
                      <FiUser className="mr-2 text-gray-400" aria-hidden="true" /> {/* Added aria-hidden */}
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full outline-none"
                        required
                        aria-required="true"
                        aria-label="Full name"
                        autoComplete="name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center border-b border-gray-300 py-2 focus-within:border-red-500 transition-colors">
                      <FiMail className="mr-2 text-gray-400" aria-hidden="true" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full outline-none"
                        required
                        aria-required="true"
                        aria-label="Email address"
                        autoComplete="email"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="flex items-center border-b border-gray-300 py-2 focus-within:border-red-500 transition-colors">
                      <FiLock className="mr-2 text-gray-400" aria-hidden="true" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full outline-none"
                        required
                        aria-required="true"
                        aria-label="Password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-700 ml-2 focus:outline-none focus:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500" id="password-requirements"> {/* Added id for potential aria-describedby */}
                      Password must contain at least 6 characters with uppercase, lowercase, and numbers
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-500 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true" // Added aria-hidden for decorative icon
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        <span>Signing Up...</span>
                      </>
                    ) : (
                      <span>Sign Up</span>
                    )}
                  </button>
                </form>

                {/* Social Login */}
                <div className="text-center mt-6 text-sm text-gray-500">
                  or continue with
                  <div className="flex justify-center mt-3">
                    <button
                      onClick={handleGoogleSignupRedirect}
                      disabled={isSubmitting}
                      className={`flex items-center space-x-2 px-4 py-2 border rounded-full transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                      }`}
                      aria-label="Sign up with Google"
                      type="button"
                    >
                      <FcGoogle className="text-xl" aria-hidden="true" />
                      <span className="text-sm font-medium">continue with Google</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;