; Original player and composition: C64 demo kit contributors, CC0-1.0.
; See README.md in this directory for attribution and the public-domain grant.
; Algorithm: native VBI calls advance a 50 Hz accumulator. Six logic ticks per
; note drive pulse lead, triangle bass and sawtooth arpeggio, with pulse/filter
; movement. Init selects pitch tables using $02a6. State is inside the payload,
; with no zero-page bytes or interrupt/timer ownership. Both calls return RTS.
; Limit: this example is a small player, not a general tracker implementation.
; The absolute call counter is an observable integration-test marker.
.cpu "6502"
* = $c400
    jmp sample_init
    jmp sample_play
sample_init:
    sta sample_song
    lda #0
    ldx #24
sample_clear_sid:
    sta $d400,x
    dex
    bpl sample_clear_sid
    sta sample_calls
    sta sample_calls+1
    sta sample_step
    sta sample_accumulator
    sta sample_delay
    sta sample_filter
    lda #60
    ldx $02a6
    beq sample_store_refresh
    lda #50
sample_store_refresh:
    sta sample_refresh
    lda #$09
    sta $d405
    sta $d40c
    sta $d413
    lda #$88
    sta $d406
    sta $d40d
    sta $d414
    lda #8
    sta $d403
    lda #$71                 ; Filter resonance and route voice 1 through lowpass.
    sta $d417
    lda #$1c
    sta $d418
    rts
sample_play:
    inc sample_calls
    bne sample_call_counted
    inc sample_calls+1
sample_call_counted:
    lda sample_accumulator
    clc
    adc #50
    cmp sample_refresh
    bcc sample_wait
    sec
    sbc sample_refresh
    sta sample_accumulator
    inc sample_filter
    lda sample_filter
    sta $d416
    sta $d402
    lda sample_delay
    beq sample_note
    dec sample_delay
    bne sample_done
    lda #$40
    sta $d404
    lda #$10
    sta $d40b
    lda #$20
    sta $d412
    rts
sample_wait:
    sta sample_accumulator
sample_done:
    rts
sample_note:
    ldx sample_step
    lda $02a6
    beq sample_ntsc
    lda pal_lead_lo,x
    sta $d400
    lda pal_lead_hi,x
    sta $d401
    lda pal_bass_lo,x
    sta $d407
    lda pal_bass_hi,x
    sta $d408
    lda pal_arp_lo,x
    sta $d40e
    lda pal_arp_hi,x
    sta $d40f
    jmp sample_gate
sample_ntsc:
    lda ntsc_lead_lo,x
    sta $d400
    lda ntsc_lead_hi,x
    sta $d401
    lda ntsc_bass_lo,x
    sta $d407
    lda ntsc_bass_hi,x
    sta $d408
    lda ntsc_arp_lo,x
    sta $d40e
    lda ntsc_arp_hi,x
    sta $d40f
sample_gate:
    lda #$41
    sta $d404
    lda #$11
    sta $d40b
    lda #$21
    sta $d412
    lda #5
    sta sample_delay
    inc sample_step
    lda sample_step
    and #15
    sta sample_step
    rts
sample_calls: .word 0
sample_song: .byte 0
sample_step: .byte 0
sample_accumulator: .byte 0
sample_refresh: .byte 0
sample_delay: .byte 0
sample_filter: .byte 0
.include "../../generated/example-music.inc"
