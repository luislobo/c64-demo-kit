; Update one eight-pixel-high band per refresh, keeping the IRQ inexpensive.
color_tick:
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
    inc color_row
    lda color_row
    cmp #23
    bne color_done
    lda #0
    sta color_row
    inc color_phase
color_done:
    rts
