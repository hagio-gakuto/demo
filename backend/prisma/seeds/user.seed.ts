import { PrismaClient, UserRole, Gender } from '@prisma/client';
import { ulid } from 'ulid';

/**
 * User シード作成用
 */
export async function seedUsers({ prisma }: { prisma: PrismaClient }) {
  console.log('User シード作成を開始...');

  // 既存のデータを削除
  await prisma.user.deleteMany();

  const systemUserId = ulid();

  // 管理者ユーザーを作成
  await prisma.user.create({
    data: {
      id: systemUserId,
      email: 'admin@example.com',
      role: UserRole.admin,
      firstName: 'Admin',
      lastName: 'User',
      gender: Gender.other,
      createdBy: systemUserId,
      updatedBy: systemUserId,
    },
  });

  // 一般ユーザーを複数作成
  const users = await prisma.user.createMany({
    data: [
      {
        id: ulid(),
        email: 'user1@example.com',
        role: UserRole.user,
        firstName: '太郎',
        lastName: '山田',
        gender: Gender.male,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: ulid(),
        email: 'user2@example.com',
        role: UserRole.user,
        firstName: '花子',
        lastName: '佐藤',
        gender: Gender.female,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
    ],
  });

  console.log(`1 件の Admin User 作成完了`);
  console.log(`${users.count} 件の User 作成完了`);
}
