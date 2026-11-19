; Application: bitmap animation with the original Clockwork PSID example.
; Run tools/build-example-music.cjs before building this entry. The imported
; payload owns $c400 upward; metadata and supplied credits enter the build report.
; This file owns the application assets and settings; lib/ stays application-free.
DEMO_NAME = "sid-example"
DEMO_DISK_NAME = "SID EXAMPLE"
DEMO_DISK_ID = "SI"
DEMO_PRG_NAME = "SID-EXAMPLE"
DEMO_IMAGE = "assets/image.bin"
DEMO_FONT_FILE = "assets/font.bin"
DEMO_HUD = "PSID EXPORT  M PAUSE/RESTART"
DEMO_SCROLL_TEXT = "        CLOCKWORK ... ORIGINAL EXAMPLE MUSIC BY C64 DEMO KIT CONTRIBUTORS ... PSID TRACKER EXPORT SUPPORT ... M PAUSES AND RESTARTS THE TUNE        "
DEMO_FRAMES = 8
DEMO_WAVE_AMPLITUDE = 8
DEMO_WAVE_LENGTH = 100
DEMO_LOGO_HEIGHT = 184
DEMO_LOGO_COLOR = 6
DEMO_TEXT_COLOR = 1
DEMO_VOLUME = 12
DEMO_NOTE_TICKS = 6
DEMO_PALETTE = [96,224,48,80,208,112,160,64]
DEMO_SID_FILE = "generated/clockwork.sid"
DEMO_SID_ZP = []
DEMO_SID_CREDIT = "Clockwork player and composition: C64 demo kit contributors"
DEMO_SID_LICENSE = "CC0-1.0; examples/music/README.md"
DEMO_SID_SOURCE = "examples/music/clockwork.asm"
.include "lib/engine.asm"
scroll_text:
    .text DEMO_SCROLL_TEXT
    .byte 0
demo_font:
    .binary DEMO_FONT_FILE
    .include "generated/music.inc"
    .include "lib/assets.asm"
