export default function LogoMHT({ dark = false, compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-14 shrink-0 font-serif text-[#7A1230]">
        <span className="absolute left-0 top-0 text-[28px] leading-none">M</span>
        <span className="absolute left-4 top-4 text-[28px] leading-none">H</span>
        <span className="absolute left-8 top-7 text-[28px] leading-none">T</span>
      </div>
      {!compact && (
        <span className={`font-serif text-2xl tracking-wide ${dark ? 'text-[#111]' : 'text-white'}`}>
          Marmoraria
        </span>
      )}
    </div>
  );
}
