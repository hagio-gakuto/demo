'use client';

import Link from 'next/link';
import Image from 'next/image';

export const HeaderLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Image
        src="/クロネコアイコン2.svg"
        alt="Sample"
        width={100}
        height={100}
        loading="eager"
        priority
        className="object-contain w-10 h-10"
      />
    </Link>
  );
};
