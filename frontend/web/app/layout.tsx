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
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
