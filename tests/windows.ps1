# The Windows launcher supplies verified Node.js, 64tass and VICE paths.
[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$Node)
$ErrorActionPreference = 'Stop'

foreach ($test in @('stress-fps', 'verify-torq', 'verify-fps-soak')) {
    & $Node (Join-Path $PSScriptRoot "$test.cjs")
    if ($LASTEXITCODE -ne 0) {
        throw "VICE check $test failed (exit code $LASTEXITCODE). See build/validation for emulator logs."
    }
}

$fps = Get-Content (Join-Path $PSScriptRoot '../build/fps-stress.json') -Raw | ConvertFrom-Json
$expected = @{ pal = 12.5; ntsc = 15 }
foreach ($mode in @('pal', 'ntsc')) {
    $trials = @($fps.trials | Where-Object { $_.mode -eq $mode })
    $misses = @($trials | Where-Object { -not $_.targetMet -or $_.measuredNominalFPS -ne $expected[$mode] })
    if ($trials.Count -ne 5 -or $misses.Count -ne 0) {
        throw "Unexpected cadence for $mode in build/fps-stress.json."
    }
}
Write-Host 'VICE passed 12.5 fps PAL and 15 fps NTSC.'
