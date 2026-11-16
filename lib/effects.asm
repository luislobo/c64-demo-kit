; Algorithm: atomically consume the pending mode, then set effect and request
; animation start or stop only if the current active state needs to change.
; Why: keyboard scanning reports intent; this main-thread controller decides
; when the player can safely transition and restore its dependent buffers.
; Modes 1/2 share the same wave frames and differ only in color treatment.
; Mode 3 stops bitmap motion while the raster-driven palette keeps changing.
; CMP after PLP tests the request value, not the previously restored flags.
; Tradeoff: three standard modes are built in; new motion modes need matching data.
; Detailed guide: docs/ALGORITHMS.md

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
