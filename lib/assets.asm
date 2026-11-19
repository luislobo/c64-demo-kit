; Algorithm: emit the patch-address table, place the static bitmap at $2000,
; and place sparse streams at $4000; use assembler errors to reject overlap.
; Why: fixed locations match VIC bank addressing and avoid runtime relocation.
; Host allocation and assembler assertions independently enforce the layout.
; The code/font/music/pointers must fit below $2000; streams must end by $c000.
; Tradeoff: generated paths and memory regions are a shared project contract;
; changing the layout requires coordinated edits to the host allocator and runtime.
; Detailed guide: docs/ALGORITHMS.md

; Fixed memory layout and generated-asset integration.
patch_pointers:
    .include "../generated/patch-pointers.inc"
    .cerror * > $2000, "Code overlaps first bitmap"
* = $2000
    .binary "../generated/static-bitmap.bin"
* = $4000
    .binary "../generated/patches.bin"
    .cerror * > $c000, "Patch data overlaps second screen RAM"
.if DEMO_EXTERNAL_SID
* = SID_LOAD
    .binary "../generated/sid-payload.bin"
    .cerror SID_LOAD < $c400 || * > $d000, "SID overlaps screen or I/O"
.endif
