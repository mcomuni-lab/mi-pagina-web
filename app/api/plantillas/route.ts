import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET: Listar todas las plantillas
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM templates ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Insertar una nueva plantilla
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, image_url, description } = body;

    const [result]: any = await db.query(
      "INSERT INTO templates (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)",
      [name, category, price, image_url || null, description || null]
    );

    return NextResponse.json({ 
      id: result.insertId, 
      name, 
      category, 
      price, 
      image_url, 
      description 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}