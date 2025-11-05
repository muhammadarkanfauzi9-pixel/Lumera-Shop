"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Edit3,
  LogOut,
  ChevronRight,
  Lock,
  ArrowLeft,
  Camera,
} from "lucide-react";
import { useUser } from "../context/UserContext";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    image: "/images/profile/avatar.png",
  });

  // ✅ Ambil data dari localStorage saat halaman dibuka
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setProfile({
        name: userData.name || "",
        email: userData.email || "",
        address: "", // Address not stored in user data, can be added later
        password: "", // Password should not be stored in plain text
        image: "/images/profile/avatar.png",
      });
    } else {
      // Redirect to login if no user data
      router.push("/login");
    }
  }, [router]);

  // ✅ back aman
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  // ✅ ubah foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const updated = { ...profile, image: imageURL };
      setProfile(updated);
      localStorage.setItem("userProfile", JSON.stringify(updated));
    }
  };

  // ✅ simpan edit
  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("✅ Profil berhasil disimpan!");
  };

  // ✅ logout (gunakan context untuk clear semua data auth)
  const { logout } = useUser();
  const handleLogout = () => {
    logout();
    router.push("/"); // Redirect ke home page setelah logout
  };

  return (
    <div className="min-h-screen bg-[#fff] flex flex-col items-center font-sans relative overflow-hidden">
      {/* 🍰 HEADER */}
      <div className="relative w-full h-40 bg-gradient-to-b from-[#6B3C2D] to-[#9B6C57] flex justify-center overflow-visible">
        {/* tombol back */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 p-2 bg-white/30 rounded-full text-white backdrop-blur-sm hover:bg-white/40 transition z-50"
        >
          <ArrowLeft size={18} />
        </button>

        {/* dekorasi */}
        <div className="absolute left-3 top-3 z-10 pointer-events-none">
          <Image
            src="/images/cakes/cake2.png"
            alt="Cake"
            width={90}
            height={90}
          />
        </div>
        <div className="absolute right-3 top-3 z-10 pointer-events-none">
          <Image
            src="/images/icecreams/ice cream.png"
            alt="Ice Cream"
            width={90}
            height={90}
          />
        </div>

        {/* avatar */}
        <div className="absolute -bottom-12 flex flex-col items-center z-20">
          <div className="relative">
            <Image
              src={profile.image}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-[20px] border-[4px] border-white shadow-lg object-cover"
            />
            {isEditing && (
              <>
                <label
                  htmlFor="fileUpload"
                  className="absolute bottom-2 right-2 bg-[#3A1F17] p-1.5 rounded-full cursor-pointer hover:bg-[#5B2D24]"
                >
                  <Camera size={14} color="#fff" />
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ⚪ FORM */}
      <div className="mt-20 w-[88%] max-w-sm bg-white space-y-5">
        {[
          { label: "Name", key: "name" as keyof typeof profile, type: "text" },
          {
            label: "Email",
            key: "email" as keyof typeof profile,
            type: "email",
          },
          {
            label: "Delivery address",
            key: "address" as keyof typeof profile,
            type: "text",
          },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-gray-500 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              disabled={!isEditing}
              value={profile[field.key] ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-800 focus:border-[#5B2D24] focus:outline-none disabled:bg-gray-50"
            />
          </div>
        ))}

        {/* password */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Password</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute right-4 top-3.5 text-gray-500"
            />
            <input
              type="password"
              disabled={!isEditing}
              value={profile.password}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-800 focus:border-[#5B2D24] focus:outline-none disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* garis pemisah */}
      <div className="w-[88%] border-t border-gray-200 mt-6" />

      {/* menu tambahan */}
      <div className="w-[88%] mt-4 space-y-2 text-sm text-gray-700 font-medium">
        <div
          className="flex justify-between items-center py-2 cursor-pointer hover:text-[#5B2D24]"
          onClick={() => router.push("/payment")}
        >
          <span>Payment Details</span>
          <ChevronRight size={16} />
        </div>
        <div
          className="flex justify-between items-center py-2 cursor-pointer hover:text-[#5B2D24]"
          onClick={() => router.push("/order-history")}
        >
          <span>Order History</span>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* tombol bawah */}
      <div className="flex justify-center gap-4 mt-8 mb-8">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center gap-2 bg-[#3A1F17] text-white px-5 py-2 rounded-full text-sm shadow-md hover:scale-[1.03] transition-transform"
        >
          <Edit3 size={16} /> {isEditing ? "Save" : "Edit profile"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-[#3A1F17] text-[#3A1F17] px-5 py-2 rounded-full text-sm hover:bg-[#3A1F17]/10 transition-all"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}
