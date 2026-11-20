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
    lda color_row
    asl
    tay
    lda color_addresses,y
    sta field_store_primary+1
    sta field_store_secondary+1
    lda color_addresses+1,y
    sta field_store_primary+2
    clc
    adc #$bc
    sta field_store_secondary+2
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
field_cell:
    lda effect
    cmp #6
    beq field_polar
    lda field_x_phase,x
    clc
    adc color_phase
    tay
    lda field_sine,y
    ldy effect
    cpy #5
    beq field_xor
    clc
    adc field_y
    lsr
    jmp field_shade
field_xor:
    eor field_y
field_shade:
    lsr
    lsr
    lsr
    lsr
    tay
    lda rainbow,y
field_store_primary:
    sta $0400,x
field_store_secondary:
    sta $c000,x
    dex
    bpl field_cell
    jmp color_row_done
field_polar:
    txa
    tay
    lda (field_radius_ptr),y
    clc
    adc color_phase
    eor (field_angle_ptr),y
    lsr
    jmp field_shade
field_x_phase:
    .for col := 0, col < 40, col += 1
        .byte col * 5
    .endfor
