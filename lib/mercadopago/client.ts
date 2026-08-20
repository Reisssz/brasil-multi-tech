import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 8000 },
});

export const mpPreference = new Preference(client);
export const mpPayment = new Payment(client);
