; Algorithm: save A/X/Y, advance ticks, scan keys, service due flips, update one
; color band, then use an accumulator to schedule approximately 50 logic ticks
; per second on nominal 50/60 Hz displays. Every other logic tick scrolls text.
; Why: flips run first to meet the border deadline. Music/ticker scheduling is
; decoupled from the slower bitmap animation; accumulator arithmetic uses bytes.
; On NTSC, add 50 and subtract 60 when due: five logic updates per six refreshes.
; Acknowledge VIC IRQ and restore registers; RTI restores caller flags.
; Tradeoff: color bands update per refresh, and real crystal rates are approximate;
; ISR work still consumes the same CPU budget used by the main-thread decoder.
; Detailed guide: docs/ALGORITHMS.md

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
