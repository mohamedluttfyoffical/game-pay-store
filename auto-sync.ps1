# Auto-sync PowerShell script for continuous monitoring and synchronization
param (
    [int]$IntervalSeconds = 10
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Game Pay - مراقب المزامنة التلقائية مع GitHub     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "المستودع: https://github.com/mohamedluttfyoffical/game-pay-store" -ForegroundColor Green
Write-Host "الفرع: main" -ForegroundColor Green
Write-Host "جاري المراقبة كل $IntervalSeconds ثوانٍ... (اضغط Ctrl+C للإيقاف)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {
    try {
        $status = git status --porcelain
        if ($status) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] تم اكتشاف تعديلات جديدة، جاري الحفظ والرفع..." -ForegroundColor Yellow
            git add .
            git commit -m "Auto-sync update: $timestamp"
            
            # محاولة الرفع، وإذا كان هناك تعديلات على السيرفر نجلبها أولاً
            $pushResult = git push origin main 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[$timestamp] جاري سحب التحديثات من GitHub أولاً..." -ForegroundColor Cyan
                git pull --rebase origin main
                git push origin main
            }
            Write-Host "[$timestamp] ✓ تم الرفع والمزامنة بنجاح على GitHub!" -ForegroundColor Green
            Write-Host ""
        }
    } catch {
        Write-Host "[$timestamp] ملاحظة: $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds $IntervalSeconds
}
