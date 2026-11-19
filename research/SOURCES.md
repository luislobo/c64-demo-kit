# C64 source catalogue

Generated from [catalog.json](catalog.json) with `node tools/research.cjs --write`.

Read [the collection guide](README.md) for scope, reuse categories and integration limits.

| Source | Topics | Reuse category | Archived files |
| --- | --- | --- | --- |
| [26-line shuffle](#26-line-shuffle) | effects, raster | reference | 0 |
| [4mat C64 demos and music drivers](#4mat-sources) | music, sizecoding, plasma, effects | reference | 0 |
| [A Mind Is Born annotated intro](#a-mind-is-born) | music, sizecoding, procedural, effects | restricted | 0 |
| [Aerial Core](#aerial-core) | effects, twister, rotozoom, codegen, streaming | reference | 0 |
| [Standalone PAL effect experiments](#alsing-effects) | effects, vectors, glenz, rotozoom, bobs, nufli | reference | 0 |
| [awsm production sources](#awsm-productions) | effects, scrollers, raster, petscii | reference | 0 |
| [KickAssembler C64 utility library](#barryw-c64lib) | sprites, math, memory, timers, music | reference | 0 |
| [The MOS 6567/6569 video controller](#bauer-vic-ii) | hardware, raster, timing, sprites | reference | 0 |
| [Bitfire loader framework](#bitfire) | streaming, compression, loading, disk | permissive | 7 |
| [Bright Pixel Christmas demo](#bright-pixel-demo) | effects, sprites, music, raster, random | permissive | 5 |
| [ByteBoozer 2 source and decruncher](#byteboozer2) | compression, optimization, loading | permissive | 5 |
| [Ultimate C64 reference guide](#c64-reference) | hardware, reference, opcodes, timing | scoped | 0 |
| [c64lib VIC-II and CIA helpers](#c64lib-chipset) | raster, sprites, hardware | permissive | 10 |
| [c64lib common routines](#c64lib-common) | math, memory, compression, optimization | permissive | 18 |
| [c64lib text and tile routines](#c64lib-text) | scrollers, tiles, text | permissive | 14 |
| [C-callable sprite multiplexor](#caruso-multiplexer) | sprites, multiplexer, cc65 | restricted | 0 |
| [CheeseCutter tracker](#cheesecutter) | music, tracker, sid | copyleft | 0 |
| [Copper-style raster lists](#copper64) | raster, effects, interrupts | permissive | 11 |
| [64tass and C64 graphics routines](#daffra-c64lib) | 64tass, graphics, math | scoped | 0 |
| [Booze Design extraction tools](#demotools) | debugging, compression, reverse-engineering | reference | 0 |
| [Exomizer legacy source archive](#exomizer-archive) | compression, loading | reference | 0 |
| [Full of Sinus browser effect reference](#full-of-sinus) | browser-reference, sine, scrollers, assets | reference | 0 |
| [Martin Galway original music sources](#galway-music) | music, sid, player, historical | copyleft | 0 |
| [GoatTracker 2 source mirror](#goattracker2) | music, tracker, sid, instruments | copyleft | 0 |
| [PETSCII image converter](#image2petscii) | assets, petscii, quantization | reference | 0 |
| [KickAssembler cruncher plugins](#kickass-crunchers) | compression, codegen, assets | scoped | 0 |
| [LZSA 6502 decoders](#lzsa) | compression, optimization, memory | permissive | 11 |
| [Magic Desk cartridge helpers](#magic-desk) | cartridge, loading, memory | permissive | 4 |
| [MagSID player and tracker](#magsid) | music, tracker, sid, optimization | scoped | 0 |
| [MegaPETSCII](#megapetscii) | petscii, animation, compression, codegen | reference | 0 |
| [Oscar64 compiler and C64 examples](#oscar64) | compiler, optimization, math, graphics | copyleft | 0 |
| [6502/6510 opcode matrix](#oxyron-opcodes) | opcodes, timing, optimization, hardware | reference | 0 |
| [Perpetual Fragility explanation](#perpetual-fragility) | effects, procedural, particles, music | reference | 0 |
| [PNG to SpritePad converter](#png2spd) | assets, sprites, conversion | reference | 0 |
| [Introduction to C64 demo programming](#puterman-introduction) | tutorial, raster, effects | reference | 0 |
| [Quadtrip C64 demo source](#quadtrip-2017) | effects, production, music | scoped | 0 |
| [C64 plasma, plotters and scrollers](#quesada-misc) | effects, plasma, scrollers, raster, sprites | reference | 0 |
| [Big Animating Sprite Logo](#raistlin-big-animating-sprite-logo) | effects, 6502, c64, sprites, multiplexing, raster irqs, code generation | attribution | 1 |
| [Big Layered Logo Mover](#raistlin-big-parallax-logo-mover) | effects, 6502, c64, sprites, multiplexing, raster irqs, code generation | attribution | 1 |
| [DXYCP Scrollers](#raistlin-dxycp-scrollers) | effects, 6502, c64, scrollers, bobs, sprites, multiplexing, code generation | attribution | 1 |
| [Finite Bobs](#raistlin-finite-bobs-nobounds) | effects, 6502, c64, bobs, badlines, raster irqs, code generation | attribution | 1 |
| [All Border Double DYPP](#raistlin-memento-mori-all-border-double-dypp) | effects, 6502, c64, sprites, borders, dypp, multiplexing, code generation | attribution | 1 |
| [Genesis Project production sources](#raistlin-releases) | effects, scrollers, sprites, speedcode, streaming | reference | 0 |
| [Remastering Sabre Wulf - Part One](#raistlin-remastering-sabre-wulf-part-one) | effects, 6502, c64, game dev, retro gaming, bitmap | attribution | 1 |
| [Remastering Sabre Wulf - Part Two](#raistlin-remastering-sabre-wulf-part-two) | effects, 6502, c64, game dev, retro gaming, sprites | attribution | 1 |
| [Scrolling Bob Scroller](#raistlin-scrolling-bob-scroller) | effects, 6502, c64, bobs, scrollers | attribution | 1 |
| [Seamless Loading in No Bounds](#raistlin-seamless-loading-nobounds) | effects, 6502, c64, loading, music, raster irqs | attribution | 1 |
| [Side Border Bitmap Scroller](#raistlin-side-border-bitmap-scroller) | effects, 6502, c64, sprites, borders, bitmap, scrollers, loading | attribution | 1 |
| [Sprite Interleave](#raistlin-sprite-interleave) | effects, 6502, c64, sprites, multiplexing, badlines, raster irqs | attribution | 1 |
| [Star Wars Scrollers](#raistlin-star-wars-scrollers) | effects, 6502, c64, demoscene, scrollers, bitmap, code generation | attribution | 1 |
| [Stopping Music Popping](#raistlin-stopping-music-popping) | effects, 6502, c64, music, sid, raster irqs, tools | attribution | 1 |
| [Welcome to SIDBlaster](#raistlin-welcome-to-sidblaster) | effects, 6502, c64, sid, music, tools | attribution | 1 |
| [Retro Debugger](#retro-debugger) | debugging, profiling, emulator | scoped | 0 |
| [Retropixels image converter](#retropixels) | assets, graphics, koala, quantization | permissive | 0 |
| [Reverse-engineering notes](#rip-and-tear) | debugging, effects, reverse-engineering | reference | 0 |
| [Safe VSP technical explanation](#safe-vsp) | hardware, scrolling, vsp | reference | 0 |
| [SID Factory II](#sid-factory-2) | music, tracker, sid, relocation | copyleft | 0 |
| [Reusable SID instrument library](#sid-instruments) | music, instruments, sid, 6581, 8580 | attribution | 23 |
| [SID-Wizard source via Vessel fork](#sid-wizard) | music, tracker, sid, midi, 64tass | scoped | 0 |
| [Sidreloc 1.0](#sidreloc) | music, sid, relocation, optimization | permissive | 8 |
| [Spaceballs effect skeleton and design notes](#spaceballs) | effects, sprites, physics, music | permissive | 6 |
| [Sparkle loader and linker](#sparkle) | streaming, compression, loading, disk | permissive | 7 |
| [Spindle 3.1](#spindle) | streaming, loading, compression, disk | permissive | 27 |
| [SPOT picture optimization tool](#spot) | assets, graphics, streaming, optimization | reference | 0 |
| [Spritemate sprite editor](#spritemate) | assets, sprites, editor | permissive | 0 |
| [Steel Ranger technical routines](#steel-ranger-code) | sprites, scrolling, music, memory, loading, optimization | permissive | 6 |
| [Total](#total) | effects, vectors, raster, codegen, streaming | reference | 0 |
| [TSCrunch 6502 decoders](#tscrunch) | compression, optimization, memory | permissive | 5 |
| [VICE emulator source and tests](#vice) | debugging, emulator, validation, hardware | copyleft | 0 |
| [Interactive VIC-II guide](#vicspector) | hardware, raster, debugging | permissive | 0 |
| [Viznut C64 size-coded intros](#viznut-c64) | effects, sizecoding, procedural, music | permissive | 6 |
| [Zirias demo part](#zirias-demo) | effects, music | reference | 0 |
| [ZX02 6502 compression](#zx02) | compression, optimization, memory | permissive | 10 |

<a id="26-line-shuffle"></a>
## 26-line shuffle

[Original source](https://github.com/geehaf/c64-demo-effects). Checked 2026-11-18.

Credit: geehaf, repository publisher; original effect credits need checking in source.

License record: No license found. Reuse category: reference.

Useful addition: Investigate a raster shuffle transition with a documented timing contract.

Limits: A small collection, currently a 26-line shuffle, rather than a large effects library.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/geehaf/c64-demo-effects/blob/feeb526a00a707a21f3d737f1978c39e4938dbbc/README.md).

Pinned revision: `feeb526a00a707a21f3d737f1978c39e4938dbbc`.

Source entry points:

- [26 line shuffle/c6426rows.asm](https://github.com/geehaf/c64-demo-effects/blob/feeb526a00a707a21f3d737f1978c39e4938dbbc/26%20line%20shuffle/c6426rows.asm)

<a id="4mat-sources"></a>
## 4mat C64 demos and music drivers

[Original source](https://4mat.itch.io/music-drivers). Checked 2026-11-18.

Credit: 4mat; TIW/SAE, page logo.

License record: Check each archive; no blanket reuse license on inspected page. Reuse category: reference.

Useful addition: Explore tiny player designs and procedural music after checking each archive's credits and terms.

Limits: The page lists In a loop, Type Mismatch, MUS1K, Pocket Universe, 1k Play, Empty and plasma sources. Archives were not downloaded or licensed in this survey.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://4mat.itch.io/music-drivers).

License evidence: [1](https://4mat.itch.io/music-drivers).

<a id="a-mind-is-born"></a>
## A Mind Is Born annotated intro

[Original source](https://hd0.linusakesson.net/scene/a-mind-is-born/index.php). Checked 2026-11-18.

Credit: Linus Åkesson (LFT).

License record: CC-BY-NC-SA; commercial permission requested by author. Reuse category: restricted.

Useful addition: Study procedural arrangement, shared state and music-driven visuals, then design original routines.

Limits: Noncommercial/share-alike terms are not a general-purpose permissive grant. This entry links to the explanation without copying code or music.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://hd0.linusakesson.net/scene/a-mind-is-born/index.php).

License evidence: [1](https://hd0.linusakesson.net/scene/a-mind-is-born/index.php).

<a id="aerial-core"></a>
## Aerial Core

[Original source](https://github.com/mankeli/aerial_core). Checked 2026-11-18.

Credit: Mankeli/Extend; Electric/Extend; Barracuda/Extend; TBB/Extend; Linus Åkesson (LFT).

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study twist.hasm.cpp and rotozoom.hasm.cpp for host-generated kernels.

Limits: Hashembler/C++ generation and Spindle 2.3, not 64tass includes.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/mankeli/aerial_core/blob/395f1f69210b3e8533d04a72b115a67d66dd94c5/README.md).

Pinned revision: `395f1f69210b3e8533d04a72b115a67d66dd94c5`.

Source entry points:

- [twist.hasm.cpp](https://github.com/mankeli/aerial_core/blob/395f1f69210b3e8533d04a72b115a67d66dd94c5/twist.hasm.cpp)
- [rotozoom.hasm.cpp](https://github.com/mankeli/aerial_core/blob/395f1f69210b3e8533d04a72b115a67d66dd94c5/rotozoom.hasm.cpp)
- [irqfukker.hasm.cpp](https://github.com/mankeli/aerial_core/blob/395f1f69210b3e8533d04a72b115a67d66dd94c5/irqfukker.hasm.cpp)

<a id="alsing-effects"></a>
## Standalone PAL effect experiments

[Original source](https://github.com/rogeralsing/c64demo). Checked 2026-11-18.

Credit: Roger Alsing and source-specific credited contributors.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Compare effect catalogues, host preprocessing and per-effect emulator verification.

Limits: Upstream describes these as PAL experiments and lists limits per example. Refer back to original research authors.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/rogeralsing/c64demo/blob/d0ce3e0aa22aa1088defbb7ec13b99efbf87c877/README.md).

Pinned revision: `d0ce3e0aa22aa1088defbb7ec13b99efbf87c877`.

Source entry points:

- [experiments/README.md](https://github.com/rogeralsing/c64demo/blob/d0ce3e0aa22aa1088defbb7ec13b99efbf87c877/experiments/README.md)
- [experiments/character-rotozoom/main.asm](https://github.com/rogeralsing/c64demo/blob/d0ce3e0aa22aa1088defbb7ec13b99efbf87c877/experiments/character-rotozoom/main.asm)
- [experiments/bitmap-kefrens/main.asm](https://github.com/rogeralsing/c64demo/blob/d0ce3e0aa22aa1088defbb7ec13b99efbf87c877/experiments/bitmap-kefrens/main.asm)
- [experiments/masked-bobs/main.asm](https://github.com/rogeralsing/c64demo/blob/d0ce3e0aa22aa1088defbb7ec13b99efbf87c877/experiments/masked-bobs/main.asm)

<a id="awsm-productions"></a>
## awsm production sources

[Original source](https://github.com/Esshahn/c64-prods-by-awsm). Checked 2026-11-18.

Credit: awsm / Esshahn; individual release contributors.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study compact color washes, scrollers and PETSCII scenes.

Limits: ACME source with release-specific graphics and music. Credit each original asset creator.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/README.md).

Pinned revision: `aa95e1e9b4145839445cf39aa74259e1a7d0f1dd`.

Source entry points:

- [arrows/code/main.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/arrows/code/main.asm)
- [arrows/sources/Ohne Titel.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/arrows/sources/Ohne%20Titel.asm)
- [arrows/sources/map.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/arrows/sources/map.asm)
- [awsm-c64-001/code/data_colorwash.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/awsm-c64-001/code/data_colorwash.asm)
- [awsm-c64-001/code/data_static_text.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/awsm-c64-001/code/data_static_text.asm)
- [awsm-c64-001/code/init_clear_screen.asm](https://github.com/Esshahn/c64-prods-by-awsm/blob/aa95e1e9b4145839445cf39aa74259e1a7d0f1dd/awsm-c64-001/code/init_clear_screen.asm)

<a id="barryw-c64lib"></a>
## KickAssembler C64 utility library

[Original source](https://github.com/barryw/c64lib). Checked 2026-11-18.

Credit: barryw, repository publisher; check source-file credits.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Compare sprite, timer and memory APIs before designing new kit modules.

Limits: Do not confuse this project with the separately licensed c64lib organization.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/README.md).

Pinned revision: `f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1`.

Source entry points:

- [basic.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/basic.asm)
- [cia.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/cia.asm)
- [constants.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/constants.asm)
- [include_me_full.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/include_me_full.asm)
- [include_me_full_r.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/include_me_full_r.asm)
- [include_me_memory.asm](https://github.com/barryw/c64lib/blob/f15e0d6a241fec18f147a8346eff0f7ab6a3e2c1/include_me_memory.asm)

<a id="bauer-vic-ii"></a>
## The MOS 6567/6569 video controller

[Original source](https://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt). Checked 2026-11-18.

Credit: Christian Bauer; Zimmers, archive host.

License record: Reference only; no redistribution grant established. Reuse category: reference.

Useful addition: Use fetch and bad-line behavior to budget sprite DMA and raster effect work.

Limits: Historical primary technical document dated 1996, read from its mirrored Latin-1 text. Validate details for the target VIC-II revision.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt).

License evidence: [1](https://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt).

<a id="bitfire"></a>
## Bitfire loader framework

[Original source](https://github.com/bboxy/bitfire). Checked 2026-11-18.

Credit: Tobias Bindhammer; Bitbreaker/Oxyron and contributors; Einar Saukas and Emmanuel Marty for packer components.

License record: BSD-3-Clause plus component notices. Reuse category: permissive.

Useful addition: Compare a compact resident loader, Dali decoder and fixed-interleave disk builder.

Limits: Includes separate ZX0 licensing. Loader and packer components must retain their own notices.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/README.md).

Pinned revision: `5a3964b533656332c12cc0904f2ce92f44499c6f`.

License evidence: [1](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/LICENSE).

Source entry points:

- [benchmark/checksum.asm](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/benchmark/checksum.asm)
- [config.inc](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/config.inc)
- [crtwrite/bootstrap.asm](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/crtwrite/bootstrap.asm)
- [crtwrite/loop.asm](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/crtwrite/loop.asm)
- [example/depack_only/example.asm](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/example/depack_only/example.asm)
- [example/example_project/bootstrap/boot.asm](https://github.com/bboxy/bitfire/blob/5a3964b533656332c12cc0904f2ce92f44499c6f/example/example_project/bootstrap/boot.asm)

Archived source: [bitfire](upstream/bitfire/). File URLs and SHA-256 values are in the manifest.

<a id="bright-pixel-demo"></a>
## Bright Pixel Christmas demo

[Original source](https://github.com/celso/c64). Checked 2026-11-18.

Credit: Bright Pixel; celso and source-file contributors.

License record: MIT. Reuse category: permissive.

Useful addition: Adapt sprite motion, raster setup and SID init/play integration to 64tass.

Limits: Assembly is licensed; included SID and artwork require their own credit and scope review. Copied code examples do not include those assets.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/README.md), [2](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/LICENSE).

Pinned revision: `04650c314c798a8a70b8bcbdba55b3cfbe20b650`.

License evidence: [1](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/LICENSE).

Source entry points:

- [card.asm](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/card.asm)
- [message.asm](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/message.asm)
- [sidinfo.asm](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/sidinfo.asm)
- [sprites.asm](https://github.com/celso/c64/blob/04650c314c798a8a70b8bcbdba55b3cfbe20b650/sprites.asm)

Archived source: [bright-pixel-demo](upstream/bright-pixel-demo/). File URLs and SHA-256 values are in the manifest.

<a id="byteboozer2"></a>
## ByteBoozer 2 source and decruncher

[Original source](https://github.com/luigidifraia/ByteBoozer2). Checked 2026-11-18.

Credit: David Malmborg (HCL), original ByteBoozer; Luigi Di Fraia, extensions.

License record: MIT for this distribution. Reuse category: permissive.

Useful addition: Compare packed size and decode cost against the kit's sparse frame patches.

Limits: Retain both original source headers and Luigi Di Fraia's distribution license. DreamAss syntax needs translation.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/luigidifraia/ByteBoozer2/blob/2fb40ffbba7e83a311ec8a37316fb75119594cab/README.md).

Pinned revision: `2fb40ffbba7e83a311ec8a37316fb75119594cab`.

License evidence: [1](https://github.com/luigidifraia/ByteBoozer2/blob/2fb40ffbba7e83a311ec8a37316fb75119594cab/LICENSE.md).

Source entry points:

- [TestProg/Decruncher.inc](https://github.com/luigidifraia/ByteBoozer2/blob/2fb40ffbba7e83a311ec8a37316fb75119594cab/TestProg/Decruncher.inc)
- [b2/Decruncher.inc](https://github.com/luigidifraia/ByteBoozer2/blob/2fb40ffbba7e83a311ec8a37316fb75119594cab/b2/Decruncher.inc)

Archived source: [byteboozer2](upstream/byteboozer2/). File URLs and SHA-256 values are in the manifest.

<a id="c64-reference"></a>
## Ultimate C64 reference guide

[Original source](https://github.com/mist64/c64ref). Checked 2026-11-18.

Credit: Michael Steil (mist64), editor; original reference authors named in README.

License record: BSD-2-Clause for project code; collected documents have separate provenance. Reuse category: scoped.

Useful addition: Use machine-readable registers and timing references to validate assumptions.

Limits: The README names original disassembly and reference authors. Do not relicense collected hardware documents or ROM content.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/mist64/c64ref/blob/7cae8b91d5317d1d18ae8cdcaac03533389e6032/README.md).

Pinned revision: `7cae8b91d5317d1d18ae8cdcaac03533389e6032`.

License evidence: [1](https://github.com/mist64/c64ref/blob/7cae8b91d5317d1d18ae8cdcaac03533389e6032/LICENSE).

Source entry points:

- [README.md](https://github.com/mist64/c64ref/blob/7cae8b91d5317d1d18ae8cdcaac03533389e6032/README.md)

<a id="c64lib-chipset"></a>
## c64lib VIC-II and CIA helpers

[Original source](https://github.com/c64lib/chipset). Checked 2026-11-18.

Credit: Maciej Małecki and c64lib contributors; J0X, NTSC detection routine.

License record: MIT. Reuse category: permissive.

Useful addition: Use register definitions, sprite masks and character rotation helpers.

Limits: VIC bank, CIA and interrupt setup conflict with the engine's existing hardware ownership.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/README.md), [2](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/vic2.asm#L420).

Pinned revision: `533b26c613243ef584fd87b1cfa9ab9d0d11271c`.

License evidence: [1](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/LICENSE).

Source entry points:

- [examples/e01-raster-irq.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/examples/e01-raster-irq.asm)
- [lib/cia-global.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/cia-global.asm)
- [lib/cia.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/cia.asm)
- [lib/mos6510-global.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/mos6510-global.asm)
- [lib/mos6510.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/mos6510.asm)
- [lib/sprites-global.asm](https://github.com/c64lib/chipset/blob/533b26c613243ef584fd87b1cfa9ab9d0d11271c/lib/sprites-global.asm)

Archived source: [c64lib-chipset](upstream/c64lib-chipset/). File URLs and SHA-256 values are in the manifest.

<a id="c64lib-common"></a>
## c64lib common routines

[Original source](https://github.com/c64lib/common). Checked 2026-11-18.

Credit: Maciej Małecki and c64lib contributors.

License record: MIT. Reuse category: permissive.

Useful addition: Adapt 16-bit arithmetic, large memory copies, RLE decoding and memory rotation.

Limits: KickAssembler macros. Port syntax and document register, carry and zero-page behavior.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/README.md).

Pinned revision: `0385f54e5a772cdf673081206e27d4ff949dd0a6`.

License evidence: [1](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/LICENSE).

Source entry points:

- [lib/common-global.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/common-global.asm)
- [lib/common.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/common.asm)
- [lib/compress-global.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/compress-global.asm)
- [lib/compress.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/compress.asm)
- [lib/invoke-global.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/invoke-global.asm)
- [lib/invoke.asm](https://github.com/c64lib/common/blob/0385f54e5a772cdf673081206e27d4ff949dd0a6/lib/invoke.asm)

Archived source: [c64lib-common](upstream/c64lib-common/). File URLs and SHA-256 values are in the manifest.

<a id="c64lib-text"></a>
## c64lib text and tile routines

[Original source](https://github.com/c64lib/text). Checked 2026-11-18.

Credit: Maciej Małecki and c64lib contributors.

License record: MIT. Reuse category: permissive.

Useful addition: Adapt tile decoding, color-RAM shifts and a configurable character scroller.

Limits: Character-mode routines require a new scene layout alongside the current bitmap scene.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/README.md).

Pinned revision: `8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a`.

License evidence: [1](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/LICENSE).

Source entry points:

- [lib/scroll1x1-global.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/scroll1x1-global.asm)
- [lib/scroll1x1.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/scroll1x1.asm)
- [lib/sub/out-hex-nibble.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/sub/out-hex-nibble.asm)
- [lib/sub/out-hex.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/sub/out-hex.asm)
- [lib/sub/out-text.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/sub/out-text.asm)
- [lib/text-global.asm](https://github.com/c64lib/text/blob/8b01a4e7b415e22a25f6c37a795e3d3f15a8f08a/lib/text-global.asm)

Archived source: [c64lib-text](upstream/c64lib-text/). File URLs and SHA-256 values are in the manifest.

<a id="caruso-multiplexer"></a>
## C-callable sprite multiplexor

[Original source](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB). Checked 2026-11-18.

Credit: Fabrizio Caruso; Flavio Web Pasqualin; original multiplexer authors named upstream.

License record: README contains explicit commercial-use restrictions. Reuse category: restricted.

Useful addition: Compare C-to-assembly API design and music coexistence requirements.

Limits: Do not copy into a general-purpose reusable library under an assumed permissive license. Follow original multiplexer credits and seek compatible permission.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/README.md).

Pinned revision: `bcae0529d9f91621ab6da348e67bdd131d6b64b6`.

Source entry points:

- [games/befana/befana_graphics_data_udg.s](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/games/befana/befana_graphics_data_udg.s)
- [games/befana/befana_graphics_udg.s](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/games/befana/befana_graphics_udg.s)
- [games/befana/hearth.asm](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/games/befana/hearth.asm)
- [games/befana/shock.asm](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/games/befana/shock.asm)
- [graphics/alpha.s](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/graphics/alpha.s)
- [graphics/commodore_graphics_udg.s](https://github.com/Fabrizio-Caruso/C64_Multiplexor_C_LIB/blob/bcae0529d9f91621ab6da348e67bdd131d6b64b6/graphics/commodore_graphics_udg.s)

<a id="cheesecutter"></a>
## CheeseCutter tracker

[Original source](https://github.com/theyamo/CheeseCutter). Checked 2026-11-18.

Credit: Abaddon / Triad; Ruk, Mac and D2 port; Dag Lem and A. Lankila, reSID; Cadaver, interface code.

License record: GPL-2.0; bundled components have their own notices. Reuse category: copyleft.

Useful addition: Compare tracker workflow, player data format and export tooling.

Limits: Tracker source is useful for data editing and exporting. Inspect driver and tune rights before linking them into a kit production.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/theyamo/CheeseCutter/blob/85323d872116ee45fdc5eaab63f945914ea4ad5e/AUTHORS), [2](https://github.com/theyamo/CheeseCutter/blob/85323d872116ee45fdc5eaab63f945914ea4ad5e/README.md).

Pinned revision: `85323d872116ee45fdc5eaab63f945914ea4ad5e`.

License evidence: [1](https://github.com/theyamo/CheeseCutter/blob/85323d872116ee45fdc5eaab63f945914ea4ad5e/LICENSE.md).

Source entry points:

- [src/audio/player.d](https://github.com/theyamo/CheeseCutter/blob/85323d872116ee45fdc5eaab63f945914ea4ad5e/src/audio/player.d)
- [doc/README](https://github.com/theyamo/CheeseCutter/blob/85323d872116ee45fdc5eaab63f945914ea4ad5e/doc/README)

<a id="copper64"></a>
## Copper-style raster lists

[Original source](https://github.com/c64lib/copper64). Checked 2026-11-18.

Credit: Maciej Małecki and c64lib contributors; Jeroen Tel, Noisy Pillars referenced in examples; music file omitted.

License record: MIT. Reuse category: permissive.

Useful addition: Build data-driven raster color changes and mixed-mode scenes after replacing the current IRQ contract.

Limits: README warns stabilization does not handle active sprites or bad lines. Examples include separately credited media, which are omitted.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/README.md).

Pinned revision: `6d4b0920db0b0ddfd42976dc7c9ddc77c766244d`.

License evidence: [1](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/LICENSE).

Source entry points:

- [examples/e01-color-raster-bars.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e01-color-raster-bars.asm)
- [examples/e02-screen-modes.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e02-screen-modes.asm)
- [examples/e03-bitmap-demo.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e03-bitmap-demo.asm)
- [examples/e03-gfx.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e03-gfx.asm)
- [examples/e04-full-raster-bars.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e04-full-raster-bars.asm)
- [examples/e05-animated-raster-bars.asm](https://github.com/c64lib/copper64/blob/6d4b0920db0b0ddfd42976dc7c9ddc77c766244d/examples/e05-animated-raster-bars.asm)

Archived source: [copper64](upstream/copper64/). File URLs and SHA-256 values are in the manifest.

<a id="daffra-c64lib"></a>
## 64tass and C64 graphics routines

[Original source](https://github.com/ClaudioDaffra/C64Lib). Checked 2026-11-18.

Credit: Claudio Daffra; Prog8 and other component authors as identified in their notices.

License record: GPL-3.0 and component-specific terms. Reuse category: scoped.

Useful addition: Compare bitmap line/circle drawing and fixed-point math in a 64tass-oriented collection.

Limits: Root license refers to Prog8 and contains an output exception. Verify the specific subdirectory and source before reuse.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/README.md).

Pinned revision: `f2edbf7609798b1fe63324e0aebf64dbdfa6000f`.

License evidence: [1](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/license.txt).

Source entry points:

- [cbm.prg.studio/example/000.hires/main.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/example/000.hires/main.asm)
- [cbm.prg.studio/example/001.hires.multicolor/main.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/example/001.hires.multicolor/main.asm)
- [cbm.prg.studio/example/002.math/main.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/example/002.math/main.asm)
- [cbm.prg.studio/example/003.hires.multicolor/main.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/example/003.hires.multicolor/main.asm)
- [cbm.prg.studio/lib.src/graphic.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/lib.src/graphic.asm)
- [cbm.prg.studio/lib.src/kernal.asm](https://github.com/ClaudioDaffra/C64Lib/blob/f2edbf7609798b1fe63324e0aebf64dbdfa6000f/cbm.prg.studio/lib.src/kernal.asm)

<a id="demotools"></a>
## Booze Design extraction tools

[Original source](https://github.com/jblang/demotools). Checked 2026-11-18.

Credit: jblang, tool author; HCL / Booze Design, underlying loader and ByteBoozer.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Learn trackmo file boundaries and decrunching workflows for analysis.

Limits: An extractor does not grant redistribution rights for extracted demos, art or music.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/jblang/demotools/blob/08492ee030dfaa362912a4ee616a17130267b36a/README.md).

Pinned revision: `08492ee030dfaa362912a4ee616a17130267b36a`.

Source entry points:

- [README.md](https://github.com/jblang/demotools/blob/08492ee030dfaa362912a4ee616a17130267b36a/README.md)

<a id="exomizer-archive"></a>
## Exomizer legacy source archive

[Original source](https://github.com/bitshifters/exomizer). Checked 2026-11-18.

Credit: Magnus Lind, original Exomizer; Bitshifters, archive publisher.

License record: Component license headers need review; legacy archive. Reuse category: reference.

Useful addition: Study raw and streaming decompression interfaces before choosing a maintained upstream release.

Limits: This contains old versions and points elsewhere for current releases. Do not assume a current format or a repository-wide license.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/README.md).

Pinned revision: `97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb`.

Source entry points:

- [exomizer/contrib/exo-4k.asm](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/contrib/exo-4k.asm)
- [exomizer/decruncher/data.s](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/decruncher/data.s)
- [exomizer/decruncher/exodecrunch.s](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/decruncher/exodecrunch.s)
- [exomizer/decruncher/exostreamdecr1.s](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/decruncher/exostreamdecr1.s)
- [exomizer/decruncher/exostreamdecr2.s](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/decruncher/exostreamdecr2.s)
- [exomizer/decruncher/main.s](https://github.com/bitshifters/exomizer/blob/97f7d6cff322d5efde013ce88c6b6aa9e28fd2bb/exomizer/decruncher/main.s)

<a id="full-of-sinus"></a>
## Full of Sinus browser effect reference

[Original source](https://github.com/Esshahn/fullofsinus). Checked 2026-11-18.

Credit: awsm / Esshahn, browser production; CODEF and TinyJSid component authors retain their own credits.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Use as a visual reference for prototyping sine motion and scroller composition before designing a native renderer.

Limits: This is JavaScript/HTML with browser assets, not native C64 assembly. It contains SID playback components and media with their own provenance. No source or assets are copied.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Esshahn/fullofsinus/tree/b3fa8506126c638f378a743d6319e8a8cd2e8a08).

Pinned revision: `b3fa8506126c638f378a743d6319e8a8cd2e8a08`.

Source entry points:

- [v1/js/main.js](https://github.com/Esshahn/fullofsinus/blob/b3fa8506126c638f378a743d6319e8a8cd2e8a08/v1/js/main.js)
- [v1/js/codef_scrolltext.js](https://github.com/Esshahn/fullofsinus/blob/b3fa8506126c638f378a743d6319e8a8cd2e8a08/v1/js/codef_scrolltext.js)

<a id="galway-music"></a>
## Martin Galway original music sources

[Original source](https://github.com/MartinGalway/C64_music). Checked 2026-11-18.

Credit: Martin Galway.

License record: GPL-3.0; README requests Martin Galway credit. Reuse category: copyleft.

Useful addition: Study the Wizball first-generation driver and historical instrument/event structure.

Limits: Author publishes original code and music and invites modification. Preserve license and original credit when deriving a player or tune.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/README.md).

Pinned revision: `a458a3687e27a63647bbe41968094f0e6d0965a0`.

License evidence: [1](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/LICENSE).

Source entry points:

- [wizball.asm](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/wizball.asm)
- [arkanoid.asm](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/arkanoid.asm)
- [greenberet.asm](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/greenberet.asm)
- [arkadrum.asm](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/arkadrum.asm)
- [ocean_assembler_directives.txt](https://github.com/MartinGalway/C64_music/blob/a458a3687e27a63647bbe41968094f0e6d0965a0/ocean_assembler_directives.txt)

<a id="goattracker2"></a>
## GoatTracker 2 source mirror

[Original source](https://github.com/leafo/goattracker2). Checked 2026-11-18.

Credit: Lasse Öörni (Cadaver / Covert Bitops); leafo, fork publisher; Dag Lem, reSID.

License record: GPL-2.0 for editor; verify exported-player terms separately. Reuse category: copyleft.

Useful addition: Learn wavetable, pulsetable, filtertable, hard-restart and player feature stripping.

Limits: Use the author's official tools page for current releases. This is a pinned fork. Editor licensing does not by itself establish song or export-player terms.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/authors), [2](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/readme.txt).

Pinned revision: `a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667`.

License evidence: [1](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/copying).

Source entry points:

- [src/player.s](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/src/player.s)
- [src/altplayer.s](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/src/altplayer.s)
- [src/gplay.c](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/src/gplay.c)
- [readme.txt](https://github.com/leafo/goattracker2/blob/a78e7e5273bfbeb17c3777b1f5ceb63b8e6b4667/readme.txt)

<a id="image2petscii"></a>
## PETSCII image converter

[Original source](https://github.com/Esshahn/image2petscii). Checked 2026-11-18.

Credit: awsm / Esshahn and source-file contributors.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Add character matching, dithering and palette constraints to a future PETSCII encoder.

Limits: Useful tool reference. Verify code and charset provenance before redistribution.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Esshahn/image2petscii/blob/d437f22cb36b5b2727da24c1653d88813e80ab90/README.md).

Pinned revision: `d437f22cb36b5b2727da24c1653d88813e80ab90`.

Source entry points:

- [README.md](https://github.com/Esshahn/image2petscii/blob/d437f22cb36b5b2727da24c1653d88813e80ab90/README.md)

<a id="kickass-crunchers"></a>
## KickAssembler cruncher plugins

[Original source](https://github.com/p-a/kickass-cruncher-plugins). Checked 2026-11-18.

Credit: p-a and contributors; Magnus Lind, Exomizer; David Malmborg, ByteBoozer; Mads Nielsen, KickAssembler.

License record: MIT wrapper; embedded crunchers retain notices. Reuse category: scoped.

Useful addition: Design explicit host build stages for compression rather than runtime packing.

Limits: Plugin is KickAssembler-specific. Underlying algorithms and distribution terms must be reviewed separately.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/README.md).

Pinned revision: `577b6177e151c0ca89def2784c8e0a85bfbd208d`.

License evidence: [1](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/LICENSE.txt).

Source entry points:

- [src/asm/b2_decruncher.inc](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/src/asm/b2_decruncher.inc)
- [src/asm/b2_decrzero.inc](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/src/asm/b2_decrzero.inc)
- [src/asm/bb_decruncher_opt.inc](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/src/asm/bb_decruncher_opt.inc)
- [src/asm/exodecr.inc](https://github.com/p-a/kickass-cruncher-plugins/blob/577b6177e151c0ca89def2784c8e0a85bfbd208d/src/asm/exodecr.inc)

<a id="lzsa"></a>
## LZSA 6502 decoders

[Original source](https://github.com/emmanuel-marty/lzsa). Checked 2026-11-18.

Credit: Emmanuel Marty; Peter Ferrie, fast decoders; John Brandwood, faster decoders.

License record: Zlib for fast/small decoders; BSL-1.0 for John Brandwood faster decoders; CC0 match finder. Reuse category: permissive.

Useful addition: Compare byte-oriented fast and small decoders for animations and large tables.

Limits: LZSA1 and LZSA2 have different formats. Preserve decoder-specific author notices and mark modifications.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/README.md).

Pinned revision: `15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5`.

License evidence: [1](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/LICENSE), [2](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/LICENSE.cc0.md), [3](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/LICENSE.zlib.md), [4](https://www.boost.org/LICENSE_1_0.txt).

Source entry points:

- [asm/6502/decompress_fast_v1.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_fast_v1.asm)
- [asm/6502/decompress_fast_v2.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_fast_v2.asm)
- [asm/6502/decompress_faster_v1.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_faster_v1.asm)
- [asm/6502/decompress_faster_v2.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_faster_v2.asm)
- [asm/6502/decompress_small_v1.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_small_v1.asm)
- [asm/6502/decompress_small_v2.asm](https://github.com/emmanuel-marty/lzsa/blob/15ee2dfe118eeb8f7683ca44f64821c3a61ca1e5/asm/6502/decompress_small_v2.asm)

Archived source: [lzsa](upstream/lzsa/). File URLs and SHA-256 values are in the manifest.

<a id="magic-desk"></a>
## Magic Desk cartridge helpers

[Original source](https://github.com/c64lib/magic-desk-crt). Checked 2026-11-18.

Credit: Maciej Małecki and c64lib contributors.

License record: MIT. Reuse category: permissive.

Useful addition: Add banked asset delivery when a production outgrows a single PRG.

Limits: A separate cartridge target, not a replacement for the current D64 build.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/c64lib/magic-desk-crt/blob/d225cf945fe266c5a4f39a9ba599e24b3fc11f28/README.md).

Pinned revision: `d225cf945fe266c5a4f39a9ba599e24b3fc11f28`.

License evidence: [1](https://github.com/c64lib/magic-desk-crt/blob/d225cf945fe266c5a4f39a9ba599e24b3fc11f28/LICENSE).

Source entry points:

- [examples/slideshow/slideshow.asm](https://github.com/c64lib/magic-desk-crt/blob/d225cf945fe266c5a4f39a9ba599e24b3fc11f28/examples/slideshow/slideshow.asm)
- [lib/bootstrap.asm](https://github.com/c64lib/magic-desk-crt/blob/d225cf945fe266c5a4f39a9ba599e24b3fc11f28/lib/bootstrap.asm)
- [lib/loader.asm](https://github.com/c64lib/magic-desk-crt/blob/d225cf945fe266c5a4f39a9ba599e24b3fc11f28/lib/loader.asm)

Archived source: [magic-desk](upstream/magic-desk/). File URLs and SHA-256 values are in the manifest.

<a id="magsid"></a>
## MagSID player and tracker

[Original source](https://github.com/MagnarHarestad/MagSID). Checked 2026-11-18.

Credit: Magnar Harestad / Censor Design; Dag Lem, reSID; Krikkit, Slaygon, Bob and Swallow credited by upstream.

License record: Editor GPL-2.0-or-later; README explicitly permits exported SID releases. Reuse category: scoped.

Useful addition: Evaluate song-dependent assembly that omits unused vibrato and slide code.

Limits: README grants use of exported player/song files in releases; individual imported MIDI files keep their own terms. Player updates include a patch against Censor sources.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/README.md).

Pinned revision: `9fde61b74c89341b0855af38c885f5ef87e599f8`.

License evidence: [1](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/LICENSE), [2](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/README.md).

Source entry points:

- [src/MagSid.Assembler/PlayerProgram.cs](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/src/MagSid.Assembler/PlayerProgram.cs)
- [src/MagSid.Assembler/EmulatedPlayer.cs](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/src/MagSid.Assembler/EmulatedPlayer.cs)
- [tests/MagSid.Assembler.Tests/Goldens/player.patch](https://github.com/MagnarHarestad/MagSID/blob/9fde61b74c89341b0855af38c885f5ef87e599f8/tests/MagSid.Assembler.Tests/Goldens/player.patch)

<a id="megapetscii"></a>
## MegaPETSCII

[Original source](https://github.com/mankeli/megapetscii). Checked 2026-11-18.

Credit: Ash Checksum/HACKERS; Hi-Stack/HACKERS; Van Damme/HACKERS; Zero Cool/HACKERS; Krill/Plush; Doynax; Bitbreaker/Oxyron; Cadaver/Covert Bitops; Marq/FIT.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Design a PETSCII animation encoder with changed-cell runs and frame scheduling.

Limits: Hashembler and host preprocessing are required. Preserve the README's distinct program, visual, sound, loader and cruncher credits.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/mankeli/megapetscii/blob/cc09379f85521705c3a03d9736812fe1942c0cd2/README.md).

Pinned revision: `cc09379f85521705c3a03d9736812fe1942c0cd2`.

Source entry points:

- [actual.hasm.cpp](https://github.com/mankeli/megapetscii/blob/cc09379f85521705c3a03d9736812fe1942c0cd2/actual.hasm.cpp)
- [megapetscii/prepare_screens.cpp](https://github.com/mankeli/megapetscii/blob/cc09379f85521705c3a03d9736812fe1942c0cd2/megapetscii/prepare_screens.cpp)
- [spiralclear.cpp](https://github.com/mankeli/megapetscii/blob/cc09379f85521705c3a03d9736812fe1942c0cd2/spiralclear.cpp)

<a id="oscar64"></a>
## Oscar64 compiler and C64 examples

[Original source](https://github.com/drmortalwombat/oscar64). Checked 2026-11-18.

Credit: Dr. Mortal Wombat / drmortalwombat and contributors.

License record: GPL-3.0 for compiler; inspect runtime/output terms. Reuse category: copyleft.

Useful addition: Compare generated code for fixed-point math and C64-specific graphics routines.

Limits: Compiler and sample/runtime licensing need separate review. This adds a toolchain, not a drop-in assembly include.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/README.md).

Pinned revision: `08b01c9ec14f0c6080c3a26be7adb16b1a0d6432`.

License evidence: [1](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/LICENSE).

Source entry points:

- [include/c64/rasterirq.c](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/include/c64/rasterirq.c)
- [include/c64/sprites.c](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/include/c64/sprites.c)
- [samples/rasterirq/colorbars.c](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/samples/rasterirq/colorbars.c)
- [samples/rasterirq/openborder.c](https://github.com/drmortalwombat/oscar64/blob/08b01c9ec14f0c6080c3a26be7adb16b1a0d6432/samples/rasterirq/openborder.c)

<a id="oxyron-opcodes"></a>
## 6502/6510 opcode matrix

[Original source](https://www.oxyron.de/html/opcodes02.html). Checked 2026-11-18.

Credit: Graham / Oxyron.

License record: Reference only; copyright notice on page. Reuse category: reference.

Useful addition: Validate instruction counts, page-crossing penalties and optional undocumented-opcode kernels.

Limits: NMOS instruction reference including undocumented opcodes. Do not assume identical behavior on 65C02 or newer variants.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://www.oxyron.de/html/opcodes02.html).

License evidence: [1](https://www.oxyron.de/html/opcodes02.html).

<a id="perpetual-fragility"></a>
## Perpetual Fragility explanation

[Original source](https://hd0.linusakesson.net/scene/perpetual-fragility/index.php). Checked 2026-11-18.

Credit: Linus Åkesson (LFT).

License record: No reuse license established for this page. Reuse category: reference.

Useful addition: Study how reused graphics structures create dense particle motion within a small memory budget.

Limits: An explained production with demo and compact music downloads. Do not infer a license from their availability.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://hd0.linusakesson.net/scene/perpetual-fragility/index.php).

License evidence: [1](https://hd0.linusakesson.net/scene/perpetual-fragility/index.php).

<a id="png2spd"></a>
## PNG to SpritePad converter

[Original source](https://github.com/Esshahn/png2spd). Checked 2026-11-18.

Credit: awsm / Esshahn.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Specify sprite-sheet slicing and 24-by-21 pixel alignment for our own converter.

Limits: A small Python converter; SpritePad output is an interchange format, not a runtime module.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Esshahn/png2spd/blob/3e01e896dd017dcfe698cbae88acb8c215cdb3ca/readme.md).

Pinned revision: `3e01e896dd017dcfe698cbae88acb8c215cdb3ca`.

Source entry points:

- [readme.md](https://github.com/Esshahn/png2spd/blob/3e01e896dd017dcfe698cbae88acb8c215cdb3ca/readme.md)

<a id="puterman-introduction"></a>
## Introduction to C64 demo programming

[Original source](https://github.com/pstankiewicz/introduction-c64-demo-programming). Checked 2026-11-18.

Credit: Puterman, original author; pstankiewicz, conversion publisher.

License record: No license found. Reuse category: reference.

Useful addition: Use as a learning sequence for raster interrupts and basic effect parts.

Limits: This is a reStructuredText conversion. Credit the original author as well as the conversion publisher.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/pstankiewicz/introduction-c64-demo-programming/blob/469c6bc416489d170a74cb1f265cfa6213a2054d/README.md).

Pinned revision: `469c6bc416489d170a74cb1f265cfa6213a2054d`.

Source entry points:

- [README.md](https://github.com/pstankiewicz/introduction-c64-demo-programming/blob/469c6bc416489d170a74cb1f265cfa6213a2054d/README.md)

<a id="quadtrip-2017"></a>
## Quadtrip C64 demo source

[Original source](https://github.com/visy/c64demo2017). Checked 2026-11-18.

Credit: Visy / Quadtrip; original bundled tools and media authors.

License record: WTFPL at repository root; bundled components retain their licenses. Reuse category: scoped.

Useful addition: Study a complete production's part sequencing and memory allocation.

Limits: The tree bundles GoatTracker, libraries and media. A root license is not sufficient evidence for every component.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/README.txt).

Pinned revision: `6ff438f2b331aefec346156ded4f62d437c26652`.

License evidence: [1](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/LICENSE.txt).

Source entry points:

- [GoatTracker/examples/src/example1.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/example1.s)
- [GoatTracker/examples/src/example2.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/example2.s)
- [GoatTracker/examples/src/example3.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/example3.s)
- [GoatTracker/examples/src/example4.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/example4.s)
- [GoatTracker/examples/src/sfx_arp1.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/sfx_arp1.s)
- [GoatTracker/examples/src/sfx_arp2.s](https://github.com/visy/c64demo2017/blob/6ff438f2b331aefec346156ded4f62d437c26652/GoatTracker/examples/src/sfx_arp2.s)

<a id="quesada-misc"></a>
## C64 plasma, plotters and scrollers

[Original source](https://github.com/ricardoquesada/c64-misc). Checked 2026-11-18.

Credit: Ricardo Quesada and per-file contributors.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study color-RAM plasma and several character/bitmap scroller sizes.

Limits: cc65/ca65 sources. The repository includes separately authored tunes.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/ricardoquesada/c64-misc/blob/8bd2e595400e80629dd0d380de798bafaffd8bbb/README.md).

Pinned revision: `8bd2e595400e80629dd0d380de798bafaffd8bbb`.

Source entry points:

- [plasma/plasma_d800.s](https://github.com/ricardoquesada/c64-misc/blob/8bd2e595400e80629dd0d380de798bafaffd8bbb/plasma/plasma_d800.s)
- [plotters/plotter_bitmap_mc.s](https://github.com/ricardoquesada/c64-misc/blob/8bd2e595400e80629dd0d380de798bafaffd8bbb/plotters/plotter_bitmap_mc.s)
- [scrollers/2x2-scroller-multi-with-rasterbars.s](https://github.com/ricardoquesada/c64-misc/blob/8bd2e595400e80629dd0d380de798bafaffd8bbb/scrollers/2x2-scroller-multi-with-rasterbars.s)
- [misc/vic_detect.s](https://github.com/ricardoquesada/c64-misc/blob/8bd2e595400e80629dd0d380de798bafaffd8bbb/misc/vic_detect.s)

<a id="raistlin-big-animating-sprite-logo"></a>
## Big Animating Sprite Logo

[Original source](https://c64demo.com/big-animating-sprite-logo/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/big-animating-sprite-logo/).

License evidence: [1](https://c64demo.com/big-animating-sprite-logo/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/big-animating-sprite-logo/index.md)

Archived source: [raistlin-big-animating-sprite-logo](upstream/raistlin-big-animating-sprite-logo/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-big-parallax-logo-mover"></a>
## Big Layered Logo Mover

[Original source](https://c64demo.com/big-parallax-logo-mover/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/big-parallax-logo-mover/).

License evidence: [1](https://c64demo.com/big-parallax-logo-mover/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/big-parallax-logo-mover/index.md)

Archived source: [raistlin-big-parallax-logo-mover](upstream/raistlin-big-parallax-logo-mover/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-dxycp-scrollers"></a>
## DXYCP Scrollers

[Original source](https://c64demo.com/dxycp-scrollers/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/dxycp-scrollers/).

License evidence: [1](https://c64demo.com/dxycp-scrollers/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/dxycp-scrollers/index.md)

Archived source: [raistlin-dxycp-scrollers](upstream/raistlin-dxycp-scrollers/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-finite-bobs-nobounds"></a>
## Finite Bobs

[Original source](https://c64demo.com/finite-bobs-nobounds/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/finite-bobs-nobounds/).

License evidence: [1](https://c64demo.com/finite-bobs-nobounds/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/finite-bobs-nobounds/index.md)

Archived source: [raistlin-finite-bobs-nobounds](upstream/raistlin-finite-bobs-nobounds/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-memento-mori-all-border-double-dypp"></a>
## All Border Double DYPP

[Original source](https://c64demo.com/memento-mori-all-border-double-dypp/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/memento-mori-all-border-double-dypp/).

License evidence: [1](https://c64demo.com/memento-mori-all-border-double-dypp/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/memento-mori-all-border-double-dypp/index.md)

Archived source: [raistlin-memento-mori-all-border-double-dypp](upstream/raistlin-memento-mori-all-border-double-dypp/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-releases"></a>
## Genesis Project production sources

[Original source](https://github.com/RobertTroughton/C64Demo-PublicReleases). Checked 2026-11-18.

Credit: Robert Troughton (Raistlin), Genesis Project; individual production contributors.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study effect-specific generators for No Bounds and Memento Mori; extract a new host-side generator design.

Limits: Full productions with C++ generators and assembly. Article code has separate reuse terms; do not extend those terms to the entire repository.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/README.md).

Pinned revision: `965807c511e2025b5c5e1ffb2a6235a4efd6ae5b`.

Source entry points:

- [MementoMori/6502/Parts/AllBorderDoubleDYPP/AllBorderDoubleDYPP.asm](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/MementoMori/6502/Parts/AllBorderDoubleDYPP/AllBorderDoubleDYPP.asm)
- [MementoMori/6502/Parts/MCPlasma/MCPlasma.asm](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/MementoMori/6502/Parts/MCPlasma/MCPlasma.asm)
- [MementoMori/6502/Parts/RCTunnel/RCTunnel.asm](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/MementoMori/6502/Parts/RCTunnel/RCTunnel.asm)
- [MementoMori/PC/Parts/SpritePlex.cpp](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/MementoMori/PC/Parts/SpritePlex.cpp)
- [NoBounds/Parts/BigDXYCP/BigDXYCP.cpp](https://github.com/RobertTroughton/C64Demo-PublicReleases/blob/965807c511e2025b5c5e1ffb2a6235a4efd6ae5b/NoBounds/Parts/BigDXYCP/BigDXYCP.cpp)

<a id="raistlin-remastering-sabre-wulf-part-one"></a>
## Remastering Sabre Wulf - Part One

[Original source](https://c64demo.com/remastering-sabre-wulf-part-one/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/remastering-sabre-wulf-part-one/).

License evidence: [1](https://c64demo.com/remastering-sabre-wulf-part-one/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/remastering-sabre-wulf-part-one/index.md)

Archived source: [raistlin-remastering-sabre-wulf-part-one](upstream/raistlin-remastering-sabre-wulf-part-one/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-remastering-sabre-wulf-part-two"></a>
## Remastering Sabre Wulf - Part Two

[Original source](https://c64demo.com/remastering-sabre-wulf-part-two/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/remastering-sabre-wulf-part-two/).

License evidence: [1](https://c64demo.com/remastering-sabre-wulf-part-two/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/remastering-sabre-wulf-part-two/index.md)

Archived source: [raistlin-remastering-sabre-wulf-part-two](upstream/raistlin-remastering-sabre-wulf-part-two/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-scrolling-bob-scroller"></a>
## Scrolling Bob Scroller

[Original source](https://c64demo.com/scrolling-bob-scroller/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/scrolling-bob-scroller/).

License evidence: [1](https://c64demo.com/scrolling-bob-scroller/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/scrolling-bob-scroller/index.md)

Archived source: [raistlin-scrolling-bob-scroller](upstream/raistlin-scrolling-bob-scroller/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-seamless-loading-nobounds"></a>
## Seamless Loading in No Bounds

[Original source](https://c64demo.com/seamless-loading-nobounds/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/seamless-loading-nobounds/).

License evidence: [1](https://c64demo.com/seamless-loading-nobounds/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/seamless-loading-nobounds/index.md)

Archived source: [raistlin-seamless-loading-nobounds](upstream/raistlin-seamless-loading-nobounds/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-side-border-bitmap-scroller"></a>
## Side Border Bitmap Scroller

[Original source](https://c64demo.com/side-border-bitmap-scroller/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/side-border-bitmap-scroller/).

License evidence: [1](https://c64demo.com/side-border-bitmap-scroller/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/side-border-bitmap-scroller/index.md)

Archived source: [raistlin-side-border-bitmap-scroller](upstream/raistlin-side-border-bitmap-scroller/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-sprite-interleave"></a>
## Sprite Interleave

[Original source](https://c64demo.com/sprite-interleave/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/sprite-interleave/).

License evidence: [1](https://c64demo.com/sprite-interleave/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/sprite-interleave/index.md)

Archived source: [raistlin-sprite-interleave](upstream/raistlin-sprite-interleave/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-star-wars-scrollers"></a>
## Star Wars Scrollers

[Original source](https://c64demo.com/star-wars-scrollers/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/star-wars-scrollers/).

License evidence: [1](https://c64demo.com/star-wars-scrollers/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/star-wars-scrollers/index.md)

Archived source: [raistlin-star-wars-scrollers](upstream/raistlin-star-wars-scrollers/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-stopping-music-popping"></a>
## Stopping Music Popping

[Original source](https://c64demo.com/stopping-music-popping/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/stopping-music-popping/).

License evidence: [1](https://c64demo.com/stopping-music-popping/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/stopping-music-popping/index.md)

Archived source: [raistlin-stopping-music-popping](upstream/raistlin-stopping-music-popping/). File URLs and SHA-256 values are in the manifest.

<a id="raistlin-welcome-to-sidblaster"></a>
## Welcome to SIDBlaster

[Original source](https://c64demo.com/welcome-to-sidblaster/). Checked 2026-11-18.

Credit: Raistlin / Genesis Project.

License record: CC-BY-4.0 for article; code also offered under MIT. Reuse category: attribution.

Useful addition: Use the annotated implementation and its code generation or timing approach as a starting point for a credited 64tass adaptation.

Limits: Article grant covers the author's text/code. Other productions, screenshots and artwork keep their original rights. Original Markdown is unmodified; linked images are not copied. No effect is integrated into the engine.

Review scope: Original author-provided Markdown and explicit license header inspected; code not assembled or emulated.

Credit evidence: [1](https://c64demo.com/welcome-to-sidblaster/).

License evidence: [1](https://c64demo.com/welcome-to-sidblaster/), [2](https://c64demo.com/about/).

Source entry points:

- [index.md](https://c64demo.com/welcome-to-sidblaster/index.md)

Archived source: [raistlin-welcome-to-sidblaster](upstream/raistlin-welcome-to-sidblaster/). File URLs and SHA-256 values are in the manifest.

<a id="retro-debugger"></a>
## Retro Debugger

[Original source](https://github.com/slajerek/RetroDebugger). Checked 2026-11-18.

Credit: Slajerek and contributors; VICE and bundled library authors.

License record: Upstream README describes multiple component licenses. Reuse category: scoped.

Useful addition: Inspect memory, sprite data, raster timing and execution while developing new parts.

Limits: Keep this as an external development tool. Reusing bundled code requires component review.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/README.md).

Pinned revision: `73e134275992a5fc9e922065b9f04ad5a7511e9c`.

Source entry points:

- [src/Emulators/atari800/vtxsmpls.inc](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/src/Emulators/atari800/vtxsmpls.inc)
- [src/Plugins/GoatTracker/gt2/altplayer.s](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/src/Plugins/GoatTracker/gt2/altplayer.s)
- [src/Plugins/GoatTracker/gt2/player.s](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/src/Plugins/GoatTracker/gt2/player.s)
- [tools/Exomizer-Decrunch/exodecrunch.s](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/tools/Exomizer-Decrunch/exodecrunch.s)
- [tools/Exomizer-Decrunch/main.s](https://github.com/slajerek/RetroDebugger/blob/73e134275992a5fc9e922065b9f04ad5a7511e9c/tools/Exomizer-Decrunch/main.s)

<a id="retropixels"></a>
## Retropixels image converter

[Original source](https://github.com/micheldebree/retropixels). Checked 2026-11-18.

Credit: Michel de Bree and contributors.

License record: MIT. Reuse category: permissive.

Useful addition: Add palette-aware quantization and Koala conversion with a matching viewer.

Limits: Multicolor and other output modes need a runtime display path; they are not compatible with the existing headerless hires input by default.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/README.md).

Pinned revision: `a5caf5b889eff11528768cf6b1d16585c47b4122`.

License evidence: [1](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/LICENSE).

Source entry points:

- [cli/c64/afli.asm](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/cli/c64/afli.asm)
- [cli/c64/artstudio.asm](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/cli/c64/artstudio.asm)
- [cli/c64/fli.asm](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/cli/c64/fli.asm)
- [cli/c64/koala.asm](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/cli/c64/koala.asm)
- [cli/c64/macros.asm](https://github.com/micheldebree/retropixels/blob/a5caf5b889eff11528768cf6b1d16585c47b4122/cli/c64/macros.asm)

<a id="rip-and-tear"></a>
## Reverse-engineering notes

[Original source](https://github.com/yupferris/rip-and-tear). Checked 2026-11-18.

Credit: Ferris / yupferris, notes; original demo authors retain their credits.

License record: No license found. Reuse category: reference.

Useful addition: Use VICE monitor experiments to identify an effect's actual data flow.

Limits: Save states and notes do not grant rights to underlying productions.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/yupferris/rip-and-tear/blob/eada1ee2d45f984a7910562395345994b17fc1af/README.md).

Pinned revision: `eada1ee2d45f984a7910562395345994b17fc1af`.

Source entry points:

- [README.md](https://github.com/yupferris/rip-and-tear/blob/eada1ee2d45f984a7910562395345994b17fc1af/README.md)

<a id="safe-vsp"></a>
## Safe VSP technical explanation

[Original source](https://www.linusakesson.net/scene/safevsp/). Checked 2026-11-18.

Credit: Linus Åkesson (LFT); Zer0-X, captured crash data.

License record: No reuse license established for this page. Reuse category: reference.

Useful addition: Keep VSP effects opt-in and study safe layouts or a conventional scrolling fallback.

Limits: This is hardware-failure analysis. Emulator success cannot establish safety on crash-prone DRAM hardware. No code or music copied.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://www.linusakesson.net/scene/safevsp/).

License evidence: [1](https://www.linusakesson.net/scene/safevsp/).

<a id="sid-factory-2"></a>
## SID Factory II

[Original source](https://github.com/Chordian/sidfactory2). Checked 2026-11-18.

Credit: Thomas Egeskov Petersen; Jens-Christian Huus; Michel de Bree; Thomas Jansson; driver authors Laxity and JCH.

License record: GPL-2.0 in SIDFactoryII/COPYING; driver terms require review. Reuse category: copyleft.

Useful addition: Explore export relocation, selectable drivers, PAL/NTSC support and instrument editing.

Limits: Editor, emulation, individual music drivers and demo tunes need separate attribution and scope checks.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Chordian/sidfactory2/blob/c72b7106fb7d9e081f982183515d5e73f915859f/README.md).

Pinned revision: `c72b7106fb7d9e081f982183515d5e73f915859f`.

License evidence: [1](https://github.com/Chordian/sidfactory2/blob/c72b7106fb7d9e081f982183515d5e73f915859f/SIDFactoryII/COPYING).

Source entry points:

- [SIDFactoryII/source/runtime/editor/driver/driver_utils.cpp](https://github.com/Chordian/sidfactory2/blob/c72b7106fb7d9e081f982183515d5e73f915859f/SIDFactoryII/source/runtime/editor/driver/driver_utils.cpp)
- [SIDFactoryII/COPYING](https://github.com/Chordian/sidfactory2/blob/c72b7106fb7d9e081f982183515d5e73f915859f/SIDFactoryII/COPYING)

<a id="sid-instruments"></a>
## Reusable SID instrument library

[Original source](https://github.com/JC-000/c64-sid-instruments). Checked 2026-11-18.

Credit: JC-000, publishing handle; no separate patch author named in inspected instrument READMEs; Lawrence Fritts, University of Iowa violin reference recordings.

License record: CC-BY-4.0 for instruments. Reuse category: attribution.

Useful addition: Create a credited instrument bank for piano, guitar and violin with tracker exports.

Limits: The root README declares CC-BY-4.0 for instruments. Inspected instrument READMEs do not name separate patch authors, despite the root attribution instruction. Credit JC-000 and source URLs; confirm author and reference-sample provenance before release. Reference audio and third-party presets are omitted.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/README.md), [2](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/grand-piano/README.md), [3](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/acoustic-guitar/README.md), [4](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/violin/README.md).

Pinned revision: `2af3d5cb422bb523ed0ea624539391a0c44646fe`.

License evidence: [1](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/LICENSE).

Source entry points:

- [instruments/acoustic-guitar/6581/acoustic-guitar-6581.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/acoustic-guitar/6581/acoustic-guitar-6581.asm)
- [instruments/acoustic-guitar/8580/acoustic-guitar-8580.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/acoustic-guitar/8580/acoustic-guitar-8580.asm)
- [instruments/grand-piano/6581/grand-piano-6581.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/grand-piano/6581/grand-piano-6581.asm)
- [instruments/grand-piano/8580/grand-piano-8580.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/grand-piano/8580/grand-piano-8580.asm)
- [instruments/violin/6581/violin-6581.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/violin/6581/violin-6581.asm)
- [instruments/violin/8580/violin-8580.asm](https://github.com/JC-000/c64-sid-instruments/blob/2af3d5cb422bb523ed0ea624539391a0c44646fe/instruments/violin/8580/violin-8580.asm)

Archived source: [sid-instruments](upstream/sid-instruments/). File URLs and SHA-256 values are in the manifest.

<a id="sid-wizard"></a>
## SID-Wizard source via Vessel fork

[Original source](https://github.com/anarkiwi/sid-wizard). Checked 2026-11-18.

Credit: Mihaly Horvath (Hermit); Soci / Singular Crew; anarkiwi, Vessel fork.

License record: README declares WTF licensing; inspect individual components. Reuse category: scoped.

Useful addition: Study a native 64tass tracker/player and reusable wave, pulse and filter tables.

Limits: Fork adds Vessel support. Do not generalize the README declaration to bundled music or third-party material.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/anarkiwi/sid-wizard/blob/2bf1703dca907d59b587d7829989215ec855a009/README.txt).

Pinned revision: `2bf1703dca907d59b587d7829989215ec855a009`.

License evidence: [1](https://github.com/anarkiwi/sid-wizard/blob/2bf1703dca907d59b587d7829989215ec855a009/README.txt).

Source entry points:

- [native/sources/include/player.asm](https://github.com/anarkiwi/sid-wizard/blob/2bf1703dca907d59b587d7829989215ec855a009/native/sources/include/player.asm)
- [native/sources/exporter.asm](https://github.com/anarkiwi/sid-wizard/blob/2bf1703dca907d59b587d7829989215ec855a009/native/sources/exporter.asm)
- [native/sources/editor.asm](https://github.com/anarkiwi/sid-wizard/blob/2bf1703dca907d59b587d7829989215ec855a009/native/sources/editor.asm)

<a id="sidreloc"></a>
## Sidreloc 1.0

[Original source](https://linusakesson.net/software/sidreloc/index.php). Checked 2026-11-18.

Credit: Linus Åkesson (LFT); Ian Piumarta, original CPU emulator.

License record: MIT for Sidreloc; Ian Piumarta permissive notice for cpu.c. Reuse category: permissive.

Useful addition: Add an optional host-side relocation step for authorized SID assets.

Limits: Relocation changes code placement, not tune reuse rights. Not every SID program can be relocated. Validate output SID writes. The cpu.c notice also requires its copyright and permission text in supporting documentation; it is reproduced in CREDITS.md.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://linusakesson.net/software/sidreloc/index.php).

Pinned revision: `1.0`.

License evidence: [1](https://linusakesson.net/software/sidreloc/index.php).

Source entry points:

- [sidreloc.c](https://hd0.linusakesson.net/files/sidreloc-1.0.tgz)
- [solver.c](https://hd0.linusakesson.net/files/sidreloc-1.0.tgz)
- [cpu.c](https://hd0.linusakesson.net/files/sidreloc-1.0.tgz)

Archived source: [sidreloc](upstream/sidreloc/). File URLs and SHA-256 values are in the manifest.

Release archive: [download](https://hd0.linusakesson.net/files/sidreloc-1.0.tgz), SHA-256 `8ca55fb4886bda2a499f837e2f9ffd0a4b7217ee7bb1907ceed9e87ef6157bf6`.

<a id="spaceballs"></a>
## Spaceballs effect skeleton and design notes

[Original source](https://github.com/betaper/spaceballs). Checked 2026-11-18.

Credit: Alex Feller (betaper); Randall, Press Space music.

License record: BSD-2-Clause for code. Reuse category: permissive.

Useful addition: Use the design as a prompt for a new fixed-point sprite-physics module; do not treat the skeleton as a working physics engine.

Limits: The checked source is an unfinished loader/music skeleton. Physics and beat impulses are goals in the README, not implemented reusable routines. Randall's tune is credited but omitted.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/betaper/spaceballs/blob/42dffa9a967bc3ba415bf260cae43d966ae3b08f/CREDITS), [2](https://github.com/betaper/spaceballs/blob/42dffa9a967bc3ba415bf260cae43d966ae3b08f/README.md).

Pinned revision: `42dffa9a967bc3ba415bf260cae43d966ae3b08f`.

License evidence: [1](https://github.com/betaper/spaceballs/blob/42dffa9a967bc3ba415bf260cae43d966ae3b08f/LICENSE).

Source entry points:

- [spaceballs.acm](https://github.com/betaper/spaceballs/blob/42dffa9a967bc3ba415bf260cae43d966ae3b08f/spaceballs.acm)
- [sb_music.acm](https://github.com/betaper/spaceballs/blob/42dffa9a967bc3ba415bf260cae43d966ae3b08f/sb_music.acm)

Archived source: [spaceballs](upstream/spaceballs/). File URLs and SHA-256 values are in the manifest.

<a id="sparkle"></a>
## Sparkle loader and linker

[Original source](https://github.com/spartaomg/SparkleCPP). Checked 2026-11-18.

Credit: Sparta / OMG.

License record: BSD-3-Clause. Reuse category: permissive.

Useful addition: Add multipart streaming with music continuity and generated disk layout.

Limits: Resident and drive-side code need reserved RAM, zero page and an IRQ that preserves the memory port. Validate actual storage compatibility.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/README.md).

Pinned revision: `24b8edb0f9099400ae67ac0d0804a6f293ba08f5`.

License evidence: [1](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/LICENSE).

Source entry points:

- [resources/Sparkle.inc](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/Sparkle.inc)
- [resources/SparkleCustom.inc](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/SparkleCustom.inc)
- [resources/sc.asm](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/sc.asm)
- [resources/sd.asm](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/sd.asm)
- [resources/sd_.asm](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/sd_.asm)
- [resources/sl.asm](https://github.com/spartaomg/SparkleCPP/blob/24b8edb0f9099400ae67ac0d0804a6f293ba08f5/resources/sl.asm)

Archived source: [sparkle](upstream/sparkle/). File URLs and SHA-256 values are in the manifest.

<a id="spindle"></a>
## Spindle 3.1

[Original source](https://linusakesson.net/software/spindle/v3.php). Checked 2026-11-18.

Credit: Linus Åkesson (LFT).

License record: MIT for src; public domain for template. Reuse category: permissive.

Useful addition: Add an optional multipart trackmo backend and resource lifetime declarations.

Limits: Full src and template are archived; examples, music and prebuilt executables are omitted. Loader integration requires a memory/IRQ redesign.

Review scope: Primary project page inspected. No program execution.

Credit evidence: [1](https://linusakesson.net/software/spindle/v3.php).

Pinned revision: `3.1`.

License evidence: [1](https://linusakesson.net/software/spindle/v3.php).

Source entry points:

- [src/drivecode.s](https://hd0.linusakesson.net/files/spindle-3.1.zip)
- [src/pefchain.c](https://hd0.linusakesson.net/files/spindle-3.1.zip)
- [template/effect.s](https://hd0.linusakesson.net/files/spindle-3.1.zip)

Archived source: [spindle](upstream/spindle/). File URLs and SHA-256 values are in the manifest.

Release archive: [download](https://hd0.linusakesson.net/files/spindle-3.1.zip), SHA-256 `4abbf757ed550d1da7aac3d9f04cf10566a1f6e9079780e02f84cfd4a164431b`.

<a id="spot"></a>
## SPOT picture optimization tool

[Original source](https://github.com/spartaomg/SPOT). Checked 2026-11-18.

Credit: Sparta / OMG.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study bitmap/screen-data optimization for streaming parts.

Limits: VB.NET host tool. Relevant to image packing; it is not a runtime display routine.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/spartaomg/SPOT/blob/0a4b9132dcd9f92344066469bdae6b6a4088ab11/README.md).

Pinned revision: `0a4b9132dcd9f92344066469bdae6b6a4088ab11`.

Source entry points:

- [README.md](https://github.com/spartaomg/SPOT/blob/0a4b9132dcd9f92344066469bdae6b6a4088ab11/README.md)

<a id="spritemate"></a>
## Spritemate sprite editor

[Original source](https://github.com/Esshahn/spritemate). Checked 2026-11-18.

Credit: awsm / Esshahn and contributors; Elliot Tanner, VICE snapshot monitor.

License record: MIT. Reuse category: permissive.

Useful addition: Add a SpritePad/KickAssembler export conversion step to the host asset pipeline.

Limits: Tool source is MIT. Sprites imported from games or snapshots retain their creators' rights.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Esshahn/spritemate/blob/e70a29d32a2040cc217193dfafc7f11418fc9cf4/README.md).

Pinned revision: `e70a29d32a2040cc217193dfafc7f11418fc9cf4`.

License evidence: [1](https://github.com/Esshahn/spritemate/blob/e70a29d32a2040cc217193dfafc7f11418fc9cf4/LICENSE).

Source entry points:

- [README.md](https://github.com/Esshahn/spritemate/blob/e70a29d32a2040cc217193dfafc7f11418fc9cf4/README.md)

<a id="steel-ranger-code"></a>
## Steel Ranger technical routines

[Original source](https://github.com/cadaver/steelranger-demo). Checked 2026-11-18.

Credit: Lasse Öörni (Cadaver / Covert Bitops).

License record: MIT for program code excluding story/dialogue; content reserved. Reuse category: permissive.

Useful addition: Study a sprite multiplexer/cache, scrolling, memory allocation and PAL/NTSC scheduling.

Limits: README explicitly reserves graphics, levels, music, sound effects and dialogue. Only selected technical .s files are copied.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/README.md).

Pinned revision: `fa99196cb94be80df12bd295adcce7567e860e44`.

License evidence: [1](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/README.md).

Source entry points:

- [actor.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/actor.s)
- [actordata.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/actordata.s)
- [aligneddata.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/aligneddata.s)
- [bg/worldglobalact.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/bg/worldglobalact.s)
- [bg/worldinfo.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/bg/worldinfo.s)
- [bg/worldlevel.s](https://github.com/cadaver/steelranger-demo/blob/fa99196cb94be80df12bd295adcce7567e860e44/bg/worldlevel.s)

Archived source: [steel-ranger-code](upstream/steel-ranger-code/). File URLs and SHA-256 values are in the manifest.

<a id="total"></a>
## Total

[Original source](https://github.com/mankeli/total). Checked 2026-11-18.

Credit: Barfly; Mankeli; Duce; Electric; Barracuda; TBB; Linus Åkesson (LFT).

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Study filter plotters, cylinders and raster effects as separate part designs.

Limits: Mixes assembly and Hashembler-generated code with a modified Spindle. Code, graphics and music have different contributors.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/README.md).

Pinned revision: `a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3`.

Source entry points:

- [src/annabel.asm](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/annabel.asm)
- [src/boot666.hasm.cpp](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/boot666.hasm.cpp)
- [src/burner.hasm.cpp](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/burner.hasm.cpp)
- [src/cylinder.asm](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/cylinder.asm)
- [src/duce.hasm.cpp](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/duce.hasm.cpp)
- [src/extfall.asm](https://github.com/mankeli/total/blob/a5aa02ab4e28a41d61e0b5c41019f6381c29a3b3/src/extfall.asm)

<a id="tscrunch"></a>
## TSCrunch 6502 decoders

[Original source](https://github.com/tonysavon/TSCrunch). Checked 2026-11-18.

Credit: Antonio Savona and contributors.

License record: Apache-2.0. Reuse category: permissive.

Useful addition: Compare a byte-aligned LZ/RLE decoder on large static assets and our sparse animation streams.

Limits: Regular, small and extreme decoders are KickAssembler sources. Account for zero page, in-place overlap and the chosen encoder format.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/tonysavon/TSCrunch/blob/16f7376d04c91b71477cd2159b4dedf0f1d8995c/README.md).

Pinned revision: `16f7376d04c91b71477cd2159b4dedf0f1d8995c`.

License evidence: [1](https://github.com/tonysavon/TSCrunch/blob/16f7376d04c91b71477cd2159b4dedf0f1d8995c/LICENSE).

Source entry points:

- [decrunch.asm](https://github.com/tonysavon/TSCrunch/blob/16f7376d04c91b71477cd2159b4dedf0f1d8995c/decrunch.asm)
- [decrunch_extreme.asm](https://github.com/tonysavon/TSCrunch/blob/16f7376d04c91b71477cd2159b4dedf0f1d8995c/decrunch_extreme.asm)
- [decrunch_small.asm](https://github.com/tonysavon/TSCrunch/blob/16f7376d04c91b71477cd2159b4dedf0f1d8995c/decrunch_small.asm)

Archived source: [tscrunch](upstream/tscrunch/). File URLs and SHA-256 values are in the manifest.

<a id="vice"></a>
## VICE emulator source and tests

[Original source](https://github.com/VICE-Team/svn-mirror). Checked 2026-11-18.

Credit: VICE team and individual test authors.

License record: GPL-2.0 in vice/COPYING; components retain notices. Reuse category: copyleft.

Useful addition: Extend our remote-monitor checks with frame, SID-write and cycle traces.

Limits: Emulator success does not prove behavior on every physical VIC-II/SID/DRAM combination.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/VICE-Team/svn-mirror/blob/83095dcbf3a535167fb864fc4801b0c8ef5be517/README.md).

Pinned revision: `83095dcbf3a535167fb864fc4801b0c8ef5be517`.

License evidence: [1](https://github.com/VICE-Team/svn-mirror/blob/83095dcbf3a535167fb864fc4801b0c8ef5be517/vice/COPYING).

Source entry points:

- [vice/COPYING](https://github.com/VICE-Team/svn-mirror/blob/83095dcbf3a535167fb864fc4801b0c8ef5be517/vice/COPYING)
- [vice/src/monitor/monitor.c](https://github.com/VICE-Team/svn-mirror/blob/83095dcbf3a535167fb864fc4801b0c8ef5be517/vice/src/monitor/monitor.c)

<a id="vicspector"></a>
## Interactive VIC-II guide

[Original source](https://github.com/elysium64/vicspector). Checked 2026-11-18.

Credit: Elysium64 and contributors identified by source.

License record: MIT. Reuse category: permissive.

Useful addition: Use as a companion when designing raster layouts and VIC register changes.

Limits: Interactive hardware reference, not an assembled C64 effect library.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/elysium64/vicspector/blob/c972f7a0a965d28096cc1396cab01fded307d818/README.md).

Pinned revision: `c972f7a0a965d28096cc1396cab01fded307d818`.

License evidence: [1](https://github.com/elysium64/vicspector/blob/c972f7a0a965d28096cc1396cab01fded307d818/LICENSE).

Source entry points:

- [README.md](https://github.com/elysium64/vicspector/blob/c972f7a0a965d28096cc1396cab01fded307d818/README.md)

<a id="viznut-c64"></a>
## Viznut C64 size-coded intros

[Original source](https://github.com/viznut/demoscene). Checked 2026-11-18.

Credit: Ville-Matias Heikkilä (Viznut / PWP).

License record: CC0-1.0. Reuse category: permissive.

Useful addition: Study procedural imagery, compact sequencing and the tradeoffs of very small intros.

Limits: Only dramatic_pixels and false_dimension are C64 entries here. Other directories target VIC-20, DOS or host systems.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/README.md).

Pinned revision: `0a9b663a18ce5c31a1243fbdb85794325eeed1d8`.

License evidence: [1](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/LICENSE).

Source entry points:

- [dramatic_pixels/dpix-1k.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/dramatic_pixels/dpix-1k.asm)
- [false_dimension/false_dimension.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/false_dimension/false_dimension.asm)
- [helium/helium.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/helium/helium.asm)
- [helium/int8.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/helium/int8.asm)
- [helium/phngball.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/helium/phngball.asm)
- [helium/player.asm](https://github.com/viznut/demoscene/blob/0a9b663a18ce5c31a1243fbdb85794325eeed1d8/helium/player.asm)

Archived source: [viznut-c64](upstream/viznut-c64/). File URLs and SHA-256 values are in the manifest.

<a id="zirias-demo"></a>
## Zirias demo part

[Original source](https://github.com/Zirias/c64_demo_part_zirias). Checked 2026-11-18.

Credit: Zirias, repository publisher and demo author; per-file music credits.

License record: No repository-wide license found. Reuse category: reference.

Useful addition: Explore music-led visual motion and a small part's assembly structure.

Limits: AmigaBASIC Music-inspired C64 part. Inspect included tune and file credits separately.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution.

Credit evidence: [1](https://github.com/Zirias/c64_demo_part_zirias/tree/286a8f286ed63610034452e4d827a113b72b6523).

Pinned revision: `286a8f286ed63610034452e4d827a113b72b6523`.

Source entry points:

- [raster_main.s](https://github.com/Zirias/c64_demo_part_zirias/blob/286a8f286ed63610034452e4d827a113b72b6523/raster_main.s)
- [gfx-line.s](https://github.com/Zirias/c64_demo_part_zirias/blob/286a8f286ed63610034452e4d827a113b72b6523/gfx-line.s)
- [snd_play.s](https://github.com/Zirias/c64_demo_part_zirias/blob/286a8f286ed63610034452e4d827a113b72b6523/snd_play.s)
- [spritezone.s](https://github.com/Zirias/c64_demo_part_zirias/blob/286a8f286ed63610034452e4d827a113b72b6523/spritezone.s)
- [text80.s](https://github.com/Zirias/c64_demo_part_zirias/blob/286a8f286ed63610034452e4d827a113b72b6523/text80.s)

<a id="zx02"></a>
## ZX02 6502 compression

[Original source](https://github.com/dmsc/zx02). Checked 2026-11-18.

Credit: Daniel Serpell (DMSC); Einar Saukas, ZX0 basis; contributors named in source.

License record: MIT plus preserved upstream BSD notice. Reuse category: permissive.

Useful addition: Prototype compressed static assets and compare 6502 decoder variants on our actual data.

Limits: ZX02 and ZX0 streams differ. Small and fast variants have different memory and placement costs.

Review scope: README, license evidence and source tree; selected source headers inspected. No upstream program execution. Selected originals are archived, with their accompanying license notices; the subset may omit build dependencies.

Credit evidence: [1](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/README.md).

Pinned revision: `7ffa0e782c9f5718a8d77ba021c6babc78c7fe19`.

License evidence: [1](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/LICENSE), [2](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/LICENSE.zx0).

Source entry points:

- [6502/zx02-fast.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx02-fast.asm)
- [6502/zx02-fast2.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx02-fast2.asm)
- [6502/zx02-optim.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx02-optim.asm)
- [6502/zx02-small.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx02-small.asm)
- [6502/zx02-zp.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx02-zp.asm)
- [6502/zx102-optim.asm](https://github.com/dmsc/zx02/blob/7ffa0e782c9f5718a8d77ba021c6babc78c7fe19/6502/zx102-optim.asm)

Archived source: [zx02](upstream/zx02/). File URLs and SHA-256 values are in the manifest.
