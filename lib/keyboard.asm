; Algorithm: select CIA keyboard rows and interpret active-low matrix bits.
; Track prior Space/M/number states so a held key causes one action per edge.
; Space toggles a one-bit request; number keys store a mode request; M changes
; music volume. Built-in music advances muted; an imported player pauses/restarts.
; Why: scanning in both IRQ and main code catches short taps. PHP/SEI/PLP keeps
; shared edge state atomic while preserving the caller interrupt-enable state.
; During decoding scan all keys once per eight runs; IRQ also scans every refresh.
; Tradeoff: this is edge suppression, not timed mechanical debouncing or an event
; queue. Multiple pending Space edges can cancel; numbers have ascending priority.
; Detailed guide: docs/ALGORITHMS.md

poll_keyboard:
    php                       ; Keep the shared edge detector atomic with the IRQ.
    sei
    jsr scan_keyboard
    plp
    rts
poll_render_keyboard:
    inc poll_counter
    lda poll_counter
    and #7
    bne render_poll_done
    jmp poll_keyboard
render_poll_done:
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
    .if KIT_AUTO_SHOW
        lda #0
        sta show_enabled
    .endif
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
    sta row_keys
    and #1
    beq number_three
    .if KIT_COLOR_FIELDS
        lda row_keys
        and #8
        beq number_four
        lda #$fb
        sta $dc00
        lda $dc01
        sta row_keys
        and #1
        beq number_five
        lda row_keys
        and #8
        beq number_six
    .endif
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
    bne number_check
    .if KIT_COLOR_FIELDS
number_four:
        lda #4
        bne number_check
number_five:
        lda #5
        bne number_check
number_six:
        lda #6
    .endif
number_check:
    cmp number_down
    beq scan_mute
    sta number_down
    cmp #0
    beq scan_mute
    sta effect_request
    .if KIT_AUTO_SHOW
        lda #0
        sta show_enabled
    .endif
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
    .if DEMO_EXTERNAL_SID
        jsr music_init       ; Restart the export to restore its SID/filter state.
    .else
        lda #DEMO_VOLUME
        sta $d418
    .endif
scan_return:
    rts
