import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    organizationName: "",
    organizationCode: "",
    agreeToTerms: false,
  });
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 2)
      return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500" };
    if (passwordStrength < 4)
      return {
        label: "Fair",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
      };
    return {
      label: "Strong",
      color: "text-green-500",
      bgColor: "bg-green-500",
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "admin" && !formData.organizationName.trim()) {
      newErrors.organizationName = "Organization Name is required";
    }

    if (formData.role === "staff" && !formData.organizationCode.trim()) {
      newErrors.organizationCode = "Organization Join Code is required";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (touched[name]) {
      validateForm();
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organizationName: formData.organizationName,
        organizationCode: formData.organizationCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data.message.includes("successfully")) {
          alert(data.message);
          navigate("/login");
        } else {
          alert(data.message || "Registration failed");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error:", error);
        alert("Registration failed. Please check details.");
      });
  };

  const strengthLabel = getPasswordStrengthLabel();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 py-12 transition-colors duration-300 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {/* Registration Card */}
        <div className="bg-white dark:bg-slate-900 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95 rounded-2xl shadow-xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-900/50">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                InvHub
              </h2>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Get Started
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Create your InvHub account in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role / Onboarding selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Join Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "admin",
                      organizationCode: "",
                    })
                  }
                  className={`py-3 rounded-lg font-semibold text-sm transition-all duration-200 border ${
                    formData.role === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Admin (Create Org)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "staff",
                      organizationName: "",
                    })
                  }
                  className={`py-3 rounded-lg font-semibold text-sm transition-all duration-200 border ${
                    formData.role === "staff"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Staff (Join Org)
                </button>
              </div>
            </div>

            {/* Organization Name Input for Admin */}
            {formData.role === "admin" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.organizationName && errors.organizationName
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="e.g. Gourmet Bistro"
                  required
                />
                {touched.organizationName && errors.organizationName && (
                  <p className="text-red-500 text-sm mt-2">
                    ⚠️ {errors.organizationName}
                  </p>
                )}
              </div>
            )}

            {/* Organization Join Code Input for Staff */}
            {formData.role === "staff" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Organization Join Code *
                </label>
                <input
                  type="text"
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.organizationCode && errors.organizationCode
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="e.g. INV-48291"
                  required
                />
                {touched.organizationCode && errors.organizationCode && (
                  <p className="text-red-500 text-sm mt-2">
                    ⚠️ {errors.organizationCode}
                  </p>
                )}
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.fullName && errors.fullName
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.fullName}
                </p>
              )}
              {touched.fullName && !errors.fullName && formData.fullName && (
                <p className="text-green-500 text-sm mt-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Looks good!
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.email && errors.email
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="you@company.com"
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.email}
                </p>
              )}
              {touched.email && !errors.email && formData.email && (
                <p className="text-green-500 text-sm mt-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Email looks good!
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.password && errors.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${strengthLabel.color}`}
                    >
                      {strengthLabel.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${strengthLabel.bgColor}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.confirmPassword}
                </p>
              )}
              {touched.confirmPassword &&
                !errors.confirmPassword &&
                formData.confirmPassword && (
                  <p className="text-green-500 text-sm mt-2 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Passwords match!
                  </p>
                )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 mt-1"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-3 text-sm text-slate-600 dark:text-slate-300"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="text-red-500 text-sm flex items-center">
                <span className="mr-1">⚠️</span> {errors.agreeToTerms}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group mt-6 shadow-sm hover:shadow"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Or
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition"
              >
                Sign in here
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-center text-slate-500">
              Your account is secure and encrypted. We take your privacy
              seriously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
