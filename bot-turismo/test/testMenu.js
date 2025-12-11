// testMenu.js
import { getMenuResponse } from "../bot/responses/menu.js";

async function test() {
  const mensajes = [
    "2",                  // debería mostrar excursiones
    "Paquete a Tucumán",  // palabra clave
    "hola",               // mensaje sin sentido
    "1",                  // otra opción de menú
    "",                   // mensaje vacío
  ];

  for (const msg of mensajes) {
    const reply = await getMenuResponse("test_user", msg);
    console.log(`Mensaje: "${msg}"\nBot: "${reply}"\n---`);
  }
}

test();
