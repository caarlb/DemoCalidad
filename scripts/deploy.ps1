# deploy.ps1 — Despliegue manual de DemoCalidad (pruebas locales en el servidor).
# El pipeline usa una version de este mismo script dentro del YAML;
# este archivo sirve para probar el despliegue sin pasar por Azure.

param(
  [Parameter(Mandatory = $true)][string]$ArchivoZip,
  [string]$Destino = "E:\Servicios\ServiciosNode\DemoCalidad",
  [string]$NombrePm2 = "DemoCalidad",
  [int]$Puerto = 3000
)

$ErrorActionPreference = "Stop"
$temp = "$Destino`_temp"

Write-Host "1/5 Verificando carpeta destino"
New-Item -ItemType Directory -Path $Destino -Force | Out-Null

Write-Host "2/5 Extrayendo artefacto"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Path $temp -Force | Out-Null
Expand-Archive -Path $ArchivoZip -DestinationPath $temp -Force
if (-not (Test-Path "$temp\bin\www")) { throw "El artefacto no contiene bin\www" }

Write-Host "3/5 Deteniendo la version actual"
pm2 stop $NombrePm2 2>$null | Out-Null

Write-Host "4/5 Reemplazando archivos"
$backup = "$Destino`_old"
if (Test-Path $backup) { Remove-Item $backup -Recurse -Force }
if (Test-Path "$Destino\bin") {
  Rename-Item $Destino $backup
  New-Item -ItemType Directory -Path $Destino -Force | Out-Null
}
Get-ChildItem $temp -Force | Move-Item -Destination $Destino -Force
Remove-Item $temp -Recurse -Force

Write-Host "5/5 Levantando y verificando el servicio"
pm2 start "$Destino\ecosystem.config.js" | Out-Null
Start-Sleep -Seconds 3
$salud = Invoke-RestMethod -Uri "http://localhost:$Puerto/api/health" -TimeoutSec 15
Write-Host ("Servicio {0}, version {1}" -f $salud.estado, $salud.version)
if ($salud.estado -ne "ok") { throw "El servicio no respondio correctamente" }

Write-Host "Despliegue completado."
