import { getCoupons } from './page.server';
import CouponsPage from './page';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function CouponsLayout({ children }: LayoutProps) {
  const coupons = await getCoupons();

  if (children) {
    return children;
  }

  return <CouponsPage coupons={coupons} />;
}
