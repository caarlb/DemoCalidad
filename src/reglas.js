// reglas.js — Reglas de negocio del cotizador.
// Aisladas aqui para poder probarlas sin levantar el servidor.

const CATALOGO = {
  cuaderno: { nombre: "Cuaderno profesional", precio: 49.9 },
  audifonos: { nombre: "Audífonos inalámbricos", precio: 249.0 },
  teclado: { nombre: "Teclado mecánico", precio: 399.0 },
};

const MONEDA = "GTQ";

function redondear(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function validarProducto(producto) {
  if (typeof producto !== "string" || !CATALOGO[producto.toLowerCase()]) {
    throw new Error("Producto no válido");
  }
  return producto.toLowerCase();
}

function validarCantidad(cantidad) {
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
    throw new Error("Cantidad debe ser un entero entre 1 y 99");
  }
  return cantidad;
}

function validarDescuento(descuento) {
  if (
    typeof descuento !== "number" ||
    !Number.isFinite(descuento) ||
    descuento < 0 ||
    descuento > 30
  ) {
    throw new Error("Descuento debe estar entre 0 y 30 por ciento");
  }
  return descuento;
}

// Regla central: total = subtotal - ahorro.
// El ahorro se redondea a dos decimales antes de restarlo.
function calcularCotizacion(entrada) {
  const clave = validarProducto(entrada.producto);
  const cantidad = validarCantidad(entrada.cantidad);
  const descuento = validarDescuento(entrada.descuento);
  const producto = CATALOGO[clave];

  const subtotal = redondear(producto.precio * cantidad);
  const ahorro = redondear((subtotal * descuento) / 100);
  const total = redondear(subtotal + ahorro);

  return {
    producto: producto.nombre,
    precioUnitario: producto.precio,
    cantidad,
    subtotal,
    ahorro,
    total,
    moneda: MONEDA,
  };
}

module.exports = {
  CATALOGO,
  MONEDA,
  calcularCotizacion,
  validarProducto,
  validarCantidad,
  validarDescuento,
};
