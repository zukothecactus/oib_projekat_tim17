# PowerShell skripta za zaustavljanje svih procesa aplikacije
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Zaustavljanje svih procesa aplikacije" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$ports = @{
    5000 = "Gateway API"
    5001 = "Auth Microservice"
    5002 = "User Microservice"
    5003 = "Processing Microservice"
    5004 = "Audit Microservice"
    5006 = "Storage Microservice"
    5100 = "Production Microservice"
}

$killedProcesses = 0

foreach ($port in $ports.Keys) {
    $serviceName = $ports[$port]
    Write-Host "Proveravam port $port ($serviceName)..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  -> Zaustavljam proces: $($process.Name) (PID: $($process.Id))" -ForegroundColor Red
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    $killedProcesses++
                }
            }
        } else {
            Write-Host "  -> Nema aktivnog procesa na portu $port" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  -> Greska prilikom provere porta $port" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
if ($killedProcesses -gt 0) {
    Write-Host "Zaustavljeno $killedProcesses proces(a)!" -ForegroundColor Green
} else {
    Write-Host "Nema aktivnih procesa za zaustavljanje!" -ForegroundColor Green
}
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pritisnite bilo koji taster za nastavak..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
