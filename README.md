# C64 demo libraries

Reusable 6502/6510 assembly libraries and portable Node.js asset builders.
**`demo.asm`** presents TORQ X SENDERO with six logo effects, automatic scene
changes and the original After Hours Roll SID tune. `sid-demo.asm` and `effects-demo.asm`
show separate music and character-scene integrations. The runtime is native C64 machine code; Node.js
and PowerShell run only on the build computer.

The assembler is **64tass 1.60.3243**, bundled for Windows with its licenses.
No npm packages, VICE installation, network connection, or API key is needed to
build. Node.js must be installed. On another OS set `TASS64` to your 64tass binary.

For implementation explanations, read [Algorithms and design decisions](docs/ALGORITHMS.md).
Each project source file also has an algorithm/rationale header. The
[file catalog](docs/FILES.md) covers binary assets, generated outputs, tests and
unchanged third-party files that cannot use those headers.

The [C64 source collection](research/README.md) gathers demo effects, music tools,
compression, loaders and asset pipelines with author credits, license evidence,
pinned source links and original source snapshots. Its
[adaptation plan](research/ADAPTATION.md) maps useful candidates to this kit.
The default demo applies original sine/XOR/polar color fields and PSID playback.
The collection also contains candidates for future work with their reuse terms.

[Tracker-exported PSID music](docs/SID.md) is available as an optional player.
The original [Clockwork example](examples/music/README.md) demonstrates this
with PAL/NTSC pitch tables and recorded music credits:

```console
node tools/build-example-music.cjs
node build.cjs --entry sid-demo.asm --out build/sid
```

The [character-effect library and example](docs/CHARACTER.md) add native plasma,
XOR interference and a polar tunnel, with two screen buffers, a scroller,
keyboard controls and music:

```console
node tools/build-example-music.cjs
node tools/build-effects.cjs
```

[Additional ready-to-run examples](dist/examples/README.md) include PRG/D64
files, captured frames, source attribution and PAL/NTSC validation reports.

## Build and run

From a fresh clone, install missing dependencies, build and launch the demo:

| Environment | Command |
| --- | --- |
| macOS | `bash run.sh` |
| Ubuntu 24.04+ desktop | `bash run.sh` |
| Windows 10/11 x64 | `.\run.bat` |

The launchers reuse installed tools. macOS setup uses Homebrew, Ubuntu setup
uses apt and includes missing C64 ROMs, and Windows uses verified portable
downloads plus the bundled assembler. See [launcher options](docs/LAUNCHERS.md)
for building without a display, offline runs and other Linux distributions.

On Windows, run `.\run.bat -Test` to set up the tools and verify TORQ in VICE
on both PAL and NTSC.

To build manually with Node.js and 64tass already available:

```console
node build.cjs
```

Or double-click `build.bat`. Outputs are `build/<DEMO_NAME>.prg` and `.d64`.
The disk writer is a reusable JavaScript library, not a wrapper around VICE.
Mount the D64 on an SD2IEC or emulator, then load the filename set by
`DEMO_PRG_NAME`. For the supplied application:

```basic
LOAD"TORQ-LOGO",8,1
RUN
```

Ready-to-run copies are also committed under `dist/`, together with a preview
and the PAL/NTSC validation reports. `assets/reference/` preserves the source
logo PNGs; the builder consumes the converted `assets/image.bin`.

The demo starts with a plasma-colored wave and changes effects every eight
nominal seconds. 1 selects blue wave, 2 rainbow wave, 3 stationary color cycle,
4 plasma, 5 XOR and 6 tunnel. A number key or Space takes manual control until
reset. Space starts/stops the wave; M pauses/restarts the music. The wave uses
16 precomputed phases at nominal 12.5 fps on PAL and 15 fps on NTSC.
See [FPS measurements and experiments](docs/FPS.md), [frame capacity](docs/FRAME_CAPACITY.md)
and the [TORQ integration guide](docs/TORQ.md) for
configuration, credits and verification.

## Change the application in one assembly file

`demo.asm` owns all application-specific text, image/font paths, disk names,
palette, wave geometry, frame count, target FPS, automatic show and music configuration.
The default generates After Hours Roll from source during the same build. Applications
without `DEMO_SID_FILE` use three MIDI-note lists, volume and tempo settings.
It also composes the engine and includes the generated data. No melody or brand
is embedded in `lib/` or `host/`. Binary artwork/font assets remain separate files.

The `DEMO_*` settings are ordinary 64tass constants. The builder reads their
literal strings, integers and lists without executing code. Use uppercase names
and literal values, not computed expressions, for those build settings.
Change `demo.asm` and rebuild; generated files are disposable.

To make another application, copy the kit or save another application `.asm`
beside `demo.asm`, keeping the same includes. Build it with:

```console
node build.cjs --entry my-demo.asm --out build/my-demo
```

Build configurations in one project share `generated/`, so build them sequentially.

## Convert another image

The asset input is a **headerless, 8000-byte, 320x200 one-bit VIC-II bitmap**.
There is no load-address prefix or palette. The bundled Windows converter accepts
PNG, JPEG, BMP and other formats supported by System.Drawing:

```powershell
powershell -NoProfile -File tools/convert-image.ps1 -InputPath "picture.png" -OutputPath "assets/new-image.bin"
```

Set `DEMO_IMAGE = "assets/new-image.bin"` in `demo.asm`, then rebuild.

The converter centers the picture without stretching it. Auto mode uses alpha
for transparent images and luminance for opaque ones. Options are `-Mode Alpha`,
`-Mode Luma`, `-Threshold 64` (0..255), and `-Invert`. For dark artwork on a light
background, use Luma with Invert. This is a monochrome converter, not a multicolor
C64 quantizer. The builder fits the resulting image into the logo area and adds
the fixed controls/ticker rows. Detailed images can exceed memory; the builder
rejects oversized patch data rather than overlapping screen RAM.

## Assembly libraries

These bitmap-engine modules are **source/include libraries with one shared zero-page ABI**. Include
`lib/engine.asm` once after the application constants. They are not independently
linked objects or automatically relocatable modules. Their placement and shared
state let native rendering fit the C64 memory and raster budget.

| File | Responsibility / public entry points |
| --- | --- |
| `state.asm` | Named zero-page allocation shared by the modules |
| `boot.asm` | BASIC SYS stub, hardware ownership, buffer initialization, PAL/NTSC detection |
| `player.asm` | `idle`, `next_frame`, `stop_animation`: double-buffer animation scheduling |
| `bitmap.asm` | `render`: decode one sparse patch into the hidden bitmap |
| `display.asm` | `flip`: request a scheduled flip; `flip_border`: IRQ-only buffer switch |
| `raster.asm` | `irq`, `nmi`: raster clock, safe flips, music and ticker scheduling |
| `keyboard.asm` | `poll_keyboard`, `poll_render_keyboard`: atomic input edge detection |
| `effects.asm` | `handle_effect`: wave/static mode controller |
| `colors.asm` | `color_tick`: update one logo row per refresh |
| `color-fields.asm` | Optional plasma/XOR/polar foreground fields in both banks |
| `show.asm` | Optional eight-second effect sequence on the 50 Hz logic clock |
| `scroller.asm` | `scroll_tick`: shift text by one pixel in both buffers |
| `sid.asm` | `music_init`, `music_tick`: three-voice note sequencer |
| `assets.asm` | Asset pointer table, bitmap/data placement and overlap assertions |

### Calling and interrupt contract

- `render`: A = patch index. Clobbers A/X/Y, flags, `src`, `dst`, `count`, and `patch_tail`.
  It does not flip the visible screen. Call from the main thread with IRQ enabled.
- Patch indices 0 and 1 warm up the two buffers from the static image. Indices
  2 through `DEMO_FRAMES+1` are steady transitions; `DEMO_FRAMES+2` restores the
  static image regardless of the last wave phase. The hidden buffer is two phases
  behind; selecting arbitrary frame indices breaks this dependency.
- `flip`: main-thread blocking request. Set `deadline` first. The IRQ switches the
  buffers when the 8-bit raster tick reaches that deadline. Deadlines must remain
  less than 128 refreshes ahead. Never call this blocking routine from the IRQ.
- `poll_keyboard` and `poll_render_keyboard`: clobber A and restore the caller's
  interrupt-enable state. X/Y are also clobbered if an imported song is restarted.
  The raw `scan_*` routines are internal.
- `music_tick`, `scroll_tick` and `color_tick`: clobber A/X/Y and flags. The IRQ
  wrapper saves/restores A/X/Y and the CPU restores flags through RTI.
- `toggle`, `effect_request` and `muted` are the input/controller interface.
  The standard controller owns key bindings, not the application image.

### Memory and hardware contract

| Range | Use |
| --- | --- |
| `$02..$4f`, `$fb..$fe` | Runtime state and pointers; see `state.asm` |
| `$0400..$07ff` | Primary color/screen matrix |
| `$0801..$14ff` | BASIC stub, code, font, text and patch/continuation pointers |
| `$1500..$1fff` | Optional low patch storage, used by the 16-phase demo |
| `$2000..$3f3f` | Primary bitmap |
| `$4000..$bfff` | Generated sparse patch streams and optional color-field tables |
| `$c000..$c3ff` | Secondary color/screen matrix |
| `$c400..$cfff` | Optional imported SID payload |
| `$e000..$ff3f` | Secondary bitmap, RAM under KERNAL ROM |
| `$fffa..$ffff` | NMI/IRQ vectors |

Entries that do not need low patch storage can use code/font RAM through `$1fff`.
The assembler enforces the boundary selected by the generated layout.

The engine takes over VIC-II, SID, the raster IRQ, CIA keyboard ports and the
low VIC bank-selection bits. It disables CIA interrupts and maps ROMs out with
`$01=$35`. It is a standalone demo engine, not a BASIC-callable component that
returns to the OS. Preserve the fixed 320x200 hires layout: logo rows 0..22,
controls row 23, ticker row 24. `DEMO_LOGO_HEIGHT` may be reduced within that area.
Frame counts and built-in song lengths must be powers of two; built-in tune
voices have equal lengths. Imported music follows the PSID contract.
The palette has eight non-black foreground colors with a black background.

## Build-side libraries

| File | Exports |
| --- | --- |
| `host/config.cjs` | `readConfig(file)` with bitmap validation; `readConstants(file)` for other scene validators |
| `host/bitmap.cjs` | `index`, `fitBitmap`, `drawText`, `waveFrames` |
| `host/patches.cjs` | `encodePatch`, `applyPatch`, `makeDoubleBufferedPatches`, `verifyPatches` |
| `host/patch-planner.cjs` | Cycle-aware patch selection and cost-balanced poses |
| `host/patch-memory.cjs` | `allocatePatches` across high/low RAM with command-aligned continuations |
| `host/timing.cjs` | `timingConfig`, `frameCadence` for refresh-aware frame scheduling |
| `host/music.cjs` | `sidFrequency`, `musicTables` for PAL/NTSC |
| `host/d64.cjs` | `createD64`, `offset`, `sectors` for a standard 35-track, single-PRG disk |
| `host/sid.cjs` | `parseSid`, `prepareSid`, `sidConstants` for the supported tracker-export subset |
| `host/color-fields.cjs` | `colorFieldAssets`, `colorFieldRow` for logo fields and native comparisons |
| `host/character.cjs` | `characterAssets`, `characterFrame` for character-scene data and its mathematical reference |
| `build.cjs` | `build({entry, outDir, compiler})` or command-line entry point |

After asset generation, the assembly is also usable directly with 64tass:

```console
tools\64tass\64tass.exe --cbm-prg -a -o build\demo.prg demo.asm
```

## Validation

```console
node --test tests/*.test.cjs
node tests/rebuild-variant.cjs
node tests/verify-torq.cjs
```

The variant check builds different artwork, text and four frames, plus a
built-in-music configuration without optional fields, then restores the default.
The TORQ check launches isolated PAL/NTSC VICE instances and verifies the
automatic show, 90 wave frames, all six modes, field pixels, SID cadence,
restoration and ticker buffers. VICE and headless Linux `xvfb-run` are required.
`tests/emulator.cjs pal PORT` (or `ntsc`) runs the default demo's frame, timing,
stop/restart, music and ticker checks against a running VICE remote monitor.
Start VICE with `-console -warp +sound -pal -remotemonitor
-remotemonitoraddress ip4://127.0.0.1:PORT`; use `-ntsc` for the other standard.
The test closes that emulator when finished.

The D64 writer is checked against allocation chains and VICE c1541 readback.
Native SD2IEC/C64 hardware was not available for testing.
