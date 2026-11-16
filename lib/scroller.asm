; Algorithm: fetch a null-terminated text byte, map it with AND 63, load its
; eight glyph rows and feed one most-significant glyph bit into each row shift.
; Propagate carry right-to-left through 40 bitmap cells with ROL, then mirror
; each result into the other buffer. After eight shifts load another glyph.
; Why: smooth single-pixel text uses existing bitmap memory and survives flips.
; The 40-cell inner operation is assembler-unrolled to avoid address arithmetic.
; Tradeoff: larger code and substantial ISR work; only the 64-glyph uppercase
; font subset is supported, not arbitrary Unicode or full PETSCII translation.
; The bottom row is reserved: motion patches must never overwrite ticker bytes.
; Detailed guide: docs/ALGORITHMS.md

; Character rows are shifted a column at a time into the right edge of a
; one-pixel ticker. Mirror each changed byte into both bitmap buffers.
scroll_tick:
    lda glyph_column
    bne shift_glyph
    ldy #0
    lda (text_ptr),y
    bne have_character
    lda #<scroll_text
    sta text_ptr
    lda #>scroll_text
    sta text_ptr+1
    lda (text_ptr),y
have_character:
    inc text_ptr
    bne text_no_carry
    inc text_ptr+1
text_no_carry:
    and #63
    sta glyph_ptr
    lda #0
    sta glyph_ptr+1
    asl glyph_ptr
    rol glyph_ptr+1
    asl glyph_ptr
    rol glyph_ptr+1
    asl glyph_ptr
    rol glyph_ptr+1
    lda glyph_ptr
    clc
    adc #<demo_font
    sta glyph_ptr
    lda glyph_ptr+1
    adc #>demo_font
    sta glyph_ptr+1
    ldy #7
load_glyph:
    lda (glyph_ptr),y
    sta glyph_rows,y
    dey
    bpl load_glyph
shift_glyph:
    ldx #7
scroll_row:
    asl glyph_rows,x
    .for col := 39, col >= 0, col -= 1
        rol $3e00 + col * 8,x
        lda $3e00 + col * 8,x
        sta $fe00 + col * 8,x
    .endfor
    dex
    bmi scroll_done
    jmp scroll_row
scroll_done:
    inc scroll_steps
    inc glyph_column
    lda glyph_column
    and #7
    sta glyph_column
    rts
