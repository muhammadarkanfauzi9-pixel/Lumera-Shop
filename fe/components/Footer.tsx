import Image from "next/image";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 px-6 py-8 mt-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h2 className="text-xl font-bold text-[#8C5A4E]">Lumera</h2>
          <p className="text-xs mt-2">
            Delicious food delivered with love. Enjoy fresh bites every day!
          </p>
          <div className="flex gap-3 mt-3">
            <Instagram size={18} />
            <Facebook size={18} />
            <Youtube size={18} />
            <Twitter size={18} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <ul className="space-y-1 text-xs">
            <li>About us</li>
            <li>Services</li>
            <li>Terms & Condition</li>
            <li>Our Blogs</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-xs">
            <li>Help center</li>
            <li>Money refund</li>
            <li>Terms and Policy</li>
            <li>Open dispute</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">For Users</h3>
          <ul className="space-y-1 text-xs">
            <li>User Login</li>
            <li>User Register</li>
            <li>Account Setting</li>
            <li>My Orders</li>
          </ul>

          <div className="mt-3 flex flex-col gap-2">
            <Image src="/images/appstore.png" alt="App Store" width={120} height={40} />
            <Image src="/images/googleplay.png" alt="Google Play" width={120} height={40} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-4 flex flex-col md:flex-row justify-between text-xs text-gray-500">
        <p>© 2025 Lumera. All rights reserved</p>
        <div className="flex gap-3 mt-2 md:mt-0">
          <span>Privacy & Cookies</span>
          <span>Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
