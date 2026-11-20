#!/usr/bin/env bash
# Bootstrap only missing tools, build from this script's directory, then launch
# VICE. macOS uses Homebrew; Ubuntu uses apt and upstream ROM data. Overrides
# remain process-local. --no-install permits offline runs with prepared tools.
set -euo pipefail
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
build_only=0
install_tools=1
for argument in "$@"; do
    case "$argument" in
        --build-only) build_only=1 ;;
        --no-install) install_tools=0 ;;
        --help|-h)
            echo 'Usage: bash run.sh [--build-only] [--no-install]'
            echo 'Install missing dependencies, build TORQ and launch VICE.'
            echo 'TASS64 and VICE_BIN may name existing executable paths.'
            exit 0 ;;
        *) echo "Unknown option: $argument" >&2; exit 2 ;;
    esac
done
cd -- "$repo_dir"

fail() { echo "Error: $*" >&2; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }
node_ready() { has node && node -e 'if(Number(process.versions.node.split(".")[0])<18)process.exit(1)' >/dev/null 2>&1; }
as_root() {
    if [[ "$EUID" == 0 ]]; then "$@"; else sudo "$@"; fi
}

platform="$(uname -s)"
case "$platform" in
    Darwin|Linux) ;;
    *) fail 'Use run.ps1 on Windows; this launcher supports macOS and Linux.' ;;
esac
if [[ "$platform" == Linux && "$build_only" == 0 && -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
    fail 'No desktop session detected. Use --build-only on a headless machine.'
fi
if [[ -n "${TASS64:-}" ]] && ! has "$TASS64"; then fail "TASS64 is not executable: $TASS64"; fi
if [[ "$build_only" == 0 && -n "${VICE_BIN:-}" ]] && ! has "$VICE_BIN"; then fail "VICE_BIN is not executable: $VICE_BIN"; fi

install_macos() {
    local packages=()
    node_ready || packages+=(node)
    has "${TASS64:-64tass}" || packages+=(tass64)
    if [[ "$build_only" == 0 ]] && ! has "${VICE_BIN:-x64sc}"; then packages+=(vice); fi
    [[ "${#packages[@]}" != 0 ]] || return 0
    if ! has brew; then
        for prefix in /opt/homebrew /usr/local; do
            if [[ -x "$prefix/bin/brew" ]]; then export PATH="$prefix/bin:$PATH"; break; fi
        done
    fi
    if ! has brew; then
        echo 'Installing Homebrew. Follow its password and developer-tool prompts.'
        local installer
        installer="$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        /bin/bash -c "$installer"
        if [[ "$(uname -m)" == arm64 ]]; then export PATH="/opt/homebrew/bin:$PATH"; else export PATH="/usr/local/bin:$PATH"; fi
    fi
    eval "$(brew shellenv)"
    brew install "${packages[@]}"
}

install_ubuntu_packages() {
    [[ "$#" != 0 ]] || return 0
    # Distribution detection is local data; other Linux systems can prepare tools
    # themselves and use --no-install without changing repositories or packages.
    # shellcheck disable=SC1091
    . /etc/os-release
    [[ "${ID:-}" == ubuntu ]] || fail 'Automatic Linux setup supports Ubuntu 24.04+. Install tools yourself and use --no-install on other distributions.'
    dpkg --compare-versions "${VERSION_ID:-0}" ge 24.04 || fail 'Automatic setup requires Ubuntu 24.04 or newer.'
    echo "Installing Ubuntu dependencies: $*"
    as_root apt-get update
    as_root apt-get install -y software-properties-common ca-certificates
    as_root add-apt-repository -y universe
    as_root add-apt-repository -y multiverse
    as_root apt-get install -y "$@"
}

install_linux() {
    local packages=()
    node_ready || packages+=(nodejs)
    has "${TASS64:-64tass}" || packages+=(64tass)
    if [[ "$build_only" == 0 ]] && ! has "${VICE_BIN:-x64sc}"; then packages+=(vice); fi
    install_ubuntu_packages "${packages[@]}"
}

install_linux_roms() {
    local data_dir="${XDG_DATA_HOME:-$HOME/.local/share}/vice" missing=0 rom location
    local required=(C64/basic-901226-01.bin C64/chargen-901225-01.bin C64/kernal-901227-03.bin DRIVES/dos1541-325302-01+901229-05.bin DRIVES/dos1541ii-251968-03.bin)
    for rom in "${required[@]}"; do
        local found=0
        for location in "$data_dir" /usr/share/vice /usr/local/share/vice; do
            if [[ -s "$location/$rom" ]]; then found=1; break; fi
        done
        if [[ "$found" == 0 ]]; then missing=1; break; fi
    done
    [[ "$missing" != 1 ]] || {
        has git || install_ubuntu_packages git
        echo 'Installing missing C64/drive ROM data from the official VICE source.'
        # Stage downloads in our own temporary directory. Copy data only, and
        # preserve any nonempty user ROMs; upstream code is never executed.
        rom_stage="$(mktemp -d)"
        trap 'if [[ -n "${rom_stage:-}" ]]; then rm -rf -- "$rom_stage"; fi' EXIT
        git clone -q --depth 1 --filter=blob:none --sparse --branch 3.10.0 https://github.com/VICE-Team/svn-mirror.git "$rom_stage/vice"
        git -C "$rom_stage/vice" sparse-checkout set vice/data/C64 vice/data/DRIVES
        for machine in C64 DRIVES; do
            mkdir -p -- "$data_dir/$machine"
            for rom in "$rom_stage/vice/vice/data/$machine/"*.bin; do
                [[ -s "$data_dir/$machine/${rom##*/}" ]] || cp -- "$rom" "$data_dir/$machine/"
            done
        done
        rm -rf -- "$rom_stage"
        rom_stage=''
    }
}

if [[ "$install_tools" == 1 ]]; then
    if [[ "$platform" == Darwin ]]; then install_macos; else install_linux; fi
fi
# An older nvm runtime can precede a newly installed apt runtime on PATH.
if [[ "$platform" == Linux ]] && ! node_ready && [[ -x /usr/bin/node ]]; then
    export PATH="/usr/bin:$PATH"
fi
node_ready || fail 'Node.js 18+ is required. Rerun without --no-install to install it.'
assembler="$(command -v "${TASS64:-64tass}")" || fail '64tass is required. Rerun without --no-install or set TASS64.'
if [[ "$build_only" == 0 ]]; then
    vice="$(command -v "${VICE_BIN:-x64sc}")" || fail 'VICE x64sc is required. Rerun without --no-install or set VICE_BIN.'
    if [[ "$platform" == Linux && "$install_tools" == 1 ]]; then install_linux_roms; fi
fi
echo 'Building TORQ from source...'
TASS64="$assembler" node "$repo_dir/build.cjs"
echo "Built $repo_dir/build/torqxsendero-c64.prg"
if [[ "$build_only" == 0 ]]; then exec "$vice" -default -autostartprgmode 1 -autostart "$repo_dir/build/torqxsendero-c64.prg"; fi
