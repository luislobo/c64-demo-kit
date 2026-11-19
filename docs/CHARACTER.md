# Build character effects

The character example provides three native effects: sine plasma, XOR
interference and a polar tunnel. It uses a generated density charset and two
text/charset banks. Select effects with 1, 2 and 3. Space pauses/resumes the
visuals; music continues. M pauses and restarts the imported tune. Reset exits.

Build and run from the repository root:

```console
node tools/build-example-music.cjs
node tools/build-effects.cjs
```

Load `build/effects/character-effects.prg` or the D64's `CHAR-EFFECTS` file.
The ready-to-run snapshot is also in [dist/examples](../dist/examples/README.md).
The original Clockwork tune demonstrates the same
[PSID player interface](SID.md) used by the bitmap example.

## Make another application

Copy `effects-demo.asm` beside the original application file. Change its title,
HUD, scroll text, palette, output names, starting effect and phase step. Keep
text in the uppercase font range `$20..$5f`; titles and HUDs fit 40 columns.
The eight palette entries are C64 color indices 0..15. `DEMO_EFFECT_START` is
1..3 and `DEMO_EFFECT_STEP` is 1..8.

```console
node tools/build-effects.cjs --entry my-effects.asm --out build/my-effects
```

Use your own compatible PSID file and its real zero-page and attribution
declarations to change music. The builder keeps music credits in a sidecar JSON
file and puts the adapted helper's full MIT notice into a release credits file.
Keep both when distributing the program. Builds share `generated/`, so run
application builds sequentially. The separate character builder does not
replace the default bitmap target.

## Rendering and scheduling

The visible field is 40 columns by 20 rows of eight-pixel characters. Sixteen
generated glyphs provide ordered brightness levels; the kit's existing font is
copied into glyph slots 64..127 for text. Each row uses a palette entry. The
title and controls occupy rows 21 and 22; a character scroller occupies row 24.

The host generates a 256-byte sine table, a shade table, and byte-sized polar
radius/angle maps. With `sine(t) = round(63.5 * (1 + sin(2*pi*t/256)))`, the
original effect loops implement these cell equations:

| Mode | Glyph index for cell x,y and phase p |
| --- | --- |
| Plasma | `(sine(5*x+p) + sine(8*y-p)) >> 4` |
| XOR interference | `(sine(5*x+p) XOR sine(8*y-p)) >> 3` |
| Polar tunnel | `((radius(x,y)+p) XOR angle(x,y)) AND 15` |

Sine arguments wrap to a byte. The polar map uses `dx=(x-19.5)/2`, `dy=y-9.5`,
`radius=round(96/max(1,hypot(dx,dy)))` and
`angle=round(atan2(dy,dx)*128/pi)`, stored modulo 256. These formulas define
coarse character effects, not a high-resolution bitmap rotozoomer.

The renderer prepares the x-wave once per half and fills ten hidden rows using
absolute indexed stores. Main code renders one half per refresh. After the
second half it requests a flip; the raster IRQ changes the VIC bank at line
250 and acknowledges the request. Only then does main code advance phase.
Mode changes discard a partial hidden frame, and pause preserves it. The IRQ
owns music, keyboard scanning, raster ticks and display-bank changes.

The verified example flips once every two native refreshes on the tested PAL
and NTSC models. The phase step is per completed frame, so motion follows the
native display rate. This result is not a timing guarantee for an arbitrary
replacement SID player. The example does not claim a measured speedup over a
different renderer.

## Memory and module contract

| Region | Ownership |
| --- | --- |
| `$02..$4f` | Shared state and character scratch; imported music must not use it |
| `$22..$2c`, `$30..$31` | Character phase/half/mode/row state and row pointer |
| `$80..$ef` | Only explicitly declared imported-player zero page |
| `$0400..$07ff` | Bank 0 text screen |
| `$0801..$1fff` | BASIC stub, code, mutable operands, row tables and scroll text |
| `$2000..$27ff`, `$6000..$67ff` | Identical charsets in VIC banks 0 and 1 |
| `$3000..$383f` | Sine, shade and polar tables |
| `$3900..$40ff` | Initial text and color templates |
| `$4400..$47ff` | Bank 1 text screen |
| `$c400..$cfff` | Reserved PSID payload |
| `$d800..$dbff` | Shared color RAM |
| `$fffa..$ffff` | NMI/IRQ vectors in RAM |

`lib/character-scene.asm` is a standalone scene composition. It takes over VIC,
CIA keyboard ports, SID and interrupts with ROMs mapped out. Include it instead
of `lib/engine.asm`; the two engines cannot own hardware at the same time.
Both use the compatible keyboard and optional PSID adapter modules.

`lib/character-effects.asm` provides `char_render_half`, using the scene's
`char_*` scratch, lookup tables and hidden-bank selection. It clobbers A/X/Y
and flags. Store/source operands are self-modifying and must not be re-entered
from the IRQ. The display buffers become visible only through the border flip.

`lib/charset.asm` provides two smaller adapted routines:

| Routine | Input | Output and constraints |
| --- | --- | --- |
| `charset_fill_1k` | A=value, X=base high byte `$00..$fc` with low byte zero | Fill four pages; preserve A, clobber X/flags. Self-modifying, one caller context. |
| `charset_scroll_left` | A=new glyph; `char_dst` points to a 40-byte row | Shift 39 cells left and insert A; preserve A/X, clobber Y/flags. Pointer is unchanged. |

The example clears both screens and initializes color RAM with the fill helper.
It calls the row scroller for both buffers so a later bank flip preserves the
ticker. These are source/include routines with explicit caller-owned memory,
not independently relocatable object files.

## Attribution and verification

The fill and compact shift loops are adapted from Maciej Małecki and c64lib:

- [fill-screen.asm at 0385f54](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/sub/fill-screen.asm)
- [scroll1x1.asm at 8b01a4e](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/scroll1x1.asm)

The port changes KickAssembler syntax to 64tass, replaces stack arguments with
registers/a row pointer, and leaves text iteration to the caller. The original
copyright and MIT permission notice are in `lib/charset.asm` and the generated
release credits. The source snapshots and original license remain in the
[research collection](../research/CREDITS.md).

The effect kernels, polar/charset generator, scene scheduler and integration
code are original kit implementations using the equations above. The research
catalogue credits other authors of plasma, scroller and procedural effects;
no unlicensed production code was copied into these original loops. Clockwork's
composition/player attribution and CC0 grant are in
[examples/music/README.md](../examples/music/README.md).

```console
node --test tests/character.test.cjs
node tests/verify-effects.cjs
```

Set `TASS64` for a local assembler and optionally `VICE_BIN` for VICE. Headless
Linux uses `xvfb-run`. The emulator check compares 24 displayed frames per
machine with the mathematical reference, observes VIC-bank selection and
two-refresh flip intervals, checks copied charsets/color RAM, tests the shared
scroller and pauses/resumes graphics while music continues. It also builds a
different title, palette, start mode and phase step without editing libraries.
The temporary application is removed and default character assets restored.
Results and captured frames are written to `build/validation/`.

The checks inject the events produced by the keyboard scanner; they do not
automate physical key presses. Physical C64 hardware and analog SID sound were
not tested. There are no undocumented CPU instructions or VSP effects in this
example.
