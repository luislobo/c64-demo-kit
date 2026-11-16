; Algorithm: select CIA keyboard rows and interpret active-low matrix bits.
; Track prior Space/M/number states so a held key causes one action per edge.
; Space toggles a one-bit request; number keys store a mode request; M changes
; SID master volume while the sequencer continues to advance.
; Why: scanning in both IRQ and main code catches short taps. PHP/SEI/PLP keeps
; shared edge state atomic while preserving the caller interrupt-enable state.
; During decoding scan Space each run, but all keys only once per eight runs.
; Tradeoff: this is edge suppression, not timed mechanical debouncing or an event
; queue. Multiple pending Space edges can cancel; number-key priority is 1,2,3.
; Detailed guide: docs/ALGORITHMS.md

poll_keyboard:
    php                       ; Keep the shared edge detector atomic with the IRQ.
    sei
    jsr scan_keyboard
    plp
    rts
poll_render_keyboard:
    php
    sei
    inc poll_counter
    lda poll_counter
    and #7
    bne render_space_only
    jsr scan_keyboard
    jmp render_poll_done
render_space_only:
    jsr scan_space
render_poll_done:
    plp
    rts
scan_space:
    lda #$7f
    sta $dc00
    lda $dc01                 ; Space is column 4 of the selected keyboard row 7.
    sta row_keys
    and #$10
    beq pressed
    lda #0
    sta space_down
    beq key_done
pressed:
    lda space_down
    bne key_done
    lda #1
    sta space_down
    lda toggle
    eor #1
    sta toggle
key_done:
    rts
scan_keyboard:
    jsr scan_space
    lda row_keys
    and #1
    beq number_one
    lda row_keys
    and #8
    beq number_two
    lda #$fd
    sta $dc00
    lda $dc01
    and #1
    beq number_three
    lda #0
    beq number_check
number_one:
    lda #1
    bne number_check
number_two:
    lda #2
    bne number_check
number_three:
    lda #3
number_check:
    cmp number_down
    beq scan_mute
    sta number_down
    cmp #0
    beq scan_mute
    sta effect_request
scan_mute:
    lda #$ef
    sta $dc00
    lda $dc01
    and #$10
    beq mute_pressed
    lda #0
    sta mute_down
    rts
mute_pressed:
    lda mute_down
    bne scan_return
    lda #1
    sta mute_down
    lda muted
    eor #1
    sta muted
    beq unmute
    lda #0
    sta $d418
    rts
unmute:
    lda #DEMO_VOLUME
    sta $d418
scan_return:
    rts
