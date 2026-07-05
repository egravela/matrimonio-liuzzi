// Composizione floreale in stile acquerello, coordinata con la grafica
// degli inviti: rose rosa cipria, boccioli e fogliame verde salvia.
export default function Floral({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="wash" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <radialGradient id="petal" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fbeef0" />
          <stop offset="55%" stopColor="#f3d3d9" />
          <stop offset="100%" stopColor="#e3adb8" />
        </radialGradient>
        <radialGradient id="petalLight" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fdf6f5" />
          <stop offset="70%" stopColor="#f6dde1" />
          <stop offset="100%" stopColor="#ecc3cb" />
        </radialGradient>
        <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8c1a3" />
          <stop offset="100%" stopColor="#93a07a" />
        </linearGradient>
        <linearGradient id="leafGrey" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ccd2c0" />
          <stop offset="100%" stopColor="#aab49a" />
        </linearGradient>
      </defs>

      {/* macchie acquerello di fondo */}
      <g filter="url(#wash)" opacity="0.5">
        <ellipse cx="95" cy="80" rx="80" ry="55" fill="#f6dde1" />
        <ellipse cx="215" cy="55" rx="70" ry="45" fill="#eef0e5" />
        <ellipse cx="40" cy="150" rx="55" ry="40" fill="#f3e6e8" />
      </g>

      {/* rami e foglie */}
      <g filter="url(#soft)">
        <path d="M150 95 C 190 70, 235 55, 285 60" stroke="#9aa77e" strokeWidth="1.6" />
        <path d="M195 74 q 10 -22 2 -34 q -14 8 -12 30 z" fill="url(#leaf)" opacity="0.9" />
        <path d="M225 64 q 16 -18 14 -34 q -17 5 -20 30 z" fill="url(#leafGrey)" opacity="0.9" />
        <path d="M255 60 q 18 -10 22 -26 q -19 2 -26 22 z" fill="url(#leaf)" opacity="0.85" />
        <path d="M275 62 q 20 2 30 14 q -18 8 -32 -8 z" fill="url(#leafGrey)" opacity="0.8" />

        <path d="M95 115 C 70 145, 55 165, 45 195" stroke="#9aa77e" strokeWidth="1.6" />
        <path d="M72 148 q -24 -2 -34 8 q 14 12 34 2 z" fill="url(#leaf)" opacity="0.9" />
        <path d="M58 172 q -22 4 -30 16 q 17 8 34 -6 z" fill="url(#leafGrey)" opacity="0.85" />

        {/* fogliame tra le rose */}
        <path d="M135 60 q -6 -26 -22 -36 q -6 20 12 38 z" fill="url(#leafGrey)" opacity="0.9" />
        <path d="M70 55 q -20 -14 -40 -12 q 8 20 34 20 z" fill="url(#leaf)" opacity="0.9" />
      </g>

      {/* rosa grande */}
      <g filter="url(#soft)">
        <circle cx="105" cy="85" r="38" fill="url(#petal)" />
        <path d="M105 47 a38 38 0 0 1 33 57 a30 30 0 0 0 -33 -57z" fill="#e8b6c0" opacity="0.7" />
        <circle cx="105" cy="85" r="26" fill="url(#petalLight)" />
        <path d="M83 78 q 12 -16 34 -12 q 12 4 14 18 q -22 -14 -48 -6z" fill="#dfa4af" opacity="0.65" />
        <circle cx="106" cy="86" r="14" fill="url(#petal)" />
        <path d="M98 82 q 9 -6 17 0 q -3 9 -13 8 q -6 -3 -4 -8z" fill="#d597a4" opacity="0.8" />
        <circle cx="107" cy="87" r="4.5" fill="#c98795" opacity="0.85" />
      </g>

      {/* rosa media */}
      <g filter="url(#soft)">
        <circle cx="185" cy="105" r="27" fill="url(#petalLight)" />
        <circle cx="185" cy="105" r="18" fill="url(#petal)" />
        <path d="M170 100 q 10 -12 28 -6 q -4 14 -18 14 q -9 -2 -10 -8z" fill="#dfa4af" opacity="0.7" />
        <circle cx="186" cy="106" r="7" fill="#e2aab5" />
        <circle cx="186" cy="106" r="3" fill="#c98795" opacity="0.85" />
      </g>

      {/* boccioli */}
      <g filter="url(#soft)">
        <ellipse cx="52" cy="105" rx="13" ry="16" fill="url(#petal)" />
        <path d="M45 98 q 7 -8 14 0 q -2 12 -7 14 q -6 -5 -7 -14z" fill="#dfa4af" opacity="0.6" />
        <ellipse cx="235" cy="128" rx="11" ry="13" fill="url(#petalLight)" />
        <path d="M229 122 q 6 -6 12 0 q -2 10 -6 11 q -5 -4 -6 -11z" fill="#e3adb8" opacity="0.7" />
        <ellipse cx="150" cy="45" rx="9" ry="11" fill="url(#petalLight)" />
      </g>

      {/* fiorellini bianchi */}
      <g filter="url(#soft)" opacity="0.95">
        {[
          [140, 130],
          [65, 70],
          [210, 82],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse
                key={a}
                cx="0"
                cy="-7"
                rx="4"
                ry="7"
                fill="#fbf7f2"
                stroke="#eadfd6"
                strokeWidth="0.5"
                transform={`rotate(${a})`}
              />
            ))}
            <circle r="3" fill="#e9d3a3" />
          </g>
        ))}
      </g>
    </svg>
  );
}
