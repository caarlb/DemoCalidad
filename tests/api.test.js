// api.test.js — Pruebas de los endpoints con supertest.
const request = require("supertest");
const app = require("../src/app");
const { version } = require("../package.json");

describe("POST /api/quote", () => {
  test("responde 200 con la cotización correcta", async () => {
    const respuesta = await request(app)
      .post("/api/quote")
      .send({ producto: "cuaderno", cantidad: 2, descuento: 10 });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.total).toBe(89.82);
    expect(respuesta.body.moneda).toBe("GTQ");
  });

  test("responde 400 con un producto inválido", async () => {
    const respuesta = await request(app)
      .post("/api/quote")
      .send({ producto: "impresora", cantidad: 1, descuento: 0 });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe("Producto no válido");
  });

  test("responde 400 con una cantidad inválida", async () => {
    const respuesta = await request(app)
      .post("/api/quote")
      .send({ producto: "cuaderno", cantidad: 0, descuento: 0 });

    expect(respuesta.status).toBe(400);
  });
});

describe("otros endpoints", () => {
  test("GET /api/health devuelve la versión del paquete", async () => {
    const respuesta = await request(app).get("/api/health");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe("ok");
    expect(respuesta.body.version).toBe(version);
  });

  test("GET / entrega la página del cotizador", async () => {
    const respuesta = await request(app).get("/");

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("Cotizador DemoCalidad");
  });
});
