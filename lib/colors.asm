; Algorithm: update 40 screen-color bytes for one body row in both VIC banks.
; Use the base color for mode 1, row bands for 2/3, or optional fields for 4..6.
; After all 23 rows, wrap the row and advance the palette phase.
; Why: hires bitmap foreground/background colors live in the screen matrix;
; changing those bytes recolors the logo without touching its bitmap pixels.
; One row per refresh bounds ISR work; both copies stay valid for future flips.
; The two text rows remain untouched. The second screen is a fixed $bc00 away.
; Tradeoff: cells are eight pixels high; a sweep is 23 refreshes, so PAL and NTSC
; color-cycling speeds differ even though wave/music/ticker timing is normalized.
; Detailed guide: docs/ALGORITHMS.md

; Update one eight-pixel-high band per refresh, keeping the IRQ inexpensive.
color_tick:
    .if KIT_COLOR_FIELDS
        lda effect
        cmp #4
        bcc color_band
        jmp color_field_tick
color_band:
    .endif
    lda color_row
    asl
    tay
    lda color_addresses,y
    sta color_ptr
    lda color_addresses+1,y
    sta color_ptr+1
    lda effect
    cmp #1
    beq blue_band
    lda color_row
    clc
    adc color_phase
    and #7
    tax
    lda rainbow,x
    bne band_color
blue_band:
    lda #(DEMO_LOGO_COLOR * 16)
band_color:
    ldy #39
band_loop:
    sta (color_ptr),y
    dey
    bpl band_loop
    lda color_ptr+1
    clc
    adc #$bc
    sta color_ptr+1
    ldy #39
    lda effect
    cmp #1
    beq second_blue
    lda color_row
    clc
    adc color_phase
    and #7
    tax
    lda rainbow,x
    bne second_band
second_blue:
    lda #(DEMO_LOGO_COLOR * 16)
second_band:
    sta (color_ptr),y
    dey
    bpl second_band
color_row_done:
    inc color_row
    lda color_row
    cmp #23
    bne color_done
    lda #0
    sta color_row
    .if KIT_COLOR_FIELDS
        lda effect
        cmp #4
        bcc color_band_phase
        lda color_phase
        clc
        adc #7
        sta color_phase
        rts
color_band_phase:
    .endif
    inc color_phase
color_done:
    rts
