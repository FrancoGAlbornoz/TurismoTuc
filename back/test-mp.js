import 'dotenv/config.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preferenceClient = new Preference(client);

async function test() {
  try {
    const preference = {
      items: [{
        title: "Test item",
        quantity: 1,
        unit_price: 100,
        currency_id: "ARS",
      }],
      back_urls: {
        success: "http://localhost:5173/perfil",
        failure: "http://localhost:5173/perfil",
        pending: "http://localhost:5173/perfil",
      }
    };

    console.log("Creating preference...");
    const response = await preferenceClient.create({ body: preference });
    console.log("Success! Init point:", response.init_point);
  } catch (error) {
    console.error("Error creating preference:");
    console.error(error);
  }
}

test();
