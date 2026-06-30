import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

    const formData = await request.formData();
    const name = formData.get("name") as string;
const description = formData.get("description") as string;
const category = formData.get("category") as string;
const price = Number(formData.get("price"));

const image = formData.get("image") as File | null;
let image_url: string | null = null;

if (image && image.size > 0) {
  // Obtener la extensión (.png, .jpg, etc.)
  const extension = image.name.split(".").pop();

  // Crear un nombre único
  const fileName = `${randomUUID()}.${extension}`;

  // Ruta donde se guardará la imagen
  const uploadPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "previews",
    fileName
  );

  // Convertir la imagen en un Buffer
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Guardar la imagen en la carpeta
  await fs.writeFile(uploadPath, buffer);

  // Guardar la ruta para la base de datos
  image_url = `/uploads/previews/${fileName}`;
}

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
   SET
     name = ?,
     description = ?,
     price = ?,
     category = ?,
     image_url = COALESCE(?, image_url)
   WHERE id = ?`,
  [
    name,
    description || null,
    price,
    category || null,
    image_url,
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