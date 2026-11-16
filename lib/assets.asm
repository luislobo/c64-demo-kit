; Fixed memory layout and generated-asset integration.
patch_pointers:
    .include "../generated/patch-pointers.inc"
    .cerror * > $2000, "Code overlaps first bitmap"
* = $2000
    .binary "../generated/static-bitmap.bin"
* = $4000
    .binary "../generated/patches.bin"
    .cerror * > $c000, "Patch data overlaps second screen RAM"
