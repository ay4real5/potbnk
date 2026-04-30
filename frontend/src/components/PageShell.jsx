import Navbar from './Navbar';
import Footer from './Footer';

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
