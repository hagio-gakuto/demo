'use client';

import NextLink from 'next/link';

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  onClick?: () => void;
};

export const CustomLink = ({
  href,
  children,
  className = '',
  'aria-label': ariaLabel,
  onClick,
}: LinkProps) => {
  const baseStyles =
    'text-blue-300 hover:text-blue-100 underline transition-colors visited:text-purple-600 visited:hover:text-purple-400';

  return (
    <NextLink
      href={href}
      className={`${baseStyles}  ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </NextLink>
  );
};
