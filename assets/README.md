# Asset formats and decisions

These are data inputs, not libraries. Their algorithms belong to the converter
and host modules; keeping data external lets `demo.asm` select another picture
or font without modifying those algorithms.

| File | Representation and reason |
| --- | --- |
| `image.bin` | Exactly 8000 bytes, no header, one bit per pixel in VIC-II 8x8-cell order. The host reads this fixed 320x200 canvas, fits it into the logo area, then builds the wave frames. A fixed input format separates conversion from animation. |
| `font.bin` | 64 glyphs x 8 bytes = 512 bytes. One byte is one glyph row, most significant bit on the left. The host stamps HUD text from it; the runtime feeds ticker glyph bits into the row shifter. The `character AND 63` mapping keeps addressing cheap but limits supported text. |
| `reference/logo-white.png` | Original white logo reference. Preserved for editing/provenance; it is not read automatically during builds. |
| `reference/logo-blue.png` | Recolored logo reference. It can be passed to the converter, but the committed `image.bin` is the actual default build input. |

`tools/convert-image.ps1` produces the raw bitmap format. It makes a monochrome
foreground mask; it does not encode RGB color. Runtime foreground colors come
from `demo.asm` and the screen-color matrices.

For a pixel `(x,y)`, its byte offset is:

```text
floor(y/8)*320 + floor(x/8)*8 + (y mod 8)
```

Its mask is `128 >> (x mod 8)`. Moving one cell to the right advances eight
bytes, not one; this explains the scroller's cell-stride addressing.
