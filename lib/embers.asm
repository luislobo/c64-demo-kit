; Unexpanded hires particles over the multicolor bitmap. Each bank has the
; same two shapes and preset screen pointers, so flips need no sprite work.
EMBER_SHAPES_PRIMARY = $0380
EMBER_SHAPES_SECONDARY = $ff40
EMBER_SCREEN_PRIMARY = $07f8
EMBER_SCREEN_SECONDARY = $c3f8

init_embers:
    ldx #127
ember_copy:
    lda ember_shapes,x
    sta EMBER_SHAPES_PRIMARY,x
    sta EMBER_SHAPES_SECONDARY,x
    dex
    bpl ember_copy
    .for slot := 0, slot < KIT_EMBER_COUNT, slot += 1
        lda #((EMBER_SHAPES_PRIMARY / 64) + (($49 >> slot) & 1))
        sta EMBER_SCREEN_PRIMARY + slot
        lda #(((EMBER_SHAPES_SECONDARY - $c000) / 64) + (($49 >> slot) & 1))
        sta EMBER_SCREEN_SECONDARY + slot
    .endfor
    lda #0
    sta $d010
    sta $d017
    sta $d01b
    sta $d01c
    sta $d01d
    rts

; The ticker's normalized half-rate tick advances the tracks 25 times per
; second on either standard. Turn sprites off when bitmap playback stops.
ember_tick:
    lda active
    bne ember_motion
    jmp ember_enable
ember_motion:
    ldx ember_step
    .for slot := 0, slot < KIT_EMBER_COUNT, slot += 1
        lda ember_tracks + slot * 3 * KIT_EMBER_STEPS,x
        sta $d000 + slot * 2
        lda ember_tracks + (slot * 3 + 1) * KIT_EMBER_STEPS,x
        sta $d001 + slot * 2
        lda ember_tracks + (slot * 3 + 2) * KIT_EMBER_STEPS,x
        sta $d027 + slot
    .endfor
    inx
    txa
    and #(KIT_EMBER_STEPS - 1)
    sta ember_step
    dex
    lda ember_tracks + KIT_EMBER_COUNT * 3 * KIT_EMBER_STEPS,x
ember_enable:
    sta $d015
ember_tick_done:
    rts

    .cerror * - init_embers > KIT_EMBER_CODE_BYTES, "Ember routines exceed their reserved bytes"
ember_shapes:
    .binary "../generated/ember-shapes.bin"
ember_tracks:
    .binary "../generated/ember-tracks.bin"
