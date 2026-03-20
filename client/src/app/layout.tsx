import { StoreProvider } from '@/store/StoreProvider';
import './globals.css';
import Navbar from './Navbar/page';
import FooterHost from './FooterHost';
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'Job Portal',
  description: 'Find your dream job.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-[#121212]">
        <StoreProvider>
          <Toaster position="top-center" />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <FooterHost />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
