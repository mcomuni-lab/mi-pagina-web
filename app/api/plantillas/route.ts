import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM plantillas WHERE activo = 1');
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, categoria, precio, descripcion, imagen_preview } = body;
  await db.query(
    'INSERT INTO plantillas (nombre, categoria, precio, descripcion, imagen_preview) VALUES (?, ?, ?, ?, ?)',
    [nombre, categoria, precio, descripcion, imagen_preview]
  );
  return NextResponse.json({ message: 'Plantilla creada' });
}