import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skills Marketplace",
  description: "A marketplace for skills and agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-xl tracking-tight">Skills Market</span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="https://github.com" className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">Github</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-100 dark:border-gray-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">© 2026 Skills Marketplace. Built for efficiency.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
