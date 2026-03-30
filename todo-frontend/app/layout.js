import "./globals.css";
import { Suspense } from "react";
import ClientWrapper from "./custom/components/ClientWrapper";
import { LoaderOne } from "@/components/ui/loader";

export const metadata = {
  title: "Must Do app",
  description: "Stop forgetting, start finishing. Must Do is the ultimate todo app for students and professionals. Manage tasks, connect with friends, and crush your goals with a lightning-fast, minimalist interface designed for peak productivity.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Wrap everything in Suspense to handle useSearchParams bailouts */}
        <Suspense fallback={<LoaderOne />}>
          <ClientWrapper>{children}</ClientWrapper>
        </Suspense>
      </body>
    </html>
  );
}