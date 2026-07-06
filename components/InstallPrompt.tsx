'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Banner "Installa la app": prompt nativo dove disponibile (Android/Chrome),
// istruzioni per iOS dove Apple non espone un'API di installazione.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<'hidden' | 'native' | 'ios'>('hidden');
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // proprietà Safari iOS, fuori dallo standard
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || localStorage.getItem('install_dismissed')) return;

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);

    if (isIos) {
      setMode('ios');
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode('native');
    };
    const onInstalled = () => setMode('hidden');

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem('install_dismissed', '1');
    setMode('hidden');
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') setMode('hidden');
  }

  if (mode === 'hidden') return null;

  return (
    <div className="install-banner" role="dialog" aria-label="Installa la app">
      <button type="button" className="install-close" aria-label="Chiudi" onClick={dismiss}>
        ×
      </button>

      <div className="install-header">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--sage-dark)" strokeWidth="1.5">
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
          <path d="M12 17.5h.01" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M12 7v6m0 0 2.4-2.4M12 13 9.6 10.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <strong>Porta con te il nostro album</strong>
      </div>

      <p className="install-desc">
        {mode === 'ios' && iosHelp ? (
          <>
            Tocca{' '}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-2px' }}>
              <path d="M12 14V4m0 0L8.5 7.5M12 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" strokeLinecap="round" />
            </svg>{' '}
            <em>Condividi</em> e poi <em>«Aggiungi alla schermata Home»</em>
          </>
        ) : (
          'Installa la app sul telefono: la ritrovi subito, anche al ricevimento'
        )}
      </p>

      {mode === 'native' ? (
        <button type="button" className="btn install-cta" onClick={install}>
          Installa
        </button>
      ) : !iosHelp ? (
        <button type="button" className="btn install-cta" onClick={() => setIosHelp(true)}>
          Installa
        </button>
      ) : null}
    </div>
  );
}
