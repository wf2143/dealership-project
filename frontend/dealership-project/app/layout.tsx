import '../styles/Welcome.css';
import '../styles/Signup.css';
import '../styles/Login.css';
import '../styles/Navbar.css';
import '../styles/Lot.css';
import '../styles/Inventory.css';
import '../styles/myProfile.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
