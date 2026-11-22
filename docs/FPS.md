# TORQ frame rate

TORQ displays all 16 wave poses at nominal **12.5 fps on PAL** and **15 fps
on NTSC**. It flips once every four refreshes on both. A wave cycle takes
1.28 seconds on PAL and about 1.07 seconds on NTSC. The six effects,
SID player, pixel ticker and eight-second mode changes retain
their own clocks.

## Patch compiler

TORQ selects `DEMO_PATCH_PLAN = "balanced"`. The compiler prices each skip,
literal and fill using the instruction totals for the native decoder. It
includes the destination page carry and averages source page carries and
indexed read penalties over the possible source alignments. At each of
several RAM prices it finds a minimum-cost encoding with dynamic programming.
It then combines streams to minimize the slowest moving frame within the RAM
budget and spends spare space on further cycle savings. Restoration has its
own limit based on the legacy encoding's expected latency.

The phase search considers the uniform wave poses and nearby angles within
one eighth of the original pose spacing. It compares each incoming patch
against the pose two steps back, which is what the hidden bitmap contains.
It favors a lower peak and average cost while keeping all 16 poses in order
with the same sine amplitude and wavelength. Neighboring angles remain
within 75–125% of uniform spacing. The builder compares the fitted result
against uniform poses and keeps the lower-cost candidate.

Select `"cycles"` to keep uniform poses and use the cycle compiler.
Omit the option or select `"legacy"` for the original byte/write heuristic.
The patch command format is shared. The host checks both warm-up patches,
five full loops and restoration before assembling a program.

Long literals now copy in groups of eight and short fills use a backward
countdown. Plasma, XOR and tunnel each choose their inner loop once per
color row. Mirrored tunnel rows share radius data and return 440 bytes to the
patch budget. Mode 4 and mode 6 use a repeated palette lookup to save three
shifts per cell. The native checks compare the emitted colors with the same
host formulas.

## Cadence

`DEMO_FPS` sets the nominal target on both standards unless
`DEMO_PAL_TICKS` sets a fixed PAL period. Omitting both gives 10 fps.
For TORQ, `DEMO_FPS = 15` and `DEMO_PAL_TICKS = 4`. The generic scheduler
still carries a fractional remainder for other rates. The faster mode adds
one preparation refresh at startup or restart, then follows its steady
cadence. An overdue frame resynchronizes at the next border and increments
the deadline counter.

## After Hours Roll release check

Windows VICE 3.10 verified the default After Hours Roll build at 12.5 fps on
PAL and 15 fps on NTSC in all five trials per standard. The run checked
2,400 bitmaps and recorded zero missed intervals or deadline resynchronizations.
The 144-second automatic-show check on each standard covered all six effects
and verified SID calls, score position and ticker timing. See the
[trial summary](../dist/validation/after-hours-fps.json) and the
[PAL](../dist/validation/fps-soak-pal.json) and
[NTSC](../dist/validation/fps-soak-ntsc.json) show reports.

## Clockwork comparison

The [repeated comparison](../dist/validation/fps-stress.json) uses the previous
12 fps build at `d7b4769` and the Clockwork release at `cf1f804`. Five trials per build and standard
alternate profile order. Each trial compares 48 sequential bitmap frames in
each moving mode, then checks static restoration, music and the ticker.
Frame rates use guest raster ticks and exclude the one startup refresh.
An independent CPU stopwatch checks that 16 guest raster interrupts span
16 physical refresh periods during plasma. A 144-second automatic-show run
on each standard exercises the complete ticker and color-phase cycles.

| Build | PAL nominal fps | NTSC nominal fps |
| --- | ---: | ---: |
| Previous default | 12 | 12 |
| New default | 12.5 | 15 |

All 20 trials passed, with 4,800 bitmap comparisons and zero missed intervals.
The peak elapsed render time among 16 plasma poses dropped from 69,945 to
53,881 guest cycles on PAL and from 74,007 to 61,512 on NTSC. Each peak
repeated across all five trials. These elapsed counts include interrupt work.

Using the new decoder's instruction model for all three encoder variants,
the worst steady patch costs an estimated 45,530 cycles with the legacy
encoder, 40,633 with the cycle compiler and uniform poses, and 40,358 with
the cycle compiler and balanced poses.

Higher whole-number targets introduce three-refresh intervals on PAL above
12.5 fps and NTSC above 15 fps. Exploratory trials missed some of those
deadlines with effects, SID and ticker active. The [probe report](../dist/validation/fps-probes.json)
records 22 missed intervals at 13 fps on PAL and 59 at 16 fps on NTSC. These
results apply to this artwork and show configuration. PAL/NTSC real hardware
remains untested.

```sh
TASS64=/path/to/64tass node tests/stress-fps.cjs --baseline /path/to/built-baseline
TASS64=/path/to/64tass node tests/stress-fps.cjs --runs 1 --rates 13,16 --probe
TASS64=/path/to/64tass node tests/verify-kernels.cjs
TASS64=/path/to/64tass node tests/verify-torq.cjs
TASS64=/path/to/64tass node tests/verify-fps-soak.cjs
```

Without `--rates`, the stress test uses the release settings. Explicit probe
rates use the same nominal rate on both standards. Build the baseline in an
isolated checkout first. Builds within one checkout share `generated/`.
Recorded checks use Linux 64tass 1.59.3120 and VICE 3.9+r45793.
