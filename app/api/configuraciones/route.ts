import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  const { plantilla_id, usuario_email, usuario_nombre, colores, tipografia, contenido } = body;
  await db.query(
    'INSERT INTO configuraciones (plantilla_id, usuario_email, usuario_nombre, colores, tipografia, contenido) VALUES (?, ?, ?, ?, ?, ?)',
    [plantilla_id, usuario_email, usuario_nombre, JSON.stringify(colores), JSON.stringify(tipografia), JSON.stringify(contenido)]
  );
  return NextResponse.json({ message: 'Configuración guardada' });
}

export async function GET() {
  const [rows] = await db.query('SELECT * FROM configuraciones ORDER BY created_at DESC');
  return NextResponse.json(rows);
}