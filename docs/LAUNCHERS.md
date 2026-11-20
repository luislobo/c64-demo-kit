# Set up and run the demo

After cloning, run the command for your environment from the repository folder.
Setup installs missing dependencies, builds TORQ from source and launches VICE
with the resulting PRG. Downloaded tools and build outputs are ignored by Git.

| Environment | Command |
| --- | --- |
| macOS | `bash run.sh` |
| Ubuntu 24.04 or newer, desktop session | `bash run.sh` |
| Windows 10/11 x64, Command Prompt or PowerShell | `.\run.bat` |
| Windows PowerShell directly | `powershell -NoProfile -ExecutionPolicy Bypass -File .\run.ps1` |

The scripts resolve paths from their own location, so they also work when
invoked by an absolute path from another directory. The Windows batch file
forwards arguments and failure status to PowerShell. Its execution-policy
setting applies only to that process.

## Build without opening the emulator

```sh
bash run.sh --build-only
```

```powershell
.\run.bat -BuildOnly
```

This installs only the build tools when needed. It skips emulator installation,
ROM downloads and launch. Use it on a headless machine or a Windows session
without a desktop. The normal Linux launcher requires DISPLAY or WAYLAND_DISPLAY.

## Use installed tools without setup

```sh
bash run.sh --no-install
```

```powershell
.\run.bat -NoInstall
```

These options disable dependency/ROM downloads and package-manager changes.
The scripts still regenerate the demo. Combine them with the build-only option
for an offline build. Missing or insufficient tools produce an error.

Other Linux distributions can use `--no-install` after installing Node.js 18+,
64tass, VICE x64sc and its C64/drive ROMs through their own package manager.
Automatic Linux package setup supports Ubuntu 24.04+.

## Select existing executables

The Bash launcher discovers `node`, `64tass` and `x64sc` on PATH. `TASS64` and
`VICE_BIN` can name absolute executable paths. For example:

```sh
TASS64=/path/to/64tass VICE_BIN=/path/to/x64sc bash run.sh --no-install
```

The PowerShell launcher accepts `NODE_BIN`, `TASS64` and `VICE_BIN` environment
overrides. It uses the bundled Windows assembler unless TASS64 is set. It
restores the caller's TASS64 and working directory on exit. No launcher writes
to your shell profile or permanently changes PATH.

## Dependency sources and reuse

On macOS, the launcher installs [Homebrew](https://docs.brew.sh/Installation)
if missing, then only the required [Node.js](https://formulae.brew.sh/formula/node),
[64tass](https://formulae.brew.sh/formula/tass64) and
[VICE](https://formulae.brew.sh/formula/vice) packages. Homebrew may request a
password or developer-tool installation confirmation.

On Ubuntu, it enables universe/multiverse when packages are needed and installs
`nodejs`, `64tass` and `vice` through apt. Setup requests sudo access if required.
Ubuntu's [VICE package](https://packages.ubuntu.com/noble/vice) can omit ROMs.
If the standard C64/1541 ROMs are missing, the launcher copies ROM data from the
[official VICE 3.10 source](https://github.com/VICE-Team/svn-mirror/tree/3.10.0/vice/data)
into your user VICE data directory. Existing nonempty user ROMs are preserved;
downloaded source code is never executed. System ROM locations are checked too.

On Windows, installed Node.js 18+ and VICE are preferred. Otherwise, the launcher
caches the current official [Node.js LTS](https://nodejs.org/en/download) ZIP and
[VICE 3.10 Windows ZIP](https://github.com/VICE-Team/svn-mirror/releases/tag/3.10.0)
under `build/tools/`. No WinGet or Chocolatey is needed. SHA-256 is checked before
extraction. Node's checksum comes from its official SHASUMS256.txt; VICE's pinned
checksum matches Microsoft's
[WinGet manifest](https://github.com/microsoft/winget-pkgs/blob/master/manifests/v/VICE-Team/VICE/GTK3/3.10/VICE-Team.VICE.GTK3.installer.yaml).
Only completed extractions receive cache markers. Keep VICE's directory intact
because its executable needs the adjacent DLLs, ROMs and data. Deleting
`build/tools/` causes missing portable tools to be downloaded on the next run.

VICE starts with default settings and
[loads the PRG directly into RAM](https://vice-emu.sourceforge.io/vice_5.html)
to avoid waiting for an emulated disk transfer. Existing saved settings
are not edited by the launchers. Downloaded tools retain their upstream license
files. Their code is not linked into the C64 demo.

## Verification

`node --test tests/launchers.test.cjs` checks setup/build/launch flow with isolated
command doubles, including paths with spaces, installation/build failures,
headless behavior, checksum rejection and completed-download reuse. PowerShell
checks run when `powershell.exe`/`pwsh` is available, or when `PWSH_BIN` names it.
Otherwise those checks are reported as skipped.

The Bash script also passes ShellCheck and a real Linux demo build. PowerShell
syntax and its real build/download helpers are checked with PowerShell on Linux.
Native macOS installation and Windows GUI execution have not been tested here.
Builds in one checkout share `generated/`; run them sequentially.
