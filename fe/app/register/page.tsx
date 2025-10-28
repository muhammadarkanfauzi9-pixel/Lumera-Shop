// app/register/page.tsx
'use client'; // WAJIB karena menggunakan hooks (useState) dan Framer Motion

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Varian untuk animasi input (muncul berurutan)
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// ===========================================
// FUNGSI AUTH LAYOUT (Dibawa ke sini)
// ===========================================
interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    isLogin: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, isLogin }) => {
    const router = useRouter();
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
                {/* Pola di Latar Belakang (Anda harus tambahkan gaya .pattern-bg di globals.css) */}
                <div className="absolute inset-0 pattern-bg opacity-70"></div> 
                
                {/* Tombol Kembali */}
                {!isLogin && (
                    <button 
                        onClick={() => router.push('/login')} 
                        className="absolute top-6 left-6 text-white text-3xl z-10 hover:text-gray-300 transition"
                        aria-label="Kembali"
                    >
                        &larr;
                    </button>
                )}
                
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
// ===========================================

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Register submitted');
    // Logika Register di sini
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <AuthLayout title="Sign Up" isLogin={false}>
        <motion.form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
        >
          {/* Input First Name */}
          <motion.div variants={itemVariants}>
            <input
              type="text"
              placeholder="First name"
              className="w-full px-0 py-3 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-gray-700 placeholder-gray-400 text-lg"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </motion.div>
          
          {/* Input Last Name (Placeholder saja) */}
          <motion.div variants={itemVariants}>
            <input
              type="text"
              placeholder="Last name"
              className="w-full px-0 py-3 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-gray-700 placeholder-gray-400 text-lg"
              required
            />
          </motion.div>

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

          {/* Input Confirm Password */}
          <motion.div variants={itemVariants}>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-0 py-3 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-gray-700 placeholder-gray-400 text-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </motion.div>
          
          {/* Tombol Sign Up */}
          <motion.button
            type="submit"
            className="w-full bg-gray-900 text-white p-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors mt-8 text-lg shadow-md"
            variants={itemVariants}
          >
            Sign Up
          </motion.button>
        </motion.form>
      </AuthLayout>
    </div>
  );
}