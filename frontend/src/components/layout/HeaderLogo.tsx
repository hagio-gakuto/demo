import Link from 'next/link';

export const HeaderLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <span className="text-xl font-bold text-white">Sample App</span>
    </Link>
  );
};
