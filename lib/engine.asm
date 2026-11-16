; Algorithm: assemble the runtime modules in a fixed order, then emit the
; palette and the 23 body-row screen-address words needed by the color updater.
; Why: source includes add no linking/runtime overhead and preserve layout.
; Boot deliberately falls through into the player: keep player.asm immediately
; after boot.asm. Forward references to application assets resolve in 64tass.
; Include once after DEMO_* constants; data and assets follow in the application.
; This is a cohesive engine with shared state, not a collection of object files.
; Detailed guide: docs/ALGORITHMS.md

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
