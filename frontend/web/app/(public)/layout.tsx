import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';
import RiskStatusBanner from '@/components/public/RiskStatusBanner';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <RiskStatusBanner />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
