import type { Metadata } from "next";
import * as Icons from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flc's Skills",
  description: "A marketplace for skills and agents",
  icons: {
    icon: '/favicon.svg',
  },
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
              <span className="font-semibold text-xl tracking-tight">Flc&apos;s Skills</span>
            </div>
            <nav className="flex items-center gap-6">
              <a 
                href="https://github.com/flc1125/skills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <Icons.Github size={18} />
                <span>Github</span>
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-100 dark:border-gray-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-900 dark:text-white font-medium mb-2">Flc&apos;s Skills</p>
            <p className="text-gray-500 text-sm italic">Built with Codex and Gemini, designed for efficiency</p>
            <p className="text-gray-400 text-xs mt-4">© 2026 Flc&apos;s Skills. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
