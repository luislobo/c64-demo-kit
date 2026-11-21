; Application composition: this is the single place for image/font paths, text,
; palette, wave geometry, show settings, exported music and output filenames.
; Algorithm: declare literal DEMO_* constants, include the engine, then append
; text/font/music and the generated bitmap/patch data in the engine memory map.
; Why: 64tass and the host builder read the same settings, avoiding a second
; application-specific JavaScript configuration that could drift out of sync.
; Use literal values: host/config.cjs is a small reader, not an assembler parser.
; Lists are powers of two where the runtime wraps indices with AND masks.
; Binary artwork stays external so it can be replaced without rewriting code.
; Detailed guide: docs/ALGORITHMS.md

; Application-specific configuration. Change this file and the referenced assets.
; All executable routines live in lib/. No application-specific JavaScript is needed.
DEMO_NAME = "torqxsendero-c64"
DEMO_DISK_NAME = "TORQ WAVE"
DEMO_DISK_ID = "TQ"
DEMO_PRG_NAME = "TORQ-LOGO"
DEMO_IMAGE = "assets/image.bin"
DEMO_FONT_FILE = "assets/font.bin"
DEMO_CREDITS_FILE = "assets/torq-credits.txt"
DEMO_HUD = "1 WAVE 2 RAIN 3 RGB 4 PLAS 5 XOR 6 TUN"
DEMO_SCROLL_TEXT = "        TORQ X SENDERO ... SIX LOGO EFFECTS AND THREE SID VOICES!     1 BLUE WAVE   2 RAINBOW WAVE   3 STATIC COLOR   4 PLASMA   5 XOR   6 TUNNEL     SPACE START/STOP WAVE   M PAUSE/RESTART MUSIC     CLOCKWORK MUSIC: C64 DEMO KIT CONTRIBUTORS, CC0     EFFECT RESEARCH: C64LIB BY MACIEJ MALECKI, RAISTLIN AND THE C64 SCENE ... FULL SOURCE CREDITS INCLUDED     GREETINGS TO EVERYONE KEEPING THE C64 ALIVE!        "
DEMO_FRAMES = 16
DEMO_FPS = 12
DEMO_WAVE_AMPLITUDE = 8
DEMO_WAVE_LENGTH = 100
DEMO_LOGO_HEIGHT = 184
DEMO_LOGO_COLOR = 6
DEMO_TEXT_COLOR = 1
DEMO_VOLUME = 12
DEMO_NOTE_TICKS = 6
DEMO_PALETTE = [96,224,48,80,208,112,160,64]

DEMO_COLOR_FIELDS = 1
DEMO_START_EFFECT = 4
DEMO_AUTO_SHOW = 1
DEMO_SID_BUILD = "clockwork"
DEMO_SID_FILE = "generated/clockwork.sid"
DEMO_SID_ZP = []
DEMO_SID_CREDIT = "Clockwork player and composition: C64 demo kit contributors"
DEMO_SID_LICENSE = "CC0-1.0; examples/music/README.md"
DEMO_SID_SOURCE = "examples/music/clockwork.asm"

.include "lib/engine.asm"

; Application data and reusable asset integration.
scroll_text:
    .text DEMO_SCROLL_TEXT
    .byte 0
demo_font:
    .binary DEMO_FONT_FILE
    .include "generated/music.inc"
    .include "lib/assets.asm"
