$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

if (-not (Test-Path $cscPath)) {
    Write-Warning "csc.exe not found. Audio controller will fallback to dynamic PowerShell execution."
    exit 0
}

$source = Join-Path $PSScriptRoot "..\resources\bin\AudioController.cs"
$target = Join-Path $PSScriptRoot "..\resources\bin\AudioController.exe"

Write-Host "Compiling $source -> $target ..."
& $cscPath /nologo /optimize /target:exe /out:"$target" "$source"

if ($LASTEXITCODE -eq 0 -and (Test-Path $target)) {
    Write-Host "AudioController.exe compiled successfully!" -ForegroundColor Green
} else {
    Write-Error "Failed to compile AudioController.exe"
}

