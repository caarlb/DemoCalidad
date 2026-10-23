// reglas.test.js — Pruebas unitarias de las reglas del cotizador.
const {
  calcularCotizacion,
  validarProducto,
  validarCantidad,
  validarDescuento,
} = require("../src/reglas");

describe("calcularCotizacion", () => {
  test("dos cuadernos con 10% de descuento dan un total de 89.82", () => {
    const r = calcularCotizacion({
      producto: "cuaderno",
      cantidad: 2,
      descuento: 10,
    });
    expect(r.subtotal).toBe(99.8);
    expect(r.ahorro).toBe(9.98);
    expect(r.total).toBe(89.82);
  });

  test("un audífono sin descuento conserva su precio", () => {
    const r = calcularCotizacion({
      producto: "audifonos",
      cantidad: 1,
      descuento: 0,
    });
    expect(r.subtotal).toBe(249.0);
    expect(r.ahorro).toBe(0);
    expect(r.total).toBe(249.0);
  });

  test("un teclado con el descuento máximo permitido", () => {
    const r = calcularCotizacion({
      producto: "teclado",
      cantidad: 1,
      descuento: 30,
    });
    expect(r.subtotal).toBe(399.0);
    expect(r.ahorro).toBe(119.7);
    expect(r.total).toBe(279.3);
  });

  test("el ahorro se redondea a dos decimales", () => {
    const r = calcularCotizacion({
      producto: "cuaderno",
      cantidad: 1,
      descuento: 5,
    });
    expect(r.ahorro).toBe(2.5);
    expect(r.total).toBe(47.4);
  });
});

describe("validaciones", () => {
  test("rechaza un producto desconocido", () => {
    expect(() => validarProducto("impresora")).toThrow("Producto no válido");
  });

  test("rechaza la cantidad cero", () => {
    expect(() => validarCantidad(0)).toThrow();
  });

  test("rechaza cantidades mayores a 99", () => {
    expect(() => validarCantidad(100)).toThrow();
  });

  test("rechaza cantidades con decimales", () => {
    expect(() => validarCantidad(2.5)).toThrow();
  });

  test("rechaza descuentos mayores a 30", () => {
    expect(() => validarDescuento(31)).toThrow();
  });
});
