# Auto-sync PowerShell script for continuous monitoring and synchronization
param (
    [int]$IntervalSeconds = 30
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Game Pay - مراقب المزامنة التلقائية مع GitHub     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "المستودع: https://github.com/mohamedluttfyoffical/game-pay-store" -ForegroundColor Green
Write-Host "جاري المراقبة كل $IntervalSeconds ثانية... (اضغط Ctrl+C للإيقاف)" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $status = git status --porcelain
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] تم اكتشاف تعديلات جديدة، جاري الرفع..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto-sync update: $timestamp"
        git push origin main
        Write-Host "[$timestamp] ✓ تم الرفع والمزامنة بنجاح!" -ForegroundColor Green
    }
    Start-Sleep -Seconds $IntervalSeconds
}
