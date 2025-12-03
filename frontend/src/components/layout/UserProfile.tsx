'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { DefaultUserIcon } from '@/components/ui/icons';

export const UserProfile = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Link
      href="/mypage"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-col"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
        style={{
          backgroundColor: user.imageUrl
            ? 'transparent'
            : 'rgba(255, 255, 255, 0.3)',
        }}
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DefaultUserIcon />
          </div>
        )}
      </div>
      <span className="text-sm">{user.name}</span>
    </Link>
  );
};
