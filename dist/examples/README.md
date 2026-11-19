# Additional runnable examples

`sid-example.prg` and `sid-example.d64` demonstrate the optional PSID integration
with the original Clockwork composition and player. Its music is by the C64
demo kit contributors, released under CC0 1.0. Preserve the accompanying
`sid-example-music-credits.json` when redistributing the example. The original
source and grant are in [examples/music](../../examples/music/README.md).

`sid-preview.png` is a PAL emulator frame. `sid-pal-validation.json` and
`sid-ntsc-validation.json` record the digital playback checks. They do not
establish analog sound quality or physical-machine compatibility.

These snapshots were built with Linux 64tass 1.59.3120 and checked in VICE x64sc.
Rebuild from source using the commands in [the SID guide](../../docs/SID.md).

`character-effects.prg` and `character-effects.d64` provide plasma, XOR
interference and a polar tunnel. 1/2/3 select effects, Space pauses/resumes
graphics, and M pauses/restarts Clockwork. Source and memory contracts are in
[the character guide](../../docs/CHARACTER.md).

The character fill/scroll helpers are adapted from Maciej Małecki/c64lib under
MIT. Preserve `character-effects-credits.txt` and
`character-effects-music-credits.json` with the program. The first contains the
full original MIT notice; the second records the original Clockwork attribution
and CC0 grant. The original native effect loops are kit code, not copied demo
parts. `character-plasma.png`, `character-xor.png` and `character-tunnel.png` are
PAL captures. Character validation JSON files record PAL/NTSC cell/frame checks.
