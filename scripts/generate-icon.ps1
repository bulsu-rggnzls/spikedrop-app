Add-Type -AssemblyName System.Drawing

$dir = Join-Path $PSScriptRoot "..\resources"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$iconPath = Join-Path $dir "icon.png"
$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background circle
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 25, 35))
$g.FillEllipse($bgBrush, 4, 4, 248, 248)

# Border ring
$ringPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 70, 85)), 6
$g.DrawEllipse($ringPen, 4, 4, 248, 248)

# Spotify Green Arc
$greenPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(29, 185, 84)), 10
$g.DrawArc($greenPen, 40, 70, 176, 120, 200, 140)
$g.DrawArc($greenPen, 60, 100, 136, 100, 200, 140)
$g.DrawArc($greenPen, 80, 130, 96, 80, 200, 140)

# Valorant Red V Accent
$redBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 70, 85))
$vPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 70, 85)), 12
$g.DrawLine($vPen, 90, 70, 128, 170)
$g.DrawLine($vPen, 128, 170, 166, 70)

$bmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Saved icon to $iconPath"

