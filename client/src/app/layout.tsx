import { StoreProvider } from '@/store/StoreProvider';
import './globals.css';
import Navbar from './Navbar/page';
import FooterHost from './FooterHost';
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'Click4Jobs - India\'s #1 Job Platform',
  description: 'Discover 50 lakh+ career opportunities on India\'s most efficient and transparent hiring ecosystem. Find your dream job with Click4Jobs.',
  icons: {
    icon: '/Fav%20Icon.png',
  },
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
