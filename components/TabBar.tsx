'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTavoliReveal } from '@/components/useTavoliReveal';

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
  // Il modulo intolleranze (/intolleranze) non è più in barra: la raccolta è
  // chiusa. La pagina resta raggiungibile dall'URL e le risposte in /admin.
  {
    href: '/tavoli',
    label: 'Tavoli',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="6" r="2.4" />
        <circle cx="5.5" cy="17" r="2.4" />
        <circle cx="18.5" cy="17" r="2.4" />
        <path d="M10.8 8 6.7 14.8M13.2 8l4.1 6.8M7.9 17h8.2" strokeLinecap="round" />
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
  // I tavoli entrano in barra solo a sorpresa svelata: prima di allora la voce
  // non c'è, nemmeno per chi apre la pagina con il link diretto.
  const reveal = useTavoliReveal();
  const visible = tabs.filter((t) => t.href !== '/tavoli' || reveal === 'aperto');

  return (
    <nav className="tabbar">
      {visible.map((t) => (
        <Link key={t.href} href={t.href} className={pathname === t.href ? 'active' : ''}>
          {t.icon}
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
