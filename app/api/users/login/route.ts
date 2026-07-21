import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave-temporal-cambiar';

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

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Login exitoso',
      name: user.name,
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}