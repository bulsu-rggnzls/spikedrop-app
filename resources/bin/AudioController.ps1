param (
    [string]$Command = "list",
    [string]$ProcessName = "VALORANT-Win64-Shipping",
    [string]$Value = "1.0"
)

$csFile = Join-Path $PSScriptRoot "AudioController.cs"
$exeFile = Join-Path $PSScriptRoot "AudioController.exe"

if (Test-Path $exeFile) {
    & $exeFile $Command $ProcessName $Value
    exit $LASTEXITCODE
}

# Fallback: compile on the fly or run via Csc
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

if ((Test-Path $cscPath) -and (Test-Path $csFile)) {
    & $cscPath /nologo /optimize /target:exe /out:"$exeFile" "$csFile" | Out-Null
    if (Test-Path $exeFile) {
        & $exeFile $Command $ProcessName $Value
        exit $LASTEXITCODE
    }
}

Write-Error "AudioController helper unavailable"
exit 1

