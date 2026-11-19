# Adapt collected techniques to this kit

The best first additions are a tracker-export workflow, a character-mode effect
scene, host-generated font/sprite data and optional asset compression. These
extend capabilities that the current bitmap animation and equal-step sequencer
do not provide. Streaming loaders and cycle-critical border effects need a
larger change to memory and interrupt ownership.

This is a proposed implementation order. No item below is claimed to be an
implemented library module or a measured speedup. Source names link to pinned
code, original creators and license evidence in the [catalogue](SOURCES.md).

## Start with host tools and independent routines

| Addition | Sources and attribution | Adaptation | Evidence needed before integration |
| --- | --- | --- | --- |
| Tracker-exported music | [Hermit/Soci SID-Wizard](SOURCES.md#sid-wizard), [Magnar Harestad's MagSID](SOURCES.md#magsid), [SID Factory II team](SOURCES.md#sid-factory-2), [Lasse Öörni's GoatTracker](SOURCES.md#goattracker2) | Define an optional init/play player interface and reserve its code, song and zero page. Use an original composition or a specifically authorized export. Record editor, player and composition rights separately. | Check init/play addresses, load range, subtune, timing mode and RAM overlap. Trace SID writes and audition both target chip models. |
| Instrument sequences | [SID instrument library](SOURCES.md#sid-instruments), [Martin Galway](SOURCES.md#galway-music) | Extend beyond fixed presets with note/rest events, waveform and pulse tables, vibrato, filter control and explicit hard-restart behavior. Resolve patch-author provenance before publishing an instrument bank. | Test gate ordering, shared filter routing, pitch, rests, release and modulation. Distinguish 6581 from 8580 filter behavior. |
| Image formats | [Michel de Bree's Retropixels](SOURCES.md#retropixels) | Add palette-aware multicolor conversion as an optional host step and a runtime mode that consumes the matching format. Keep hires conversion available. | Decode generated bitmap, screen and color data independently; inspect the result in VICE. |
| Sprite assets | [awsm's Spritemate](SOURCES.md#spritemate), [c64lib chipset](SOURCES.md#c64lib-chipset) | Import sprite bytes, pad each hardware sprite to 64 bytes and generate pointers for the chosen VIC bank. Make asset attribution part of the manifest. | Check 24-by-21 geometry, multicolor packing, pointer alignment and bank boundaries. |
| Arithmetic and copies | [Maciej Małecki/c64lib common](SOURCES.md#c64lib-common), [Lasse Öörni's math.s](SOURCES.md#steel-ranger-code) | Port a small routine to 64tass only when a caller needs it. State signedness, carry behavior, clobbers, zero page and overlap constraints. | Compare boundary inputs against an independent host implementation and inspect the assembled instructions. |
| Static asset compression | [Daniel Serpell's ZX02](SOURCES.md#zx02), [Marty/Ferrie/Brandwood's LZSA](SOURCES.md#lzsa), [Antonio Savona's TSCrunch](SOURCES.md#tscrunch), [Malmborg/Di Fraia's ByteBoozer](SOURCES.md#byteboozer2) | Compress on the host. Select one format and one decoder variant with an explicit buffer and zero-page allocation. Keep the existing sparse-patch format until measurements justify a replacement. | Round-trip actual assets; measure packed bytes, code/table bytes, peak RAM and decode cycles under the demo's IRQ load. |
| SID relocation | [Linus Åkesson's Sidreloc](SOURCES.md#sidreloc), [Raistlin's SIDBlaster article](SOURCES.md#raistlin-welcome-to-sidblaster) | Relocate authorized imported players on the host where possible. Detect unsupported cases and leave the input untouched on failure. | Compare SID-register traces before and after relocation for the selected subtunes and duration. |

PAL/NTSC player cadence and frequency tables are separate issues. Calling a
PAL-authored tune at a different cadence does not retune its embedded SID
frequency constants. A PSID header or player export may specify frame-based or
CIA timing. The current engine's approximately 50 Hz logic scheduler is not a
universal scheduler for arbitrary imported players.

## Add a scene that can own its graphics mode

| Effect family | Sources and attribution | Useful implementation approach | Main integration cost |
| --- | --- | --- | --- |
| Character scrollers and tile maps | [c64lib text](SOURCES.md#c64lib-text) | Fine scroll plus screen/charset updates; split screen and color-RAM movement into explicit operations. | New screen/charset allocations and a graphics mode contract. |
| Raster bars and mixed modes | [Copper64](SOURCES.md#copper64) | Store raster events as data, then dispatch a bounded set of handlers. | Replace IRQ ownership and budget stabilization. Copper64 documents active-sprite and bad-line limits. |
| DYCP/DXYCP | [Raistlin](SOURCES.md#raistlin-dxycp-scrollers) | Generate pre-shifted fonts and plotting code on the host; deduplicate glyph data. | Charset/bitmap layout, font licensing and generated-code RAM. |
| Big sprite logos | [Raistlin's interleave article](SOURCES.md#raistlin-sprite-interleave) and [animated logo](SOURCES.md#raistlin-big-animating-sprite-logo) | Plan sprite interleave, pointer writes and changed-frame data before emitting the display routine. | Sprite DMA, pointer timing and memory bandwidth compete with music and decoding. |
| Bobs and trails | [Finite bobs](SOURCES.md#raistlin-finite-bobs-nobounds) and [scrolling bob scroller](SOURCES.md#raistlin-scrolling-bob-scroller) | Restore old background regions and stamp a shape into prepared character/bitmap data. | Keep restoration and display buffers consistent when phases are skipped or stopped. |
| Perspective text | [Raistlin's Star Wars scrollers](SOURCES.md#raistlin-star-wars-scrollers) | Prepare font bit selections and cyclic buffers on the host. | A separate renderer and perspective data layout. |
| Sprite multiplexing | [Lasse Öörni's sprite.s/raster.s](SOURCES.md#steel-ranger-code) and [Raistlin's production sources](SOURCES.md#raistlin-releases) | Sort visible objects by Y and schedule hardware sprite reuse with explicit per-line occupancy. | Same-line sprite limits, DMA and IRQ deadlines. Full production sources may require permission before copying. |
| Procedural graphics and small intros | [Viznut](SOURCES.md#viznut-c64), [4mat source listing](SOURCES.md#4mat-sources), [Linus Åkesson's explanations](SOURCES.md#perpetual-fragility) | Reuse patterns, character arrangements and compact state to avoid full framebuffer redraws. | Keep target-platform differences and each source's actual license explicit. |
| Twisters, rotozoom, plasma and vectors | [Mankeli/Extend](SOURCES.md#aerial-core), [Ricardo Quesada](SOURCES.md#quesada-misc), [Roger Alsing](SOURCES.md#alsing-effects), [Genesis Project](SOURCES.md#raistlin-releases) | Study the host/runtime division, lookup tables and specialized render kernels, then implement original routines or obtain compatible permission. | These entries are linked references, not licensed source imported into the runtime. |

The current engine maps ROMs out with `$01=$35`, owns VIC bank selection and uses
`$02..$4f` plus `$fb..$fe` for shared state. Its two hires bitmap regions are
`$2000..$3f3f` and `$e000..$ff3f`; sparse patch streams occupy `$4000..$bfff`.
An effect's hard-coded addresses and zero page cannot be assumed free. Add an
explicit scene memory map before combining a new effect with the existing one.

## Optimize actual bottlenecks

These are candidate experiments, not speed claims:

1. Deduplicate pre-shifted glyph columns and sprite tiles before adding runtime
   decompression. Attribute the approach to the relevant Raistlin article when
   deriving code or a generator from it.
2. Generate repeated plotting/copying instructions on the host where saved
   cycles justify more C64 code bytes. Keep generated code out of display and
   loader regions. Compare with a compact loop using the same data.
3. Align tables and branch targets when measurements show indexed-read or
   branch page penalties. Check counts against
   [Graham/Oxyron's opcode reference](SOURCES.md#oxyron-opcodes).
4. Track changed screen cells or bitmap spans for bobs, fades and PETSCII
   animation. Compare dirty-region restoration with a full redraw and with the
   kit's current sparse stream.
5. Choose forward or backward memory copies from the actual overlap relation.
   Account for self-modifying operands when a copy routine can be interrupted.
6. Compile out unused player features, following the idea described by
   [Magnar Harestad](SOURCES.md#magsid). Measure the resulting song/player
   combination rather than quoting a size from a different song.
7. Budget graphics with sprite DMA, bad lines and the music IRQ active. A bare
   decoder benchmark does not represent time available in a real demo frame.
8. Use [Raistlin's music-call trace method](SOURCES.md#raistlin-stopping-music-popping)
   to detect missed, duplicate or irregular play calls through transitions.

Keep a measurement's input assets, build revision, machine model, decoder/player
options, cycle boundaries and output verification with its result. Do not rank
crunchers from README numbers measured on different data or processors.

## Reserve streaming and border effects for later

[Spindle](SOURCES.md#spindle), [Sparkle](SOURCES.md#sparkle) and
[Bitfire](SOURCES.md#bitfire) provide different loading/linking models. Select
one for an optional build target after defining resident RAM, zero page, drive
support and interrupt ownership. The current host D64 writer stores one ordinary
PRG; it is not a trackmo linker. Preserve the single-file target for productions
that do not need streaming.

Loader calls can change `$01` to access RAM under I/O. An IRQ must preserve the
interrupted memory-port state and map in I/O before accessing VIC/CIA/SID, with
its own code and required player code remaining visible. Verify the chosen
loader's exact contract instead of assuming that the current fixed `$35` state
holds throughout loading.

Side-border scrolling, double DYPP, FLI and VSP need separate cycle-critical
parts. [Christian Bauer's VIC-II document](SOURCES.md#bauer-vic-ii) explains
the fetch model, and [Linus Åkesson's Safe VSP analysis](SOURCES.md#safe-vsp)
explains a physical-machine failure mode. Test intended PAL/NTSC and VIC-II
revisions separately. Successful emulator output alone does not establish VSP
reliability on physical machines.

## Promote one routine into the library

For each adaptation, record the original person/handle, production, exact source
path and revision, license notice and modifications. Give the module a 64tass
entry point and state its registers, flags, zero page, code/data regions,
hardware ownership and timing requirements.

Build a small example with original or authorized assets. Check the assembled
memory map, demonstrate visible/audio behavior in VICE, and run the existing
kit tests. Add a behavioral test where it can catch a real error. Update the
release credits with both the derived code's author and any music/art creators.
Only then mark that candidate as an implemented kit feature.
