import { NextResponse } from "next/server";
import db from "@/lib/db";

// PUT: Actualizar una plantilla existente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de plantilla inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, image_url } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Nombre y precio son obligatorios" },
        { status: 400 }
      );
    }

    const [existing]: any = await db.query(
      "SELECT id FROM templates WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    await db.query(
      `UPDATE templates 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ? 
       WHERE id = ?`,
      [
        name,
        description ?? null,
        price,
        category ?? null,
        image_url ?? null,
        id,
      ]
    );

    return NextResponse.json({
      message: "Plantilla actualizada correctamente",
      id,
      name,
      description,
      price,
      category,
      image_url,
    });
  } catch (error: any) {
    console.error("Error al actualizar plantilla:", error);
    return NextResponse.json(
      { error: "Error de base de datos al actualizar la plantilla" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una plantilla
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID de plantilla inválido" },
        { status: 400 }
      );
    }

    const [existing]: any = await db.query(
      "SELECT id FROM templates WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    await db.query("DELETE FROM templates WHERE id = ?", [id]);

    return NextResponse.json({ message: "Plantilla eliminada correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar plantilla:", error);
    return NextResponse.json(
      { error: "Error de base de datos al eliminar la plantilla" },
      { status: 500 }
    );
  }
}