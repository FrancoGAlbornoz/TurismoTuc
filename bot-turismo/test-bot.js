// test-bot.js
import { getMenuResponse } from "./bot/responses/menu.js";

// Simular un usuario
const userId = "5493815001111@c.us";

// Función para simular un mensaje
async function enviarMensaje(mensaje) {
  console.log("\n👤 TÚ:", mensaje);
  console.log("⏳ Procesando...");
  
  const respuesta = await getMenuResponse(userId, mensaje);
  
  console.log("\n🤖 BOT:");
  console.log(respuesta);
  console.log("\n" + "=".repeat(60));
}

// Simular conversación
async function testearBot() {
  console.log("🧪 INICIANDO PRUEBA DEL BOT\n");
  console.log("=".repeat(60));
  
  // Paso 1: Saludo
  await enviarMensaje("hola");
  
  // Esperar un poco para simular usuario escribiendo
  await esperar(1000);
  
  // Paso 2: Elegir excursión 1
  await enviarMensaje("1");
  
  await esperar(1000);
  
  // Paso 3: Ver precio
  await enviarMensaje("1");
  
  await esperar(1000);
  
  // Paso 4: Volver
  await enviarMensaje("menu");
  
  await esperar(1000);
  
  // Paso 5: Ver fechas de excursión 2
  await enviarMensaje("2");
  
  await esperar(1000);
  
  await enviarMensaje("2");
  
  console.log("\n✅ Prueba completada!");
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar prueba
testearBot().catch(err => {
  console.error("❌ Error en la prueba:", err);
});