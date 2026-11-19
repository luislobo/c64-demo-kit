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
