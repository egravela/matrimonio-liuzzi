'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10.5V20h13v-9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/intolleranze',
    label: 'A tavola',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 3v7.5a2 2 0 0 0 4 0V3M9 10.5V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.5 21v-7m0 0c1.9 0 2.8-1.5 2.8-4.5 0-3-.9-6.5-2.8-6.5S13.7 6.5 13.7 9.5c0 3 .9 4.5 2.8 4.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/carica',
    label: 'Carica',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 16V5m0 0-4.5 4.5M12 5l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/galleria',
    label: 'Galleria',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5 17.5 4.5-4 3 2.5 4-3.8 3 2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={pathname === t.href ? 'active' : ''}>
          {t.icon}
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
