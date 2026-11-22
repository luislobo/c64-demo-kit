# TORQ X SENDERO demo

The default application combines the supplied logo, its 16-phase bitmap wave,
three original foreground color fields, a pixel ticker and After Hours Roll SID music.
It starts with fire plasma above a nighttime firepit and changes modes every
eight nominal seconds. The firepit has a stone ring, glowing coals, moving
flames and drifting sparks. The landscape keeps a dark clearing behind the flames.
The 16-pose wave runs at nominal 12.5 fps on PAL and 15 fps on NTSC.
[FPS measurements](FPS.md) include the PAL cadence and startup allowance.
[Capacity measurements](FRAME_CAPACITY.md) cover 8, 16 and 32 phases.

| Key | Result |
| --- | --- |
| 1 | Blue wave |
| 2 | Rainbow wave |
| 3 | Stationary logo with cycling color bands |
| 4 | Wave with rising fire plasma and an ember-to-yellow palette |
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
| `DEMO_FIRE_PLASMA` | `0` | `1` gives mode 4 a rising heat field and fire palette |
| `DEMO_FIREPIT` | `0` | `1` places the animated scene below the logo. Use `DEMO_LOGO_HEIGHT` between 48 and 88, in multiples of eight. |
| `DEMO_START_EFFECT` | `1` | Initial mode, within the enabled range |
| `DEMO_AUTO_SHOW` | `0` | `1` starts the wave and cycles enabled modes every eight seconds |
| `DEMO_SID_BUILD` | None | `"after-hours"` generates TORQ's original SID before import |
| `DEMO_CREDITS_FILE` | None | Text notice copied beside the PRG/D64 |

The supplied application selects fields, initial mode 4 and automatic playback.
Other bitmap entries retain their three-mode behavior unless they enable fields.
Set `DEMO_FIRE_PLASMA = 0` in `demo.asm` to restore the original plasma palette.
Disable `DEMO_FIREPIT` and set `DEMO_LOGO_HEIGHT = 184` for the full-screen logo.
Removing the PSID configuration selects the existing built-in note sequencer.
`DEMO_VOLUME` and `DEMO_NOTE_TICKS` control that sequencer; an imported player
owns its volume and tempo. See [SID contracts](SID.md) before importing music.

## Runtime design

The color fields change only foreground nibbles in the logo rows of the two 40×25 screen
matrices. Backgrounds remain black. Each IRQ updates one row in both banks, so
bank flips never select an older copy of that row. The rolling update traverses 23 rows per cycle and recolors the eight
logo rows in the default layout. The firepit, HUD and ticker keep their own
palettes. This keeps the recognizable logo and its wave visible.

The host prepares a 256-byte sine table, two polar maps and their row-address
tables, totaling 1,748 bytes. The
patches fit in high RAM with the tables, scene palettes and raster handlers.
The default layout leaves 6,538 bytes available in the high patch budget after
reserving space for those assets. The SID occupies `$c400..$ca93`.
IRQ scratch `$22`, `$24..$27` and automatic-show state `$28..$2a` are
disjoint from decoder pointers, ticker state and the imported player's allocation.

Plasma adds horizontal and vertical sine samples; XOR combines them with EOR.
The tunnel adds phase to inverse radius, XORs angle and selects a palette entry.
Fire plasma mixes a rising sine band with a bottom-to-top heat falloff once
per row. Its helper and tables fit in the unused bytes at `$3f40..$3fff`,
outside the visible bitmap.

The host paints the landscape and 16 fire poses, then chooses three local
colors plus black for each 4×8 multicolor cell across the loop. The two screen
matrices and shared color RAM receive the scene palette at startup. Two short
raster interrupts switch to the 160-pixel-wide multicolor scene and back to
320-pixel-wide hires for the controls. Both switches happen in blank rows.
The normal bitmap patches carry flame, coal and spark motion. Static mode
restores the scene's first pose.
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
