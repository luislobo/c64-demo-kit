; Algorithm: select the supported machine clock, call an exported RTS init once
; and its play routine once per VBI. A/X/Y and flags are clobbered. The enclosing
; IRQ preserves registers. Each call restores $01 and processor flags; export
; calls use $36, the PSID bank mapping for the reserved $c400..$cfff region.
; Why: exported tracker code already implements instruments and sequencing.
; Declared player zero page ($80..$ef) cannot overlap this engine's shared state.
; Limit: PSID v1/v2 VBI exports only, not arbitrary RSID/IRQ/CIA players. Exports
; must obey docs/SID.md. A clock mismatch stays silent (music_supported=0).
; M pauses playback at volume zero and restarts the selected subtune on unmute.
; Original adapter; format authors and tracker-integration references: docs/SID.md.

music_init:
    lda #0
    sta music_supported
    sta $d418
    lda refresh_hz
    cmp #50
    beq sid_machine_pal
    lda #0
    sta $02a6
    lda #2
    bne sid_check_clock
sid_machine_pal:
    lda #1
    sta $02a6
sid_check_clock:
    and #SID_CLOCK
    beq sid_init_done
    lda #1
    sta music_supported
    php
    sei
    lda $01
    pha
    lda #$36
    sta $01
    lda #SID_SONG
    ldx #0
    ldy #0
    cld
    jsr SID_INIT
    sei
    pla
    sta $01
    plp
sid_init_done:
    rts

music_tick:
    lda music_supported
    beq sid_play_done
    lda muted
    bne sid_play_done
    php
    sei
    lda $01
    pha
    lda #$36
    sta $01
    cld
    jsr SID_PLAY
    sei
    pla
    sta $01
    plp
sid_play_done:
    rts
