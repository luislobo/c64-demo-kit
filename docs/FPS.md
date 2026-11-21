# Higher frame rate and experiments

TORQ now targets nominal 12 fps on PAL and NTSC, with the same 16 phases, logo,
six modes, Clockwork music and pixel ticker. That is 20% more displayed phases
per second than the previous 10 fps default. A wave cycle takes about 1.33
seconds. The music, ticker and automatic scene-change clocks are independent
of bitmap FPS and retain their previous rates.

## Implementation

`DEMO_FPS = 12` is an application setting. Omitted settings retain the previous
10 fps default for other bitmap applications. Valid integers are 1..50; a valid
setting is not a guarantee that arbitrary artwork or music meets its deadlines.

The native scheduler carries a fractional refresh remainder. At 12 fps, PAL
uses `[4,4,4,4,4,5]` refresh intervals; NTSC uses five refreshes per frame.
This averages to the same nominal frame rate while every flip remains in the
border. The PAL interval variation is intentional refresh quantization.

Playback above 10 fps starts its frame clock at the next refresh, giving the
first decode one extra preparation tick after boot or Space/restart. This
startup allowance does not repeat during playback. The scheduler records an
overdue target and resynchronizes it to the next border, preventing accumulated
lateness from wrapping the signed eight-bit deadline comparison.

Literal runs now copy backward with DEY/BPL, avoiding a per-byte count compare.
Their maximum length is 127, so the signed countdown is valid. Fill runs use
an X countdown and retain their 1..255-byte range. Both preserve the source and
destination advancement contract, including low/high patch continuations.
Native tests cover 127-byte literals crossing source/destination pages,
255-byte fills, single-byte literals and recovery after a forced late target.

## Verification and limits

The repeated comparison uses the previous 16-phase/10 fps application at
`bc26a71` and the new 12 fps build. Five trials per profile and video standard
alternate order. Each trial checks 48 sequential bitmap frames in every moving
mode: blue, rainbow, plasma, XOR and tunnel. Static mode then restores both
bitmaps while music and the ticker continue.

The nominal rate comes from displayed frame counts divided by guest raster
ticks, not host elapsed time. The one-time startup preparation tick is recorded
separately and excluded from the steady frame-clock calculation. Every bitmap
is compared against its host-generated phase; no phases are skipped. An extra
heavy-effect check compares 16 IRQs with real guest CPU cycles, detecting a
lost physical raster interrupt instead of trusting the application counter.
Each trial also checks one SID call per refresh, the normalized ticker clock,
matching ticker buffers and restored CPU memory mapping. A 144-second soak per
standard spans three complete automatic shows, the full ticker loop and a full
color-phase cycle with zero deadline misses.

| Build | PAL nominal fps; five-trial range | NTSC nominal fps; five-trial range |
| --- | --- | --- |
| Previous 16-phase build | 10; 10..10 | 10; 10..10 |
| Updated 16-phase build | 12; 12..12 | 12; 12..12 |

All 20 trials passed: 4,800 compared bitmap frames, including 2,400 at the new
rate, with no interval misses or deadline resynchronizations. IRQ windows matched
16 physical raster periods within six guest cycles. Exploratory 13/15 fps
targets missed their intended cadence, so neither is adopted. This does not
prove that a different implementation cannot achieve a higher rate.

The [repeated-trial report](../dist/validation/fps-stress.json) contains observed
refresh intervals, misses and per-mode checks. The
[overload probes](../dist/validation/fps-probes.json) record exploratory targets
that do not meet their requested cadence. Higher configured rates must pass
these checks before becoming defaults; resynchronization is a recovery behavior.

```sh
TASS64=/path/to/64tass node tests/stress-fps.cjs
TASS64=/path/to/64tass node tests/stress-fps.cjs --runs 1 --rates 12,13,15 --probe
TASS64=/path/to/64tass node tests/verify-kernels.cjs
TASS64=/path/to/64tass node tests/verify-torq.cjs
TASS64=/path/to/64tass node tests/verify-fps-soak.cjs
```

Use `--baseline checkout-directory` for an independently built 16-phase,
10 fps checkout. Builds share `generated/` and must run sequentially. Recorded
checks use Linux 64tass 1.59.3120 and VICE 3.9+r45793. These are emulator results;
physical hardware and analog audio quality remain untested.

## Untested ideas for this engine

These are hypotheses to try, with no claim of global novelty or measured gains.

| Experiment | Proposed mechanism | Evidence required |
| --- | --- | --- |
| Cost-balanced wave phases | Jointly choose the 16 angles and their dwell times, accounting for each hidden bitmap being two phases behind; spread expensive quantized pixel changes across transitions. | Lower worst-frame cost with the same amplitude, recognizable motion and all 16 poses. Reject visible speed bumps. |
| Cycle-aware patch compiler | Replace the heuristic byte/write score with calibrated 6510 costs, including page crossings, run setup and IRQ budgets; select a RAM/time tradeoff per phase. | More deadline margin under the existing memory limits, validated against native output and timing. |
| Specialized copy kernels | Generate only the most useful short copy/fill kernels and route common lengths through them. | Saved dispatch cycles exceed entry overhead; added code still fits below low patch storage. |
| Shared edge templates | Deduplicate recurring changed-byte patterns across logo rows and phases, then stamp them through a small native kernel. | Net RAM savings after dictionary/index overhead, without a slower decoder. |
| Music-aware visual scheduling | Use explicit Clockwork musical state to steer color progression or place heavier visual work in measured CPU slack. | More intentional audiovisual phrasing or deadline margin, with unchanged SID call cadence and no work omitted. |

The first two are the strongest candidates for this memory-constrained demo.
Each experiment should retain an unchanged reference path, compare actual
displayed frames and side clocks, and earn adoption through repeated native
measurements. A failed hypothesis should remain a recorded result.
