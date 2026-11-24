# Conecta la recepcionista con tu Telegram. La llave del bot se escribe oculta y va directo a Cloudflare:
# no se muestra en pantalla ni se guarda en ningún archivo.
$ErrorActionPreference = 'Stop'
$env:CLOUDFLARE_ACCOUNT_ID = '413140211e3e586eddf279c41f0345d2'
Set-Location $PSScriptRoot

$seguro = Read-Host 'Pega la llave (token) que te dio BotFather y pulsa Enter' -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)).Trim()

$yo = Invoke-RestMethod "https://api.telegram.org/bot$token/getMe"
Write-Host "Bot encontrado: @$($yo.result.username)" -ForegroundColor Green
Write-Host "Ahora abre Telegram, busca @$($yo.result.username) y enviale: hola"
Read-Host 'Cuando lo hayas enviado, pulsa Enter'

$chat = $null
for ($i = 0; $i -lt 6 -and -not $chat; $i++) {
  $u = Invoke-RestMethod "https://api.telegram.org/bot$token/getUpdates"
  $chat = ($u.result | Where-Object { $_.message.chat.type -eq 'private' } | Select-Object -Last 1).message.chat.id
  if (-not $chat) { Start-Sleep 3 }
}
if (-not $chat) { Write-Host 'No llego tu mensaje al bot. Enviale "hola" y vuelve a ejecutar este archivo.' -ForegroundColor Yellow; exit 1 }

$token | npx -y wrangler@4 secret put TELEGRAM_TOKEN | Out-Null
"$chat" | npx -y wrangler@4 secret put TELEGRAM_CHAT | Out-Null
Invoke-RestMethod "https://api.telegram.org/bot$token/sendMessage" -Method Post -ContentType 'application/json' -Body (@{ chat_id = $chat; text = 'Listo: aqui te avisare cuando un cliente este listo para hablar contigo.' } | ConvertTo-Json) | Out-Null
Write-Host 'Conectado. Te llego un mensaje de prueba a Telegram.' -ForegroundColor Green
