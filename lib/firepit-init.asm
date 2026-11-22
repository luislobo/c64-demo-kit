; Static scene screen colors in both banks and shared VIC color RAM.
; Keeping both attributes in sync makes fire, coals and sparks flip atomically
; with the ordinary bitmap renderer. Startup owns X and A.
FIREPIT_COLOR_BYTES = (23 - KIT_FIREPIT_ROW) * 40
FIREPIT_SCREEN = $0400 + KIT_FIREPIT_ROW * 40
FIREPIT_SECOND_SCREEN = FIREPIT_SCREEN + $bc00
init_firepit_colors:
    ldx #0
firepit_copy_pages:
    .for page := 0, page < FIREPIT_COLOR_BYTES / 256, page += 1
        lda firepit_colors + 256 * page,x
        sta FIREPIT_SCREEN + 256 * page,x
        sta FIREPIT_SECOND_SCREEN + 256 * page,x
        lda firepit_color_ram + 256 * page,x
        sta $d800 + KIT_FIREPIT_ROW * 40 + 256 * page,x
    .endfor
    inx
    bne firepit_copy_pages
    .if FIREPIT_COLOR_BYTES % 256
        ldx #(FIREPIT_COLOR_BYTES % 256) - 1
firepit_copy_tail:
        lda firepit_colors + (FIREPIT_COLOR_BYTES & $ff00),x
        sta FIREPIT_SCREEN + (FIREPIT_COLOR_BYTES & $ff00),x
        sta FIREPIT_SECOND_SCREEN + (FIREPIT_COLOR_BYTES & $ff00),x
        lda firepit_color_ram + (FIREPIT_COLOR_BYTES & $ff00),x
        sta $d800 + KIT_FIREPIT_ROW * 40 + (FIREPIT_COLOR_BYTES & $ff00),x
        dex
        cpx #$ff
        bne firepit_copy_tail
    .endif
    rts
