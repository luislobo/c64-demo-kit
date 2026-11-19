# All Border Double DYPP

- URL: https://c64demo.com/memento-mori-all-border-double-dypp/
- Author: Raistlin (Genesis Project)
- Published: 2022-03-15
- Series: Memento Mori
- Level: insane
- Tags: 6502, c64, sprites, borders, dypp, multiplexing, code generation
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> How the all-border double DYPP in Memento Mori works on the C64: open borders, multiplexed sprites and prebaked, deduped font data.

Assumes: Opening the top, bottom and side borders; Sprite multiplexing; A stable raster; Sprite interleave (https://c64demo.com/sprite-interleave/)

## Summary

The “All Border Double DYPP” is one of the effects, used in Memento Mori (which you can [download from CSDb](https://csdb.dk/release/?id=195841)), that I am asked about most often. Here we have 2 DYPPs moving across the whole screen, and through the borders, while wrapping behind some raster bars. I’m going to jump right into how this is pulled off in this, my first blog post on C64 demo coding.

A funny aside… it’s hard when you’ve spent so long working on a single demo effect (months in this case) to reduce it down to be less than 30 seconds of the full demo. But that was a decision that we made with Memento Mori – and I personally think it was a good one.
Video: <https://www.youtube.com/watch?v=ob5GHijbWSg>
*Video: [Memento Mori by Genesis Project](https://www.youtube.com/watch?v=ob5GHijbWSg), the full demo. The all-border double DYPP is on screen for under 30 seconds of it.*

---

## Prerequisites

You probably need to know at least the very basics of C64 demo coding, such as how to:-

- open the borders (top, bottom and sides)
- multiplex sprites
- get a stable raster

It would also be helpful if you can:-
- interleave sprite data (check [sprite interleave on Codebase64](https://codebase64.org/doku.php?id=base:sprite_interleave) if you’re unsure)

---

## In A Nutshell

The image below shows in simple terms what is used for one of the DYPPs in a single frame. At the top and bottom of the DYPP, we’re using 4 sprites (red, cyan, purple and green) and within the rasterbar section we’re only using 2. With 2 DYPPs, then, we have 8 sprites at top and bottom, 4 for the middle section.

One trick that I used – which is why you might notice the DYPP doesn’t quite look 100% clean – is to use double-height sprites. The simple reason for doing this: the DYPP appears larger and we use half the number of blits that would otherwise be needed to draw the scroller.

Note that the DYPP is also 432px wide. Although only 408px can be shown on screen at a time, we need 24px more so that we can smooth-scroll the sprites. Note also that 432px can be covered horizontally with *exactly 18 sprite columns*.

![DYPP sine path over the screen with 4 sprites per column in the borders and 2 inside the raster bar area](https://c64demo.com/img/RaXG3r_7mU-432.png)
*Sprite coverage for a single DYPP*

The effect uses 2 frames of “animation” (more would be nice – but, for me at least, memory constraints prevented this). Following these 2 frames, the blit data will advance. We blit whole bytes – so it gives us a scroller speed of 4px per frame. That’s too fast for small fonts – but with a 16px font, it’s totally fine. The sinus moves in the opposite direction and at a faster speed so that it nicely rolls across the screen (if the speeds were matched, you would simply see the scroller moving through a static sinus – which would look pretty awful).

---

## Memory Map
Below you can see how we’ve squeezed everything into memory – like many of my demo effects, almost every byte of the C64 is utilised. This can of course be a hurdle on C64 – but that’s half the fun, right? It’s not just about unrolling code and precalculating everything – it’s the balance of doing that while also sticking within the very tight memory constraints.

```clike
//;$0000-0fff RESERVED
//;$1000-1fff Music
//;$2000-9fff Code and Precalc Font Data
//;$b800-bb5f Sprite X Tables
//;$bc00-bd7f Scrolltext0
//;$bd80-beff Scrolltext1
//;$bf00-bfff Fade Sin Table
//;$e000-ffff Sprite Output (nb. avoiding the holes below)
//;$f7f8-f7ff Screen0 Sprite Vals
//;$fbf8-fbff Screen1 Sprite Vals
```

---

## Stages of Development

One thing that I find helps a lot when building complex demo parts is to plan out exactly what is needed to make it happen. With this part, there are several things that will be required:-

- Top and bottom borders to be opened (somewhere around VSYNC=$0f8 and $0ff we will need to change $d011)
- Side borders to be opened for the whole screen ($d016 to be changed at the appropriate HSYNC positions for every raster line)
- Simple sprite multiplexing working – updating sprite Y values as appropriate to match our sprite sinus
- Full sprite multiplexing working – updating sprite X values and sprite indices as appropriate
- Baking out pre-calculated DYPP font data
- Generate some test sprite data – a single frame of prebaked DYPP sprite data to make sure that the sprite multiplexing is implemented correctly
- Interleaving the blit-code into the above raster code
- Adding sinus and scrolltext movement, along with the 2nd frame of animation

So, yeah, it’s a lot to get through… but you can do this in baby-steps with a plan like this – keeping an eye on memory as best as you can as you work through it.

With all of the above, I consider what the end goal is as well – a single function that’s called with a stable raster, at a certain raster position, and that will do all the work without any variable timing – we need to know exactly how many cycles each instruction takes – so we should avoid branching, any indexed loads that might cross page boundaries, etc etc.

I tend to do this by starting at an early raster position, eg. VSYNC=$010, and simply NOP’ing until I get to the exact VSYNC/HSYNC that I want.. since the first stage is to open top/bottom borders, starting at VSYNC=$0f8, that means a large of NOPs. Don’t worry about this though – the plan later on is to replace as many of these as we can with “proper” code.

---

## Screen Off Mode

Badlines are a fantastic thing on C64 – where the VIC uses a bunch of cycles to pull in the next char row of the screen. Extra badlines can be coaxed out of the VIC to create some really nice effects – like FLI for example. But.. when you only want sprites on the screen, such as for the Sprites Only compo, it would be nice to not have to worry about them.

And that’s where this special screen mode comes in… essentially, you disable the screen but then tear it open again by using border-opening tricks. VIC works on trigger points – it starts drawing the border when it (i) believes that it shouldn’t have already started drawing the border and (ii) when it believes that it now should be drawing the border. So, essentially, there are 2 points on the screen where it will decide for the top and bottom borders: one for 25 row screens, one for 24 row screens… and top/bottom border opening happens when you switch between these modes at the right VSYNC points.

To open top/bottom borders in screen-off mode, we need to first of all have the screen turned on for a single frame (make sure the screen is clear and set to the same colour as the border to avoid flicker). Then, at around VSYNC=$0f8, we simply:-

```asm6502
lda #$03
sta $d011
```

And at VSYNC=$0ff:-

```asm6502
lda #$0b
sta $d011
```

Note: This has to be done *every single frame*. This is important. If you get your timing wrong – *everything will completely disappear*.

---

## Tearing Open The Side Borders

The next stage is to start opening up the side borders. It’s worth at this point putting 8 y-expanded sprites at their top-most position – sprites affect raster timings so, in doing this, we just make sure that we’re not going to have to re-do the timing work later on.

On PAL machines, we have 63 cycles per raster-line.. and we lose quite a few of those for having 8 sprites enabled. With y-expanded sprites, we will have 42px at the top of the screen where the timing will be different. On these lines, and all lines following, we aim for having the following code at the appropriate HSYNC, close to where the right border is (HSYNC around $038) – this needs to be very accurate and you can either do it by following the VIC Timing chart (by the awesome Linus Akesson, aka LFT) to the word, or simply use trial-and-error like myself.

```asm6502
dec VIC_D016
inc VIC_D016
```

At this point, I should probably mention … to make all of this much, much easier… I use an “ASM generator” written in C++. So I’ll go off on a tangent now and explain a little about what this is …

---

## Raistlin’s ASM Generator

To cut a long story short, in order to allow myself to quickly build these sort of effects, I have a self-written toolset that helps me generate 6510 ASM code that is cycle-timed so that I know exactly at which HSYNC and VSYNC code will execute. CPP functions are used for adding cycle-wasting code – so if I call, for example, WasteCycles(1000), it might spit out 500 lines of NOPs.

This generator comes into it’s own when it comes to interleaving code – so, later on, we want to interleave the code that blits the DYPP data into the sprites.

I have a “*Master Routine*” which adds in all the code that must be very precisely timed – the border opening stuff, for example, and the raster bars. It also “loosely” multiplexes the sprites – sprite Y coordinates updating as appropriate to fill the full screen height (you have 20-21 raster lines where this can happen – hence why I say “loosely”), sprite X coordinates updating, sprite indices, etc. It’s important to try not to dirty registers in this code, if it can be avoided, so that the interleaved blit code doesn’t end up having to reload data – it can’t always be avoided, of course. This is one reason why I try to use DEC/INC pairs for changing $d016 – of course, doing STA/STX would be faster but then we’ve probably caused a problem for the blit code.

The Master Routine will then, once we’re ready, allow us to interleave blit code. We do this with something like:-

```clike
iSpareCycles = InterleaveCode(iSpareCycles);
```

Below you can see some of the code that my generator output for the finished version of this effect (don’t worry about what the blit code is doing – I’ll come to that later):-

```asm6502
//; Line $24
  lda FontDataDeduped_Line337,x                       //; 3 (  391) bytes   4 (   534) cycles
  sta Base_BankAddress0 + ($98 * 64) + (4 * 3) + 2    //; 3 (  394) bytes   4 (   538) cycles
  lda FontDataDeduped_Line148,x                       //; 3 (  397) bytes   4 (   542) cycles
  sta Base_BankAddress0 + ($98 * 64) + (5 * 3) + 2    //; 3 (  400) bytes   4 (   546) cycles
  lda FontDataDeduped_Line163,x                       //; 3 (  403) bytes   4 (   550) cycles
  sta Base_BankAddress0 + ($98 * 64) + (6 * 3) + 2    //; 3 (  406) bytes   4 (   554) cycles
  lda FontDataDeduped_Line338,x                       //; 3 (  409) bytes   4 (   558) cycles
  sta Base_BankAddress0 + ($98 * 64) + (7 * 3) + 2    //; 3 (  412) bytes   4 (   562) cycles
  nop                                                 //; 1 (  413) bytes   2 (   564) cycles
  dec VIC_D016                                        //; 3 (  416) bytes   6 (   570) cycles
  inc VIC_D016                                        //; 3 (  419) bytes   6 (   576) cycles
//; Line $25
  lda FontDataDeduped_Line339,x                       //; 3 (  422) bytes   4 (   580) cycles
  sta Base_BankAddress0 + ($98 * 64) + (8 * 3) + 2    //; 3 (  425) bytes   4 (   584) cycles
  lda FontDataDeduped_Line340,x                       //; 3 (  428) bytes   4 (   588) cycles
  sta Base_BankAddress0 + ($98 * 64) + (9 * 3) + 2    //; 3 (  431) bytes   4 (   592) cycles
  lda FontDataDeduped_Line341,x                       //; 3 (  434) bytes   4 (   596) cycles
  sta Base_BankAddress0 + ($98 * 64) + (10 * 3) + 2   //; 3 (  437) bytes   4 (   600) cycles
  lda FontDataDeduped_Line342,x                       //; 3 (  440) bytes   4 (   604) cycles
  sta Base_BankAddress0 + ($98 * 64) + (11 * 3) + 2   //; 3 (  443) bytes   4 (   608) cycles
  nop                                                 //; 1 (  444) bytes   2 (   610) cycles
  dec VIC_D016                                        //; 3 (  447) bytes   6 (   616) cycles
  inc VIC_D016                                        //; 3 (  450) bytes   6 (   622) cycles
//; Line $26
  lda FontDataDeduped_Line022,x                       //; 3 (  453) bytes   4 (   626) cycles
  sta Base_BankAddress0 + ($98 * 64) + (12 * 3) + 2   //; 3 (  456) bytes   4 (   630) cycles
  ldx ZP_ScrollText0 + 3                              //; 2 (  458) bytes   3 (   633) cycles
  lda FontDataDeduped_Line343,x                       //; 3 (  461) bytes   4 (   637) cycles
```

And here is the pre-DYPP’ed font data that the above code references:-

```asm6502
    FontDataDeduped_Line337:
        .byte $00, $f8, $f8, $f8, $f8, $f8, $f8, $f8, $78, $78, $f8, $78, $f8, $f8, $f8, $f8
        .byte $f8, $f8, $f8, $78, $78, $f8, $f8, $f8, $f8, $f8, $00
    FontDataDeduped_Line338:
        .byte $00, $fc, $fc, $fc, $f4, $fc, $fc, $fc, $c0, $c0, $fc, $f8, $fc, $fc, $fc, $fc
        .byte $fc, $f4, $7c, $f8, $0f, $c0, $fc, $fc, $fc, $fc, $00
    FontDataDeduped_Line339:
        .byte $00, $ff, $fc, $ff, $f8, $fc, $fc, $ff, $40, $40, $fc, $fc, $ff, $fc, $fc, $ff
        .byte $60, $f8, $1f, $f8, $0f, $c0, $fc, $fc, $fc, $fc, $00
    FontDataDeduped_Line340:
        .byte $00, $ff, $fc, $ff, $f8, $fc, $fc, $ff, $80, $00, $fc, $fc, $ff, $fc, $fc, $ff
        .byte $00, $f8, $87, $fc, $0f, $c0, $fc, $fc, $fc, $fc, $80
    FontDataDeduped_Line341:
        .byte $00, $fc, $fc, $fc, $fc, $fc, $fc, $7c, $f8, $00, $7c, $fc, $fc, $fc, $fc, $fc
        .byte $00, $fc, $f8, $fc, $0f, $c0, $7c, $7c, $fc, $fc, $f8
        .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00 //; pad out to 256 bytes
    FontDataDeduped_Line342:
        .byte $00, $7c, $7c, $7f, $64, $7f, $64, $1f, $7c, $00, $1f, $7c, $7c, $7c, $7c, $7c
        .byte $00, $7c, $7f, $64, $0f, $40, $1f, $1f, $64, $7f, $7c
```

The code for generating this, which hooks into my library functions, looks something like:-

```clike
    if (PartOfPlot == 1)
    {
        if (ALineLoaded != ReadLineA)
        {
            if (EnoughFreeCycles(NumCyclesToUse, 4))
            {
                SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDA_ABX, fmt::format("FontDataDeduped_Line{:03d}", ReadLineA)));
                ALineLoaded = ReadLineA;
                PartOfPlot++;
            }
            else
            {
                return false;
            }
        }
        else
        {
            PartOfPlot++; //; Skip this part as it's not needed
        }
    }
    if (PartOfPlot == 2)
    {
        if (EnoughFreeCycles(NumCyclesToUse, 4))
        {
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STA_ABS, fmt::format("Base_BankAddress0 + (${:02x} * 64) + ({:d} * 3) + {:d}", ABDDYPP_UsableSpriteVals[SpriteVal], SpriteLine, XCharPos % 3)));
            PartOfPlot = 0;
            CODE_YPos[ScrollerIndex]++;
        }
        else
        {
            return false;
        }
    }
```

Here’s a snippet from the Master Routine, too… ABDDYPP_UseCycles() is the call into the function that inserts the blit code (which only uses the A and X registers by the way).. and then we have the sideborder opening code and the raster-colour code (since we only have 4 sprites on that section of screen, we have enough cycles in between the $d016 changes to update $d021 (screen colour)).

```clike
    TotalWastedCycles += ABDDYPP_UseCycles(code, NumCyclesToUse, false, FrameIndex);
    code.OutputCodeLine(DEC_ABS, fmt::format("VIC_D016"));
    if (ColourToChangeScreenTo != 0xff)
    {
        code.OutputCodeLine(LDY_IMM, fmt::format("#${:02x}", ColourToChangeScreenTo));
        code.OutputCodeLine(STY_ABS, fmt::format("VIC_ScreenColour"));
        LastScreenColour = ColourToChangeScreenTo;
    }
    code.OutputCodeLine(INC_ABS, fmt::format("VIC_D016"));
    code.OutputBlankLine();
```

So, yeah, it’s a powerful toolset, I can’t imagine how something like this effect would be coded without it… but, still, there’s a hell of a lot of work required outside of this in order to get everything working.

---

## Sprite Multiplexing Part 1 – Y Positions

With our code generator, we now want to add some logic that will automatically move all of our sprites down, when needed. Inside my main loop, I keep track of the current VSYNC position, and the current state of Y for all of the sprites. As soon as VSYNC is greater than sprite Y, I know that we can update sprite Y to the next position. Something like this:-

```clike
    bool bYLoaded = false;
    for (int SpriteIndex = 0; SpriteIndex < 8; SpriteIndex++)
    {
        int CurrYVal = CurrentSpriteYVal[SpriteIndex];
        int NextYVal = CurrYVal + 42;
        if (RasterLine > CurrYVal)
        {
            if (0) //; <-- I do some checks here to remove 4 of the sprites during the rasterbar section...
            {
                CurrentSpriteYVal[SpriteIndex] = NextYVal;
                continue;
            }
            if (!bYLoaded)
            {
                if (EnoughFreeCycles(NumCyclesToUse, 2))
                {
                    SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDY_IMM, fmt::format("#${:02x}", NextYVal & 255)));
                    bYLoaded = true;
                }
            }
            if (bYLoaded)
            {
                if (EnoughFreeCycles(NumCyclesToUse, 4))
                {
                    SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STY_ABS, fmt::format("VIC_Sprite{:d}Y", SpriteIndex)));
                    CurrentSpriteYVal[SpriteIndex] = NextYVal;
                }
            }
        }
    }
```

That’s all that’s needed.. more important things are placed within the code to steal cycles first – because we have the luxury of being able to update sprite Y anywhere within 42 lines… so there’s really no rush.

---

## Sprite Multiplexing Part 2 – X Positions

For updating sprite X, due to the nature of our sinus, we have to do it “fairly soon”… so we set this code as higher-priority than updating the Y positions. I’ll just show you some of the code here – it’s quite a complex part of the solution so, yeah, please forgive me that this is real messy:-

```clike
    if (NextSpriteColumnIndex != CurrentSpriteColumnIndex[OutputSpriteIndex])
    {
        if (EnoughFreeCycles(NumCyclesToUse, 6)) //; <-- 6 needs to be higher if we alter sprite colours..
        {
            code.OutputFunctionLine(fmt::format("ABDDYPP_SpriteX{:d}_Scroller{:d}_Frame{:d}", NextSpriteColumnIndex, ScrollerIndex, FrameIndex));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDY_IMM, fmt::format("#$00")));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STY_ABS, fmt::format("VIC_Sprite{:d}X", OutputSpriteIndex)));
            code.OutputBlankLine();
            //; Some additional code was here to deal with the sprite colours - for my DYPP, each sprite column had a different colour...
            bXMSBIsDirty = true;
            CurrentSpriteColumnIndex[OutputSpriteIndex] = NextSpriteColumnIndex;
        }
    }
```

You’ll notice, hopefully, that I’ve added a label for each sprite column (0-17), one for each of our scrollers (0-1) and one for each frame (0-1) .. giving a total of 72 labels. The reason being that, as the sinus moves, and the scroller scrolls, we need to update these values outside our raster code. By using the labels, that outside code can write directly into the code – eg. “sta ABDDYPP_SpriteX13_Scroller0_Frame1 + 1” ..

---

## Sprite Multiplexing Part 3 – Sprite Indices

For my DYPP, I used 16px interleave. This means that, every 32 lines (remember, the sprites are y-expanded) I can update the whole row. I do this with:-

```clike
    while ((UpdateSpriteValIndex != -1) && (EnoughFreeCycles(NumCyclesToUse, 12)))
    {
        int LineVal = YLine / 32 + 1;
        int SpriteVal = ABDDYPP_SpriteRemapping[FrameIndex][LineVal][UpdateSpriteValIndex];
        if (SpriteVal != -1)
        {
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDY_IMM, fmt::format("#${:02x}", ABDDYPP_UsableSpriteVals[SpriteVal + 0])));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STY_ABS, fmt::format("SpriteVals{:d} + {:d}", CurrentD018, SpriteValsToUse[0][UpdateSpriteValIndex])));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDY_IMM, fmt::format("#${:02x}", ABDDYPP_UsableSpriteVals[SpriteVal + 64])));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STY_ABS, fmt::format("SpriteVals{:d} + {:d}", CurrentD018, SpriteValsToUse[1][UpdateSpriteValIndex])));
        }
        UpdateSpriteValIndex++;
        if (UpdateSpriteValIndex == ABDDYPP_MAX_NUM_SPRITES_TO_USE)
        {
            UpdateSpriteValIndex = -1;
        }
    }
```

The updates can happen anywhere within around 32 lines as we are setting the values for the next row. We then just need a perfectly-timed $d018 change in order to update the screen-address and reference the correct sprite indices. I handle this with:-

```clike
    if ((YLine > 0) && (YLineMod32 == 0))
    {
        if (EnoughFreeCycles(NumCyclesToUse, 6))
        {
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(LDY_IMM, fmt::format("#D018Value{:d}", CurrentD018)));
            SubtractCycles(NumCyclesToUse, code.OutputCodeLine(STY_ABS, fmt::format("VIC_D018")));
            CurrentD018 ^= 1;
        }
    }
```

---

## The Blit Code (and data)

I can’t believe I’ve written so much, about a DYPP routine, and haven’t even touched on the basics of how this type of DYPP work yet. I don’t believe anyone’s really defined the different DYPP methods yet – so… let’s go ahead and name this one the Prebaked Blit DYPP.

With this method, we will have our font pre-DYPP’ed and packed down into as small a format as we can easily access.

For starters, here’s the font that we used for this effect – the font was built by Ksubi of Genesis Project, one of my main go-to guys when I want a font with certain technical qualities (I’ll come to those in a minute):-

![Ksubi's 16px font for the DYPP: A to Z plus full stop, exclamation and question marks](https://c64demo.com/img/Dq2hmTKkLx-528.png)

Before we even start to apply our DYPP sine to this, there’s an easy optimisation to make. If we convert these into 8x16px columns, we can see that there are a few duplicates in this. For example, the left side of ‘A’ and ‘F’. In fact, there are quite a few matches (thanks Ksubi!). The font has 58 columns – deduped, it comes down to just 27 – meaning that we can fit 9 sets of these into each 256-byte memory block (nb. remember that we don’t want to have any data crossing page boundaries – our blit code must have a fixed cycle count)… and we’re only “wasting” 13 bytes per block, which isn’t too bad.

At the next step, I actually did something a bit .. well .. naughty. In code, I effectively scaled Ksubi’s beautiful 16px high font down to 9px – since I’m using Y-expanded sprites, this gives an “effective” size of 18px. From what I can remember, I did this as a nasty-hack at first, hoping to ask Ksubi to later create me a proper 9px high font – but either I forgot to mention it to him, or we just decided that it worked fine .. honestly, I can’t remember which …….. (sorry Ksubi!)

Next up, I pre-DYPP’ified the font data. That is, I took each 8px-wide section of the sinus above and I rendered each char to be displaced as it would be on that sine. That gives this:-

![The font pre-DYPPed: each 8px column rendered at every displacement of the sine, 624 lines tall](https://c64demo.com/img/Xreip5tsWE-216.png)

This is 624px tall – so, packing 9 lines per 256 byte block, that’s 17,920 bytes of memory.. and then the same again for the 2nd frame of our DYPP, coming to 35,840 bytes. BAD. Basically, we can’t fit it.

But herein lies the next trick .. we now look for how many of our 27-byte rows are identical. Our C++ code handles this for us too of course. Note: with both the column-data dedupe from the original font, and with the row-data dedupe I’m about to show you, we of course need to keep track of how we are deduping with a reverse lookup table.

Here’s how this turned out:-

![Row dedupe: original data for both frames in blue, duplicate rows marked red, the 478 unique rows in green](https://c64demo.com/img/QB_lAZw8-v-532.png)

On the left, in blue, you see the original font data – this time including the 2nd animation frame as well. In the middle, where you see a red row, that’s because that data line has already appeared somewhere above – so can be taken out of the data. On the right hand size, you see our full deduped data. Deduping has reduced the data from 1248 lines to 478 – a 62% reduction. Meaning we just need 13,824 bytes for data.

For convenience, I output this data as an ASM – I could of course just as easily output in binary format .. but it’s sometimes nice to have the data in human-readable form. Note: I already showed some of this output above when talking about my ASM generator.. you can see how I pad out to 256 bytes every 9 lines here with the extra zeros added between FontDataDeduped_Line341 and FontDataDeduped_Line342.

The final stage is to add in our blit code … and that’s easy now of course. With an “unpacked scrolltext” (we pre-unpack the scrolltext so it’s in our column-format rather than the actual text), we can now use indexed reads into FontDataDeduped and write directly to the correct memory address.

On that last point, the destination address depends on how you choose to go about this … you really have 2 options… (i) use a set of sprite data for each of your frames, (ii) reuse the same sprites for both frames. Option (i) means that you don’t need to clear any data (the frames won’t write to exactly the same bytes).. but option (ii) requires less sprite data, saving you a good chunk of memory.

---

## Conclusion

Hopefully this was useful to some .. and I hope some will see some avenues in the above for further optimisation and improvement – in writing this up I’ve thought of a few myself, actually, but whether I will ever come back to these routines I can’t say (how many DYPPs can one scener make, right?).

Please let me know if you have any questions or suggestions.

Cheers!
