// app.js — Aplicacion Express del cotizador DemoCalidad.
// Sin base de datos ni servicios externos: todo se resuelve en memoria.
const fs = require("fs");
const express = require("express");
const path = require("path");
const { calcularCotizacion } = require("./reglas");
const { version } = require("../package.json");

// Escribe directamente en stdout de forma sincrona: PM2 captura ese
// flujo y `pm2 logs` lo muestra de inmediato. console.log se bufferiza
// cuando stdout es un pipe (como ocurre bajo PM2) y los mensajes tardan
// en aparecer, lo que confunde durante la demostracion.
function log(msg) {
  fs.writeSync(process.stdout.fd, msg + "\n");
}

const app = express();

app.use(express.json());

// Registro de actividad: cada solicitud deja una linea en el log.
// Se ve con `pm2 logs DemoCalidad` y sirve para mostrar en vivo
// que la aplicacion esta recibiendo trafico.
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion} ms)`);
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
    log(
      `[cotizacion] ${resultado.cantidad} x ${resultado.producto} | descuento ${req.body.descuento}% | total Q ${resultado.total.toFixed(2)}`
    );
    res.json(resultado);
  } catch (error) {
    log(`[cotizacion] rechazada: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

module.exports = app;
