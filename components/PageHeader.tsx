export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="pt-safe pt-8 pb-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">Boat Day</p>
      <h1 className="mt-1 text-[30px] font-semibold leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-white/85">{subtitle}</p>}
    </header>
  );
}
