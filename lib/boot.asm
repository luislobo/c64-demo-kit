; Algorithm: emit BASIC SYS2064, take over hardware, clear state, initialize
; both bitmap/color buffers, measure raster length, install vectors, enable IRQ.
; Why: the BASIC stub loads normally from disk; ROMs are mapped out so the
; second bitmap can occupy RAM under KERNAL while I/O remains accessible.
; The startup copy is unrolled by pages: 31*256 + 64 = exactly 8000 bytes.
; Copying a full 8192 bytes would overwrite the interrupt-vector area.
; Raster measurement distinguishes standard PAL from NTSC without a ROM flag.
; Tradeoff: startup owns the machine and exits by reset, not by returning to BASIC.
; Detailed guide: docs/ALGORITHMS.md

* = $0801
    .word basic_end
    .word 10
    .byte $9e
    .text "2064"
    .byte 0
basic_end:
    .word 0
* = $0810
entry:
    sei
    cld
    ldx #$ff
    txs
    lda #$7f
    sta $dc0d                 ; Disable and acknowledge both CIA IRQ sources.
    sta $dd0d
    lda $dc0d
    lda $dd0d
    lda #$35                 ; RAM under both ROMs; keep I/O visible.
    sta $01
    lda #0
    sta $d011
    sta $d015
    sta $d01a
    sta $d020
    sta $d021
    ldx #$4f
clear_state:
    sta $00,x
    dex
    cpx #1
    bne clear_state
    lda $dd02
    ora #3
    sta $dd02
    lda $dd00
    ora #3
    sta $dd00
    lda #$ff
    sta $dc02
    lda #0
    sta $dc03
    lda #$7f
    sta $dc00
    lda #KIT_START_EFFECT
    sta effect
    .if KIT_AUTO_SHOW
        lda #1
        sta toggle
        sta show_enabled
        lda #50
        sta show_ticks
        lda #8
        sta show_seconds
    .endif
    lda #<scroll_text
    sta text_ptr
    lda #>scroll_text
    sta text_ptr+1
    .if !DEMO_EXTERNAL_SID
        jsr music_init
    .endif

    ; Initialize the hidden bitmap once. Only 8000 bytes, not the IRQ vectors.
    ldx #0
copy_static:
    .for page := 0, page < 31, page += 1
        lda $2000 + page * 256,x
        sta $e000 + page * 256,x
    .endfor
    inx
    beq copy_tail
    jmp copy_static
copy_tail:
    lda $3f00,x
    sta $ff00,x
    inx
    cpx #64
    bne copy_tail
    lda #(DEMO_LOGO_COLOR * 16)
    ldx #0
colors:
    sta $0400,x
    sta $0500,x
    sta $0600,x
    sta $0700,x
    sta $c000,x
    sta $c100,x
    sta $c200,x
    sta $c300,x
    inx
    bne colors
    lda #(DEMO_TEXT_COLOR * 16)
    ldx #79
text_colors:
    sta $0798,x
    sta $c398,x
    dex
    bpl text_colors

    ; Detect actual raster length, rather than trusting a ROM PAL/NTSC flag.
    ; PAL exceeds line 287; standard NTSC variants finish before that.
    ldx #6                   ; Six NTSC refreshes per animation frame.
detect_low:
    bit $d011
    bmi detect_low
detect_high:
    bit $d011
    bpl detect_high
detect_length:
    bit $d011
    bpl detected
    lda $d012
    cmp #32
    bcc detect_length
    ldx #5                   ; Five PAL refreshes: approximately 10 fps either way.
detected:
    stx period
    lda #50
    cpx #5
    beq refresh_detected
    lda #60
refresh_detected:
    sta refresh_hz
    .if DEMO_EXTERNAL_SID
        jsr music_init
    .endif
    lda #<irq
    sta $fffe
    lda #>irq
    sta $ffff
    lda #<nmi
    sta $fffa
    lda #>nmi
    sta $fffb
    lda #$18
    sta $d018
    lda #8
    sta $d016
    lda #$3b
    sta $d011
    lda #250                 ; Lower border, after the last bitmap scanline.
    sta $d012
    lda #1
    sta $d019
    sta $d01a
    cli
