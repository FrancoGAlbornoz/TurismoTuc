// bot/testExcursiones.js
import { handleExcursiones } from "../bot/responses/excursiones.js";

async function test() {
  const reply = await handleExcursiones();
  console.log(reply);
}

test();