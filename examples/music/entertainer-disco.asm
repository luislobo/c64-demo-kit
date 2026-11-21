; Scott Joplin, The Entertainer (1902), first strain.
; Disco arrangement and player: C64 demo kit contributors, CC0-1.0.
; See README.md for the score and arrangement credits.
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
    sta accumulator
    sta play_calls
    sta play_calls+1
    sta drum_decay
    lda #127
    sta step
    lda #60
    ldx $02a6
    beq set_refresh
    lda #50
set_refresh:
    sta refresh
    sta accumulator
    lda #$04
    sta $d403
    lda #$04
    sta $d405
    lda #$a4
    sta $d406
    lda #$05
    sta $d40c
    lda #$94
    sta $d40d
    lda #$0a
    sta $d418
    rts

play:
    inc play_calls
    bne count_ready
    inc play_calls+1
count_ready:
    lda drum_decay
    beq advance_clock
    dec drum_decay
    lsr kick_pitch          ; Kick pitch falls for two refreshes.
    lda kick_pitch
    sta $d40f
advance_clock:
    lda accumulator
    clc
    adc #8                 ; Eight sixteenths per second = 120 BPM.
    cmp refresh
    bcs next_note
    sta accumulator
    cmp #24
    bcc done
    lda #$10               ; Short bass articulation.
    sta $d40b
    lda #0
    sta $d412
done:
    rts

next_note:
    sbc refresh
    sta accumulator
    inc step
    lda step
    and #127
    sta step
    tax
    lda lead_notes,x
    bmi keep_lead
    tay
    lda $02a6
    beq lead_ntsc
    lda pal_pitch_lo,y
    sta $d400
    lda pal_pitch_hi,y
    jmp lead_ready
lead_ntsc:
    lda ntsc_pitch_lo,y
    sta $d400
    lda ntsc_pitch_hi,y
lead_ready:
    sta $d401
    lda #$41
    sta $d404
keep_lead:
    lda bass_notes,x
    bmi keep_bass
    tay
    lda $02a6
    beq bass_ntsc
    lda pal_pitch_lo,y
    sta $d407
    lda pal_pitch_hi,y
    jmp bass_ready
bass_ntsc:
    lda ntsc_pitch_lo,y
    sta $d407
    lda ntsc_pitch_hi,y
bass_ready:
    sta $d408
    lda #$11
    sta $d40b
keep_bass:
    lda accents,x
    cmp #$ff
    beq done
    cmp #$fe
    beq kick
    cmp #$fd
    beq hat
    tay
    lda #$07
    sta $d413
    lda #$43
    sta $d414
    lda $02a6
    beq chord_ntsc
    lda pal_pitch_lo,y
    sta $d40e
    lda pal_pitch_hi,y
    jmp chord_ready
chord_ntsc:
    lda ntsc_pitch_lo,y
    sta $d40e
    lda ntsc_pitch_hi,y
chord_ready:
    sta $d40f
    lda #$21
    sta $d412
    rts
kick:
    lda #$04
    sta $d413
    lda #$03
    sta $d414
    lda #0
    sta $d40e
    lda #$0c
    sta kick_pitch
    sta $d40f
    lda #2
    sta drum_decay
    lda #$11
    sta $d412
    rts
hat:
    lda #$02
    sta $d413
    lda #$01
    sta $d414
    lda #$46
    sta $d40f
    lda #$81
    sta $d412
    rts

refresh: .byte 0
accumulator: .byte 0
step: .byte 0
drum_decay: .byte 0
kick_pitch: .byte 0
play_calls: .word 0
.include "../../generated/entertainer-disco.inc"
