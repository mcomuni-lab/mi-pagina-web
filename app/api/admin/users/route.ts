import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/admin/users — listar todos los usuarios
export async function GET() {
  try {
    const [rows]: any = await db.query(
      "SELECT id, name, email FROM users ORDER BY id ASC"
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=X — eliminar usuario por ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}