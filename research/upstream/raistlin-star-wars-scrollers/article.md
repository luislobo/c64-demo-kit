# Star Wars Scrollers

- URL: https://c64demo.com/star-wars-scrollers/
- Author: Raistlin (Genesis Project)
- Published: 2022-03-22
- Level: hard
- Tags: 6502, c64, demoscene, scrollers, bitmap, code generation
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Rivalry by The Seniors (Bonzai, Censor Design, Fairlight, Genesis Project and Offence) (2019) https://csdb.dk/release/?id=177023; The Dive by Genesis Project (2019) https://csdb.dk/release/?id=179128

> How to make a Star Wars scroller on the C64 with bit-picked font data and cyclic scroll buffers, plus a short history of the effect.

Assumes: Setting up charset, bitmap and sprite screens; Unrolled LDA/ORA/STA plotting from pre-shifted font data (https://c64demo.com/dxycp-scrollers/)

## Summary

We’ve all seen the openings to the Star Wars movies, with the scrawl starting just below the camera and moving out into the distance, the text slowly getting smaller and smaller until it fades away. Here’s one that I made earlier, featured in 2019’s Rivalry demo by The Seniors (Bonzai, Censor, Fairlight, Genesis Project and Offence), released at Revision 2019 (and winning the Oldschool Demo Competition):-
Video: <https://www.youtube.com/watch?v=P9CfUbRuMGc>
*Video: [Rivalry by The Seniors](https://www.youtube.com/watch?v=P9CfUbRuMGc), the full demo, including the Star Wars scroller aimed at Censor Design.*

This is what I would call a “classic” Star Wars scroller. In this case, following the theme and nature of the demo, it’s making a jibe at Censor Design who, just 6 months or so prior to this, had release “The Star Wars Demo” and managed to do so without incorporating a Star Wars Scroller – much to the chagrin of many (not that it mattered – their demo still took home the coveted 1st place at X2018).

---

## History of Star Wars Scrollers

It’s worth looking back at the various different Star Wars scrollers that have been created before.

## Argon Gew Up by Argon (1989)

Possibly the first such scroller (thanks to Bjorn Odendahl for pointing out that I’d omitted it in an earlier version of this blog). Really nice ROL/ROR-based scroller. No Y-packing, unfortunately, so it does look a little bit strange along with the coolness 😉 :-
Video: <https://www.youtube.com/watch?v=mYFAkBrHVe8>
*Video: [Argon Grew Up by Argon (1989)](https://www.youtube.com/watch?v=mYFAkBrHVe8): a ROL/ROR scroller with no Y-packing.*

## Bring Me Edelgas by Masters’ Design Group (1989)

Not quite a Star Wars scroller – but very similar. A very different technique used here, too, with expanded sprites, in a kind of “who needs smooth timing?” x-position tech-tech and scaling using precalculated sprites of various sizes. I really like it, actually, definitely very very nice for 1989.

NB. Sorry everyone, the YouTube video that I was linking to was removed by the author… and there seem to be no more recordings of this demo on there right now…


## Eldorado by Origo Dreamline (1990)

Another ROR/ROL scroller, with perspective. Looks a little bit messy and hard to read the further back the text goes, especially with the text so tightly packed in Y, but still very impressive for it’s time.
Video: <https://www.youtube.com/watch?v=OBNDlIULVVE>
*Video: [Eldorado by Origo Dreamline (1990)](https://www.youtube.com/watch?v=OBNDlIULVVE): a ROL/ROR scroller with perspective.*

## Trick and Treat by Fairlight, Offence and Prosonix (2012)

Stein Pedersen was the next to give the scrawl a go… and he came up with something silky-smooth. By using a 3×5 font, he was able to make the scroller work at 50fps. Blocky, yes, but it’s a thing of beauty running at this framerate:-
Video: <https://www.youtube.com/watch?v=aT3pkqmxxLY>
*Video: [Trick and Treat by Fairlight, Offence and Prosonix](https://www.youtube.com/watch?v=aT3pkqmxxLY): the 3x5 font scrawl at 50fps.*

## The Phoenix Code by Bonzai (2016)

In the X2016 winning demo, Ricky of Bonzai presented a really nice, proper-font scrawl. None of the nasty definition loss as the scroller moved into the distance. Not 50fps, sure, there’s just too much data being blit per frame here, but it’s hard to tell that at first glance. Here, the text is possibly just a little bit too much spaced out in Y but, otherwise, can’t be faulted at all:-
Video: <https://www.youtube.com/watch?v=L9HUSKzy918>
*Video: [The Phoenix Code by Bonzai](https://www.youtube.com/watch?v=L9HUSKzy918): a full-font scrawl that keeps its definition into the distance.*

## The Dive by Genesis Project (2019)

Three or four months after the release of Rivalry, I recycled the scrawl code in The Dive – but with a slight difference. I reversed the direction of the scroller, so that it was coming out of the screen rather than heading into it, and I added a wibbly reflection of the scroller on the water as well. JackAsser liked it, anyway, as you’ll hear from the whoops in the live recording from Gubbdata 2019 here:-
Video: <https://www.youtube.com/watch?v=PTZ3Uiv55cs>
*Video: [The Dive by Genesis Project, live recording](https://www.youtube.com/watch?v=PTZ3Uiv55cs): the reversed scrawl with its reflection on the water.*

---

## Prerequisites

You probably need to know at least the very basics of C64 demo coding, such as how to:-

- setup charset, bitmap, sprites

That’s probably all that you need, this time around… nothing too technical to describe here – it’s all just about clever data and ASM generation.

---

## How It Works

The way my own Star Wars scrollers work is to essentially have all the font-date pre-packed into all the forms needed to do simple LDA/ORA/STA work in drawing the scrawl. If you take a look at the image below, you can see each text-column highlighted in yellow/blue. At the bottom, the text is 16px wide, at the top, 8px. Given the minimum width of 8px, that means that each target byte will be affected by at most 2 characters in our scrolltext.

![The perspective scroll plane on the byte grid: text columns alternate yellow and blue, 16px wide at the bottom, 8px at the top](https://c64demo.com/img/VQkW3Bo_lu-1024.png)

There needs to be a calculation mapping from screenspace (320x80px) to our flat scrollplane (320x128px). The X component of that is easy enough – just do an iteration for the width from 320 to 160px across the height (80px) and then linearly interpolate from -width/2 to +width/2. Use texel-centre math to make it a little smoother. For Y, you really just need to play around until you find something that works – I found a weird inverse calculation that kinda worked well for me:-

```clike
    float ZValue = 0.6f + (((float)YScreenPos) / ((float)STARWARS_HEIGHT)) * 0.4f;
    int YLookupPos = 499 - (int)(299.0f / ZValue);
```

With this, we can use some very simple code like the following to plot each part of the scroller:-

```asm6502
    PlotLine11:
        iny                                                                                                             //; 1 ( 3798) bytes, 2 (  5054) cycles
        ldx.abs ScrollData + (0 * $100), y                                                                              //; 3 ( 3801) bytes, 4 (  5058) cycles
        bpl PlotLine11_Yes                                                                                              //; 2 ( 3803) bytes, 2 (  5060) cycles
        jmp.abs PlotLine12                                                                                              //; 3 ( 3806) bytes, 3 (  5063) cycles
    PlotLine11_Yes:
        lda.abs FontData_14, x                                                                                          //; 3 ( 3809) bytes, 4 (  5067) cycles
        sta.abs BitmapAddress + (5 * 320) + (1 * 8) + 7                                                                 //; 3 ( 3812) bytes, 4 (  5071) cycles
        lda.abs FontData_15, x                                                                                          //; 3 ( 3815) bytes, 4 (  5075) cycles
        sta.abs BitmapAddress + (5 * 320) + (2 * 8) + 7                                                                 //; 3 ( 3818) bytes, 4 (  5079) cycles
        lda.abs FontData_16, x                                                                                          //; 3 ( 3821) bytes, 4 (  5083) cycles
        ldx.abs ScrollData + (1 * $100), y                                                                              //; 3 ( 3824) bytes, 4 (  5087) cycles
        ora.abs FontData_8, x                                                                                           //; 3 ( 3827) bytes, 4 (  5091) cycles
        sta.abs BitmapAddress + (5 * 320) + (3 * 8) + 7                                                                 //; 3 ( 3830) bytes, 4 (  5095) cycles
        lda.abs FontData_9, x                                                                                           //; 3 ( 3833) bytes, 4 (  5099) cycles
        sta.abs BitmapAddress + (5 * 320) + (4 * 8) + 7                                                                 //; 3 ( 3836) bytes, 4 (  5103) cycles
```

nb. don’t worry about how I’m indexing ScrollData here just yet – I’ll explain that later. It’s quite cunning 😉

In order to get our heads around the data format and how the blitting works, let’s isolate a single byte that we need to blit – choosing one deep within the scrawl:-

![Zoom on one target byte deep in the scrawl: 3px from the left char, a 1px gap, 4px from the right char](https://c64demo.com/img/NAu28EJS5f-1024.png)

Here, we have 3px of the left hand character, a 1px space and then 4px from the right hand character. So we can consider the two parts that will need to be ORA’d together to be something like this

```clike
xxx----- ([0-15],[0-15],[0-15],UNUSED,UNUSED,UNUSED,UNUSED,UNUSED) //; 3px of left-hand-char
----xxxx (UNUSED,UNUSED,UNUSED,UNUSED,[0-15],[0-15],[0-15],[0-15]) //; 4px right-hand-char
```

Due to the nature of the data, each [0-15] part will be ascending, too. The data that we need for blitting will be the font “compressing” from 16px down to 8px the closer to the top (“far distance”) – so it’s essentially skipping bits. Eg. at 8px, we might have (0,2,4,6,8,10,12,14). It doesn’t make any difference to our code that the data falls out in this form – but it means that we’re likely to need a lot less memory for our precalculated bitfield data.

Taking the example above again, we could have bits (11, 13, 15) for the left (yellow) and bits (0, 2, 4, 6) for the right (blue). Our code-generator (C++ code in my case) then stores this into a data table.

---

## Bit-Picked Compressed Font Data

I’ll explain why in the next section, but our font has one very nice characteristic that allows us to compress the data into a very usable form. There are only 28 unique 16x1px segments within the entire font. Ksubi, again, is our technical font-master. He built his font using CharPad, creating 16x1px tiles and using these to build the font characters. We cheated slightly to get the data size down – omitting Q and only including a small number of special characters (dash ‘-‘, dot ‘.’ and ‘4’ (an odd choice, I know, but go hassle F4CG about it, who we wanted to greet in our scroller :-p)).

By doing so, we get our precalculated data down to 28bytes per unique bit-set. It also means that our scrolltext needs to be converted into ~16bytes, becoming the tile index into the 16×1 tileset (nb. this can be done at runtime, of course, as memory is an expensive commodity on C64).

In creating our unique bit-picked font data, we then end up with something like:-

```asm6502
    FontData_309: //; 3_4_6_8_9_11_13_14
        .byte $00, $7c, $fe, $c7, $83, $ff, $fc, $fe, $87, $fc, $7f, $ff, $c0, $80, $bf, $c3
        .byte $30, $03, $07, $c7, $ef, $bb, $bb, $93, $fc, $7e, $c6, $fc
    FontData_310: //; 4_6_8_9_11_13_14_255
        .byte $00, $f8, $fc, $8e, $06, $fe, $f8, $fc, $0e, $f8, $fe, $fe, $80, $00, $7e, $86
        .byte $60, $06, $0e, $8e, $de, $76, $76, $26, $f8, $fc, $8c, $f8
    FontData_311: //; 1_3_5_6_8_10_11_13
        .byte $00, $3e, $7f, $c3, $c1, $ff, $fe, $ff, $c3, $fe, $3f, $7f, $c0, $c0, $df, $c1
        .byte $18, $01, $03, $e7, $f7, $fd, $d9, $c9, $7e, $3f, $67, $7e
    FontData_312: //; 9_10_12_14_255_255_255_255
        .byte $00, $c0, $e0, $30, $30, $f0, $c0, $e0, $30, $e0, $f0, $f0, $00, $00, $f0, $30
        .byte $00, $30, $30, $70, $f0, $f0, $b0, $30, $c0, $e0, $60, $e0
    FontData_313: //; 255_255_255_255_255_2_4_5
        .byte $00, $03, $07, $06, $04, $07, $07, $07, $04, $07, $03, $07, $06, $04, $04, $06
        .byte $00, $00, $00, $07, $07, $05, $04, $04, $07, $03, $07, $03
    FontData_314: //; 1_3_4_6_8_9_11_13
        .byte $00, $3e, $7f, $e3, $c1, $ff, $fe, $ff, $c3, $fe, $3f, $7f, $e0, $c0, $df, $e1
        .byte $18, $01, $03, $e3, $f7, $dd, $dd, $c9, $7e, $3f, $63, $7e
    .fill 4, $00 //; pad to 256-byte boundary to prevent page crossing costs
```

In our case, we ended up with 395 of these – 11,232 bytes of memory in total.

---

## Cyclical Scroll Buffers

The Star Wars scrawl in Rivalry was 80px tall. The actual non-perspective data moving through this was taller, however, at 128px. Some of the horizontal pixel lines would be removed in order to compress the scroller in Y – the further that the scroller gets into the distance, the more lines are removed, compressing the text down in Y to create perspective.

As each on-screen character starts at 16px-wide, and we start the scroller at 320px wide, we have 20 individual columns of scrolldata. Into these, we place each tile index of the scroller. In it’s shortest form, that would be 20x 128-byte blocks (2560 bytes total). But … so that we didn’t need to mess around scrolling this data (it would be expensive due to the size), we opted for cyclic memory buffers. To do this, we simply duplicated the data in each buffer – so ScrollData0 would be repeated at ScrollData0 + 128.

When blitting the data to the screen, we then simply set Y to an appropriate value at the top, increase it by an appropriate amount for each line of the screen (not always by 1 – we might increase it by 2 or 3 in order to skip lines, as mentioned above), and we simply read the scrolldata for each column with something like:-

```asm6502
        ldx.abs ScrollData + (ColumnIndex * $100), y                                                                              //; 3 ( 3801) bytes, 4 (  5058) cycles
```

Where ColumnIndex is a number in the [0, 20) range.

As each line of the scroller is quite costly, and an entire line can be completely empty, we also allow an early-out. Where we can get away with not drawing a whole line, we simply insert a negative number into the scrolldata ($ff for example) and then detect this with:-

```asm6502
        ldx.abs ScrollData + (0 * $100), y                                                                              //; 3 (23552) bytes, 4 ( 31364) cycles
        bpl PlotLine75_Yes                                                                                              //; 2 (23554) bytes, 2 ( 31366) cycles
        jmp.abs PlotLine76                                                                                              //; 3 (23557) bytes, 3 ( 31369) cycles
    PlotLine75_Yes:
//; ... all the blit code here
    PlotLine76:
        iny
        iny
```

Or something to that effect.

---

## Lazy Rendering

For my Star Wars scrawl, in The Dive, the entire render function was over 32000 cycles and 24000 bytes – plus the 11000+ for the font data. It doesn’t matter so much that this is more cycles than we have in a frame. You can either use the IRQ-in-an-IRQ method or you can issue the rendering from outside IRQs completely. No need to worry about double-buffering, just keep running the plot routine continuously. The nature of these scrollers, you just notice an extra little bit of “wobbling” in the scroller. Call it “tearing” if you like – but, honestly, so long as you don’t vsync before each call to the plot routine, you’re unlikely to notice anything – the tear will be in a completely different position each frame (unless you’re extremely unlucky with your timing – if so, it can be easily fixed anyway).

---

## The Reflection

The Dive’s Star Wars scroller also has that cool-looking reflection at the bottom of the screen. I’ve been asked how that was done – and, honestly, the answer is “easily”.

When blitting to the bitmap (or wherever), we just do a little randomised, scaled operation to decide whether or not, and where, we should repeat the byte that we’ve just written – but writing it to the bottom of the screen instead.

I scale to half-height and use C++’s rand() function like this:-

```clike
    if (YPos % 2 == 0)
    {
        if(rand() % 2 == 0)
        {
            int YPos1 = 167 - (YPos / 2);
            if (YPos0 != YPos1)
            {
                PlotterCode.OutputCodeLine(STA_ABS, fmt::format("BitmapAddress + ({:d} * 320) + ({:d} * 8) + {:d}", YPos1 / 8, XBytePos, YPos1 % 8));
            }
        }
    }
```

I then just do a bit of raster-trickery to wobble the reflection area by changing $d016 each line too.

![The Dive's reversed Star Wars scroller with its scaled, scattered reflection on the water below](https://c64demo.com/img/GwgXXg96mQ-408.png)

Works pretty nicely I think..?

---

## Wrapping Up

Hopefully this gave you some ideas, anyway, and will help you think up even better ways of doing these effects .. will you be the one who creates a smooth-font 50fps Star Wars scroller on C64? I’d love to see that one day.
