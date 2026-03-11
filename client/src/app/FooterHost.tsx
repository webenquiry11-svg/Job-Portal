'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer/page';

export default function FooterHost() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith('/employer/dashboard') || pathname.startsWith('/dashboard')) {
    return null;
  }
  return <Footer />;
}
