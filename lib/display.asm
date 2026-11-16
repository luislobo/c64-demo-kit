; Algorithm: main-thread flip sets a request and waits. The raster ISR calls
; flip_border when the deadline is due, selects the other VIC bank/screen,
; records the tick and clears the request to release the waiting main thread.
; Why: switch complete frames at raster line 250, before expensive ISR work,
; so the viewer never sees a half-decoded bitmap or a late mid-picture flip.
; Only the low two CIA2 port bits change; unrelated output bits are preserved.
; Tradeoff: flip blocks and requires enabled IRQs; it must not run inside an ISR.
; Detailed guide: docs/ALGORITHMS.md

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
