; Algorithm: assign a shared zero-page ABI; this file emits no runtime bytes.
; Why: zero-page accesses and indirect pointers keep the 6510 decoder small and
; fast. Explicit addresses also make memory ownership inspectable in VICE.
; State groups: animation/scheduling, input edges, audio/ticker clocks, glyph
; scratch, and src/dst pointers. All participating modules use these symbols.
; Tradeoff: these modules share an ABI and are not independently relocatable.
; The boot clear covers $02..$4f; src/dst are initialized by render before use.
; Detailed guide: docs/ALGORITHMS.md

; Shared zero-page ABI for the C64 bitmap-demo libraries.
; Assemble with 64tass. All code running on the C64 is ordinary 6510 assembly.
.cpu "6502"
phase = $02
active = $03
space_down = $04
visible = $05
toggle = $06
ticks = $07
deadline = $08
period = $09
count = $0a
warmup = $0b
flip_count = $0c
last_flip_tick = $0d
flip_request = $0e
effect = $0f
effect_request = $10
muted = $11
mute_down = $12
logic_acc = $13
scroll_div = $14
music_div = $15
music_step = $16
text_position = $17
glyph_column = $18
color_row = $19
color_phase = $1a
scroll_steps = $1b
refresh_hz = $1d
number_down = $1e
row_keys = $1f
poll_counter = $20
music_supported = $21
glyph_rows = $40
glyph_ptr = $48
text_ptr = $4a
color_ptr = $4c
src = $fb
dst = $fd
