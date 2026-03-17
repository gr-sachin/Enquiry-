import './globals.css';

export const metadata = {
  title: 'Enquiry Dashboard | Knitway India Pvt Ltd',
  description: 'Overview of total tracking quotes and machine requirements.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
