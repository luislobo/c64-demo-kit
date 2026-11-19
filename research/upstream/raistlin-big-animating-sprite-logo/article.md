# Big Animating Sprite Logo

- URL: https://c64demo.com/big-animating-sprite-logo/
- Author: Raistlin (Genesis Project)
- Published: 2022-04-13
- Series: Memento Mori
- Level: intermediate
- Tags: 6502, c64, sprites, multiplexing, raster irqs, code generation
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> How the big animating Genesis Project sprite logo in Memento Mori works on the C64: a 20px interleaved sprite carpet and delta-blitted frames.

Assumes: 20px sprite interleave (https://c64demo.com/sprite-interleave/); Stable raster IRQs

## Summary

Another effect that was well-liked from Memento Mori was the large, animating sprite logo – where we had “Genesis” and “Project” swinging on a circular arc around a large skull-themed picture.

This one is actually much easier to accomplish than most effects in the demo – though, of course, it was still quite a bit of work to get done.
Video: <https://www.youtube.com/watch?v=ob5GHijbWSg>
*Video: [Memento Mori by Genesis Project](https://www.youtube.com/watch?v=ob5GHijbWSg), the full demo, including the Genesis Project sprite logo swinging around the skull.*

---

**How Does It Work?**

There are 2 main parts to this effect:-

- a sprite block/carpet of 8×9 24x21px sprites using 20px interleave (which in some ways makes it 8×10 sprites);
- a method of “blitting” our swinging text to the sprite data.

That’s all that is needed, really, and then all the glue that goes with that.

---

## The Sprite Carpet

Easy part first .. we need to implement a sprite carpet. In order to keep things simple, we went for the 20px technique so that we didn’t need to be concerned about badlines. This is done using some perfectly timed code. Here’s our main IRQ function:-

```asm6502
RotatingGP_MainIRQ:
        :IRQManager_BeginIRQ(0, 0)
    RotatingGP_SpriteLayerIndex:
        ldy #$00
        bne NotZero
        lda #$ff
        sta VIC_SpriteEnable
    NotZero:
        lda Row_SpriteYVals, y
        .for (var SpriteIndex = 0; SpriteIndex < 8; SpriteIndex++)
            sta VIC_Sprite0Y + (SpriteIndex * 2)
        .for (var NOPs = 0; NOPs < 8; NOPs++)
            nop
        ldx Row_SpriteVals, y
        lda #$fb
        .for (var SpriteIndex = 0; SpriteIndex < 4; SpriteIndex++)
        {
            sax SpriteVals + SpriteIndex
            stx SpriteVals + SpriteIndex + 4
            .if (SpriteIndex != 3)
                inx
        }
        cpy #0
        bne Not0
//; --- do some non-timing crucial things here .. eg. update sprite X values
    Not0:
        iny
        cpy #10
        bne Not10
        inc Signal_CustomSignal0 //; <-- signal for the non-IRQ blitting code to begin
        lda #$f0
    WaitMore:
        cmp VIC_D012
        bcs WaitMore
        lda #$00
        sta VIC_SpriteEnable
//; --- play music, update framecounters and other demo-specific gubbings here...
        ldy #$00
    Not10:
        sty RotatingGP_SpriteLayerIndex + 1
        :IRQManager_EndIRQ()
        rti
```

Pretty simple stuff, really. Note lines 16 and 17 – these are important. For me, this gives me the exact HSYNC that I need, the exact point on the rasterline, where I need to (rapidly) update all the SpriteVals. This needs to be cycle-exact – get it at the wrong position and you’ll see glitching in your sprites every 20th line.

Also note: D012 values coming into this function are spaced by 20px… the values that I use are:-

```asm6502
Row_D012Vals:
        .byte $00                           //; first IRQ each frame has lots of time to setup the first row of sprites
        .fill 1, $3a + (20 * (i + 1)) - 1   //; second IRQ is on line 77
        .fill 8, $3a + (20 * (i + 2)) - 2   //; subsequents are every 20 lines - 96, 116, 136, 156, 176, 196, 216 and 236
```

---

## Firing Off The Blitter

With that done, we have 10 fairly low impact IRQs breaking up our frame. Outside of IRQs, we can do the grunt work of the animation.

This means that the non-IRQ function is essentially looping around a wait-blit-wait loop:-

```asm6502
    WaitForSignal:
        lda Signal_CustomSignal0
        beq WaitForSignal
        jsr DoBlitWork
        lda #$00
        sta Signal_CustomSignal0
        beq WaitForSignal
```

Our final code was very slightly more complicated than that, in order to respond to the “our effect is finished” signal .. but that’s pretty much it.

---

## Delta Animation

Now… we need to consider how “DoBlitWork()” actually does the animation.. which is of course the crux of this effect. The answer? Very easily.

Here’re the pre-built animation frames that Jon Egg kindly made for this (I prototyped the effect with my own hacky animation – and Jon did the honours of turning it into something that looked awesome):-

![All 16 animation frames of the Genesis Project logo swinging around the skull, by Jon Egg](https://c64demo.com/img/ByOmqmJP9O-1024.png)

That’s 16 frames of animation, 192x189px each.

The image below shows the “hit-mask” for the animation (red coloured area on the LHS) and the “static” part (the skull picture on the RHS) across the 16 frames. Although both of these are of course easy to determine, my C++ code was setup to cope with any animation – the hit-mask and static image are computed and so don’t need to be provided manually.

![Left: hit-mask in red covering every pixel the 16 frames touch. Right: the static skull part that never changes](https://c64demo.com/img/0XzSIkGvNx-386.png)

With that in place, the remaining work is very simple.

Note: technically, the animation is done at 25fps – we alternate between drawing the top part (Genesis) and bottom (Project). Personally I’m not a big fan of effects running at less than 50fps – but we can hide this somewhat by swinging the whole sprite array in X at full 50fps).

The blit code is nothing more than:-

```asm6502
    BlitRotatingGP0:
        lda BlitDataAddress +     0,x                                                                                   //; 3 (    3) bytes   4 (     4) cycles
        sta SpriteMem + (4 * 64) + 3                                                                                    //; 3 (    6) bytes   4 (     8) cycles
        lda BlitDataAddress +    16,x                                                                                   //; 3 (    9) bytes   4 (    12) cycles
        sta SpriteMem + (3 * 64) + 7                                                                                    //; 3 (   12) bytes   4 (    16) cycles
        lda BlitDataAddress +    32,x                                                                                   //; 3 (   15) bytes   4 (    20) cycles
        sta SpriteMem + (3 * 64) + 8                                                                                    //; 3 (   18) bytes   4 (    24) cycles
//; ... rest of blitting for logo 0 ...
        sta SpriteMem + (25 * 64) + 40                                                                                  //; 3 ( 5358) bytes   4 (  7144) cycles
        lda BlitDataAddress + 13520,x                                                                                   //; 3 ( 5361) bytes   4 (  7148) cycles
        sta SpriteMem + (25 * 64) + 42                                                                                  //; 3 ( 5364) bytes   4 (  7152) cycles
        rts                                                                                                             //; 1 ( 5365) bytes   6 (  7158) cycles
    BlitRotatingGP1:
        lda BlitDataAddress + 27056,x                                                                                   //; 3 ( 5368) bytes   4 (  7162) cycles
        sta SpriteMem + (75 * 64) + 59                                                                                  //; 3 ( 5371) bytes   4 (  7166) cycles
        lda BlitDataAddress + 27072,x                                                                                   //; 3 ( 5374) bytes   4 (  7170) cycles
        sta SpriteMem + (76 * 64) + 57                                                                                  //; 3 ( 5377) bytes   4 (  7174) cycles
//; ... rest of blitting for logo 1 ...
        lda BlitDataAddress + 13536,x                                                                                   //; 3 (10828) bytes   4 ( 14442) cycles
        sta SpriteMem + (46 * 64) + 10                                                                                  //; 3 (10831) bytes   4 ( 14446) cycles
        rts                                                                                                             //; 1 (10832) bytes   6 ( 14452) cycles
```

Which ended up as 10,832 bytes and 14,452 cycles (7158 and 7294 cycles for logos 0 and 1 respectively).

Yes, we had plenty of spare CPU in this part.

The only remaining thing to explain, although I doubt an explanation is really needed, is that the BlitDataAddress stuff is generated from the delta animation data. We simply work our way from top to bottom of each logo, creating a table of the 16 values that hit each byte.

For additional optimisation, you can again look for duplicates of these 16 value blocks and reduce them down – due to the nature of the effect, there usually aren’t many.. but it all helps, it’s always worth doing a little extra work to save crucial memory.

Note that, to choose the frame of animation for each logo, which comes into the BlitRotatingGP functions in the X register, we use another sine-table with values in the [0, 15] range (to include the 16 frames of animation).

---

## Wrapping Up

As mentioned at the beginning, this part is really very simple indeed… a true smoke-and-mirrors animation effect – which we know that some groups love to make. Impressing the audience doesn’t always need to be about squeezing every byte, every cycle and every VIC trick out of the machine. Sometimes, you just need a good idea and a nice implementation.
