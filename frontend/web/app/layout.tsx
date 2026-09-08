import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bhu-Rakshak — AI Landslide Risk & Decision Support',
  description: 'AI-Based Landslide Risk Prediction, Early Warning & Decision Support Platform for North Eastern Region (NER)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
