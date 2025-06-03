import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function LoginGoogle({ setUser, backendUrl }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);

  // Determine backend URL - use prop first, then environment variable, then fallback
  const getBackendUrl = useCallback(() => {
    return backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }, [backendUrl]);

  // Handle different OAuth error types
  const handleOAuthError = useCallback((error) => {
    setIsProcessing(false);

    let message;
    switch (error) {
      case "access_denied":
        message = "Google login was cancelled. Please try again.";
        break;
      case "oauth_failed":
        message = "Google authentication failed. Please try again.";
        break;
      case "no_user":
        message = "No user account found. Please sign up first.";
        // Special handling for no_user to redirect to signup
        toast.error(message);
        setTimeout(() => {
          navigate("/signup", { replace: true });
        }, 2000);
        return; // Exit early to prevent default redirect to login
      case "callback_failed":
        message = "Login process failed. Please try again.";
        break;
      case "invalid_request":
        message = "Invalid login request. Please try again.";
        break;
      case "server_error":
        message = "Server error occurred. Please try again later.";
        break;
      default:
        message = "Authentication error occurred. Please try again.";
    }
    toast.error(message);

    // Redirect to login after error (except for no_user case, handled above)
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  }, [navigate]);

  // Validate token with backend
  const validateToken = useCallback(async (token) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid === true;
      }

      // If response is not OK, log status and text for debugging
      console.error(`Token validation failed with status: ${response.status}, message: ${await response.text()}`);
      return false;
    } catch (error) {
      console.error("Token validation error:", error);
      // In case of network error or endpoint not existing, default to true if the primary goal is just to proceed
      // However, for security, it's safer to treat it as invalid if validation fails.
      // Removed the 'return true' fallback to enforce validation.
      return false;
    }
  }, [getBackendUrl]);


  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");
        const userId = urlParams.get("userId");
        const userEmail = urlParams.get("email");
        const userName = urlParams.get("name");

        // Clean up URL immediately to prevent token exposure in history
        window.history.replaceState({}, document.title, window.location.pathname);

        if (error) {
          handleOAuthError(error);
          return;
        }

        if (token) {
          const isValidToken = await validateToken(token);

          if (isValidToken) {
            localStorage.setItem("token", token);

            // Store additional user info if available
            if (userId || userEmail || userName) {
              const userInfo = {
                id: userId,
                email: userEmail,
                name: userName
              };
              localStorage.setItem("userInfo", JSON.stringify(userInfo));
            }

            // Update user state if the prop is provided
            if (setUser) {
              setUser(token);
            }

            toast.success("Google login successful!");

            const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin"); // Clear redirect preference

            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 1000);
          } else {
            // Token was present but validation failed
            toast.error("Login failed: Invalid or expired token.");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 2000);
          }
        } else {
          // No token and no error - unexpected state, usually means direct access to callback
          toast.error("No authentication data received. Redirecting to login.");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error("OAuth callback processing error:", error);
        toast.error(error.message || "An unexpected error occurred during login.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [location.search, navigate, setUser, handleOAuthError, validateToken]); // Added dependencies

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          {isProcessing ? (
            <>
              <div className="mb-4" role="status" aria-live="polite"> {/* Added role and aria-live */}
                <svg
                  className="animate-spin h-8 w-8 text-red-500 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
              </div>
              <p className="text-gray-600">Processing your Google login...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
            </>
          ) : (
            <>
              {/* This section will only show if isProcessing is false after an error or if the initial state isn't caught */}
              <div className="mb-4" role="status" aria-live="polite">
                <svg
                  className="h-8 w-8 text-red-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Redirecting...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default LoginGoogle;