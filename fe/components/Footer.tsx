"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="bg-gradient-to-r from-[#F4E4BC] to-[#E6D7C3] text-[#654321] px-6 py-8 mt-8"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

        {/* Logo + Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <h2 className="text-xl font-bold text-[#8B4513]">Lumera</h2>
          <p className="text-xs mt-2 text-[#654321]/90">
            Delicious food delivered with love. Enjoy fresh bites every day!
          </p>
          <div className="flex gap-3 mt-3">
            {[
              { icon: Instagram, url: "https://www.instagram.com/lumera.verse/" },
              { icon: Facebook, url: "https://facebook.com/lumera" },
              { icon: Youtube, url: "https://youtube.com/@lumera" },
              { icon: Twitter, url: "https://twitter.com/lumera" },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <item.icon size={18} className="cursor-pointer" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <h3 className="font-semibold mb-2 text-[#8B4513]">About</h3>
          <ul className="space-y-1 text-xs text-[#654321]/80">
            {["About us", "Services", "Terms & Condition", "Our Blogs"].map((item, i) => (
              <motion.li key={i} whileHover={{ x: 5 }} className="cursor-pointer">
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <h3 className="font-semibold mb-2 text-[#8B4513]">Services</h3>
          <ul className="space-y-1 text-xs text-[#654321]/80">
            {["Help center", "Money refund", "Terms and Policy", "Open dispute"].map((item, i) => (
              <motion.li key={i} whileHover={{ x: 5 }} className="cursor-pointer">
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* For Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.7 }}
        >
          <h3 className="font-semibold mb-2 text-[#8B4513]">For users</h3>
          <ul className="space-y-1 text-xs text-[#654321]/80">
            {["User Login", "User Register", "Account Setting", "My Orders"].map((item, i) => (
              <motion.li key={i} whileHover={{ x: 5 }} className="cursor-pointer">
                {item}
              </motion.li>
            ))}
          </ul>

          <div className="mt-25 flex flex-col gap-2">
            {[].map((btn, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Image src={btn.src} alt={btn.alt} width={120} height={40} className="cursor-pointer" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="border-t border-[#D4AF37]/30 mt-6 pt-4 flex flex-col md:flex-row justify-between text-xs text-[#654321]/70"
      >
        <p>© 2025 Lumera. All rights reserved</p>
        <div className="flex gap-3 mt-5 md:mt-0 pb-6">
          <motion.span whileHover={{ scale: 1.05 }} className="cursor-pointer">
            Privacy & Cookies
          </motion.span>
          <motion.span whileHover={{ scale: 1.05 }} className="cursor-pointer">
            Accessibility
          </motion.span>
        </div>
      </motion.div>
    </motion.footer>
  );
}
