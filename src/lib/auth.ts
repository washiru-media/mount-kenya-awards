import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE = 'mka_admin_session';
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
  return new TextEncoder().encode(value);
}
export async function createAdminSession(adminId: string) {
  const token = await new SignJWT({ role: 'SUPER_ADMIN' })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(adminId)
    .setIssuedAt().setExpirationTime('8h').sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
}
export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (!payload.sub || payload.role !== 'SUPER_ADMIN') return null;
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, role: true } });
    if (!admin || admin.role !== 'SUPER_ADMIN') return null;
    return { id: admin.id, role: admin.role };
  } catch { return null; }
}
export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
