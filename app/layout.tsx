// app/layout.tsx
export const metadata = {
  title: 'RSS Widget',
  description: 'Auto-publish from RSS to GHL blogs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
