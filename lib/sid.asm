music_init:
    lda #0
    ldx #24
sid_clear:
    sta $d400,x
    dex
    bpl sid_clear
    lda #8
    sta $d403                 ; Lead: 50% pulse, soft attack and short release.
    lda #$09
    sta $d405
    sta $d40c
    lda #$88
    sta $d406
    lda #$a8
    sta $d40d
    lda #$04
    sta $d413
    lda #$48
    sta $d414
    lda #DEMO_VOLUME
    sta $d418
    rts

music_tick:
    lda music_div
    beq new_note
    cmp #(DEMO_NOTE_TICKS - 1)
    bne music_count
    lda #$40
    sta $d404
    lda #$10
    sta $d40b
    lda #$20
    sta $d412
music_count:
    inc music_div
    lda music_div
    cmp #DEMO_NOTE_TICKS
    bne music_done
    lda #0
    sta music_div
music_done:
    rts
new_note:
    ldx music_step
    lda period
    cmp #5
    bne notes_ntsc
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
    jmp notes_gate
notes_ntsc:
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
notes_gate:
    lda #$41
    sta $d404
    lda #$11
    sta $d40b
    lda #$21
    sta $d412
    inc music_step
    lda music_step
    and #(len(DEMO_LEAD) - 1)
    sta music_step
    jmp music_count
