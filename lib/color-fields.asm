; Original logo color fields: one 40-cell row per border IRQ in both VIC banks.
; Host sine/polar tables remove trigonometry; byte adds/XOR select eight colors.
; Patching indexed stores avoids two indirect writes per cell. IRQ is the only
; caller, so these operands cannot be reentered. Text rows never enter the loop.
; Phase advances only after a complete sweep, producing a rolling color update.
; Scratch $22..$27 is disjoint from bitmap decoding, ticker and imported SID ZP.
field_y = $22
field_radius_ptr = $24
field_angle_ptr = $26

color_field_tick:
    lda effect
    sec
    sbc #4
    asl
    tax
    lda field_loops,x
    sta field_dispatch+1
    lda field_loops+1,x
    sta field_dispatch+2
    lda color_row
    asl
    tay
    lda color_addresses,y
    sta field_store_primary+1
    sta xor_store_primary+1
    sta polar_store_primary+1
    sta field_store_secondary+1
    sta xor_store_secondary+1
    sta polar_store_secondary+1
    lda color_addresses+1,y
    sta field_store_primary+2
    sta xor_store_primary+2
    sta polar_store_primary+2
    clc
    adc #$bc
    sta field_store_secondary+2
    sta xor_store_secondary+2
    sta polar_store_secondary+2
    lda field_radius_rows,y
    sta field_radius_ptr
    lda field_radius_rows+1,y
    sta field_radius_ptr+1
    lda field_angle_rows,y
    sta field_angle_ptr
    lda field_angle_rows+1,y
    sta field_angle_ptr+1
    lda color_row
    asl
    asl
    asl
    sec
    sbc color_phase
    tay
    lda field_sine,y
    sta field_y
    ldx #39
field_dispatch:
    jmp field_plasma
field_plasma:
    lda field_x_phase,x
    clc
    adc color_phase
    tay
    lda field_sine,y
    clc
    adc field_y
    lsr
    lsr
    tay
    .if KIT_FIRE_PLASMA
        lda fire_palette,y
    .else
        lda field_palette,y
    .endif
field_store_primary:
    sta $0400,x
field_store_secondary:
    sta $c000,x
    dex
    bpl field_plasma
    jmp color_row_done
field_xor:
    lda field_x_phase,x
    clc
    adc color_phase
    tay
    lda field_sine,y
    eor field_y
    lsr
    lsr
    lsr
    lsr
    tay
    lda rainbow,y
xor_store_primary:
    sta $0400,x
xor_store_secondary:
    sta $c000,x
    dex
    bpl field_xor
    jmp color_row_done
field_polar:
    txa
    tay
    lda (field_radius_ptr),y
    clc
    adc color_phase
    eor (field_angle_ptr),y
    lsr
    lsr
    tay
    lda field_palette,y
polar_store_primary:
    sta $0400,x
polar_store_secondary:
    sta $c000,x
    dex
    bpl field_polar
    jmp color_row_done
field_loops:
    .if KIT_FIRE_PLASMA
        .word field_fire, field_xor, field_polar
    .else
        .word field_plasma, field_xor, field_polar
    .endif
; Shift twice in the loop; eight copies per shade replace three more shifts.
field_palette:
    .for shade := 0, shade < 8, shade += 1
        .fill 8, DEMO_PALETTE[shade]
    .endfor
field_x_phase:
    .for col := 0, col < 40, col += 1
        .byte col * 5
    .endfor
