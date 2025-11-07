    import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ message: error.message || "Failed to fetch product" }, { status: response.status });
    }
    const product = await response.json();
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;

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

    const productData = {
      name,
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
    };

    if (image && image.size > 0) {
      productData.imageUrl = `/uploads/${image.name}`;
    }

    const backendResponse = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(productData),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json({ message: error.message || "Failed to update product" }, { status: backendResponse.status });
    }

    const result = await backendResponse.json();
    return NextResponse.json({ message: "Product updated successfully", product: result.product });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    const backendResponse = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json({ message: error.message || "Failed to delete product" }, { status: backendResponse.status });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
