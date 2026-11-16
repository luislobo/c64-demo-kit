; Include once, after the DEMO_* application configuration.
.include "state.asm"
.include "boot.asm"
.include "player.asm"
.include "bitmap.asm"
.include "display.asm"
.include "raster.asm"
.include "keyboard.asm"
.include "effects.asm"
.include "colors.asm"
.include "scroller.asm"
.include "sid.asm"

rainbow:
    .byte DEMO_PALETTE
color_addresses:
    .for row := 0, row < 23, row += 1
        .word $0400 + row * 40
    .endfor
