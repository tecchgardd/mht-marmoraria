import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/5511999999999"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chamar no WhatsApp"
      className="whatsapp-float fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon size={26} className="text-white" />
    </a>
  );
}
