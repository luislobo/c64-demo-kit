# Working demo snapshots

These files are committed delivery artifacts. They are intentionally separate
from ignored `build/` outputs so a user can run the known working demo without
Node.js or an assembler. Source changes do not silently replace this snapshot;
rebuild and explicitly copy new delivery files when publishing an update.

| File | What it records |
| --- | --- |
| `torqxsendero-c64.prg` | Two-byte little-endian load address, BASIC launcher, native machine code, bitmap and compressed patch data. This is the assembled result, not source text. |
| `torqxsendero-c64.d64` | Standard 35-track disk made by `host/d64.cjs`, containing the closed PRG entry. Sector interleave changes disk placement, not the program bytes. |
| `preview.png` | A captured emulator frame showing the demo. It illustrates one instant; it cannot demonstrate animation, timing or audio. |
| `validation/test-pal.json` | Recorded default-demo PAL emulator checks and measured decoder-cycle/tick samples. |
| `validation/test-ntsc.json` | The corresponding NTSC recording. |

The reports check decoded image memory, frame spacing, restore/restart, effect
requests, music-sequencer advancement and matching ticker buffers. Mode requests
are injected into the runtime's event state; those automated reports do not
simulate physical key presses. Sequencer advancement does not establish musical
quality, and emulator checks do not establish compatibility with every real
C64, SID revision or SD2IEC firmware.

The most recent documentation-only update rebuilds the same PRG and D64 bytes;
it does not need a new captured validation snapshot.
