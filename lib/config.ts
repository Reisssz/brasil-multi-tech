export const SITE = {
  name: "Brasil Multi Tech",
  slogan: "Tecnologia que cabe no seu bolso.",
  domain: "brasilmultitech.com.br",
  whatsappNumber: "5511964603290",
  whatsappMessage: "Olá! Quero falar com um consultor da Brasil Multi Tech.",
  phoneDisplay: "(91) 98633-8826",
  supportEmail: "brasilmultitech1000@gmail.com",
  instagram: "@brasilmultitech",
  instagramUrl: "https://instagram.com/brasilmultitech",
  address: {
    line1: "Shopping João Alfredo — R. Conselheiro João Alfredo, 236",
    line2: "Piso térreo, loja C20 e C22 — Campina, Belém - PA",
    zip: "66013-000",
  },
  yearsInBusiness: 5,
  devicesDelivered: 48000,
  happyCustomers: 31500,
  averageRating: 4.8,
};

export function whatsappLink(message: string = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
