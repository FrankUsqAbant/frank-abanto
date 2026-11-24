# Conecta la recepcionista con tu base "Clientes del taller" de Notion.
# La llave se escribe oculta y va directo a Cloudflare: no se muestra ni se guarda en ningún archivo.
$ErrorActionPreference = 'Stop'
$env:CLOUDFLARE_ACCOUNT_ID = '413140211e3e586eddf279c41f0345d2'
$IdBase = '42103e949ef4818a87eceecc9c075827'
Set-Location $PSScriptRoot

function Probar-Notion($url, $version) {
  try { $r = Invoke-RestMethod $url -Headers @{ Authorization = "Bearer $script:token"; 'Notion-Version' = $version }; return @{ ok = $true; r = $r } }
  catch {
    $cod = $_.Exception.Response.StatusCode.value__; $det = ''
    try { $det = ($_.ErrorDetails.Message | ConvertFrom-Json).code } catch {}
    return @{ ok = $false; cod = $cod; det = $det }
  }
}

$seguro = Read-Host 'Pega el Token de API de Notion y pulsa Enter' -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)).Trim()
Write-Host "Largo de lo pegado: $($token.Length) caracteres (empieza con '$($token.Substring(0, [Math]::Min(4, $token.Length)))')"

# 1) ¿la llave es valida?
$yo = Probar-Notion 'https://api.notion.com/v1/users/me' '2022-06-28'
if (-not $yo.ok) { Write-Host "La llave NO es valida (Notion respondio $($yo.cod) $($yo.det)). Vuelve a copiarla con el icono de copiar y ejecuta de nuevo." -ForegroundColor Red; exit 1 }
Write-Host "Llave valida: conexion '$($yo.r.name)'" -ForegroundColor Green

# 2) ¿ve la base?
$base = Probar-Notion "https://api.notion.com/v1/databases/$IdBase" '2022-06-28'
if (-not $base.ok) {
  $base2 = Probar-Notion "https://api.notion.com/v1/databases/$IdBase" '2025-09-03'
  Write-Host "No ve la base: Notion respondio $($base.cod) $($base.det) (con la version nueva: $($base2.cod) $($base2.det) $(if ($base2.ok) {'OK'}))." -ForegroundColor Yellow
  Write-Host 'Si es 404 object_not_found: en la conexion, pestaña "Acceso al contenido", confirma que "Clientes del taller" aparece en la lista y que pulsaste Guardar.'
  exit 1
}
Write-Host "Acceso confirmado a: $($base.r.title[0].plain_text)" -ForegroundColor Green

$token | npx -y wrangler@4 secret put NOTION_TOKEN | Out-Null
$IdBase | npx -y wrangler@4 secret put NOTION_DB | Out-Null
Write-Host 'Conectado. Las fichas de clientes llegaran solas a Notion.' -ForegroundColor Green
