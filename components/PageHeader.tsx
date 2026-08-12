export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="pt-safe pt-8 pb-4">
      <h1 className="text-[28px] font-semibold text-text-navy">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-text-navy/70">{subtitle}</p>}
    </header>
  );
}
