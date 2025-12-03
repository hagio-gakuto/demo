'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type HelpTooltipProps = {
  message: string;
  linkText?: string;
  linkHref?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export const HelpTooltip = ({
  message,
  linkText,
  linkHref,
  children,
  position = 'bottom',
}: HelpTooltipProps) => {
  const { isMaster } = useAuth();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-l-transparent',
  };

  const tooltipContent = (
    <div
      className={`hidden group-hover:block absolute ${positionStyles[position]} w-64 z-50`}
    >
      <div
        className={`absolute ${arrowStyles[position]} border-4 border-transparent`}
      ></div>
      <div className="bg-gray-800 text-white text-xs p-3 rounded shadow-lg text-left leading-relaxed whitespace-pre-line">
        {message}
        {linkText && (
          <div className="mt-1">
            {linkHref && isMaster() ? (
              <Link
                href={linkHref}
                className="text-blue-300 hover:text-blue-100 underline"
              >
                {linkText}
              </Link>
            ) : (
              <span className="font-semibold text-gray-300">{linkText}</span>
            )}
            <span> をしてください</span>
          </div>
        )}
      </div>
    </div>
  );

  if (children) {
    return (
      <div className="group relative inline-block">
        {children}
        {tooltipContent}
      </div>
    );
  }

  return (
    <div className="group relative inline-block ml-1 align-middle">
      <span className="text-gray-400 hover:text-gray-600 hover:border-gray-600 cursor-help text-xs font-bold border border-gray-400 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
        ?
      </span>
      {tooltipContent}
    </div>
  );
};
