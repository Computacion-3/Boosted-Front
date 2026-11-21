import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthHydrator } from "@/src/features/auth/presentation/components/AuthHydrator";
import { AuthUserViewModelMapper } from "@/src/features/auth/presentation/viewmodels/auth-user.viewmodel";
import { getSession } from "@/src/lib/dal";
import { StoreProvider } from "@/src/store/StoreProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boosted",
  description:
    "Plataforma para aficionados a los carros: garaje digital, bitácora de proyecto, comunidad y eventos.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Se lee la sesión en el servidor (la cookie es httpOnly) y se pasan solo
  // datos planos al cliente: nunca el token. Si venció, getSession da null.
  const session = await getSession();
  const user = session ? AuthUserViewModelMapper.fromSession(session) : null;

  return (
    <html
      lang="es"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base-200">
        <StoreProvider>
          <AuthHydrator user={user} />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
