import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAsync,
  registerAsync,
  clearError,
  clearStatus,
} from "../../store/Auth/authSlice";

const MessageDisplay = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    "p-4 mb-6 rounded-lg flex items-center justify-between shadow-md border";
  const successClasses = "bg-green-50 border-green-300 text-green-800";
  const errorClasses = "bg-red-50 border-red-300 text-red-800";

  return (
    <div
      className={`${baseClasses} ${
        type === "error" ? errorClasses : successClasses
      }`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-xl font-bold opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

const Index = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { isAuthenticated, token, error, status, username } = useSelector(
    (state) => state.auth
  );

  console.log("Auth State:", { isAuthenticated, token, status, error });

  // Local form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  // local error state
  const [localError, setLocalError] = useState(null);

  // Auto-navigate on successful auth
  useEffect(() => {
    if (isAuthenticated && status === "succeeded") {
      const timer = setTimeout(() => {
        navigate("/chat");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Log local error updates
  useEffect(() => {
    console.log("Local error UPDATED:", localError);
  }, [localError]);

  // Reset form on toggle
  const handleToggleForm = useCallback(() => {
    setIsLoginForm((prev) => !prev);
    setFormData({ username: "", password: "", confirmPassword: "" });
  }, []);

  const validateForm = () => {
    if (!formData.username || !formData.password) return false;
    if (!isLoginForm) {
      if (formData.password !== formData.confirmPassword) return false;
      if (formData.password.length < 6) return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    try {
      await dispatch(
        loginAsync({
          username: formData.username,
          password: formData.password,
        })
      ).unwrap(); // <--- proper error handling
    } catch (err) {
      console.log("Login error:", err);
      setLocalError(err || "Invalid credentials");
    }
  };

  // Register Handler
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setLocalError("Please fill in all required fields correctly.");
      return;
    }

    try {
      await dispatch(
        registerAsync({
          username: formData.username,
          password: formData.password,
        })
      ).unwrap();
    } catch (err) {
      setLocalError(err || "Registration failed");
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLoginForm ? "Welcome Back" : "Join Us Today"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginForm
              ? "Sign in to continue chatting"
              : "Create an account to get started"}
          </p>
        </div>

        {/* Global Message */}
        {error && status !== "idle" && (
          <MessageDisplay
            message={error}
            type="error"
            onClose={() => {
              dispatch(clearError());
              dispatch(clearStatus());
            }}
          />
        )}

        {status === "succeeded" &&
          isAuthenticated && (
            <MessageDisplay
              message={`Welcome ${username}! Redirecting...`} // <-- Use Redux username
              type="success"
              onClose={() => {
                dispatch(clearError());
                dispatch(clearStatus());
              }}
            />
          )}

        {/* local error */}
        {localError && (
          <MessageDisplay
            message={localError}
            type="error"
            onClose={() => setLocalError(null)}
          />
        )}

        {/* Form */}
        <form
          onSubmit={isLoginForm ? handleLogin : handleRegister}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLoginForm ? "current-password" : "new-password"}
              required
              minLength={6}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder={
                isLoginForm ? "Enter password" : "Choose a strong password"
              }
              disabled={isLoading}
            />
          </div>

          {!isLoginForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition ${
              isLoginForm
                ? "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                {isLoginForm ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {isLoginForm ? (
                  <>
                    <LogIn className="w-5 h-5" /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" /> Create Account
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* toggle form button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleToggleForm}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
            disabled={isLoading}
          >
            {isLoginForm
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
