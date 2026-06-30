import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import db from "@/lib/db";

export const config = {
  api: { bodyParser: false },
};

async function extractZip(buffer: Buffer, destDir: string): Promise<void> {
  let offset = 0;

  while (offset < buffer.length - 4) {
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const filenameLength = buffer.readUInt16LE(offset + 26);
      const extraLength = buffer.readUInt16LE(offset + 28);
      const filename = buffer
        .slice(offset + 30, offset + 30 + filenameLength)
        .toString("utf8");

      const dataOffset = offset + 30 + filenameLength + extraLength;
      const compressedData = buffer.slice(dataOffset, dataOffset + compressedSize);

      if (!filename.endsWith("/")) {
        const filePath = path.join(destDir, filename);
        const fileDir = path.dirname(filePath);

        if (!existsSync(fileDir)) {
          await mkdir(fileDir, { recursive: true });
        }

        if (compressionMethod === 0) {
          await writeFile(filePath, compressedData);
        } else if (compressionMethod === 8) {
          const { inflateRaw } = await import("zlib");
          const decompressed = await new Promise<Buffer>((resolve, reject) => {
            inflateRaw(compressedData, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
          await writeFile(filePath, decompressed);
        }
      }

      offset = dataOffset + compressedSize;
    } else {
      offset++;
    }
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const file = formData.get("file") as File;
    const previewImage = formData.get("image") as File | null;

    console.log("================================");
    console.log("Imagen recibida:", previewImage?.name, previewImage?.size);
    console.log("================================");

    if (!name || !category || !price || !file) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const folder = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const destDir = path.join(process.cwd(), "public", "templates", folder);

    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await extractZip(buffer, destDir);

    let imageUrl: string | null = null;

    if (previewImage && previewImage.size > 0) {
      console.log("✅ Guardando imagen...");

      const extension = previewImage.name.split(".").pop();
      const imageName = `${Date.now()}-${folder}.${extension}`;

      // ⬇️ FIX: aseguramos que la carpeta de previews exista antes de escribir
      const previewsDir = path.join(process.cwd(), "public", "uploads", "previews");

      if (!existsSync(previewsDir)) {
        await mkdir(previewsDir, { recursive: true });
      }

      const imagePath = path.join(previewsDir, imageName);

      const imageBuffer = Buffer.from(await previewImage.arrayBuffer());
      await writeFile(imagePath, imageBuffer);

      imageUrl = `/uploads/previews/${imageName}`;

      console.log("✅ Imagen guardada en:", imageUrl);
    } else {
      console.log("❌ No llegó ninguna imagen");
    }

    const [result]: any = await db.query(
      "INSERT INTO templates (name, category, description, price, folder, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, category, description || "", parseFloat(price), folder, imageUrl]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      folder,
      image_url: imageUrl,
      message: "Plantilla subida correctamente",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}