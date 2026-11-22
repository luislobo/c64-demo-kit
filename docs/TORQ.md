# TORQ X SENDERO demo

The default application combines the supplied logo, its 16-phase bitmap wave,
three original foreground color fields, a pixel ticker and After Hours Roll SID music.
It starts with plasma and automatically changes modes every eight nominal seconds.
The 16-pose wave runs at nominal 12.5 fps on PAL and 15 fps on NTSC.
[FPS measurements](FPS.md) include the PAL cadence and startup allowance.
[Capacity measurements](FRAME_CAPACITY.md) cover 8, 16 and 32 phases.

| Key | Result |
| --- | --- |
| 1 | Blue wave |
| 2 | Rainbow wave |
| 3 | Stationary logo with cycling color bands |
| 4 | Wave with sine-sum plasma colors |
| 5 | Wave with XOR interference colors |
| 6 | Wave with polar tunnel colors |
| Space | Start/stop bitmap motion |
| M | Pause/restart After Hours Roll |
| Reset | Restart the automatic show |

A number key or Space takes manual control until reset. Space stops bitmap
motion while color fields, ticker and music continue. Mode 3 stops the wave;
selecting another mode starts it. Music pause holds the exported player and
silences the master volume. Unmuting initializes the song again.

## Build and release

```console
node build.cjs
```

The same command generates After Hours Roll from its assembly source, assembles the
demo and packages a D64. `TASS64` selects another 64tass executable. No downloaded
tune, npm dependency or network connection is needed.

Outputs include `torqxsendero-c64.prg`, `.d64`, `-credits.txt` and
`-music-credits.json` in `build/`. Preserve both credit files when redistributing
the program. Ready-to-run copies and captures are in [dist](../dist/README.md).

## Application settings

`demo.asm` owns these optional bitmap-engine settings:

| Setting | Default when omitted | Meaning |
| --- | --- | --- |
| `DEMO_FPS` | `10` | Nominal bitmap FPS; TORQ selects `15` |
| `DEMO_PAL_TICKS` | Unset | Fixed PAL period when set; TORQ uses four refreshes |
| `DEMO_PATCH_PLAN` | `"legacy"` | TORQ selects `"balanced"` for cycle-based patches and pose selection |
| `DEMO_COLOR_FIELDS` | `0` | `1` enables modes 4..6 and their lookup tables |
| `DEMO_START_EFFECT` | `1` | Initial mode, within the enabled range |
| `DEMO_AUTO_SHOW` | `0` | `1` starts the wave and cycles enabled modes every eight seconds |
| `DEMO_SID_BUILD` | None | `"after-hours"` generates TORQ's original SID before import |
| `DEMO_CREDITS_FILE` | None | Text notice copied beside the PRG/D64 |

The supplied application selects fields, initial mode 4 and automatic playback.
Other bitmap entries retain their three-mode behavior unless they enable fields.
Removing the PSID configuration selects the existing built-in note sequencer.
`DEMO_VOLUME` and `DEMO_NOTE_TICKS` control that sequencer; an imported player
owns its volume and tempo. See [SID contracts](SID.md) before importing music.

## Runtime design

The color fields change only foreground nibbles in the two 40x23 logo screen
matrices. Backgrounds remain black. Each IRQ updates one row in both banks, so
bank flips never select an older copy of that row. The rolling update takes
23 refreshes; its speed differs between PAL and NTSC. HUD and ticker colors
remain outside the field. This keeps the recognizable logo and its wave visible.

The host prepares a 256-byte sine table plus two 920-byte polar maps. Their
23-word row-address tables add 92 bytes, for 2,188 bytes total. These follow the
patch streams, below `$c000`; host and assembler independently reject overlaps.
The 16-phase build uses repeated-byte patch compression and `$1500..$1fff`
for low patch storage. A continuation table lets a stream resume in high RAM
without resetting its destination. Code/font/text/tables fit below `$1500`;
`$2e..$2f` holds the pending continuation. High patches plus color tables leave
408 bytes before `$c000`. The SID occupies `$c400..$c5d5`.
IRQ scratch `$22`, `$24..$27` and automatic-show state `$28..$2a` are
disjoint from decoder pointers, ticker state and the imported player's allocation.

Plasma adds horizontal and vertical sine samples; XOR combines them with EOR.
The tunnel adds phase to inverse radius, XORs angle and selects a palette entry.
The native loops use additions, shifts, table reads and two indexed stores per
cell. They calculate no trigonometric functions. The IRQ is their only caller,
which makes the patched screen-store operands safe from reentry.

The automatic show requests modes through the existing controller every 400
normalized logic updates, or 400 PAL/480 NTSC refreshes. Entering stationary
mode therefore uses the normal bitmap restoration path. Keyboard scanning runs
every IRQ and between frames. The decoder performs no per-command keyboard
calls, leaving time for compressed-run dispatch, color and music work.

## Credits

The wave engine, new color fields, PSID adapter and After Hours Roll are original kit
implementations. After Hours Roll's composition/player are by C64 demo kit contributors
under CC0 1.0. The [release notice](../assets/torq-credits.txt) preserves these
credits and the PSID format authors.

Research acknowledgments include Maciej Małecki/c64lib and Raistlin/Genesis
Project. Their primary sources and license evidence remain in the
[credited collection](../research/CREDITS.md). No archived demo routine or
third-party composition is copied into these color fields. The separate
character example retains its own MIT-adapted c64lib helper notices.

## Verification

```console
node --test tests/*.test.cjs
node tests/rebuild-variant.cjs
node tests/verify-torq.cjs
```

The native check requires VICE `x64sc`, 64tass and headless Linux `xvfb-run`.
It rebuilds music from scratch and checks automatic startup, eight-second
transitions, wraparound and the Space edge handler on PAL/NTSC. It also compares
90 displayed bitmap frames per machine, 46 color rows per new mode including
phase wrap, refresh-aware flip cadence, zero deadline misses, text colors, stop/restart, ticker
buffers and one SID play call per refresh. Results and captures go to `build/`.
Input events/handlers are exercised directly; physical keyboard scanning,
analog audio quality and real C64 hardware remain untested.
