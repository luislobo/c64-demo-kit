// Exercise launcher behavior through real Bash processes and isolated command
// doubles. Package managers never touch the host; build/launch arguments and
// failure propagation are observed across paths containing spaces.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const unixTest = (name, run) => test(name, { skip: process.platform === 'win32' }, run);

function fixture(t, overrides = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'c64 launcher '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const bin = path.join(directory, 'bin'); fs.mkdirSync(bin);
  fs.copyFileSync(path.join(root, 'run.sh'), path.join(directory, 'run.sh'));
  const command = (name, code) => fs.writeFileSync(path.join(bin, name), '#!/bin/bash\nset -eu\n' + code + '\n', { mode: 0o755 });
  command('uname', 'if [[ "${1:-}" == -m ]]; then echo arm64; else echo "$TEST_PLATFORM"; fi');
  command('node', 'if [[ "${1:-}" == -e && "${TEST_OLD_NODE:-}" == 1 && ! -e "$TEST_ROOT/installed" ]]; then exit 1; fi\nexec "$TEST_NODE_BIN" "$@"');
  command('64tass', 'exit 0');
  command('x64sc', 'printf "%s\\n" "$@" > "$TEST_ROOT/launch.log"');
  command('brew', 'if [[ "$1" == shellenv ]]; then exit 0; fi\nprintf "%s\\n" "$*" >> "$TEST_ROOT/packages.log"\n[[ "${TEST_INSTALL_FAIL:-}" != 1 ]] || exit 42\ntouch "$TEST_ROOT/installed"');
  command('sudo', 'exec "$@"');
  command('apt-get', 'printf "%s\\n" "$*" >> "$TEST_ROOT/packages.log"\n[[ "${TEST_INSTALL_FAIL:-}" != 1 ]] || exit 42\ntouch "$TEST_ROOT/installed"');
  command('add-apt-repository', 'printf "%s\\n" "$*" >> "$TEST_ROOT/packages.log"');
  fs.writeFileSync(path.join(directory, 'build.cjs'), `const fs=require('node:fs');fs.writeFileSync('build.log',process.env.TASS64);if(process.env.TEST_BUILD_FAIL)process.exit(9);fs.mkdirSync('build',{recursive:true});fs.writeFileSync('build/torqxsendero-c64.prg','fixture');`);
  const env = { ...process.env, PATH: bin + path.delimiter + process.env.PATH, HOME: directory, XDG_DATA_HOME: path.join(directory, 'data'), TEST_ROOT: directory, TEST_NODE_BIN: process.execPath, TEST_PLATFORM: 'Linux', DISPLAY: ':99', WAYLAND_DISPLAY: '', TASS64: '', VICE_BIN: '', ...overrides };
  return { directory, run: (...args) => spawnSync('bash', [path.join(directory, 'run.sh'), ...args], { cwd: os.tmpdir(), env, encoding: 'utf8' }), read: file => fs.readFileSync(path.join(directory, file), 'utf8'), exists: file => fs.existsSync(path.join(directory, file)) };
}

unixTest('launcher help and invalid arguments perform no setup or build', t => {
  const f = fixture(t);
  assert.equal(f.run('--help').status, 0);
  assert.notEqual(f.run('--unknown').status, 0);
  assert.equal(f.exists('build.log'), false); assert.equal(f.exists('packages.log'), false);
});

unixTest('build-only works outside the repo and needs no display or package manager', t => {
  const f = fixture(t, { DISPLAY: '' });
  const result = f.run('--no-install', '--build-only');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(f.read('build.log').endsWith('/bin/64tass'));
  assert.equal(f.exists('launch.log'), false); assert.equal(f.exists('packages.log'), false);
});

unixTest('launch receives the built PRG as one absolute argument', t => {
  const f = fixture(t); const result = f.run('--no-install');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(f.read('launch.log').trim().split('\n'), ['-default', '-autostartprgmode', '1', '-autostart', path.join(f.directory, 'build/torqxsendero-c64.prg')]);
});

unixTest('compiler failure prevents emulator launch', t => {
  const f = fixture(t, { TEST_BUILD_FAIL: '1' }); const result = f.run('--no-install');
  assert.equal(result.status, 9); assert.equal(f.exists('launch.log'), false);
});

unixTest('macOS installs an insufficient Node runtime through Homebrew', t => {
  const f = fixture(t, { TEST_PLATFORM: 'Darwin', TEST_OLD_NODE: '1' });
  const result = f.run('--build-only'); assert.equal(result.status, 0, result.stderr);
  assert.match(f.read('packages.log'), /install node/); assert.equal(f.exists('build.log'), true);
});

unixTest('Ubuntu dependency installation failures stop before compilation', t => {
  const f = fixture(t, { TEST_OLD_NODE: '1', TEST_INSTALL_FAIL: '1' });
  const result = f.run('--build-only'); assert.notEqual(result.status, 0);
  assert.equal(f.exists('build.log'), false); assert.equal(f.exists('launch.log'), false);
});

unixTest('Ubuntu installs an insufficient runtime before building', t => {
  const f = fixture(t, { TEST_OLD_NODE: '1' });
  const result = f.run('--build-only'); assert.equal(result.status, 0, result.stderr);
  assert.match(f.read('packages.log'), /install -y nodejs/);
  assert.equal(f.exists('build.log'), true);
});

unixTest('headless Linux launch explains the build-only option before installing', t => {
  const f = fixture(t, { DISPLAY: '' }); const result = f.run();
  assert.notEqual(result.status, 0); assert.match(result.stderr, /--build-only/);
  assert.equal(f.exists('packages.log'), false);
});

const powershell = process.env.PWSH_BIN || (process.platform === 'win32' ? 'powershell.exe' : 'pwsh');
const hasPowershell = spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()']).status === 0;
const psTest = (name, run) => test(name, { skip: !hasPowershell && 'PowerShell is not installed; set PWSH_BIN to run these checks' }, run);
function psFixture(t, overrides = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'c64 powershell '));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.copyFileSync(path.join(root, 'run.ps1'), path.join(directory, 'run.ps1'));
  fs.writeFileSync(path.join(directory, 'build.cjs'), `const fs=require('node:fs');fs.writeFileSync('build.log',process.env.TASS64);if(process.env.TEST_BUILD_FAIL)process.exit(9);fs.mkdirSync('build',{recursive:true});fs.writeFileSync('build/torqxsendero-c64.prg','fixture');`);
  const env = { ...process.env, OS: 'Windows_NT', PROCESSOR_ARCHITECTURE: 'AMD64', NODE_BIN: process.execPath, TASS64: process.execPath, VICE_BIN: '', TEST_ROOT: directory, ...overrides };
  return { directory, run: code => spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-Command', code], { cwd: os.tmpdir(), env, encoding: 'utf8' }), exists: file => fs.existsSync(path.join(directory, file)) };
}

psTest('PowerShell builds from another directory with prepared tools and spaces', t => {
  const f = psFixture(t);
  const result = f.run('& (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -BuildOnly');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(f.exists('build/torqxsendero-c64.prg'));
  assert.equal(fs.readFileSync(path.join(f.directory, 'build.log'), 'utf8'), process.execPath);
});

psTest('PowerShell build failure returns an error', t => {
  const f = psFixture(t, { TEST_BUILD_FAIL: '1' });
  const result = f.run('& (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -BuildOnly');
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Build failed with exit code 9/);
});

psTest('PowerShell test mode uses the prepared tools and stops on a VICE failure', t => {
  const f = psFixture(t, { VICE_BIN: 'node' });
  fs.mkdirSync(path.join(f.directory, 'tests'));
  fs.copyFileSync(path.join(root, 'tests/windows.ps1'), path.join(f.directory, 'tests/windows.ps1'));
  for (const [name, exit] of [['stress-fps', 0], ['verify-torq', 7], ['verify-fps-soak', 0]]) {
    fs.writeFileSync(path.join(f.directory, 'tests', name + '.cjs'), `
      require('node:assert/strict').equal(process.env.VICE_BIN, process.env.EXPECTED_VICE);
      require('node:fs').appendFileSync('test.log', '${name}\\n');
      process.exit(${exit});
    `);
  }
  const result = f.run(`
    $env:EXPECTED_VICE = (Get-Command node -CommandType Application).Source
    try { & (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -Test; throw 'Test should fail' }
    catch { if ($_.Exception.Message -notmatch 'verify-torq failed \\(exit code 7\\)') { throw } }
    if ($env:VICE_BIN -ne 'node') { throw 'VICE override leaked' }
    exit 0
  `);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(fs.readFileSync(path.join(f.directory, 'test.log'), 'utf8'), 'stress-fps\nverify-torq\n');
  assert.equal(f.exists('build.log'), false);
});

psTest('PowerShell restores the caller directory and compiler override on failure', t => {
  const f = psFixture(t, { TEST_BUILD_FAIL: '1', TASS64: 'node' });
  const result = f.run(`
    $before = Get-Location
    try { & (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -BuildOnly; throw 'Build should fail' }
    catch { if ($_.Exception.Message -notmatch 'Build failed with exit code 9') { throw } }
    if ($env:TASS64 -ne 'node') { throw 'Compiler override leaked' }
    if ((Get-Location).Path -ne $before.Path) { throw 'Caller directory changed' }
    exit 0
  `);
  assert.equal(result.status, 0, result.stderr);
});

psTest('PowerShell rejects corrupt downloads before extracting or caching', t => {
  const f = psFixture(t);
  const result = f.run(`
    . (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -BuildOnly
    $NoInstall = $false
    function Invoke-WebRequest($Url, $OutFile, [switch]$UseBasicParsing) { [IO.File]::WriteAllText($OutFile, 'bad download') }
    function Expand-Archive { throw 'Extraction must not happen' }
    try { Install-Archive https://example.invalid/tool.zip tool.zip ('0' * 64) 'tool/tool.exe'; throw 'Download was accepted' }
    catch { if ($_.Exception.Message -notmatch 'SHA-256 mismatch') { throw } }
    exit 0
  `);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.exists('build/tools/tool/tool.exe.complete'), false);
  assert.equal(f.exists('build/tools/tool.zip.download'), false);
});

psTest('PowerShell caches an extracted tool only after successful verification', t => {
  const f = psFixture(t);
  const result = f.run(`
    . (Join-Path $env:TEST_ROOT run.ps1) -NoInstall -BuildOnly
    $NoInstall = $false
    function Invoke-WebRequest($Url, $OutFile, [switch]$UseBasicParsing) { [IO.File]::WriteAllText($OutFile, 'verified fixture') }
    function Expand-Archive($Path, $DestinationPath, [switch]$Force) {
      $target = Join-Path $DestinationPath 'tool/tool.exe'
      New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
      [IO.File]::WriteAllText($target, 'executable fixture')
    }
    $hash = '${require('node:crypto').createHash('sha256').update('verified fixture').digest('hex')}'
    $first = Install-Archive https://example.invalid/tool.zip tool.zip $hash 'tool/tool.exe'
    function Invoke-WebRequest { throw 'Cached tool must not be downloaded again' }
    $second = Install-Archive https://example.invalid/tool.zip tool.zip $hash 'tool/tool.exe'
    if ($first -ne $second) { throw 'Cached executable changed' }
  `);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.exists('build/tools/tool/tool.exe.complete'), true);
});
