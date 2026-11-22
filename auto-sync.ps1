# Auto-sync script for continuous monitoring and synchronization with GitHub
param (
    [int]$IntervalSeconds = 5
)

if ($PSScriptRoot) {
    Set-Location -Path $PSScriptRoot
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Game Pay - Auto-Sync Monitor (GitHub: game-pay-store) " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Branch: main" -ForegroundColor Green
Write-Host "Monitoring every $IntervalSeconds seconds... (Press Ctrl+C to stop)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {
    try {
        $status = git status --porcelain
        if ($status) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] Changes detected. Staging and committing..." -ForegroundColor Yellow
            git add .
            git commit -m "Auto-sync update: $timestamp"
            
            git push origin main
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[$timestamp] Remote updates detected. Pulling with rebase first..." -ForegroundColor Cyan
                git pull --rebase origin main
                git push origin main
            }
            Write-Host "[$timestamp] [OK] Successfully synchronized and pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
        }
    } catch {
        Write-Host "[$timestamp] Error during sync: $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds $IntervalSeconds
}
