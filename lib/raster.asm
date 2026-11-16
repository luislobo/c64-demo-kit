irq:
    pha
    txa
    pha
    tya
    pha
    inc ticks
    jsr scan_keyboard
    lda flip_request
    beq no_flip
    lda ticks
    sec
    sbc deadline
    bmi no_flip
    jsr flip_border
no_flip:
    jsr color_tick
    lda logic_acc
    clc
    adc #50
    cmp refresh_hz
    bcc logic_wait
    sec
    sbc refresh_hz
    sta logic_acc
    jsr music_tick
    inc scroll_div
    lda scroll_div
    and #1
    bne irq_done
    jsr scroll_tick
    jmp irq_done
logic_wait:
    sta logic_acc
irq_done:
    lda #1
    sta $d019
    pla
    tay
    pla
    tax
    pla
nmi:
    rti
