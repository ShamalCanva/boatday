// Minimal inline icon set — no icon library dependency, keeps the bundle tiny.
export function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.2 8.8 13 13l-4.2 2.2L11 11l4.2-2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.9 6.5 11 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function AnchorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5V19M7 14c0 3 2.5 5 5 5s5-2 5-5M4.5 12.5h3M16.5 12.5h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LifeRingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 6l3.6 3.6M18 6l-3.6 3.6M6 18l3.6-3.6M18 18l-3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StairsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 19v-3h3v-3h3V10h3V7h3V4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4.5 16.5v-3.2c0-.5.2-1 .5-1.4l1.7-2.1c.3-.4.9-.7 1.4-.7h7.8c.5 0 1 .3 1.4.7l1.7 2.1c.4.4.5.9.5 1.4v3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="3" y="14.5" width="18" height="4.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="19.5" r="1.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="19.5" r="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function BusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4.5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 10.5h16M8 4.5v12" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="19.3" r="1.3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="19.3" r="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ParkingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 16V8h2.6a2.5 2.5 0 0 1 0 5H9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WheelIcon({ className }: { className?: string }) {
  // A ship's helm — used to mark the captain in the guest list.
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <path
        d="M12 4.8V8M12 16v3.2M4.8 12H8M16 12h3.2M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
