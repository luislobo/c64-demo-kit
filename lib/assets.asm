; Algorithm: emit the patch-address table, place the static bitmap at $2000,
; place streams at $4000 and optionally $1500; reject code/data overlap.
; Why: fixed locations match VIC bank addressing and avoid runtime relocation.
; Host allocation and assembler assertions independently enforce the layout.
; Code/font/pointers fit below $1500 when low patches are used, else $2000.
; High streams plus optional fields end by $c000.
; Tradeoff: generated paths and memory regions are a shared project contract;
; changing the layout requires coordinated edits to the host allocator and runtime.
; Detailed guide: docs/ALGORITHMS.md

; Fixed memory layout and generated-asset integration.
patch_pointers:
    .include "../generated/patch-pointers.inc"
patch_tails:
    .include "../generated/patch-tails.inc"
    .include "../generated/patch-layout.inc"
    .if PATCH_LOW_BYTES
        .cerror * > PATCH_LOW_START, "Code overlaps low patch region"
* = PATCH_LOW_START
patch_low:
        .binary "../generated/patches-low.bin"
        .cerror * > $2000, "Low patches overlap first bitmap"
    .else
        .cerror * > $2000, "Code overlaps first bitmap"
    .endif
* = $2000
    .binary "../generated/static-bitmap.bin"
    .if KIT_COLOR_FIELDS && KIT_FIRE_PLASMA
        .include "fire-plasma.asm"
        .cerror * > $4000, "Fire plasma overlaps high patch region"
    .endif
* = $4000
    .binary "../generated/patches.bin"
 .if KIT_COLOR_FIELDS
field_sine:
    .binary "../generated/color-fields.bin"
field_radius = field_sine + 256
field_angle = field_radius + 12 * 40
field_radius_rows:
    .for row := 0, row < 23, row += 1
        ; Rows equidistant from the middle have identical radii.
        .if row < 12
            .word field_radius + row * 40
        .else
            .word field_radius + (22 - row) * 40
        .endif
    .endfor
field_angle_rows:
    .for row := 0, row < 23, row += 1
        .word field_angle + row * 40
    .endfor
 .endif
    .cerror * > $c000, "Patch data overlaps second screen RAM"
.if DEMO_EXTERNAL_SID
* = SID_LOAD
    .binary "../generated/sid-payload.bin"
    .cerror SID_LOAD < $c400 || * > $d000, "SID overlaps screen or I/O"
.endif
