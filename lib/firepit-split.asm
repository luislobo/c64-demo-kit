; Switch inside blank rows bracketing the scene. The logo above and HUD
; below stay in hires. The split only changes display state. Music,
; ticker, input and bitmap deadlines remain in the one-per-refresh IRQ.
firepit_schedule_split:
    lda #<firepit_split_irq
    sta $fffe
    lda #>firepit_split_irq
    sta $ffff
    lda #(51 + KIT_FIREPIT_ROW * 8 + 2)
    sta $d012
    rts

firepit_split_irq:
    pha
    lda #$18
    sta $d016
    lda #<firepit_hires_irq
    sta $fffe
    lda #>firepit_hires_irq
    sta $ffff
    lda #(51 + 176 + 2)
    sta $d012
    lda #1
    sta $d019
firepit_split_done:
    pla
    rti

firepit_hires_irq:
    pha
    lda #$08
    sta $d016
    lda #<irq
    sta $fffe
    lda #>irq
    sta $ffff
    lda #250
    sta $d012
    lda #1
    sta $d019
firepit_hires_done:
    pla
    rti
    .cerror * - firepit_schedule_split > KIT_FIREPIT_SPLIT_BYTES, "Firepit split exceeds its reserved bytes"
