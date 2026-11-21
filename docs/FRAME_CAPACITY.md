# TORQ frame capacity at 10 fps

This report records the 16-phase implementation at commit `bc26a71`. The current
12 fps default is documented in [FPS measurements](FPS.md). That earlier build
passed repeated PAL/NTSC checks at
the existing nominal 10 displayed frames per second, with plasma, Clockwork
music and the ticker active. A wave cycle takes 1.6 seconds instead of 0.8.
More phases reduce the change between consecutive poses; they do not double fps.

This is a measured improvement within the current design. It does not establish
the best possible C64 renderer or a maximum frame rate for different artwork.

## Memory results

The logo, font, amplitude, wavelength, color fields and music are unchanged.

| Profile | Patch storage | Low patch RAM used | Free high patch RAM | Result |
| --- | ---: | ---: | ---: | --- |
| Previous 8 phases, `ddb6307` | 24,415 bytes | 0 | 6,165 bytes | Stable |
| Updated 8 phases | 19,715 bytes | 0 | 10,865 bytes | Stable |
| Updated 16 phases | 32,988 bytes | 2,816 bytes | 408 bytes | Stable; default at bc26a71 |
| Updated 32 phases | At least 55,898 bytes | Unallocated | Insufficient | Rejected before assembly |

The high stream/table region is `$4000..$bfff`. Color lookup tables consume
2,188 bytes there. The optional `$1500..$1fff` region adds 2,816 bytes, for a
combined 35,584-byte budget. The 16-phase streams include two extra chunk
terminators. With tables, 32 phases need at least 58,086 bytes in these regions.
Changing artwork or wave geometry requires another fit/timing check.

## Changes that make 16 phases fit

The bytecode adds `$80,count,value` for repeated-byte fills. Dynamic programming
selects skip, literal and fill commands with score
`5*encodedBytes + writtenBytes + 2*commands`. A size-only prototype wrote large
unchanged areas to save a few header bytes and missed raster deadlines. The
write cost prevents that behavior; a host regression checks sparse erasures.

The allocator splits streams only between complete commands when using low RAM.
The decoder preserves its destination while switching to a continuation source.
Independent host/assembler limits protect bitmap, screen and imported SID areas.

The patch loop also removes per-command keyboard calls. Keys are scanned every
raster IRQ and between frames, including while waiting for a flip. IRQ work and
decoder work still share the C64 CPU. Physical keyboard behavior remains untested.

## Repeated native timing

Five trials per profile and video standard alternate profile order. Each trial
checks 20 actually displayed bitmaps against host-generated frames, scheduled
five-refresh PAL/six-refresh NTSC flips, 16 extra SID calls over 16 refreshes and
the restored CPU memory port. All 30 trials passed with zero errors: 600 bitmap
frames, including 200 for the 16-phase profile. The default PRG at that commit equals the
tested 16-phase profile byte for byte.

The measurement is elapsed emulated CPU cycles between `render` and
`render_done`, including IRQ and VIC stalls. It excludes waiting for a scheduled
flip and host monitor time. The flip-spacing check verifies the displayed rate
independently. Startup trials use the same native refresh and renderer settings.
The recorded tools are Linux 64tass 1.59.3120 and GTK3 VICE 3.9+r45793. The
16-core host had load averages below 1.3 before testing; host elapsed time is
not the metric. The raw count remains in guest CPU cycles while the monitor
pauses the emulator between observations.

| Profile | PAL median cycles; trial-median range | NTSC median cycles; trial-median range |
| --- | --- | --- |
| Previous 8 | 85,131.5; 85,131.5..85,131.5 | 89,273; 89,273..89,273 |
| Updated 8 | 80,153.5; 80,153..80,154 | 80,943; 80,943..80,943 |
| Updated 16 | 69,071.5; 69,071..69,071.5 | 72,973; 72,973..72,973 |

Each trial median excludes the two warm-up frames. The table reports the median
of those five medians and their range. Updated 16-phase transitions change fewer
bytes per frame than 8-phase transitions, so they are different workloads.
The 8-versus-8 comparison holds the visible wave frames constant.

RAM is the limit for 32 phases in this encoding. The 16-phase result leaves
little high-RAM headroom; it is not evidence for adding arbitrary features or
doubling the display rate. The normal PAL/NTSC regression additionally verifies
90 bitmap frames per machine, all color fields and stop/restart restoration.

## Repeat the check

With 64tass, VICE x64sc and headless Linux xvfb-run available:

```sh
TASS64=/path/to/64tass node tests/stress-frames.cjs
```

This compares 8/16-phase builds at an explicitly fixed 10 fps and records
32-phase rejection. Later decoder changes can alter cycle samples; checkout
`bc26a71` to reproduce the recorded runtime.
It restores the default generated assets afterward. For the previous-code
comparison, first build an isolated copy of the baseline:

```sh
baseline_dir="$(mktemp -d)"
git archive ddb6307 | tar -x -C "$baseline_dir"
TASS64=/path/to/64tass node "$baseline_dir/build.cjs"
TASS64=/path/to/64tass node tests/stress-frames.cjs --baseline "$baseline_dir"
```

`--runs 1` provides a quick check; the recorded comparison uses the default five.
`--summarize` regenerates summaries from an existing `build/frame-stress.json`
without running an emulator. Builds in one checkout must remain sequential.
The committed [raw report](../dist/validation/frame-stress.json) includes every
cycle sample and displayed phase/tick. Results are emulator evidence; analog
audio quality and physical C64 compatibility are not established.
