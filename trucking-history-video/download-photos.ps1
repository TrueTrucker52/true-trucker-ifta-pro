# Run this script once from your Windows machine to download real stock photos.
# Place it in the trucking-history-video folder and run:
#   powershell -ExecutionPolicy Bypass -File download-photos.ps1

$dir = "$PSScriptRoot\public\photos"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

function Download-Photo($filename, $urls) {
    $out = Join-Path $dir $filename
    Write-Host "Downloading $filename ..."
    foreach ($url in $urls) {
        try {
            Invoke-WebRequest -Uri $url -OutFile $out -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -TimeoutSec 30
            $size = [math]::Round((Get-Item $out).Length / 1KB)
            if ($size -gt 5) {
                Write-Host "  OK ($size KB)"
                return
            }
        } catch {}
    }
    Write-Host "  FAILED all sources for $filename"
}

# scene1 — dramatic night / dusk semi truck
Download-Photo "scene1.jpg" @(
    "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/1252500/pexels-photo-1252500.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1080"
)

# scene2 — 1896 Daimler first motor truck (public domain, Wikimedia)
Download-Photo "scene2.jpg" @(
    "https://upload.wikimedia.org/wikipedia/commons/1/1a/DMG-lastwagen-cannstatt-1896.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/DMG-lastwagen-cannstatt-1896.jpg/800px-DMG-lastwagen-cannstatt-1896.jpg"
)

# scene3 — WWII Red Ball Express convoy (public domain, Wikimedia)
Download-Photo "scene3.jpg" @(
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/Convoy_Red_Ball_Express.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Convoy_Red_Ball_Express.jpg/1024px-Convoy_Red_Ball_Express.jpg"
)

# scene4 — interstate highway interchange, aerial view
Download-Photo "scene4.jpg" @(
    "https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/1145434/pexels-photo-1145434.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/38537/road-highway-expressway-freeway-38537.jpeg?auto=compress&cs=tinysrgb&w=1080"
)

# scene5 — classic 1970s-80s semi truck (golden age)
Download-Photo "scene5.jpg" @(
    "https://images.pexels.com/photos/3609464/pexels-photo-3609464.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/1625220/pexels-photo-1625220.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1080"
)

# scene6 — modern semi truck hauling freight on open highway
Download-Photo "scene6.jpg" @(
    "https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/1252500/pexels-photo-1252500.jpeg?auto=compress&cs=tinysrgb&w=1080"
)

# scene7 — truck at sunset / golden hour
Download-Photo "scene7.jpg" @(
    "https://images.pexels.com/photos/1009534/pexels-photo-1009534.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/2526105/pexels-photo-2526105.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop",
    "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1080"
)

Write-Host "`nDone! Restart Remotion Studio to see the real photos."
