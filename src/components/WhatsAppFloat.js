import QuoteButton from '@/components/quote/QuoteButton';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function WhatsAppFloat() {
  return (
    <QuoteButton
      ariaLabel="Pedir orçamento pelo WhatsApp"
      className="whatsapp-float fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon size={26} className="text-white" />
    </QuoteButton>
  );
}
