import { Link } from 'react-router-dom';

const footerCols = [
  {
    heading: 'Personal',
    items: [
      { label: 'Checking Accounts', href: '/bank/checking' },
      { label: 'Savings Accounts',  href: '/bank/savings' },
      { label: 'Credit Cards',      href: '/bank/credit-cards' },
      { label: 'Mortgages',         href: '/borrow/mortgages' },
      { label: 'Auto Loans',        href: '/borrow/auto-loans' },
      { label: 'Personal Loans',    href: '/borrow/personal-loans' },
      { label: 'Online Banking',    href: '/bank/online-banking' },
    ],
  },
  {
    heading: 'Business',
    items: [
      { label: 'Business Checking', href: '/business/checking' },
      { label: 'Business Savings',  href: '/business' },
      { label: 'Business Loans',    href: '/business/loans' },
      { label: 'Treasury Services', href: '/business' },
      { label: 'Business Online',   href: '/business' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Help Center',   href: '/support' },
      { label: 'Contact Us',    href: '/contact' },
      { label: 'FAQ',           href: '/support/faq' },
      { label: 'Security',      href: '/protect' },
      { label: 'Find a Branch', href: '/locations' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Hunch', href: '/about' },
      { label: 'Newsroom',    href: '/newsroom' },
      { label: 'Careers',     href: '/careers' },
      { label: 'Accessibility', href: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-bank-dark border-t border-white/10 text-white/60">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-5 gap-8">
        {/* Brand column */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            Hunch<span className="text-[#4ade80]">.</span>
          </h3>
          <p className="text-sm leading-relaxed mb-4">Modern banking built for real life.</p>
          <div className="flex gap-3 mb-5">
            {['fb', 'tw', 'li'].map((s) => (
              <div key={s} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold uppercase text-white/50">{s}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.3.17.65.2.98.08l12.08-6.96-2.61-2.61L3.18 23.76zm16.36-10.53L16.9 11.5l-2.72 2.72 2.64 2.64 2.72-1.57c.78-.45.78-1.42 0-1.86zM3.05.24c-.3.18-.49.5-.49.86v21.8l11.1-11.09L3.05.24zm9.22 9.21L3.18.24l.01-.01 10.7 6.17-1.62 3.05z"/>
              </svg>
              <div>
                <p className="text-[9px] text-white/50 leading-none">Get it on</p>
                <p className="text-xs text-white font-semibold leading-tight">Google Play</p>
              </div>
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 transition-colors">
              <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-[9px] text-white/50 leading-none">Download on the</p>
                <p className="text-xs text-white font-semibold leading-tight">App Store</p>
              </div>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {footerCols.map((col) => (
          <div key={col.heading}>
            <h4 className="text-white font-semibold mb-4 text-sm">{col.heading}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="hover:text-white cursor-pointer transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Hunch Financial, Inc.&nbsp;·&nbsp;Member FDIC</p>
          <p>Hunch is a demo application. Not a real bank.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Accessibility', 'Security'].map((l) => (
              <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
