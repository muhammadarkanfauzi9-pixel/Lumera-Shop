import { NextResponse } from "next/server";

export async function POST(req) {
  try {
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
      // For now, we'll store the image URL as a placeholder
      // In a real implementation, you'd upload to a cloud service or local storage
      productData.imageUrl = `/uploads/${image.name}`;
    }

    // Send to backend API
    const backendResponse = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add admin token if available
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(productData),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json({ message: error.message || "Failed to add product" }, { status: backendResponse.status });
    }

    const result = await backendResponse.json();
    return NextResponse.json({ message: "Product added successfully", product: result.product });
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
