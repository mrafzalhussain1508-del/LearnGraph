import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import HashiraCodersBadge from '@/components/HashiraCodersBadge';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'LearnGraph — From Marks to Understanding',
  description: 'AI-Powered Smart Education Platform analyzing student answer sheets to extract topic-wise conceptual understanding instead of raw scores.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-yellow-200 selection:text-amber-950 dark:selection:bg-yellow-500/30 dark:selection:text-yellow-200 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {/* Top Left Corner: Created by Hashira Coders Bar */}
            <HashiraCodersBadge />

            <Navbar />
            <main className="flex-1">
              {children}
            </main>

            {/* Global Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-pink-950/30 border border-indigo-100/90 dark:border-indigo-900/60 shadow-xs">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Created by</span>
                    <span className="text-xs font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                      Hashira Coders
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">LearnGraph</span>
                    <span>— Moving education from &quot;Marks to Understanding&quot;</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-slate-400 dark:text-slate-500 text-xs">
                  <span>Next.js App Router</span>
                  <span>•</span>
                  <span>Tailwind CSS</span>
                  <span>•</span>
                  <span>Google Gemini Vision</span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}