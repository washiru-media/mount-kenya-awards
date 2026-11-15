import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
 const email = process.env.ADMIN_EMAIL?.toLowerCase();
 const password = process.env.ADMIN_INITIAL_PASSWORD;
 if (!email || !password || password.length < 16) throw new Error('Set ADMIN_EMAIL and a strong ADMIN_INITIAL_PASSWORD (at least 16 characters).');
 const passwordHash = await bcrypt.hash(password, 12);
 await prisma.admin.upsert({ where: { email }, update: { passwordHash, role: 'SUPER_ADMIN' }, create: { email, passwordHash, role: 'SUPER_ADMIN' } });
 const competition = await prisma.competition.upsert({ where: { slug: 'mount-kenya-awards' }, update: {}, create: { name: 'MOUNT KENYA AWARDS', slug: 'mount-kenya-awards', description: 'Celebrating excellence across the Mount Kenya region.', status: 'DRAFT' } });
 console.log(`Seeded super administrator ${email} and competition ${competition.id}`);
}
main().finally(()=>prisma.$disconnect());
