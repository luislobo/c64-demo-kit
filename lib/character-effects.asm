; Original 40x20 character-effect kernels. Generate x sine samples once per
; half, then render ten rows into the hidden screen using absolute indexed
; stores. Only complete two-half frames are displayed by the border IRQ.
; Plasma sums two sine terms; interference XORs them; tunnel scrolls a polar
; radius/angle texture. Trigonometry and division live in host/character.cjs.
; A/X/Y and flags are clobbered. Uses char_* scratch from character-scene.asm.
; Store/source operands are self-modifying; IRQ code must not re-enter this module.
; Attribution, memory layout and the visible equations: docs/CHARACTER.md.
char_render_half:
    ldx #0
    ldy char_phase
char_make_x:
    lda char_sine,y
    sta char_x_wave,x
    tya
    clc
    adc #5
    tay
    inx
    cpx #40
    bne char_make_x
    lda #0
    ldx char_half
    beq char_row_selected
    lda #10
char_row_selected:
    sta char_row
char_render_row:
    lda char_row
    asl
    tax
    lda char_row_offsets,x
    sta char_plasma_store+1
    sta char_xor_store+1
    sta char_tunnel_store+1
    lda char_row_offsets+1,x
    clc
    ldy visible
    beq char_hidden_bank1
    adc #$04
    bne char_store_bank
char_hidden_bank1:
    adc #$44
char_store_bank:
    sta char_plasma_store+2
    sta char_xor_store+2
    sta char_tunnel_store+2
    lda char_radius_rows,x
    sta char_radius_load+1
    lda char_radius_rows+1,x
    sta char_radius_load+2
    lda char_angle_rows,x
    sta char_angle_load+1
    lda char_angle_rows+1,x
    sta char_angle_load+2
    lda char_row
    asl
    asl
    asl
    sec
    sbc char_phase
    tax
    lda char_sine,x
    sta char_row_value
    ldx #39
    lda char_mode
    beq char_plasma_loop
    cmp #1
    beq char_xor_loop
    jmp char_tunnel_loop
char_plasma_loop:
    lda char_x_wave,x
    clc
    adc char_row_value
    tay
    lda char_shades,y
char_plasma_store:
    sta $4400,x
    dex
    bpl char_plasma_loop
    jmp char_next_row
char_xor_loop:
    lda char_x_wave,x
    eor char_row_value
    lsr
    lsr
    lsr
char_xor_store:
    sta $4400,x
    dex
    bpl char_xor_loop
    jmp char_next_row
char_tunnel_loop:
char_radius_load:
    lda char_radius,x
    clc
    adc char_phase
char_angle_load:
    eor char_angle,x
    and #15
char_tunnel_store:
    sta $4400,x
    dex
    bpl char_tunnel_loop
char_next_row:
    inc char_row
    lda char_row
    ldx char_half
    beq char_end_top
    cmp #20
    bne char_more_rows
    rts
char_end_top:
    cmp #10
    bne char_more_rows
    rts
char_more_rows:
    jmp char_render_row

char_x_wave: .fill 40,0
char_row_offsets:
    .for row := 0, row < 20, row += 1
        .word row*40
    .endfor
char_radius_rows:
    .for row := 0, row < 20, row += 1
        .word char_radius+row*40
    .endfor
char_angle_rows:
    .for row := 0, row < 20, row += 1
        .word char_angle+row*40
    .endfor
