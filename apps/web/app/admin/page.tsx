import type { Metadata } from 'next';
import AdminApp from '@/components/admin/AdminApp';

export const metadata: Metadata = {
  title: 'Admin | Copper Kitchen',
  robots: { index: false, follow: false }
};

export default function AdminPage(): React.ReactElement {
  return <AdminApp />;
}
