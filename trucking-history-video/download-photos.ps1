# Run this script once from your Windows machine to download real stock photos.
# Place it in the trucking-history-video folder and run:
#   powershell -ExecutionPolicy Bypass -File download-photos.ps1

$dir = "$PSScriptRoot\public\photos"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$photos = @{
    "scene1.jpg" = "https://images.unsplash.com/photo-tSSqFlP0--o?w=1080&h=1920&fit=crop&q=85"
    "scene2.jpg" = "https://upload.wikimedia.org/wikipedia/commons/1/1a/DMG-lastwagen-cannstatt-1896.jpg"
    "scene3.jpg" = "https://upload.wikimedia.org/wikipedia/commons/f/fb/Convoy_Red_Ball_Express.jpg"
    "scene4.jpg" = "https://images.unsplash.com/photo-xTAF3D6K-SU?w=1080&h=1920&fit=crop&q=85"
    "scene5.jpg" = "https://images.unsplash.com/photo-xhl1zMqWN34?w=1080&h=1920&fit=crop&q=85"
    "scene6.jpg" = "https://images.unsplash.com/photo-PozaNwheXFE?w=1080&h=1920&fit=crop&q=85"
    "scene7.jpg" = "https://images.unsplash.com/photo-0A_XOIocfrE?w=1080&h=1920&fit=crop&q=85"
}

foreach ($file in $photos.Keys) {
    $url = $photos[$file]
    $out = Join-Path $dir $file
    Write-Host "Downloading $file ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UserAgent "Mozilla/5.0" -TimeoutSec 30
        Write-Host "  OK ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
    } catch {
        Write-Host "  FAILED: $_"
    }
}

Write-Host "`nDone! Now restart Remotion Studio to see the real photos."
