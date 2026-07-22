import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/api/pagos/crear-pago', {
      items: [{ nombre: 'Test', cantidad: 1, precio: 100 }],
      id_turista: 1
    });
    console.log("Response:", res.data);
  } catch (error) {
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
  }
}

test();
