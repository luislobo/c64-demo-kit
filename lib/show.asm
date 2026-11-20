; Cycle the enabled effects every eight nominal seconds using the engine's
; 50 Hz logic clock, independent of PAL/NTSC and bitmap decoding. Boot starts
; the wave; number/Space edges leave the show under manual control until reset.
; Requests use the existing main-thread controller so static restoration and
; warm-up follow the same safe path as an interactive effect change.
show_tick:
    lda show_enabled
    beq show_return
    dec show_ticks
    bne show_return
    lda #50
    sta show_ticks
    dec show_seconds
    bne show_return
    lda #8
    sta show_seconds
    lda effect_request
    bne show_return
    lda effect
    clc
    adc #1
    .if KIT_COLOR_FIELDS
        cmp #7
    .else
        cmp #4
    .endif
    bcc show_request
    lda #1
show_request:
    sta effect_request
show_return:
    rts
