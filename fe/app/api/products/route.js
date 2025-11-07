import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const price = formData.get("price");
    const description = formData.get("description");
    const stock = formData.get("stock");
    const image = formData.get("image");

    // Prepare data for backend
    const productData = {
      name,
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
    };

    // Handle image upload if present
    if (image && image.size > 0) {
      // Create a new FormData to send the image to backend
      const backendFormData = new FormData();
      backendFormData.append('name', name);
      backendFormData.append('price', price);
      backendFormData.append('description', description);
      backendFormData.append('stock', stock);
      backendFormData.append('image', image);

      // Send to backend API with FormData
      const backendResponse = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: backendFormData,
      });

      if (!backendResponse.ok) {
        const error = await backendResponse.json();
        return NextResponse.json({ message: error.message || "Failed to add product" }, { status: backendResponse.status });
      }

      const result = await backendResponse.json();
      return NextResponse.json({ message: "Product added successfully", product: result.product });
    } else {
      // No image, send JSON data
      const backendResponse = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(productData),
      });

      if (!backendResponse.ok) {
        const error = await backendResponse.json();
        return NextResponse.json({ message: error.message || "Failed to add product" }, { status: backendResponse.status });
      }

      const result = await backendResponse.json();
      return NextResponse.json({ message: "Product added successfully", product: result.product });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Failed to add product" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}
