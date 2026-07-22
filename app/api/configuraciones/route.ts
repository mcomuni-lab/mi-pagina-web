import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const PRECIO_PERSONALIZACION = 20;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "clave-temporal-cambiar";

type SessionPayload = {
  id: number;
  name: string;
  email: string;
};

async function obtenerUsuarioSesion(): Promise<SessionPayload | null> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "session_token",
      )?.value;

    if (!token) {
      return null;
    }

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET,
      ) as SessionPayload;

    if (
      !decoded.id ||
      !decoded.name ||
      !decoded.email
    ) {
      return null;
    }

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };
  } catch (error) {
    console.error(
      "Error al verificar la sesión:",
      error,
    );

    return null;
  }
}

// POST: Guardar la configuración enviada por el cliente
export async function POST(
  req: Request,
) {
  try {
    const usuario =
      await obtenerUsuarioSesion();

    if (!usuario) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para guardar o enviar una configuración",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await req.json();

    const {
      plantilla_id,
      colores,
      tipografia,
      contenido,
      imagenes,
      secciones,
      social,
      contacto,
      comentarios,
    } = body;

    const plantillaId =
      Number(plantilla_id);

    if (
      !plantillaId ||
      Number.isNaN(
        plantillaId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El ID de la plantilla es obligatorio o inválido",
        },
        {
          status: 400,
        },
      );
    }

    const comentarioLimpio =
      typeof comentarios ===
      "string"
        ? comentarios
            .trim()
            .slice(0, 2000)
        : "";

    const [templateRows]: any =
      await db.query(
        `
          SELECT
            id,
            name,
            price
          FROM templates
          WHERE id = ?
          LIMIT 1
        `,
        [plantillaId],
      );

    if (
      !templateRows ||
      templateRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "La plantilla indicada no existe",
        },
        {
          status: 404,
        },
      );
    }

    const precioPlantilla =
      Number(
        templateRows[0].price,
      );

    if (
      Number.isNaN(
        precioPlantilla,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El precio de la plantilla es inválido",
        },
        {
          status: 500,
        },
      );
    }

    const precioPersonalizacion =
      PRECIO_PERSONALIZACION;

    const precioTotal =
      precioPlantilla +
      precioPersonalizacion;

    const [result]: any =
      await db.query(
        `
          INSERT INTO configuraciones (
            plantilla_id,
            usuario_email,
            usuario_nombre,
            colores,
            tipografia,
            contenido,
            imagenes,
            secciones,
            social,
            contacto,
            comentarios,
            precio_plantilla,
            precio_personalizacion,
            precio_total,
            estado
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'pending'
          )
        `,
        [
          plantillaId,
          usuario.email,
          usuario.name,
          JSON.stringify(
            colores || {},
          ),
          JSON.stringify(
            tipografia || {},
          ),
          JSON.stringify(
            contenido || {},
          ),
          JSON.stringify(
            imagenes || {},
          ),
          JSON.stringify(
            secciones || {},
          ),
          JSON.stringify(
            social || {},
          ),
          JSON.stringify(
            contacto || {},
          ),
          comentarioLimpio,
          precioPlantilla,
          precioPersonalizacion,
          precioTotal,
        ],
      );

    return NextResponse.json(
      {
        message:
          "Configuración guardada correctamente",
        id: result.insertId,
        usuario_nombre:
          usuario.name,
        usuario_email:
          usuario.email,
        plantilla_nombre:
          templateRows[0].name,
        comentarios:
          comentarioLimpio,
        precio_plantilla:
          precioPlantilla,
        precio_personalizacion:
          precioPersonalizacion,
        precio_total:
          precioTotal,
        estado: "pending",
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error(
      "Error al guardar configuración:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      {
        error:
          "No se pudo guardar la configuración",
        details: message,
      },
      {
        status: 500,
      },
    );
  }
}

// GET: Listar configuraciones para el historial de compras
export async function GET() {
  try {
    const [rows] =
      await db.query(
        `
          SELECT
            c.id,
            c.plantilla_id,
            c.usuario_email,
            c.usuario_nombre,
            c.colores,
            c.tipografia,
            c.contenido,
            c.imagenes,
            c.secciones,
            c.social,
            c.contacto,
            c.comentarios,
            c.estado,
            c.precio_plantilla,
            c.precio_personalizacion,
            c.precio_total,
            c.created_at,
            c.updated_at,
            t.name AS plantilla_nombre
          FROM configuraciones c
          LEFT JOIN templates t
            ON c.plantilla_id = t.id
          ORDER BY c.created_at DESC
        `,
      );

    return NextResponse.json(
      rows,
    );
  } catch (error: unknown) {
    console.error(
      "Error al listar configuraciones:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      {
        error:
          "No se pudieron listar las configuraciones",
        details: message,
      },
      {
        status: 500,
      },
    );
  }
}