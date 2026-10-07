/* Ditto's WhatsApp line, as joinditto.in links it (its site config's
   whatsappNumber). wa.me opens the app on a phone and WhatsApp Web on a
   computer, with the first message filled in. Plain data, so server pages
   can link to it as well as the header's help panel. */
const NUMBER = "918867919680";

export const whatsappLink = (message: string) => `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;

export const whatsappHref = whatsappLink("Hi Ditto, I need help with my policy.");
