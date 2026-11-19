; Standalone character-effect application. All text, palette and effect settings
; stay here; host tools generate glyph/polar assets and validate music placement.
; New native render loops are original. Fill/scroll helper attribution and the
; scene's calling/memory contract are documented in docs/CHARACTER.md.
DEMO_NAME = "character-effects"
DEMO_DISK_NAME = "CHARACTER LAB"
DEMO_DISK_ID = "CE"
DEMO_PRG_NAME = "CHAR-EFFECTS"
DEMO_FONT_FILE = "assets/font.bin"
DEMO_TITLE = "C64 CHARACTER LAB"
DEMO_HUD = "1 PLASMA  2 XOR  3 TUNNEL"
DEMO_SCROLL_TEXT = "        CHARACTER EFFECTS ... SINE PLASMA ... XOR INTERFERENCE ... POLAR TUNNEL ... SPACE PAUSES ... M PAUSES AND RESTARTS MUSIC ... FILL AND SCROLL HELPERS ADAPTED FROM MACIEJ MALECKI AND C64LIB ... MUSIC BY C64 DEMO KIT CONTRIBUTORS        "
DEMO_PALETTE = [6,14,3,1,7,13,5,11]
DEMO_EFFECT_START = 1
DEMO_EFFECT_STEP = 3
DEMO_SID_FILE = "generated/clockwork.sid"
DEMO_SID_ZP = []
DEMO_SID_CREDIT = "Clockwork player and composition: C64 demo kit contributors"
DEMO_SID_LICENSE = "CC0-1.0; examples/music/README.md"
DEMO_SID_SOURCE = "examples/music/clockwork.asm"
.include "generated/character-config.inc"
.include "lib/character-scene.asm"
char_scroll_text:
    .binary "generated/character-scroll.bin"
    .cerror * > $2000, "Character code overlaps charset"
* = $2000
    .binary "generated/character-charset.bin"
    .cerror * != $2800, "Character font must be 2048 bytes"
* = $3000
char_sine: .binary "generated/character-sine.bin"
char_shades: .binary "generated/character-shades.bin"
char_radius: .binary "generated/character-radius.bin"
char_angle: .binary "generated/character-angle.bin"
    .cerror * != $3840, "Unexpected character table sizes"
* = $3900
char_template: .binary "generated/character-screen.bin"
char_colors: .binary "generated/character-colors.bin"
    .cerror * > $4400, "Character data overlaps hidden screen"
* = SID_LOAD
    .binary "generated/character-sid.bin"
    .cerror SID_LOAD < $c400 || * > $d000, "SID overlaps screen or I/O"
