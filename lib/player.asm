; Algorithm: state machine for idle, two-buffer warm-up, steady playback and
; static restoration. Render the hidden buffer, request its scheduled flip,
; advance phase with a mask, and add integer/fractional periods to the deadline.
; Why: absolute deadlines include rendering time instead of adding a delay
; after drawing; each hidden buffer is two phases behind the next target.
; Warm-up patches start both buffers from static. The universal restore patches
; both buffers on stop so the next start has a known baseline and no trails.
; Tradeoff: arbitrary frame jumps need new patches; missed deadlines can slow
; playback. Overdue frames resync at the next refresh and increment a counter,
; preventing accumulated lateness from wrapping the signed deadline comparison.
; Detailed guide: docs/ALGORITHMS.md

idle:
    jsr poll_keyboard
    jsr handle_effect
    lda toggle
    beq idle
    lda #0
    sta toggle
    sta phase
    sta frame_accumulator
    lda #1
    sta active
    lda #2
    sta warmup
    lda ticks
    .if KIT_STARTUP_TICKS
        clc
        adc #1              ; Start the fast frame clock at the next border.
    .endif
    sta deadline
    jsr schedule_frame
    .if KIT_STARTUP_TICKS
        inc frame_interval
    .endif
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
    lda ticks
    sec
    sbc deadline
    bmi frame_deadline_ready
    inc deadline_misses
    lda ticks
    clc
    adc #1
    sta deadline             ; Resync a missed target instead of accumulating lag.
frame_deadline_ready:
    jsr flip
    inc phase
    lda phase
    and #(DEMO_FRAMES - 1)
    sta phase
    jsr schedule_frame
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

; Add base ticks plus a carried fractional tick to the prior deadline. This
; keeps PAL/NTSC at the same nominal FPS without changing music/ticker clocks.
schedule_frame:
    lda frame_accumulator
    clc
    adc frame_remainder
    cmp #KIT_FPS
    bcc frame_base_interval
    sbc #KIT_FPS
    sta frame_accumulator
    lda period
    clc
    adc #1
    bne frame_add_interval
frame_base_interval:
    sta frame_accumulator
    lda period
frame_add_interval:
    sta frame_interval
    clc
    adc deadline
    sta deadline
    rts
