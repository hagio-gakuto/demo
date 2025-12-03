'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  visited?: boolean;
  'aria-label'?: string;
};

export const Link = ({
  href,
  children,
  className = '',
  visited = false,
  'aria-label': ariaLabel,
}: LinkProps) => {
  const pathname = usePathname();
  const isVisited = useMemo(() => {
    if (visited) return true;
    // 現在のパスとhrefが一致する場合はvisitedとみなす
    return pathname === href;
  }, [pathname, href, visited]);

  return (
    <NextLink
      href={href}
      className={`${className} ${isVisited ? 'visited:underline' : ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </NextLink>
  );
};

