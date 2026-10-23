// ecosystem.config.js — Configuracion de PM2 para DemoCalidad.
// Se guarda dentro del proyecto para no tocar el ecosystem global
// de los demas servicios del servidor.
// No se fija PORT ni NODE_ENV aqui: el pipeline genera el archivo .env
// en el servidor desde el variable group demo-calidad y la aplicacion
// lo lee al arrancar (dotenv). Sin .env, bin/www usa el puerto 3000.
module.exports = {
  apps: [
    {
      name: "DemoCalidad",
      script: "./bin/www",
      cwd: __dirname,
    },
  ],
};
