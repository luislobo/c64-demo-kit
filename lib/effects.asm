handle_effect:
    php
    sei
    lda effect_request
    pha
    lda #0
    sta effect_request
    pla
    plp
    cmp #0
    beq effect_return
    sta effect
    cmp #3
    beq effect_static
    lda active
    bne effect_return
    lda #1
    sta toggle
    rts
effect_static:
    lda active
    beq effect_return
    lda #1
    sta toggle
effect_return:
    rts
