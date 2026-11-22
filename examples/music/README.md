# Clockwork example music

`clockwork.asm` is an original player and short three-voice composition by the
C64 demo kit contributors. It is dedicated to the public domain under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). This grant covers
this original example's player, composition and generated PSID file.

Build it from the repository root:

```console
node tools/build-example-music.cjs
node build.cjs --entry sid-demo.asm --out build/sid
```

The tool generates `generated/clockwork.sid` and assembly pitch tables. No
downloaded tune or existing musician's composition is used. The file declares
PAL and NTSC support; its init routine selects the proper pitch table, and its
VBI play routine preserves a nominal 50 Hz musical clock on either machine.
It reserves `$c400` upward and uses no zero page. The example does not use
interrupts or CIA timers of its own.

The PSID container follows the format by Michael Schwendt, Simon White, Dag Lem,
LaLa and Wilfred Bos, documented in [the SID integration guide](../../docs/SID.md).
The player itself is original code. The research catalogue records the other
creators whose work can inform later tracker and instrument development.

## The Entertainer, SID disco arrangement

Scott Joplin wrote [The Entertainer](https://www.loc.gov/item/2023864238/) in
1902. The original U.S. score is in the public domain. This 120 BPM
arrangement uses the first strain from the
[original sheet music](https://commons.wikimedia.org/wiki/File:Entertainer_2.jpg)
with a new disco bass line, four-on-the-floor kick, hi-hat and syncopated
synth stabs. The third SID voice alternates percussion and stabs so the
pulse lead and bass can stay on their own voices. It loops every 16 seconds.

The arrangement and player are by the C64 demo kit contributors and dedicated
to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
The preview is a recording of the arranged SID in VICE.

- [Play the preview](../../dist/music/entertainer-disco.mp3)
- [Download the PAL/NTSC SID](../../dist/music/entertainer-disco.sid)
- Rebuild with `TASS64=/path/to/64tass node tools/build-entertainer-disco.cjs`.
- Play with `vsid dist/music/entertainer-disco.sid`.

The PSID loads at `$c400`, requires zero zero-page bytes, and selects pitch
tables from the machine's video standard. TORQ's default soundtrack is
After Hours Roll.

## After Hours Roll

`after-hours.asm` and `after-hours-score.cjs` implement TORQ's original
88 BPM rock-and-roll shuffle. The 12-bar E blues uses three triplet
subdivisions per beat. A pulse lead, triangle walking bass and synthetic
kick and snare use the three SID voices. The track and player are dedicated
to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

From the kit root, run `node tools/build-example-music.cjs after-hours` to
generate `generated/after-hours.sid`. The normal TORQ build generates it
automatically. Clockwork is still the tune in the standalone SID and
character examples.
