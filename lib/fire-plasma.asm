; Optional plasma data and row setup in the 192 bytes after the first bitmap.
; Rising sine bands mix with a heat gradient. The plasma loop still uses one
; indexed palette load per cell and writes the same 40 cells in each bank.
fire_palette:
    .binary "../generated/fire-plasma.bin"
fire_heat = fire_palette + 64
field_fire:
    lda color_row
    asl
    asl
    asl
    clc
    adc color_phase
    tay
    lda field_sine,y
    ldy color_row
    clc
    adc fire_heat,y
    lsr
    sta field_y
    jmp field_plasma
