'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Dashboard } from '@/features/dashboard/components/Dashboard';

export default function Home() {
  const { setItems } = useBreadcrumb();
  usePageTitle('ダッシュボード');

  useEffect(() => {
    setItems([{ label: 'ホーム', href: '/' }]);
  }, [setItems]);

  return <Dashboard />;
}

