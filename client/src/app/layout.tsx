import { StoreProvider } from '@/store/StoreProvider';
import './globals.css';
import Navbar from './Navbar/page';
import Footer from './Footer/page';

export const metadata = {
  title: 'Job Portal',
  description: 'Find your dream job.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <StoreProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}