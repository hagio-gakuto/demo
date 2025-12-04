import { Providers } from '@/components/providers/Providers';

export default function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
