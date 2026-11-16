; Application composition: this is the single place for image/font paths, text,
; palette, wave geometry, note lists, tempo, volume and output filenames.
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
DEMO_HUD = "1 WAVE  2 RAINBOW  3 COLOR  M MUSIC"
DEMO_SCROLL_TEXT = "        TORQ X SENDERO ... EIGHT FRAMES, THREE SID VOICES, ONE COMMODORE 64!     1 BLUE WAVE   2 RAINBOW WAVE   3 COLOR CYCLE   SPACE START/STOP   M MUSIC ON/OFF     GREETINGS TO EVERYONE KEEPING THE C64 ALIVE!        "
DEMO_FRAMES = 8
DEMO_WAVE_AMPLITUDE = 8
DEMO_WAVE_LENGTH = 100
DEMO_LOGO_HEIGHT = 184
DEMO_LOGO_COLOR = 6
DEMO_TEXT_COLOR = 1
DEMO_VOLUME = 12
DEMO_NOTE_TICKS = 6
DEMO_PALETTE = [96,224,48,80,208,112,160,64]
DEMO_LEAD = [67,75,74,72,67,70,72,75,65,68,67,63,65,67,70,74,67,75,79,77,75,74,72,70,65,70,74,77,75,74,70,67,72,75,79,82,79,77,75,72,68,72,75,79,77,75,72,68,67,70,75,79,77,75,74,70,65,70,74,77,75,74,72,67]
DEMO_BASS = [36,36,48,36,36,36,48,36,32,32,44,32,32,32,44,32,39,39,51,39,39,39,51,39,34,34,46,34,34,34,46,34,36,36,48,36,36,36,48,36,32,32,44,32,32,32,44,32,39,39,51,39,39,39,51,39,34,34,46,34,34,34,46,34]
DEMO_ARP = [48,55,60,63,48,55,60,63,44,51,56,59,44,51,56,59,51,58,63,66,51,58,63,66,46,53,58,61,46,53,58,61,48,55,60,63,48,55,60,63,44,51,56,59,44,51,56,59,51,58,63,66,51,58,63,66,46,53,58,61,46,53,58,61]

.include "lib/engine.asm"

; Application data and reusable asset integration.
scroll_text:
    .text DEMO_SCROLL_TEXT
    .byte 0
demo_font:
    .binary DEMO_FONT_FILE
    .include "generated/music.inc"
    .include "lib/assets.asm"
