; Standalone character scene: own VIC/CIA/IRQ, two text/charset banks, two-half
; rendering and a border-only bank switch. This composes character-effects,
; charset helpers, keyboard scanning and the PSID adapter; it is not a bitmap
; engine include. Reset exits. Detailed ABI, attribution and tests: docs/CHARACTER.md.
.include "state.asm"
KIT_COLOR_FIELDS = 0
KIT_AUTO_SHOW = 0
char_phase = $22
char_half = $23
char_last_tick = $24
char_mode = $25
char_paused = $26
char_row = $27
char_row_value = $28
char_scroll_delay = $2b
char_frames = $2c
char_dst = $30

* = $0801
    .word char_basic_end
    .word 10
    .byte $9e
    .text "2064"
    .byte 0
char_basic_end: .word 0
* = $0810
char_entry:
    sei
    cld
    ldx #$ff
    txs
    lda #$7f
    sta $dc0d
    sta $dd0d
    lda $dc0d
    lda $dd0d
    lda #$35
    sta $01
    lda #0
    sta $d011
    sta $d015
    sta $d01a
    sta $d020
    sta $d021
    ldx #$4f
char_clear_state:
    sta $00,x
    dex
    cpx #1
    bne char_clear_state
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
    lda #0
    ldx #$04
    jsr charset_fill_1k
    ldx #$44
    jsr charset_fill_1k
    lda #1
    ldx #$d8
    jsr charset_fill_1k
    ldx #0
char_copy_charset:
    .for page := 0, page < 8, page += 1
        lda $2000+page*256,x
        sta $6000+page*256,x
    .endfor
    inx
    bne char_copy_charset
char_copy_colors:
    .for page := 0, page < 3, page += 1
        lda char_colors+page*256,x
        sta $d800+page*256,x
    .endfor
    inx
    bne char_copy_colors
char_color_tail:
    lda char_colors+$300,x
    sta $db00,x
    inx
    cpx #32
    bne char_color_tail
    ldx #79
char_copy_text:
    lda char_template+21*40,x
    sta $0400+21*40,x
    sta $4400+21*40,x
    dex
    bpl char_copy_text
    lda #<char_scroll_text
    sta text_ptr
    lda #>char_scroll_text
    sta text_ptr+1
    lda #(DEMO_EFFECT_START-1)
    sta char_mode
    ldx #60
char_detect_low:
    bit $d011
    bmi char_detect_low
char_detect_high:
    bit $d011
    bpl char_detect_high
char_detect_length:
    bit $d011
    bpl char_detected
    lda $d012
    cmp #32
    bcc char_detect_length
    ldx #50
char_detected:
    stx refresh_hz
    jsr music_init
    lda #<char_irq
    sta $fffe
    lda #>char_irq
    sta $ffff
    lda #<char_nmi
    sta $fffa
    lda #>char_nmi
    sta $fffb
    lda #$18
    sta $d018
    lda #8
    sta $d016
    lda #$1b
    sta $d011
    lda #250
    sta $d012
    lda #1
    sta $d019
    sta $d01a
    cli
char_idle:
    lda ticks
    cmp char_last_tick
    beq char_idle
    sta char_last_tick
    jsr char_events
char_events_done:
    lda char_paused
    bne char_idle
    jsr char_render_half
    lda char_half
    eor #1
    sta char_half
    bne char_idle
    lda #1
    sta flip_request
char_wait_flip:
    lda flip_request
    bne char_wait_flip
char_flip_done:
    inc char_frames
    lda char_phase
    clc
    adc #DEMO_EFFECT_STEP
    sta char_phase
    jsr char_scroll_tick
    jmp char_idle

char_events:
    php
    sei
    lda effect_request
    beq char_check_pause
    sec
    sbc #1
    sta char_mode
    lda #0
    sta effect_request
    sta char_half
    sta char_paused
char_check_pause:
    lda toggle
    beq char_events_return
    lda #0
    sta toggle
    lda char_paused
    eor #1
    sta char_paused
char_events_return:
    plp
    rts

char_scroll_tick:
    inc char_scroll_delay
    lda char_scroll_delay
    and #3
    bne char_scroll_done
    ldy #0
    lda (text_ptr),y
    bne char_have_glyph
    lda #<char_scroll_text
    sta text_ptr
    lda #>char_scroll_text
    sta text_ptr+1
    lda (text_ptr),y
char_have_glyph:
    pha
    lda #$c0
    sta char_dst
    lda #$07
    sta char_dst+1
    pla
    jsr charset_scroll_left
    pha
    lda #$47
    sta char_dst+1
    pla
    jsr charset_scroll_left
    inc text_ptr
    bne char_scroll_done
    inc text_ptr+1
char_scroll_done:
    rts

char_irq:
    pha
    txa
    pha
    tya
    pha
    inc ticks
    lda flip_request
    beq char_no_flip
    lda visible
    eor #1
    sta visible
    lda $dd00
    eor #1                  ; VIC banks 0/1, both screen/charset offsets identical.
    sta $dd00
    lda #0
    sta flip_request
char_no_flip:
    jsr scan_keyboard
    jsr music_tick
    lda #1
    sta $d019
    pla
    tay
    pla
    tax
    pla
char_nmi:
    rti

.include "character-effects.asm"
.include "charset.asm"
.include "keyboard.asm"
.include "sid-player.asm"
