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
| `torqxsendero-c64-credits.txt` | Release credits for the application, original music, PSID format and research references. |
| `torqxsendero-c64-music-credits.json` | Original Clockwork metadata and CC0 grant reference. |
| `logo-plasma.png`, `logo-xor.png`, `logo-tunnel.png` | PAL captures of the three new logo color fields. |
| `validation/test-pal.json` | Recorded default-demo PAL emulator checks and measured decoder-cycle/tick samples. |
| `validation/test-ntsc.json` | The corresponding NTSC recording. |
| `validation/frame-stress.json` | Five interleaved trials per fitting profile and video standard, covering 600 bitmap frames and 32-phase memory rejection. |
| `validation/fps-stress.json` | Five trials per build/standard, 4,800 bitmap comparisons and unchanged music/ticker clocks at the new 12 fps target. |
| `validation/fps-probes.json` | Exploratory higher-rate results, including recorded target misses. |
| `validation/fps-soak-pal.json`, `fps-soak-ntsc.json` | 144-second automatic-show checks with no missed deadlines. |
| `validation/copy-kernels-pal.json`, `copy-kernels-ntsc.json` | Native copy/fill page boundaries and intentional late-target recovery. |

The reports check decoded image memory, frame spacing, restore/restart, effect
requests, all new color cells, PSID advancement and matching ticker buffers. Mode requests
are injected into the runtime's event state; those automated reports do not
simulate physical key presses. Sequencer advancement does not establish musical
quality, and emulator checks do not establish compatibility with every real
C64, SID revision or SD2IEC firmware.

This snapshot starts automatically with plasma, then changes between six effects
every eight nominal seconds. Number keys or Space take manual control; M pauses
and restarts Clockwork. Preserve both credit files when redistributing it.
`validation/show-pal.json` and `show-ntsc.json` record automatic startup,
eight-second cycles, wraparound and the Space handler's manual takeover.
Source/configuration details are in [the TORQ guide](../docs/TORQ.md).

The wave has 16 phases at nominal 12 fps, for an approximately 1.33-second cycle.
[FPS results and proposed experiments](../docs/FPS.md) document this update. The
[frame-capacity guide](../docs/FRAME_CAPACITY.md) records the compression and
RAM changes, repeated timings and the limits of the 32-phase experiment.
