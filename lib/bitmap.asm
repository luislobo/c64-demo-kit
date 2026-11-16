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
    jsr poll_render_keyboard
    ldy #0
    lda (src),y
    beq render_done
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
    tya
    clc
    adc dst
    sta dst
    bcc command
    inc dst+1
    jmp command
render_done:
    rts
