import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// GET: Obtener una sola plantilla por su ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: "ID de plantilla inválido",
        },
        {
          status: 400,
        },
      );
    }

    const [rows]: any = await db.query(
      "SELECT * FROM templates WHERE id = ? LIMIT 1",
      [id],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          error: "Plantilla no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    console.error(
      "Error al obtener plantilla:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Error de base de datos al obtener la plantilla",
      },
      {
        status: 500,
      },
    );
  }
}

// PUT: Actualizar una plantilla existente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: "ID de plantilla inválido",
        },
        {
          status: 400,
        },
      );
    }

    const formData = await request.formData();

    const name = String(
      formData.get("name") || "",
    ).trim();

    const description = String(
      formData.get("description") || "",
    ).trim();

    const category = String(
      formData.get("category") || "",
    ).trim();

    const price = Number(formData.get("price"));

    const image = formData.get("image");

    let imageUrl: string | null = null;

    if (
      image instanceof File &&
      image.size > 0
    ) {
      const extension =
        image.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName =
        `${randomUUID()}.${extension}`;

      const previewsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "previews",
      );

      if (!existsSync(previewsDir)) {
        await fs.mkdir(previewsDir, {
          recursive: true,
        });
      }

      const uploadPath = path.join(
        previewsDir,
        fileName,
      );

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await fs.writeFile(uploadPath, buffer);

      imageUrl =
        `/uploads/previews/${fileName}`;
    }

    if (
      !name ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El nombre y el precio son obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    const [existing]: any = await db.query(
      `
        SELECT id
        FROM templates
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        {
          error: "Plantilla no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    await db.query(
      `
        UPDATE templates
        SET
          name = ?,
          description = ?,
          price = ?,
          category = ?,
          image_url = COALESCE(?, image_url)
        WHERE id = ?
      `,
      [
        name,
        description || null,
        price,
        category || null,
        imageUrl,
        id,
      ],
    );

    return NextResponse.json({
      message:
        "Plantilla actualizada correctamente",
      id,
      name,
      description,
      price,
      category,
      image_url: imageUrl,
    });
  } catch (error: unknown) {
    console.error(
      "Error al actualizar plantilla:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Error de base de datos al actualizar la plantilla",
      },
      {
        status: 500,
      },
    );
  }
}

// DELETE: Eliminar una plantilla y sus registros relacionados
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: "ID de plantilla inválido",
        },
        {
          status: 400,
        },
      );
    }

    const [existing]: any = await db.query(
      `
        SELECT
          id,
          folder,
          image_url
        FROM templates
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        {
          error: "Plantilla no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    const plantilla = existing[0];

    /*
     * Primero eliminamos las configuraciones relacionadas.
     * Esto evita el error de llave foránea:
     * configuraciones.plantilla_id -> templates.id
     */
    await db.query(
      `
        DELETE FROM configuraciones
        WHERE plantilla_id = ?
      `,
      [id],
    );

    /*
     * Después eliminamos la plantilla.
     */
    await db.query(
      `
        DELETE FROM templates
        WHERE id = ?
      `,
      [id],
    );

    /*
     * Eliminamos la carpeta física de la plantilla.
     * Esto se realiza después de eliminarla de la BD para
     * que un fallo del sistema de archivos no impida el DELETE.
     */
    if (
      plantilla.folder &&
      typeof plantilla.folder === "string"
    ) {
      const templatesBasePath = path.resolve(
        process.cwd(),
        "public",
        "templates",
      );

      const templateFolderPath = path.resolve(
        templatesBasePath,
        plantilla.folder,
      );

      const isInsideTemplatesDirectory =
        templateFolderPath.startsWith(
          `${templatesBasePath}${path.sep}`,
        );

      if (
        isInsideTemplatesDirectory &&
        existsSync(templateFolderPath)
      ) {
        try {
          await fs.rm(templateFolderPath, {
            recursive: true,
            force: true,
          });
        } catch (folderError) {
          console.error(
            "La plantilla se eliminó de la base de datos, pero no se pudo eliminar su carpeta:",
            folderError,
          );
        }
      }
    }

    /*
     * Eliminamos la imagen previa, siempre que se encuentre
     * dentro de public/uploads/previews.
     */
    if (
      plantilla.image_url &&
      typeof plantilla.image_url === "string" &&
      plantilla.image_url.startsWith(
        "/uploads/previews/",
      )
    ) {
      const previewsBasePath = path.resolve(
        process.cwd(),
        "public",
        "uploads",
        "previews",
      );

      const imageFileName = path.basename(
        plantilla.image_url,
      );

      const imagePath = path.resolve(
        previewsBasePath,
        imageFileName,
      );

      const isInsidePreviewsDirectory =
        imagePath.startsWith(
          `${previewsBasePath}${path.sep}`,
        );

      if (
        isInsidePreviewsDirectory &&
        existsSync(imagePath)
      ) {
        try {
          await fs.unlink(imagePath);
        } catch (imageError) {
          console.error(
            "La plantilla se eliminó, pero no se pudo eliminar su imagen:",
            imageError,
          );
        }
      }
    }

    return NextResponse.json({
      message:
        "Plantilla eliminada correctamente",
    });
  } catch (error: unknown) {
    console.error(
      "Error al eliminar plantilla:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      {
        error:
          "No se pudo eliminar la plantilla",
        details: message,
      },
      {
        status: 500,
      },
    );
  }
}