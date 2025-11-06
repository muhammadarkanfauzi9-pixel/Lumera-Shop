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
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        image: data.user.image || "/images/profile/avatar.png",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ back aman
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/dashboard");
  };

  // ✅ ubah foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
      setProfile((prev) => ({ ...prev, image: imageURL }));
    }
  };

  // ✅ simpan edit
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const token = localStorage.getItem("userToken");
      console.log("Token:", token);
      console.log("Profile data to save:", profile);

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);

      if (imageFile) {
        formData.append("image", imageFile);
        console.log("Image file:", imageFile);
      }

      console.log("Sending request to /api/profile");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `Failed to update profile: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Response data:", result);

      // Update profile with saved data
      setProfile({
        name: result.user.name || "",
        email: result.user.email || "",
        phone: result.user.phone || "",
        address: result.user.address || "",
        image: result.user.image || "/images/profile/avatar.png",
      });

      // Clear temporary states
      setImageFile(null);
      setImagePreview(null);

      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ logout (hapus data dari localStorage)
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

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

      {/* Success message */}
      {saveSuccess && (
        <div className="mt-16 w-[88%] max-w-sm bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-green-800">
            Profile updated successfully!
          </span>
        </div>
      )}

      {/* Error message */}
      {saveError && (
        <div className="mt-16 w-[88%] max-w-sm bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-sm text-red-800">{saveError}</span>
        </div>
      )}

      {/* ⚪ FORM */}
      <div className="mt-20 w-[88%] max-w-sm bg-white space-y-5">
        {[
          { label: "Name", key: "name", type: "text" },
          { label: "Email", key: "email", type: "email" },
          { label: "Phone", key: "phone", type: "text" },
          { label: "Address", key: "address", type: "text" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-gray-500 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              disabled={!isEditing}
              value={profile[field.key as keyof typeof profile] || ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-800 focus:border-[#5B2D24] focus:outline-none disabled:bg-gray-50"
            />
          </div>
        ))}

        {/* password placeholder - not editable here */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Password</label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute right-4 top-3.5 text-gray-500"
            />
            <input
              type="password"
              disabled
              value="••••••••"
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
          onClick={() => router.push("/dashboard/orders")}
        >
          <span>Order History</span>
          <ChevronRight size={16} />
        </div>
        <div
          className="flex justify-between items-center py-2 cursor-pointer hover:text-[#5B2D24]"
          onClick={() => router.push("/dashboard/payment")}
        >
          <span>Payment Details</span>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* tombol bawah */}
      <div className="flex justify-center gap-4 mt-8 mb-8">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
          className="flex items-center gap-2 bg-[#3A1F17] text-white px-5 py-2 rounded-full text-sm shadow-md hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit3 size={16} />
          {saving ? "Saving..." : isEditing ? "Save" : "Edit profile"}
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
