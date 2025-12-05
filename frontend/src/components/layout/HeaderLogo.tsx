'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export const HeaderLogo = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      {imageError ? (
        <span className="text-xl font-bold text-white">SAMPLE</span>
      ) : (
        <Image
          src="/sample_logo.svg"
          alt="Sample"
          width={150}
          height={50}
          loading="eager"
          priority
          onError={() => setImageError(true)}
        />
      )}
    </Link>
  );
};
