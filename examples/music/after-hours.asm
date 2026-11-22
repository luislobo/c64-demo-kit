; After Hours Roll. Original slow rock-and-roll shuffle for three SID voices.
.cpu "6502"
* = $c400
    jmp init
    jmp play

init:
    lda #0
    ldx #24
clear_sid:
    sta $d400,x
    dex
    bpl clear_sid
    sta clock_lo
    sta lead_age
    sta play_calls
    sta play_calls+1
    sta lead_freq+1
    sta accent
    sta accent_age
    sta $d402
    lda #$4a
    sta cutoff
    lda #$05
    sta $d403
    lda #$03
    sta $d405
    lda #$83
    sta $d406
    lda #$01
    sta $d40c
    lda #$a2
    sta $d40d
    lda #$52
    sta $d417
    lda #$1e
    sta $d418
    lda #$ff
    sta step
    lda $02a6
    beq ntsc
    lda #<1000
    ldx #>1000
    bne set_clock
ntsc:
    lda #<1200
    ldx #>1200
set_clock:
    sta limit_lo
    sta clock_lo
    stx limit_hi
    stx clock_hi
    rts

play:
    inc play_calls
    bne play_counted
    inc play_calls+1
play_counted:
    jsr sustain
    ; Three triplet subdivisions per beat at 88 BPM.
    lda clock_lo
    clc
    adc #88
    sta clock_lo
    lda clock_hi
    adc #0
    sta clock_hi
    cmp limit_hi
    bcc clock_wait
    bne event
    lda clock_lo
    cmp limit_lo
    bcs event
clock_wait:
    rts
event:
    lda clock_lo
    sec
    sbc limit_lo
    sta clock_lo
    lda clock_hi
    sbc limit_hi
    sta clock_hi
    inc step
    ldx step
    cpx #144
    bcc in_score
    ldx #0
    stx step
in_score:
    lda lead,x
    cmp #255
    beq bass_step
    cmp #254
    beq lead_off
    tay
    jsr pitch
    sta lead_freq
    sta $d400
    sty lead_freq+1
    sty $d401
    lda #0
    sta lead_age
    lda #$41
    sta $d404
    bne bass_step
lead_off:
    lda #$40
    sta $d404
bass_step:
    lda bass,x
    cmp #255
    beq accent_step
    cmp #254
    beq bass_off
    tay
    jsr pitch
    sta $d407
    sty $d408
    lda #$11
    sta $d40b
    lda #$82
    sta cutoff
    sta $d416
    bne accent_step
bass_off:
    lda #$10
    sta $d40b
accent_step:
    lda rhythm,x
    beq done
    sta accent
    lda #0
    sta accent_age
    sta $d412
    jsr tick_accent
done:
    rts

pitch:
    lda $02a6
    beq pitch_ntsc
    lda pal_hi,y
    sta pitch_high
    lda pal_lo,y
    ldy pitch_high
    rts
pitch_ntsc:
    lda ntsc_hi,y
    sta pitch_high
    lda ntsc_lo,y
    ldy pitch_high
    rts

sustain:
    inc lead_age
    lda lead_age
    cmp #32
    bcc fresh_note
    and #7
    ora #24
fresh_note:
    tax
    lda pulse,x
    sta $d402
    lda vibrato_lo,x
    clc
    adc lead_freq
    sta $d400
    lda lead_freq+1
    adc vibrato_hi,x
    sta $d401
sustain_bass:
    lda cutoff
    cmp #$4a
    bcc bass_cutoff_ready
    sbc #5
    sta cutoff
bass_cutoff_ready:
    sta $d416
    lda accent
    bne sustain_accent
    rts
sustain_accent:
    inc accent_age
tick_accent:
    ; A pitched kick and a noise snare trade the backbeat.
    lda accent
    cmp #1
    beq kick
    cmp #2
    bne not_hat
    jmp hat
not_hat:
    cmp #3
    bne not_snare
    jmp snare
not_snare:
    cmp #5
    beq backbeat
    ldy accent_age
    cpy #5
    bcc chord
    jmp accent_off
chord:
    ldx step
    lda chord_bar,x
    tax
    tya
    and #3
    beq arpeggio_low
    cmp #2
    beq arpeggio_high
    ldy voicing_middle,x
    bne arpeggio_pitch
arpeggio_low:
    ldy voicing_low,x
    bne arpeggio_pitch
arpeggio_high:
    ldy voicing_high,x
arpeggio_pitch:
    jsr pitch
    sta $d40e
    sty $d40f
    lda #$02
    sta $d413
    lda #$42
    sta $d414
    lda #$21
    sta $d412
    rts
backbeat:
    lda accent_age
    cmp #2
    bcc kick
    beq backbeat_gap
    lda #3
    sta accent
    lda #0
    sta accent_age
    jmp snare
backbeat_gap:
    lda #$10
    sta $d412
    rts
kick:
    ldy accent_age
    cpy #4
    bcs accent_off
    lda #0
    sta $d40e
    sta $d413
    lda #$02
    sta $d414
    lda kick_pitch,y
    sta $d40f
    lda #$11
    sta $d412
    rts
hat:
    lda accent_age
    cmp #1
    bcs accent_off
    lda #$00
    sta $d413
    lda #$32
    sta $d414
    lda #$54
    sta $d40f
    lda #$81
    sta $d412
    rts
snare:
    lda accent_age
    cmp #3
    bcs accent_off
    tax
    lda snare_pitch,x
    sta $d40f
    lda #$01
    sta $d413
    lda #$32
    sta $d414
    lda #$81
    sta $d412
    rts
accent_off:
    lda #0
    sta $d412
    sta accent
sustain_done:
    rts

clock_lo: .byte 0
clock_hi: .byte 0
limit_lo: .byte 0
limit_hi: .byte 0
pitch_high: .byte 0
step: .byte 0
lead_age: .byte 0
lead_freq: .word 0
cutoff: .byte 0
sample_calls:
play_calls: .word 0
accent: .byte 0
accent_age: .byte 0
kick_pitch: .byte $11,$0a,$06,$04
snare_pitch: .byte $2e,$26,$20
.include "../../generated/after-hours-score.inc"
