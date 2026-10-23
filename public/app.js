// app.js — Interaccion de la pagina del cotizador.
const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
const errorBox = document.getElementById("error");
const productoSelect = document.getElementById("producto");
const registro = document.getElementById("registro");

// Escribe una linea en el panel de actividad y en la consola del navegador.
// Sirve para que durante la demostracion se vea que la pagina se esta usando
// sin tener que abrir las herramientas de desarrollo.
function registrar(mensaje) {
  const hora = new Date().toLocaleTimeString("es-GT");
  const linea = document.createElement("li");
  linea.textContent = `${hora}  ${mensaje}`;
  registro.prepend(linea);
  console.log(`[${hora}] ${mensaje}`);
}

function nombreProducto() {
  const opcion = productoSelect.options[productoSelect.selectedIndex];
  return opcion.text.split(" — ")[0];
}

// Muestra la version publicada por el servidor (se lee tras cada deploy).
fetch("/api/health")
  .then((r) => r.json())
  .then((salud) => {
    document.getElementById("version").textContent = `versión ${salud.version}`;
    registrar(`Aplicación conectada · versión ${salud.version}`);
  })
  .catch(() => registrar("No se pudo consultar la versión del servidor"));

// Cada cambio en el combo deja rastro en el panel y en la consola.
productoSelect.addEventListener("change", () => {
  registrar(`Producto seleccionado: ${nombreProducto()}`);
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  resultado.classList.add("oculto");
  errorBox.classList.add("oculto");

  const cuerpo = {
    producto: productoSelect.value,
    cantidad: Number(document.getElementById("cantidad").value),
    descuento: Number(document.getElementById("descuento").value),
  };

  registrar(
    `Click en Calcular · ${cuerpo.cantidad} × ${nombreProducto()} · ${cuerpo.descuento} % de descuento`
  );

  const respuesta = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    errorBox.textContent = datos.error || "No se pudo calcular la cotización";
    errorBox.classList.remove("oculto");
    registrar(`Respuesta 400 · ${datos.error}`);
    return;
  }

  document.getElementById("detalle").textContent =
    `${datos.cantidad} × ${datos.producto} al ${datos.precioUnitario.toFixed(2)} con ${document.getElementById("descuento").value} % de descuento`;
  document.getElementById("subtotal").textContent = `Q ${datos.subtotal.toFixed(2)}`;
  document.getElementById("ahorro").textContent = `Q ${datos.ahorro.toFixed(2)}`;
  document.getElementById("total").textContent = `Q ${datos.total.toFixed(2)}`;
  resultado.classList.remove("oculto");
  registrar(`Cotización calculada · total Q ${datos.total.toFixed(2)}`);
});
