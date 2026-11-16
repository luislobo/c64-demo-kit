; Algorithm: state machine for idle, two-buffer warm-up, steady playback and
; static restoration. Render the hidden buffer, request its scheduled flip,
; advance phase with a power-of-two mask, and add period to the prior deadline.
; Why: absolute deadlines include rendering time instead of adding a delay
; after drawing; each hidden buffer is two phases behind the next target.
; Warm-up patches start both buffers from static. The universal restore patches
; both buffers on stop so the next start has a known baseline and no trails.
; Tradeoff: arbitrary frame jumps need new patches; missed deadlines can slow
; playback. The eight-bit signed deadline test assumes less than 128 ticks ahead.
; Detailed guide: docs/ALGORITHMS.md

idle:
    jsr poll_keyboard
    jsr handle_effect
    lda toggle
    beq idle
    lda #0
    sta toggle
    sta phase
    lda #1
    sta active
    lda #2
    sta warmup
    lda ticks
    clc
    adc period
    sta deadline
next_frame:
    jsr handle_effect
    lda toggle
    bne stop_animation
    lda phase
    ldx warmup
    beq steady_patch
    dec warmup                ; First two writes start from the original bitmap.
    jmp selected_patch
steady_patch:
    clc
    adc #2                    ; Then each hidden buffer is two phases behind.
selected_patch:
    jsr render
frame_ready:
    jsr poll_keyboard
    jsr handle_effect
    lda toggle
    bne stop_animation
    jsr flip
    inc phase
    lda phase
    and #(DEMO_FRAMES - 1)
    sta phase
    lda deadline              ; Absolute schedule: drawing time is part of period.
    clc
    adc period
    sta deadline
    jmp next_frame

stop_animation:
    lda #0
    sta toggle
    sta active
    lda ticks
    clc
    adc #1
    sta deadline
    lda #(DEMO_FRAMES + 2)                   ; Universal restore covers every byte any wave alters.
    jsr render
    jsr flip
    lda #(DEMO_FRAMES + 2)
    jsr render                ; Restore the other buffer, ready for a clean restart.
    jmp idle
