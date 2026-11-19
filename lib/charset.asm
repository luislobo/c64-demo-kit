; Fill/scroll routines adapted to 64tass from c64lib by Maciej Małecki.
; Source revisions, original paths and modifications: docs/CHARACTER.md.
; Copyright (c) 2017-2023 c64lib
; Copyright (c) 2017-2023 Maciej Małecki
;
; Permission is hereby granted, free of charge, to any person obtaining a copy
; of this software and associated documentation files (the "Software"), to deal
; in the Software without restriction, including without limitation the rights
; to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
; copies of the Software, and to permit persons to whom the Software is
; furnished to do so, subject to the following conditions:
;
; The above copyright notice and this permission notice shall be included in all
; copies or substantial portions of the Software.
;
; THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
; IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
; FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
; AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
; LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
; OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
; SOFTWARE.
;
; Algorithm: patch four absolute store operands once, then fill four pages in
; one indexed loop. A=value, X=base high byte ($00..$fc), low byte must be zero.
; Clobbers X/flags, preserves A. Self-modifying: call from one context only.
; The original stack-parameter wrapper is replaced by register arguments.
charset_fill_1k:
    pha
    stx charset_fill0+2
    inx
    stx charset_fill1+2
    inx
    stx charset_fill2+2
    inx
    stx charset_fill3+2
    pla
    ldx #0
charset_fill_loop:
charset_fill0: sta $0400,x
charset_fill1: sta $0500,x
charset_fill2: sta $0600,x
charset_fill3: sta $0700,x
    inx
    bne charset_fill_loop
    rts

; Algorithm: shift 39 bytes left in place, then insert A at column 39.
; char_dst points to a contiguous 40-byte row; clobbers Y/flags, preserves A/X.
; Adapted from scroll1x1's compact loop. Text iteration belongs to the caller;
; the original stack wrapper, text-pointer update and sentinel handling are removed.
charset_scroll_left:
    pha
    ldy #0
charset_shift:
    iny
    lda (char_dst),y
    dey
    sta (char_dst),y
    iny
    cpy #39
    bne charset_shift
    pla
    sta (char_dst),y
    rts
