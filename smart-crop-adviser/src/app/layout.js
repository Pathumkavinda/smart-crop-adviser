// src/app/layout.js
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import '@/theme.css';
// Fix the import path for home.module.css
import './home.module.css';  // Changed from '@/home.module.css'
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageThemeWrapper from '@/components/PageThemeWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <PageThemeWrapper>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
              </PageThemeWrapper>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
// // src/app/layout.js
// import { Inter } from 'next/font/google';
// import '../styles/globals.css'; // global CSS with :root variables
// import '@/theme.css';
// import './home.module.css'; // CSS module for page-specific classes
// import { AuthProvider } from '@/context/AuthContext';
// import { LanguageProvider } from '@/context/LanguageContext';
// import { ThemeProvider } from '@/context/ThemeContext';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import PageThemeWrapper from '@/components/PageThemeWrapper';

// const inter = Inter({ subsets: ['latin'] });

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           <LanguageProvider>
//             <ThemeProvider>
//               <PageThemeWrapper>
//                 <div className="flex flex-col min-h-screen">
//                   <Header />
//                   <main className="flex-grow">
//                     {children}
//                   </main>
//                   <Footer />
//                 </div>
//               </PageThemeWrapper>
//             </ThemeProvider>
//           </LanguageProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
