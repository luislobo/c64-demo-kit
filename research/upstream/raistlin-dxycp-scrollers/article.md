# DXYCP Scrollers

- URL: https://c64demo.com/dxycp-scrollers/
- Author: Raistlin (Genesis Project)
- Published: 2022-03-20
- Level: hard
- Tags: 6502, c64, scrollers, bobs, sprites, multiplexing, code generation
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Christmas Megademo by Atlantis, Bonzai, Genesis Project, Lethargy and Offence (2020) https://csdb.dk/release/?id=198283; The Dive by Genesis Project (2019) https://csdb.dk/release/?id=179128

> DXYCP scrollers on the C64: pre-shifted fonts, generated LDA/ORA/STA plot code, and plotting to bitmap, charset or multiplexed sprites.

Assumes: Setting up charset, bitmap and sprite screens; Double buffering

## Summary

With DYCPs being so popular in the early days of the demoscene (and still, to many, today), some looked for new ideas for where to take these next. The most obvious improvement was to allow full X and Y movement – inspired by the Commodore Amiga’s BOBs (Blitter Objects) perhaps.

And so, the DXYCP was born.

In scroller form, these would usually feature relatively small fonts – because to draw these, on C64, could be pretty expensive.
Video: <https://www.youtube.com/watch?v=p0ddV07WC8o&t=550s>
*Video: [Christmas Megademo](https://www.youtube.com/watch?v=p0ddV07WC8o&t=550s), from 9:10: the Christmas tree DXYCP scroller.*

---

## Types of DXYCP

As with most C64 effects, there are several ways of doing this …

1. how flexible should the plotting be in terms of movement?
   - fully-flexible, so that each character can move anywhere within the plot region;
   - partially-flexible, eg. having a fixed X Position but having a variable Y
   - fixed, such that the plot-shape is static and unchanging

2. where are we plotting to?
   - a bitmap screen?
   - a fixed charset – usually these will be laid out on screen as something like 32×8 or 16×16 chars
   - sprites – offering the ability to draw these on top of bitmap and/or charset logos etc…

3. is this a scroller, an animation, or something else?

These are the main considerations. Over the last 35+ years, I’ve done all of these .. but more recently have focused on one particular type: fixed-shape scrollers onto either sprites or bitmaps. Here’re a few of such, dating from 1991 through to 2022:-

![Collage of seven fixed-shape DXYCP scrollers by Raistlin, from Delirious 10 (1991) to Tree of Peace (2022)](https://c64demo.com/img/ncKpl-kvj9-960.png)

From top-left, we have:-

- 1991’s Delirious 10, in which I had a 96-bob plotter drawing onto a 32-sprite multiplex over a bitmap background. Quite an achievement for the time, I’d say, I don’t believe that anyone had done this before, nor tried to do after? (I may be wrong .. please let me know if so)
- 2018’s Delirious 11. I remade the 96-bob-plotter, adding colour to it and allowing it to wrap in front of and behind a near-fullscreen logo swinger
- 2018’s X Marks the Spot, our entry for the X2018 demo competition (we came 4th). This one had 128 bobs, again on top of a bitmap (ie. the plot was done to multiplexed sprites again) – we threw the gauntlet down for Bonzai to try to beat us in this one 😉
- 2019’s The Dive, with a 212-bob plotter… beating our own record before Bonzai had a chance to.
- 2020’s Memento Mori, in which we made the shape more interesting, increase the font size and made it clip to the background bitmap .. really pushing the boat out to make the effect look truly gorgeous here
- 2020’s Christmas Megademo .. this time we pushed the boundary a little more, creating the shape of a stylish Christmas tree – and this time not being shy to create lots of overlaps and bunching-up of the chars .. my code-generator would optimise for all these cases as best it could
- 2022’s Tree of Peace .. this time going for an Only Sprites affair with a crazy triple-sinus. In static pictures, the scroller looks absolutely unreadable. In motion, it’s slightly less so

---

## Prerequisites

You probably need to know at least the very basics of C64 demo coding, such as how to:-

- setup charset, bitmap, sprites
- double buffer

---

## Pre-Shifted Font Data

The first step is to choose a font, of an appropriate size, and generate some pre-shifted data – we don’t really want to be shifting the font in realtime.. it’s possible, sure, but we have better things to spend those cycles on, right..? Using a 5×5 font as an example, with 32 different chars available (space, A-Z and then 5 special chars), we would end up with a table that is 1920 bytes in size (see explanation/calculation below the following image):-

![A 5px char pre-shifted 0 to 7px: left byte for every shift, right byte only needed for shifts 4 to 7](https://c64demo.com/img/xStBCZe8BG-512.png)

So, we have **32** chars in the font, each char is 5 bytes high.. and for **8** shift values, we have **8** sets of data for the LHS, **4** sets for RHS… giving our total data-size of 32 * 5 * (8 + 4) = 1920 bytes.

As always, I generate this data in C++ – you could of course use macros in your favourite 6510 assembler if that’s your preference. To keep my blit-code ASM tidy, I also prefer to save this data in a format that can be easily read, too… and in a form that’s indexable. So, I’ll end up with something like:-

```asm6502
    ShiftedFont_Shift5_Y0_L:
        .byte $00, $07, $07, $07, $07, $07, $07, $07, $04, $07, $00, $04, $04, $04, $04, $03
        .byte $07, $07, $07, $07, $07, $04, $04, $04, $04, $04, $07, $00, $01, $00, $00, $00
    ShiftedFont_Shift5_Y0_R:
        .byte $00, $c0, $c0, $c0, $80, $c0, $c0, $c0, $40, $c0, $c0, $40, $00, $40, $40, $80
        .byte $80, $c0, $80, $c0, $c0, $40, $40, $40, $40, $40, $c0, $00, $00, $00, $00, $00
```

That’s the first line (Y=0) of the font, shifted 5 pixels to the right – so we have both a Left and a Right side. As always, we should avoid crossing page boundaries – so we should ensure that this data is stored at a 32 byte boundary… easy in most assemblers with something like:-

```asm6502
.align 32
```

---

## Blit Code

The next step is fairly easy, depending on your render target (bitmap, chars or sprites). The simplest to consider first is a bitmap screen.

Taking the Christmas Tree part in Christmas Megademo, here’s how the DXYCP chars (“BOBs”) are placed across 3 frames of animation:-

![The 232 char positions forming the spiral Christmas tree shape, across the 3 animation frames](https://c64demo.com/img/rg2mqxAhoR-960.png)

This part included 232 chars. With 3 frames of animation, that gives 696 frames in total for each char to move from bottom-right to the peak of the tree – which will take around 14 seconds at 50fps.

The way that we draw this is to iterate through each of these 232 chars, working out the bytes that we need to change for each to be drawn, and the shifts required. For example, if we have Char231 at (221, 196) then that would be the 27th char and our plot would need a right-shift of 5 (since 221/8 is 27 remainder 5. The simple plot for this would be something like:-

```asm6502
    Char231_Frame0:
        ldy #$00
        sty Char230_Frame0 + 1
        lda ShiftedFont_Shift5_Y0_Side0,y
        sta BitmapAddress + (24 * 320) + (27 * 8) + 4
        lda ShiftedFont_Shift5_Y0_Side1,y
        sta BitmapAddress + (24 * 320) + (28 * 8) + 4
        lda ShiftedFont_Shift5_Y1_Side0,y
        sta BitmapAddress + (24 * 320) + (27 * 8) + 5
//;        ... more ...
        lda ShiftedFont_Shift5_Y4_Side1,y
        sta BitmapAddress + (24 * 320) + (28 * 8) + 8
```

If we have Char230 hitting some of those bytes, we might need to ORA those in as well. In my plot code, I will always allow 2 chars to be overlapped this way:-

```asm6502
   Char230_Frame0:
        ldx #$00
        stx Char229_Frame0 + 1
//;        ... some of Char230 plotted here ...
   Char231_Frame0:
        ldy #$00
        sty Char230_Frame0 + 1
        lda ShiftedFont_Shift5_Y0_Side0,y
        ora ShiftedFont_Shift3_Y3_Side1,x              //; <-- overlap point here
        sta BitmapAddress + (24 * 320) + (27 * 8) + 4
        lda ShiftedFont_Shift5_Y0_Side1,y
        sta BitmapAddress + (24 * 320) + (28 * 8) + 4
        lda ShiftedFont_Shift5_Y1_Side0,y
        ora ShiftedFont_Shift3_Y4_Side1,x              //; <-- overlap point here
        sta BitmapAddress + (24 * 320) + (27 * 8) + 5
//;        ... more ...
        lda ShiftedFont_Shift5_Y4_Side1,y
        sta BitmapAddress + (24 * 320) + (28 * 8) + 8
```

Furthermore, if there are 3 or more chars hitting the same byte, we would need to do something like this:-

```asm6502
        lda BitmapAddress + (24 * 320) + (27 * 8) + 4
        ora ShiftedFont_Shift5_Y0_Side0,y
        ora ShiftedFont_Shift3_Y3_Side1,x
        sta BitmapAddress + (24 * 320) + (27 * 8) + 4
```

Which, yeah, starts to get more costly of course .. but it’s all good – these complex overlaps also make the effect look more impressive.

Note that all of this is generated using the “Raistlin Code Generator” which I mentioned in my last blog post, [All Border Double DYPP](/memento-mori-all-border-double-dypp/). The C++ works out exactly which chars overlap, or not, and the best way to plot these. I iterate over the chars in order – so I’ll always have X, Y loaded with adjacent char indices.

Here’s the actual generated code from a section of the tree scroller just so that you can see there’s nothing more to this:-

```asm6502
    Char086_Frame0:
        ldx #$00                                                                                                        //; 2 ( 4409) bytes   2 (  5820) cycles
        stx Char085_Frame0 + 1                                                                                          //; 3 ( 4412) bytes   4 (  5824) cycles
        lda ShiftedFont_Shift1_Y1_Side0,y                                                                               //; 3 ( 4415) bytes   4 (  5828) cycles
        ora BitmapAddress + (12 * 320) + (14 * 8) + 7                                                                   //; 3 ( 4418) bytes   4 (  5832) cycles
        sta BitmapAddress + (12 * 320) + (14 * 8) + 7                                                                   //; 3 ( 4421) bytes   4 (  5836) cycles
        lda ShiftedFont_Shift1_Y2_Side0,y                                                                               //; 3 ( 4424) bytes   4 (  5840) cycles
        ora BitmapAddress + (13 * 320) + (14 * 8) + 0                                                                   //; 3 ( 4427) bytes   4 (  5844) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 0                                                                   //; 3 ( 4430) bytes   4 (  5848) cycles
        lda ShiftedFont_Shift1_Y3_Side0,y                                                                               //; 3 ( 4433) bytes   4 (  5852) cycles
        ora ShiftedFont_Shift7_Y0_Side0,x                                                                               //; 3 ( 4436) bytes   4 (  5856) cycles
        ora BitmapAddress + (13 * 320) + (14 * 8) + 1                                                                   //; 3 ( 4439) bytes   4 (  5860) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 1                                                                   //; 3 ( 4442) bytes   4 (  5864) cycles
        lda ShiftedFont_Shift1_Y4_Side0,y                                                                               //; 3 ( 4445) bytes   4 (  5868) cycles
        ora ShiftedFont_Shift7_Y1_Side0,x                                                                               //; 3 ( 4448) bytes   4 (  5872) cycles
        ora BitmapAddress + (13 * 320) + (14 * 8) + 2                                                                   //; 3 ( 4451) bytes   4 (  5876) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 2                                                                   //; 3 ( 4454) bytes   4 (  5880) cycles
    Char087_Frame0:
        ldy #$00                                                                                                        //; 2 ( 4456) bytes   2 (  5882) cycles
        sty Char086_Frame0 + 1                                                                                          //; 3 ( 4459) bytes   4 (  5886) cycles
        lda ShiftedFont_Shift7_Y2_Side0,x                                                                               //; 3 ( 4462) bytes   4 (  5890) cycles
        ora BitmapAddress + (13 * 320) + (14 * 8) + 3                                                                   //; 3 ( 4465) bytes   4 (  5894) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 3                                                                   //; 3 ( 4468) bytes   4 (  5898) cycles
        lda ShiftedFont_Shift7_Y3_Side0,x                                                                               //; 3 ( 4471) bytes   4 (  5902) cycles
        ora BitmapAddress + (13 * 320) + (14 * 8) + 4                                                                   //; 3 ( 4474) bytes   4 (  5906) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 4                                                                   //; 3 ( 4477) bytes   4 (  5910) cycles
        lda ShiftedFont_Shift7_Y4_Side0,x                                                                               //; 3 ( 4480) bytes   4 (  5914) cycles
        sta BitmapAddress + (13 * 320) + (14 * 8) + 5                                                                   //; 3 ( 4483) bytes   4 (  5918) cycles
        lda ShiftedFont_Shift7_Y0_Side1,x                                                                               //; 3 ( 4486) bytes   4 (  5922) cycles
        ora BitmapAddress + (13 * 320) + (15 * 8) + 1                                                                   //; 3 ( 4489) bytes   4 (  5926) cycles
        sta BitmapAddress + (13 * 320) + (15 * 8) + 1                                                                   //; 3 ( 4492) bytes   4 (  5930) cycles
        lda ShiftedFont_Shift7_Y1_Side1,x                                                                               //; 3 ( 4495) bytes   4 (  5934) cycles
        ora BitmapAddress + (13 * 320) + (15 * 8) + 2                                                                   //; 3 ( 4498) bytes   4 (  5938) cycles
        sta BitmapAddress + (13 * 320) + (15 * 8) + 2                                                                   //; 3 ( 4501) bytes   4 (  5942) cycles
        lda ShiftedFont_Shift7_Y2_Side1,x                                                                               //; 3 ( 4504) bytes   4 (  5946) cycles
        ora BitmapAddress + (13 * 320) + (15 * 8) + 3                                                                   //; 3 ( 4507) bytes   4 (  5950) cycles
        sta BitmapAddress + (13 * 320) + (15 * 8) + 3                                                                   //; 3 ( 4510) bytes   4 (  5954) cycles
        lda ShiftedFont_Shift7_Y3_Side1,x                                                                               //; 3 ( 4513) bytes   4 (  5958) cycles
        ora BitmapAddress + (13 * 320) + (15 * 8) + 4                                                                   //; 3 ( 4516) bytes   4 (  5962) cycles
        sta BitmapAddress + (13 * 320) + (15 * 8) + 4                                                                   //; 3 ( 4519) bytes   4 (  5966) cycles
        lda ShiftedFont_Shift7_Y4_Side1,x                                                                               //; 3 ( 4522) bytes   4 (  5970) cycles
        ora ShiftedFont_Shift7_Y0_Side0,y                                                                               //; 3 ( 4525) bytes   4 (  5974) cycles
        sta BitmapAddress + (13 * 320) + (15 * 8) + 5                                                                   //; 3 ( 4528) bytes   4 (  5978) cycles
```

Yep, it’s really that simple. Each frame of animation code uses ~15,000 cycles and 11,000 bytes.

Note: on this occasion I didn’t double-buffer.. since I had 3 frames, I actually would’ve needed to triple-buffer – because the write-addresses are all hardcoded into my plot function. Regardless, I didn’t want to waste 9,000 bytes by double-buffering (and definitely not 18,000 bytes for triple-buffering). So, with that in mind, there’s some between-frames cleanup needed to blank out the bytes that are used in one frame but not the next … to do that I just have a big block of clearing code:-

```asm6502
    DrawShape_Frame0:
        lda #$00                                                                                                        //; 2 (    2) bytes   2 (     2) cycles
        sta BitmapAddress + (1 * 320) + (20 * 8) + 1                                                                    //; 3 (    5) bytes   4 (     6) cycles
        sta BitmapAddress + (5 * 320) + (19 * 8) + 0                                                                    //; 3 (    8) bytes   4 (    10) cycles
        sta BitmapAddress + (6 * 320) + (21 * 8) + 4                                                                    //; 3 (   11) bytes   4 (    14) cycles
        sta BitmapAddress + (7 * 320) + (19 * 8) + 2                                                                    //; 3 (   14) bytes   4 (    18) cycles
        sta BitmapAddress + (7 * 320) + (19 * 8) + 3                                                                    //; 3 (   17) bytes   4 (    22) cycles
        sta BitmapAddress + (7 * 320) + (19 * 8) + 4                                                                    //; 3 (   20) bytes   4 (    26) cycles
        sta BitmapAddress + (7 * 320) + (18 * 8) + 7                                                                    //; 3 (   23) bytes   4 (    30) cycles
//;     ... more ...
        sta BitmapAddress + (24 * 320) + (21 * 8) + 6                                                                   //; 3 (  308) bytes   4 (   410) cycles
```

Note also that, inside my blit code, I automatically scroll the scrolltext through:-

```asm6502
    Char086_Frame0:
        ldx #$00                                                                                                        //; 2 ( 4409) bytes   2 (  5820) cycles
        stx Char085_Frame0 + 1                                                                                          //; 3 ( 4412) bytes   4 (  5824) cycles
```

Each frame’s code scrolls through it’s own text .. and then we simply write into the final-char of each when we move new scrolltext onto the screen.

---

## Blitting To Sprites

In Delirious 10, Delirious 11, X Marks the Spot, The Dive and Tree of Peace I plotted into sprite data rather than bitmap. The latter, Tree of Peace, was as simple as the bitmap plotting, I simply used a sprite carpet. The others, though, were more complicated: they all used a sprite multiplexor.. which meant that in addition to working out where each char would be plotted, I also needed to work out an arrangement of sprites that would work well.

![Delirious 10: 96-bob circular DXYCP scroller in multiplexed sprites over a bitmap of a car](https://c64demo.com/img/XY0VeHCoPH-408.png)

The advantage to blitting to sprites is that you can then easily swing these horizontally on screen (vertically too if you’re so inclined).. and you can place a bitmap, so charset-animation, etc etc in front of or behind the DXYCP – or, of course, both.

On Delirious 10 and 11, I simply used a 32-sprite multiplexor, putting 3 chars into each sprite and working out the best sprite position for these. Delirious 11, coming 27 years after the previous demo, included one major optimisation to my method of determining the sprite position: I wouldn’t just settle for the first position that worked .. I would try up to 7 further x-positions of each sprite, sliding it 1px left each time to find which position gave the code with the least cycles – some positions gave less byte-overlaps and, hence, faster code. Surprisingly, the code was -significantly- faster this way, leaving me more than enough cycles to do the logo-swinger behind (nb. this logo-swinger is drawing with brute-force memory copies, there’s no VSP or such involved here).

With X Marks the Spot and The Dive, having a fixed number of chars per sprite didn’t work – with 32 sprites, there were some positions where you simply couldn’t fit 4+ chars as the chars were too spaced-out. So, instead, I reworked the code to allow for a variable number – it then just comes down to finding the best arrangement of sprites that you can.

Here’s the sprite layout that we ended up with in The Dive (where 2 frames were used):-

![Multiplexed sprite arrangement covering the circular DXYCP path in The Dive, frames 0 and 1](https://c64demo.com/img/MAeHdH_700-571.png)

---

## Wrapping Up

So, yeah, DXYCPs aren’t as complicated as you might have thought.. it really does just come down to a whole load of LDAs, STAs (and perhaps some ORAs). That’s the grunt work of this.

There’s still a lot of room for innovation with these, though.. even after doing so many of them, there are still some cool ideas that I have for how to take things further. I might write about those one day – *after* they’ve been released in a demo of course ;-p .. I can’t wait to see what others might do, though, it does feel lonely with only myself and Walt/Bonzai really doing these right now, showering each other with scene love 😉

![A DXYCP scroller by Walt/Bonzai: text on an ellipse around two hands forming a heart](https://c64demo.com/img/NJIdoXJOt2-408.png)
