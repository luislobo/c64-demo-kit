# C64 demo source collection

This collection gathers source code, effect explanations, SID music tools,
asset tools and optimization references for extending this kit. Start with the
[source catalogue](SOURCES.md), [adaptation plan](ADAPTATION.md) and
[credits and licenses](CREDITS.md).

The 2026-11-18 survey contains 73 entries, including 51 GitHub repositories
pinned to commits, 14 original Raistlin articles and 8 other primary sources.
There are 197 archived files in 32 source/article bundles, including 122 source
files and six GoatTracker instrument exports. Counts can be checked with
`node tools/research.cjs --check`; all file records are in [catalog.json](catalog.json).
This is a broad curated survey, not an exhaustive index of the demoscene.

## Find material for a new part

Run these commands from the repository root. Search matches all supplied words
across titles, authors, tags, license notes and proposed uses.

```console
node tools/research.cjs scrollers
node tools/research.cjs music optimization
node tools/research.cjs Maciej raster
node tools/research.cjs compression permissive
node tools/research.cjs --check
```

| Goal | Start with | Possible kit addition |
| --- | --- | --- |
| Character scrolling and tiles | [c64lib text](SOURCES.md#c64lib-text) | Character-mode scenes, tile decoder, color-RAM scrolling |
| Raster bars and split displays | [Copper64](SOURCES.md#copper64) | A raster event list with explicit cycle constraints |
| Large sprite logos | [Sprite interleave](SOURCES.md#raistlin-sprite-interleave) and [animated logos](SOURCES.md#raistlin-big-animating-sprite-logo) | Host-generated sprite layouts and delta updates |
| DYCP/DXYCP and border text | [DXYCP](SOURCES.md#raistlin-dxycp-scrollers) and [double DYPP](SOURCES.md#raistlin-memento-mori-all-border-double-dypp) | Pre-shifted fonts and generated plot routines |
| Bobs, trails and layered movement | [Finite bobs](SOURCES.md#raistlin-finite-bobs-nobounds) | Dirty-background restoration and reusable plot kernels |
| Procedural intros | [Viznut's C64 sources](SOURCES.md#viznut-c64) | Original compact visuals and music sequencing |
| New music | [SID-Wizard](SOURCES.md#sid-wizard), [SID Factory II](SOURCES.md#sid-factory-2), [GoatTracker](SOURCES.md#goattracker2), [MagSID](SOURCES.md#magsid) | A tracker export/import workflow with an authorized player |
| Instrument design | [SID instrument library](SOURCES.md#sid-instruments) and [Galway sources](SOURCES.md#galway-music) | Wavetables, pulse movement, filters and instrument sequences |
| Smaller assets | [ZX02](SOURCES.md#zx02), [LZSA](SOURCES.md#lzsa), [TSCrunch](SOURCES.md#tscrunch), [ByteBoozer](SOURCES.md#byteboozer2) | Optional host compression and an appropriate 6502 decoder |
| More than one disk-loaded part | [Spindle](SOURCES.md#spindle), [Sparkle](SOURCES.md#sparkle), [Bitfire](SOURCES.md#bitfire) | Streaming, resource lifetimes and transitions |
| Fit an authorized SID into RAM | [Sidreloc](SOURCES.md#sidreloc) | Host-side relocation with SID-write verification |
| Multicolor pictures and sprites | [Retropixels](SOURCES.md#retropixels), [Spritemate](SOURCES.md#spritemate) | New asset formats with matching display routines |
| Debug timing and audio continuity | [Retro Debugger](SOURCES.md#retro-debugger), [VICE](SOURCES.md#vice), [music popping](SOURCES.md#raistlin-stopping-music-popping) | Raster and SID-write trace checks |

## Understand what is collected

`upstream/` contains unmodified source subsets and article Markdown, with their
license notices. File URLs, revisions, archive checksums and per-file SHA-256
values are recorded in the manifest. These files are research inputs, not
64tass modules included by `lib/engine.asm`. Some subsets omit dependencies,
artwork and tunes and will not build on their own. Markdown images still refer
to the author's site; image assets are not archived.

The default runtime still uses the original bitmap engine and sequencer.
[Optional tracker-export integration](../docs/SID.md) now implements a restricted
PSID player interface with an original example tune. The archived third-party
players and loaders are research inputs. The [adaptation plan](ADAPTATION.md)
describes their remaining integration requirements.

The categories describe evidence at the inspected revision, not a replacement
for the source's actual terms:

| Category | Meaning |
| --- | --- |
| `permissive` | An explicit permissive grant was found for the relevant code. Preserve notices and check per-file overrides. |
| `attribution` | Material has an explicit attribution license. Preserve the creator, source and license, and state modifications. |
| `copyleft` | GPL or similar terms need to be accounted for before combining source into a distributed production. |
| `scoped` | Editor, output, runtime, assets or bundled components have different or incomplete terms. |
| `reference` | Useful to study, but permission for redistribution of relevant code has not been established. No snapshot is copied here. |
| `restricted` | Explicit restrictions prevent treating the source as a generally permissive kit component. No snapshot is copied here. |

For example, the full Genesis Project repository has no repository-wide grant
established in this survey, while Raistlin's separately published articles
explicitly license their own text and code. Lasse Öörni licenses Steel Ranger's
technical code under MIT while reserving its content. LZSA's faster decoders by
John Brandwood use Boost terms, unlike its zlib-licensed fast/small decoders.
These distinctions are recorded per source.

Attribution follows the author or handle supplied upstream. A publisher or fork
maintainer is identified as such when original authorship is not established.
In particular, the SID instrument repository's root README requests per-patch
author credit, but the inspected instrument READMEs do not name separate patch
authors. Its entry credits the publishing handle and records the provenance
gap. Confirm that information before releasing an adapted instrument bank.

## Review scope and omissions

The survey checked primary project pages, README files, license notices and
repository trees. Selected source headers were inspected to distinguish actual
code, planned features and component license overrides. The snapshots were
checked for byte integrity and attribution records. Upstream demos, editors,
loaders and instruments were not assembled, emulated, auditioned or tested on
physical hardware as part of this collection. Their performance claims are not
measurements for this kit.

Searches included graphics effects, complete productions, SID players,
size-coded intros, crunchers, loaders, image/sprite tools and debugging tools.
Duplicate forks were avoided where an author's project was available. A pinned
fork is identified when it provides useful source, such as the GoatTracker and
SID-Wizard entries. Non-C64 directories in multi-platform archives are excluded
from local source snapshots. No prebuilt executables, reference audio, game
artwork or standalone SID music files were added.

Codebase64 is a useful further discovery source, but direct access failed during
this survey. Its content was not mirrored or treated as a blanket reuse grant.
4mat's download page was inspected; its individual archives were not downloaded.
The Exomizer entry is explicitly a legacy source archive, not a current release
recommendation. Missing and moved repository guesses are excluded from the index.

## Maintain the collection

Update `catalog.json` with a source's exact revision, authors, evidence links,
reuse category and useful entry points. Copy source only after inspecting the
specific code's license and preserving its notices. Record each original URL
and SHA-256 value. Do not change upstream bytes to add our own headers.

For a GitHub file, its original bytes can be obtained without executing it:

```console
gh api 'repos/OWNER/REPO/contents/PATH?ref=COMMIT' --jq .content
```

Quote the API endpoint in shells that interpret `?`. The API content is base64;
decode it to a file, verify its hash and inspect its original notices before
adding it. For release archives, record the archive checksum and version as
well as the hashes of extracted files. Never run downloaded build scripts as
part of catalogue refresh.

Regenerate the two indexes and check the archive:

```console
node tools/research.cjs --write
node tools/research.cjs --check
node --test tests/research.test.cjs
```

The verifier checks declared file hashes, missing licenses and author records,
untracked archive files, unsafe paths and lost GitHub commit pins. It also
checks that generated source/credit indexes match the manifest. It does not
establish authorship, interpret licenses or prove that a routine works.
