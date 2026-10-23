// app.js — Aplicacion Express del cotizador DemoCalidad.
// Sin base de datos ni servicios externos: todo se resuelve en memoria.
const express = require("express");
const path = require("path");
const { calcularCotizacion } = require("./reglas");
const { version } = require("../package.json");

const app = express();

app.use(express.json());

// Registro de actividad: cada solicitud deja una linea en el log.
// Se ve con `pm2 logs DemoCalidad` y sirve para mostrar en vivo
// que la aplicacion esta recibiendo trafico.
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion} ms)`
    );
  });
  next();
});

app.use(express.static(path.join(__dirname, "..", "public")));

// Salud del servicio: devuelve la version publicada, util para
// comprobar despues de cada despliegue que llego la version nueva.
app.get("/api/health", (req, res) => {
  res.json({
    estado: "ok",
    servicio: "DemoCalidad",
    version,
    fecha: new Date().toISOString(),
  });
});

// Cotizacion: recibe producto, cantidad y descuento en JSON.
// Los datos invalidos se rechazan con 400 y un mensaje claro.
app.post("/api/quote", (req, res) => {
  try {
    const resultado = calcularCotizacion(req.body || {});
    console.log(
      `[cotizacion] ${resultado.cantidad} x ${resultado.producto} | descuento ${req.body.descuento}% | total Q ${resultado.total.toFixed(2)}`
    );
    res.json(resultado);
  } catch (error) {
    console.warn(`[cotizacion] rechazada: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

module.exports = app;
