; Algorithm: stream sparse commands into the hidden bitmap. 0 ends the stream;
; 1..127 skips; $81..$ff copies literals; $80,count,value fills 1..255 bytes.
; Why: skips change only the destination pointer, and literal loops use indexed
; indirect reads/writes. Pointers advance once per run, avoiding per-byte calls.
; Literal zeros erase old pixels; skips preserve the buffer-specific baseline.
; Input A is a valid patch index. Clobbers A/X/Y, flags, src/dst/count and
; patch_tail. A low-stream terminator switches source without resetting dst.
; Only builder-validated streams are supported: runtime does not bounds-check.
; IRQ scans keys every refresh; main polls between frames. Avoiding per-command
; input calls leaves CPU time for the larger set of shorter compressed runs.
; Detailed guide: docs/ALGORITHMS.md

; Patch commands: 0=end, 1..127=skip unchanged bytes,
; $81..$ff=copy 1..127 literal bytes, including zero bytes that erase old pixels.
; Source and destination pointers advance once per run, not once per pixel byte.
render:
    asl
    tax
    lda patch_pointers,x
    sta src
    lda patch_pointers+1,x
    sta src+1
    lda patch_tails,x
    sta patch_tail
    lda patch_tails+1,x
    sta patch_tail+1
    lda #0
    sta dst
    lda visible
    beq target_secondary
    lda #$20
    bne set_target
target_secondary:
    lda #$e0
set_target:
    sta dst+1
command:
    ldy #0
    lda (src),y
    beq patch_end
    bmi literal
    clc                       ; Skip by pointer arithmetic: no bitmap writes.
    adc dst
    sta dst
    bcc skip_no_carry
    inc dst+1
skip_no_carry:
    inc src
    bne command
    inc src+1
    jmp command
literal:
    and #$7f
    beq fill_run
    sta count
    inc src
    bne literal_begin
    inc src+1
literal_begin:
    ldy #0
literal_loop:
    lda (src),y
    sta (dst),y
    iny
    cpy count
    bne literal_loop
    tya
    clc
    adc src
    sta src
    bcc source_no_carry
    inc src+1
source_no_carry:
advance_destination:
    tya
    clc
    adc dst
    sta dst
    bcc command
    inc dst+1
    jmp command
patch_end:
    lda patch_tail+1
    beq render_done
    sta src+1
    lda patch_tail
    sta src
    lda #0
    sta patch_tail+1
    jmp command
render_done:
    rts

; Repeated-byte runs omit source reads inside the loop. Three header bytes
; advance the source; the destination advances by count, including page carry.
fill_run:
    ldy #1
    lda (src),y
    sta count
    iny
    lda (src),y
    ldy #0
fill_loop:
    sta (dst),y
    iny
    cpy count
    bne fill_loop
    lda src
    clc
    adc #3
    sta src
    bcc fill_source_ready
    inc src+1
fill_source_ready:
    jmp advance_destination
