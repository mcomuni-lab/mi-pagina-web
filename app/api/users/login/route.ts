import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { nombre, password } = await req.json();

    const [rows]: any = await db.query(
      'SELECT * FROM users WHERE name = ?', [nombre]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Login exitoso', name: user.name });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}