import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave-temporal-cambiar';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }
}