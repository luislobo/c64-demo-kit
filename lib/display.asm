flip:
    lda #1
    sta flip_request
flip_wait:
    jsr poll_keyboard
    lda flip_request
    bne flip_wait
    rts
; Called by the raster IRQ at line 250, before music or ticker work.
flip_border:
    lda visible
    eor #1
    sta visible
    beq show_primary
    lda #8
    sta $d018                 ; Screen $c000, bitmap $e000 in VIC bank 3.
    lda $dd00
    and #$fc
    sta $dd00
    jmp flip_record
show_primary:
    lda #$18
    sta $d018                 ; Screen $0400, bitmap $2000 in VIC bank 0.
    lda $dd00
    ora #3
    sta $dd00
flip_record:
    inc flip_count            ; Small counters also make emulator tests measurable.
    lda ticks
    sta last_flip_tick
    lda #0
    sta flip_request
    rts
