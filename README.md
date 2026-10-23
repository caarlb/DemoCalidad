# DemoCalidad

Cotizador genérico de práctica para la demostración de **Integración Continua y
DevOps con Azure DevOps** (curso de Aseguramiento de la Calidad de Software).

Sin base de datos y sin servicios externos: el catálogo vive en el código y todo
se resuelve en memoria, en tiempo de ejecución.

## Requisitos

- Node.js 20.x (local y en el servidor)
- PM2 instalado en el servidor Windows
- Un agente autohospedado registrado en el pool `Default` de Azure DevOps

## Ejecutar en local

```bash
npm install
copy .env.example .env
npm start
```

Abrir `http://localhost:3000`. El puerto se cambia con la variable `PORT`, y en
el servidor esa variable la escribe el pipeline en el archivo `.env` a partir
del variable group `demo-calidad`.

## Pruebas

```bash
npm test
```

Son 14 pruebas: 9 de reglas de negocio (`tests/reglas.test.js`) y 5 de API
(`tests/api.test.js`). El informe JUnit queda en `test-results/results.xml`, que
es el archivo que el pipeline publica con `PublishTestResults@2`.

## Estructura

```
DemoCalidad/
├── azure-pipelines.yml      # definición del pipeline
├── .env.example             # plantilla de configuración para desarrollo local
├── package.json             # dependencias, versión y configuración de Jest
├── ecosystem.config.js      # configuración de PM2 (propia del proyecto)
├── bin/
│   └── www                  # punto de entrada
├── src/
│   ├── app.js               # aplicación Express
│   └── reglas.js            # reglas de negocio del cotizador
├── public/
│   ├── index.html           # página del cotizador
│   ├── style.css
│   └── app.js
├── scripts/
│   └── deploy.ps1           # despliegue manual (pruebas locales)
└── tests/
    ├── reglas.test.js
    └── api.test.js
```

## Despliegue manual (prueba local en el servidor)

1. Generar el ZIP con el contenido de la aplicación (bin, src, public,
   package.json, package-lock.json, node_modules y ecosystem.config.js).
2. Ejecutar en PowerShell:

```powershell
.\scripts\deploy.ps1 -ArchivoZip "C:\ruta\democalidad.zip"
```

El script extrae el ZIP, detiene la versión actual con PM2, reemplaza los
archivos, levanta el servicio y verifica `http://localhost:3000/api/health`.
El pipeline ejecuta esta misma lógica dentro del YAML, con un paso adicional
que genera el `.env` desde el variable group. En el despliegue manual, si hace
falta otro puerto, se crea el `.env` a mano en la carpeta destino.

## Configuración en Azure DevOps

1. Crear el proyecto en la organización y subir este repositorio a Azure Repos.
2. En **Pipelines > Library**, crear el variable group `demo-calidad` con dos
   variables: `PORT` = `3000` y `NODE_ENV` = `production`.
3. En **Pipelines > Environments**, crear el environment `demo-calidad` (sin
   aprobaciones para la demostración).
4. Crear el pipeline apuntando al archivo `azure-pipelines.yml` del repositorio.
   Al guardar, autorizar el uso del variable group `demo-calidad` cuando Azure
   lo solicite (también se puede vincular desde la configuración del pipeline).
5. Verificar que el agente del servidor aparece **Online** en el pool `Default`.
6. En el servidor, confirmar que existe `E:\Servicios\ServiciosNode\` y que
   PM2 está disponible (`pm2 --version`).

No se configuran políticas de rama ni pull requests: en la cooperativa se
trabaja con push directo a `main`, así que la barrera es el propio pipeline
(las pruebas corren en cada push y el despliegue solo ocurre si pasan).

## Flujo de la demostración

1. Abrir la aplicación desplegada y calcular **dos cuadernos con 10 % de
   descuento**: el total debe ser **Q 89.82**. Mientras se usa la página, el
   panel **Actividad** y la consola del navegador van mostrando cada acción.
2. En `main`, cambiar la resta por una suma en `src/reglas.js`
   (`total = redondear(subtotal + ahorro)`), hacer commit y `git push`.
3. El pipeline arranca solo: la prueba
   *"dos cuadernos con 10% de descuento dan un total de 89.82"* falla
   (`expected 89.82, received 109.78`), la etapa Build queda en rojo y la etapa
   Deploy **no se ejecuta**: el servidor sigue respondiendo con la versión
   anterior, intacta.
4. Corregir la resta, actualizar la versión en `package.json` a `1.0.1`, hacer
   commit y `git push`.
5. Build pasa y Deploy corre: el paso 5/6 escribe el `.env` con `PORT` y
   `NODE_ENV` del variable group; el paso 6/6 levanta el servicio y consulta la
   salud con ese mismo puerto. `GET /api/health` responde con la versión
   `1.0.1` y la página muestra el total correcto.

## Logs

La aplicación deja rastro de su uso en dos lugares:

- **Servidor** (`pm2 logs DemoCalidad`): una línea por cada solicitud
  (`método`, `ruta`, `código de respuesta` y duración), el detalle de cada
  cotización (`producto`, `cantidad`, `descuento`, `total`) y los rechazos con
  su motivo. Al arrancar imprime la versión y el entorno.
- **Página**: el panel **Actividad** muestra lo mismo que la consola del
  navegador: producto seleccionado, click en Calcular, cotización calculada,
  errores y la versión con la que se conectó.

## Notas

- El agente debe ejecutarse con el mismo usuario con el que se revisa `pm2` en
  el servidor; de lo contrario, PM2_HOME difiere y `pm2 ls` no muestra la
  aplicación levantada por el agente.
- El puerto configurado en el variable group debe estar abierto si se quiere
  mostrar la página desde otra máquina; como alternativa se puede verificar por
  RDP o con el log del pipeline (paso 6/6).
- El `ecosystem.config.js` del proyecto es propio de DemoCalidad; no modifica
  el ecosystem global de los demás servicios del servidor.
