# Bootstrap missing Windows tools into ignored build/tools, verify archive
# hashes, then build and launch TORQ or run the VICE checks. Existing tools and
# cached downloads are reused; no package manager or permanent PATH edit is needed.
[CmdletBinding()]
param([switch]$BuildOnly, [switch]$NoInstall, [switch]$Test)
$ErrorActionPreference = 'Stop'

function Find-Executable([string]$Override, [string]$Name) {
    if ($Override) {
        $command = Get-Command $Override -CommandType Application -ErrorAction SilentlyContinue
        if (-not $command) { throw "Executable override does not exist: $Override" }
        return $command.Source
    }
    $command = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
}

function Test-Node([string]$Executable) {
    if (-not $Executable) { return $false }
    & $Executable -e 'if(parseInt(process.versions.node,10)<18)process.exit(1)' *> $null
    return $LASTEXITCODE -eq 0
}

function Install-Archive([string]$Url, [string]$Name, [string]$Hash, [string]$RelativeExe) {
    $executable = Join-Path $toolsDir $RelativeExe
    $marker = "$executable.complete"
    if ((Test-Path $marker) -and (Test-Path $executable)) { return $executable }
    if ($NoInstall) { throw "Missing $RelativeExe. Rerun without -NoInstall to download it." }
    if ($Hash -notmatch '^[a-fA-F0-9]{64}$') { throw "Invalid SHA-256 metadata for $Name" }
    New-Item -ItemType Directory -Force $toolsDir | Out-Null
    $archive = Join-Path $toolsDir $Name
    $partial = "$archive.download"
    Write-Host "Downloading $Name..."
    try {
        Invoke-WebRequest -UseBasicParsing $Url -OutFile $partial
        if ((Get-FileHash $partial -Algorithm SHA256).Hash -ne $Hash) { throw "SHA-256 mismatch for $Name" }
        Move-Item $partial $archive -Force
        Expand-Archive $archive $toolsDir -Force
        if (-not (Test-Path $executable)) { throw "Archive did not contain $RelativeExe" }
        Set-Content $marker $Hash
    } finally {
        if (Test-Path $partial) { Remove-Item $partial -Force }
    }
    return $executable
}

function Get-Node {
    $existing = Find-Executable $env:NODE_BIN 'node.exe'
    if (Test-Node $existing) { return $existing }
    if ($env:NODE_BIN) { throw 'NODE_BIN must point to Node.js 18 or newer.' }
    foreach ($directory in @(Get-ChildItem $toolsDir -Directory -Filter 'node-v*-win-x64' -ErrorAction SilentlyContinue | Sort-Object Name -Descending)) {
        $cached = Join-Path $directory.FullName 'node.exe'
        if ((Test-Path "$cached.complete") -and (Test-Node $cached)) { return $cached }
    }
    if ($NoInstall) { throw 'Node.js 18+ is required. Rerun without -NoInstall or set NODE_BIN.' }
    $releases = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
    $version = ($releases | Where-Object { $_.lts } | Select-Object -First 1).version
    if ($version -notmatch '^v\d+\.\d+\.\d+$') { throw 'Invalid Node.js release metadata.' }
    $name = "node-$version-win-x64.zip"
    $sums = (Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/$version/SHASUMS256.txt").Content
    $line = $sums -split '\r?\n' | Where-Object { $_ -match "^[a-fA-F0-9]{64}\s+$([regex]::Escape($name))$" } | Select-Object -First 1
    if (-not $line) { throw "No official checksum found for $name" }
    $node = Install-Archive "https://nodejs.org/dist/$version/$name" $name (($line -split '\s+')[0]) "node-$version-win-x64/node.exe"
    if (-not (Test-Node $node)) { throw 'Downloaded Node.js could not run on this Windows version.' }
    return $node
}

function Get-Vice {
    $existing = Find-Executable $env:VICE_BIN 'x64sc.exe'
    if ($existing) { return $existing }
    # Official VICE 3.10 release, SHA-256 preserved by Microsoft's WinGet manifest.
    # Includes ROMs, DLLs and data beside bin/x64sc.exe; preserve this directory.
    return Install-Archive 'https://github.com/VICE-Team/svn-mirror/releases/download/3.10.0/GTK3VICE-3.10-win64.zip' 'GTK3VICE-3.10-win64.zip' 'BEB3791D90E98F7E012C0028F26FBAA6545C8FCE676F852A67F8AD893DEE9D08' 'GTK3VICE-3.10-win64/bin/x64sc.exe'
}

if ($env:OS -ne 'Windows_NT') { throw 'Use bash run.sh on macOS or Linux.' }
if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64' -and $env:PROCESSOR_ARCHITEW6432 -ne 'AMD64') { throw 'Automatic setup supports Windows x64.' }
if ($BuildOnly -and $Test) { throw 'Choose either -BuildOnly or -Test.' }
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$toolsDir = Join-Path $PSScriptRoot 'build/tools'
$previousTass = $env:TASS64
$previousVice = $env:VICE_BIN
Push-Location $PSScriptRoot
try {
    $node = Get-Node
    $assembler = $env:TASS64
    if (-not $assembler) { $assembler = Join-Path $PSScriptRoot 'tools/64tass/64tass.exe' }
    $env:TASS64 = Find-Executable $assembler '64tass.exe'
    if (-not $BuildOnly) { $vice = Get-Vice }
    if ($Test) {
        $env:VICE_BIN = $vice
        & (Join-Path $PSScriptRoot 'tests/windows.ps1') -Node $node
        return
    }
    Write-Host 'Building TORQ from source...'
    & $node (Join-Path $PSScriptRoot 'build.cjs')
    if ($LASTEXITCODE -ne 0) { throw "Build failed with exit code $LASTEXITCODE" }
    $prg = Join-Path $PSScriptRoot 'build/torqxsendero-c64.prg'
    Write-Host "Built $prg"
    if (-not $BuildOnly) {
        & $vice -default -autostartprgmode 1 -autostart $prg
        if ($LASTEXITCODE -ne 0) { throw "VICE failed with exit code $LASTEXITCODE" }
    }
} finally {
    $env:TASS64 = $previousTass
    $env:VICE_BIN = $previousVice
    Pop-Location
}
