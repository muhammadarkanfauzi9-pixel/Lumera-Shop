'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Animasi input
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// ✅ Komponen Layout Login/Register
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  isLogin: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, isLogin }) => {
  return (
    <motion.div
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ y: "0", opacity: 1 }}
      exit={{ y: "100vh", opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
      className="relative w-full max-w-sm mx-auto min-h-[600px] bg-white shadow-2xl flex flex-col overflow-hidden"
      style={{ borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 rounded-b-[2.5rem]"></div>
        <div className="absolute inset-0 pattern-bg opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl font-extrabold flex items-center justify-center z-10">
          <span className="bg-white text-gray-900 px-3 py-1 rounded-md leading-none font-sans">D</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center p-8 pt-6 flex-grow">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 mt-4">{title}</h2>
        {children}
        <p className="mt-8 text-sm text-gray-500">
          {isLogin ? "Don't have any account?" : "Already have an account?"}{' '}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="text-gray-900 font-semibold hover:underline transition-colors"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

// ✅ Halaman Login
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi proses login
    setTimeout(() => {
      // Simpan profil user ke localStorage
      const userProfile = {
        name: email.split('@')[0] || "Guest User",
        image: "/images/avatar.jpg",
      };
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      // Redirect ke HomePage
      router.push('/');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <AuthLayout title="Login" isLogin={true}>
        <motion.form
          onSubmit={handleSubmit}
          className="w-full space-y-6"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {/* Input Email */}
          <motion.div variants={itemVariants}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-0 py-3 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-gray-700 placeholder-gray-400 text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          {/* Input Password */}
          <motion.div variants={itemVariants}>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-0 py-3 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-gray-700 placeholder-gray-400 text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          {/* Tombol Login */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gray-900 text-white p-4 rounded-xl font-semibold mt-12 text-lg shadow-md transition-all
              ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800 active:scale-[0.98]"}`}
            variants={itemVariants}
          >
            {isLoading ? "Logging in..." : "Login"}
          </motion.button>
        </motion.form>
      </AuthLayout>
    </div>
  );
}
