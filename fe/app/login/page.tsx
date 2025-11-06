// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Cookie, Eye, EyeOff, Mail, Lock } from "lucide-react";

// Varian untuk animasi input (muncul berurutan)
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// ===========================================
// LUMERA AUTH LAYOUT - WARM & COZY
// ===========================================
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  isLogin: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  isLogin,
}) => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4BC] via-[#E6D7C3] to-[#D4AF37]/10 flex">
      {/* Left Side - Artistic Food Illustration */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/5 to-[#654321]/10"></div>

        {/* Artistic Food Elements - Salty & Sweet Combination */}
        <div className="absolute top-16 left-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl opacity-80"
          >
            🥖
          </motion.div>
        </div>

        <div className="absolute top-32 right-20">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl opacity-75"
          >
            🍪
          </motion.div>
        </div>

        <div className="absolute top-48 left-32">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl opacity-70"
          >
            🧀
          </motion.div>
        </div>

        <div className="absolute bottom-32 right-12">
          <motion.div
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl opacity-80"
          >
            🥧
          </motion.div>
        </div>

        <div className="absolute bottom-20 left-20">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl opacity-65"
          >
            🥨
          </motion.div>
        </div>

        <div className="absolute top-64 left-16">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl opacity-70"
          >
            🍞
          </motion.div>
        </div>

        {/* Central Brand Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center"
          >
            <h1 className="text-7xl font-bold text-[#654321] mb-4 font-serif tracking-wide">
              Lumera
            </h1>
            <p className="text-2xl text-[#8B4513] font-medium italic mb-2">
              Lebih dari Sekedar Rasa
            </p>
            <p className="text-lg text-[#654321]/70 font-light">
              More than just taste
            </p>
          </motion.div>
        </div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-12 left-12 w-40 h-40 border-2 border-[#8B4513] rounded-full"></div>
          <div className="absolute top-40 right-24 w-28 h-28 border-2 border-[#654321] rounded-full"></div>
          <div className="absolute bottom-24 left-24 w-32 h-32 border-2 border-[#D4AF37] rounded-full"></div>
        </div>
      </motion.div>

      {/* Right Side - Form (No White Box) */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-4xl font-bold text-[#654321] mb-3 font-serif"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-[#8B4513] text-xl italic font-light"
            >
              Welcome back to Lumera! More than just taste.
            </motion.p>
          </div>

          {children}

          {/* Footer Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-8 text-center text-[#654321]/60 text-sm"
          >
            {isLogin ? "New to Lumera?" : "Already part of our family?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="text-[#8B4513] font-medium hover:text-[#654321] transition-colors"
            >
              {isLogin ? "Create account" : "Sign in here"}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
// ===========================================

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Normalize email to avoid casing/whitespace mismatches with backend
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(`http://localhost:5000/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token based on user type
      const tokenKey = data.user.type === "admin" ? "adminToken" : "userToken";
      localStorage.setItem(tokenKey, data.token);

      // Store user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect based on user type
      const redirectPath = data.user.type === "admin" ? "/admin" : "/";
      router.push(redirectPath);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" isLogin={true}>
      <motion.form
        onSubmit={handleSubmit}
        className="w-full space-y-6"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
      >
        {/* Social Login Buttons */}
        <motion.div variants={itemVariants} className="space-y-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-[#F4E4BC] text-[#654321] py-3 px-4 rounded-2xl font-medium text-sm border border-[#E6D7C3] hover:bg-[#E6D7C3] transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-[#4267B2] text-white py-3 px-4 rounded-2xl font-medium text-sm hover:bg-[#365899] transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            Continue with Facebook
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E6D7C3]"></div>
          <span className="text-[#8B4513] text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-[#E6D7C3]"></div>
        </motion.div>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Email */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B4513]/60" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3 bg-[#F4E4BC]/30 border border-[#E6D7C3] rounded-xl focus:outline-none focus:border-[#8B4513] focus:bg-white transition-all text-[#654321] placeholder-[#8B4513]/60 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B4513]/60" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 bg-[#F4E4BC]/30 border border-[#E6D7C3] rounded-xl focus:outline-none focus:border-[#8B4513] focus:bg-white transition-all text-[#654321] placeholder-[#8B4513]/60 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B4513]/60 hover:text-[#654321] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Sign In Button */}
        <motion.button
          type="submit"
          disabled={loading}
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#8B4513] text-white py-4 px-6 rounded-2xl font-semibold text-base hover:bg-[#654321] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Brewing your login..." : "Sign In"}
        </motion.button>

        {/* Demo Credentials */}
        <motion.div
          variants={itemVariants}
          className="text-center text-xs text-[#654321]/60 bg-[#F4E4BC]/20 p-3 rounded-xl"
        >
          <p className="font-medium mb-1">Demo Customer:</p>
          <p>Email: user@example.com</p>
          <p>Password: user123</p>
          <p className="mt-2 font-medium">Demo Admin:</p>
          <p>Email: admin@lumera.com</p>
          <p>Password: admin123</p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}
