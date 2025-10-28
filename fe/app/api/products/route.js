import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const price = formData.get("price");
    const description = formData.get("description");
    const category = formData.get("category");
    const image = formData.get("image");

    // Simpan file image ke folder /public/uploads
    let fileName = null;
    if (image && image.name) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // buat folder kalau belum ada
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // buat nama file unik
      const ext = path.extname(image.name);
      const baseName = path.basename(image.name, ext);
      fileName = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // simpan file
      fs.writeFileSync(filePath, buffer);
    }

    // Simpan data produk ke file JSON (sebagai database sederhana)
    const newProduct = {
      id: Date.now(),
      name,
      price,
      description,
      category,
      image: fileName ? `/uploads/${fileName}` : null,
    };

    const dataPath = path.join(process.cwd(), "data", "products.json");
    let products = [];
    if (fs.existsSync(dataPath)) {
      const file = fs.readFileSync(dataPath, "utf-8");
      products = JSON.parse(file);
    }

    products.push(newProduct);
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ message: "Produk berhasil ditambahkan" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Gagal menambah produk" }, { status: 500 });
  }
}
