# Side Border Bitmap Scroller

- URL: https://c64demo.com/side-border-bitmap-scroller/
- Author: Raistlin (Genesis Project)
- Published: 2022-12-03
- Series: Memento Mori
- Level: insane
- Tags: 6502, c64, sprites, borders, bitmap, scrollers, loading
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> The Memento Mori end part: a bitmap scrolling through the C64 side borders at 25fps while streaming from disk with Sparkle and SPOT.

Assumes: Opening the side borders; 20px sprite interleave (https://c64demo.com/sprite-interleave/); Multicolour bitmap mode; IRQ loading

## Summary

Probably the effect that garnered the largest applause from our demo [Memento Mori](https://csdb.dk/release/?id=195841) was the final part. This featured a beautiful, huge bitmap scrolling up through the full screen AND the sideborders while streaming extra data from disk… all at 25 frames per second. Definitely not an easy feat, and something that had never been done before on the C64.

The effect was developed by myself ([Raistlin](https://csdb.dk/scener/?id=848)) with a tremendous amount of help from [Sparta](https://csdb.dk/scener/?id=29482) to get it working at 25fps.

The visible screen is 408 x 192px – 320 x 192px for the main full-colour bitmap part of the screen plus 48 x 192px for sprites in the left border, 40 x 192px for sprites in the right border.

Take a look at it here:-
Video: <https://www.youtube.com/watch?v=ob5GHijbWSg>
*Video: [Memento Mori by Genesis Project](https://www.youtube.com/watch?v=ob5GHijbWSg), the full demo. The side border bitmap scroller is the final part.*

---

## Initial Border-Opening Code

As with most of my demo parts, I started this with a detailed plan of attack… in order for the effect to work, I would need several IRQ routines that would open the side borders – but with all the bitmap scrolling code, sprite multiplexing and more interleaved into this .. all without exceeding the relatively small memory footprint available.

Most of the coding here is done using my C++-based ASM-code-generator. I’d like to call it a “library” or a “suite”.. but, honestly, it’s more a hodge-podge of barely working functions that I slowly mould over time, as I need more and more features, into an even bigger bowl of spaghetti code. But anyway..!

Initially, I started by placing the top row of 4 sprites on screen and then started on the border-opening IRQ.. filling gaps between the $d016 writes with pad code (NOPs). I knew that I would need all this space later on for efficient bitmap scrolling – so there’s no need to do anything clever here, simply add NOP (1 byte, 2 cycles) and NOP $ff (2 bytes, 3 cycles) in order to space the $d016 writes correctly.. eg.:-

```asm6502
IRQ_MainCall_0:
    nop $ff                                                                    //; 2 (    2) bytes   3 (     3) cycles
    nop                                                                        //; 1 (    3) bytes   2 (     5) cycles
    nop                                                                        //; 1 (    4) bytes   2 (     7) cycles
    ldy #D016_Value_40Rows_MC                                                  //; 2 (   59) bytes   2 (   115) cycles
    ldx #D016_Value_38Rows_MC                                                  //; 2 (   61) bytes   2 (   117) cycles
    stx VIC_D016                                                               //; 3 (   64) bytes   4 (   121) cycles
    sty VIC_D016                                                               //; 3 (   67) bytes   4 (   125) cycles
```

Next up is the code to add the additional sprite rows (adding 21 to the y-coordinate of all 4 sprites) and then continuing the border code .. 10 rows of sprites are needed in total to cover 210 pixels.

With that done, the next part was to make the screen scroll every couple of frames – changing $d011 to smooth-scroll upwards. With this, I would also move the sprites by the same amount. Together, this means that the same border-opening IRQ code will work despite moving badlines – we just adjust the IRQ trigger v-pos ($d012) to follow the scroll.

Now we have a working scrolling sprite-multiplex with side borders always open.

---

## Interleaved Bitmap Scroll

There are 3 sets of data that need to be moved in order to achieve smooth bitmap scrolling:-

- the bitmap (.map) data, 8000 bytes
- the screen (.scr) data, 1000 bytes
- the colour (.col, $d800) data, 1000 bytes

If you’ve worked with C64 bitmaps before (I’m assuming that you have – if you haven’t, you’re probably lost already about what the heck this is all about) then you will know that the bitmap and screen data can be double-buffered. The colour data, however, can’t.

We scroll at 1 pixel per 2 frames and we copy all the data 8 pixels up the screen.. so we have 16 frames before we need to flip buffers. Since the colour data can’t be double-buffered, we “just” update that on the 15th frame, right before the buffer flip. We “chase the rasterbeam” with this, making sure that we only write to colour memory once the VIC has finished reading that whole line. If we don’t do this right, there’ll be some nasty flickering every 16 frames.

So… we actually end up with 3 different routines:-

1. copy 1/15th of the bitmap data from buffer A to buffer B
2. copy 1/15th of the bitmap data from buffer B to buffer A
3. copy the colour data

Here’s an example section from our code for the first routine:-

```asm6502
    lda BitmapAddress0 + $01c7,x                                               //; 3 (   59) bytes   4 (    88) cycles
    sta BitmapAddress1 + $0087,x                                               //; 3 (   62) bytes   5 (    93) cycles
    lda BitmapAddress0 + $01d6,x                                               //; 3 (   65) bytes   4 (    97) cycles
    sta BitmapAddress1 + $0096,x                                               //; 3 (   68) bytes   5 (   102) cycles
    lda BitmapAddress0 + $01e5,x                                               //; 3 (   71) bytes   4 (   106) cycles
    sta BitmapAddress1 + $00a5,x                                               //; 3 (   74) bytes   5 (   111) cycles
    nop                                                                        //; 1 (   75) bytes   2 (   113) cycles
D016_40Cols_Load_0:
    ldy #D016_Value_40Rows_MC                                                  //; 2 (   77) bytes   2 (   115) cycles
    dec VIC_D016                                                               //; 3 (   80) bytes   6 (   121) cycles
    sty VIC_D016                                                               //; 3 (   83) bytes   4 (   125) cycles
//; Line $32
    lda BitmapAddress0 + $01f1,x                                               //; 3 (   86) bytes   4 (   129) cycles
    sta BitmapAddress1 + $00b1,x                                               //; 3 (   89) bytes   5 (   134) cycles
    lda BitmapAddress0 + $0200,x                                               //; 3 (   92) bytes   4 (   138) cycles
```

We use X for our frame index (0-14). It’s a little bit awkward, sure, as 15’s not such a nice number to work with .. our raster code needs to be consistently timed so that we hit the exact cycles needed to open the borders, we need to make sure that none of those LDA, x’s cross a 256-byte page boundary (if they do, a cycle is lost, turning LDA, x from a 4 cycle instruction to a 5 cycle one).

If you examine the numbers closely in the above, you’ll see that we copy from $1e5, x and $1f1, x .. so we actually have an overlap here of 3 bytes ($1f1, $1f2 and $1f3 will be copied twice). This is a very tiny “waste” of cycles .. but this only happens on the first copy section (where we copy BitmapAddress0 + [$140,$1ff] to BitmapAddress1 + [$000,$0bf]).

For all other sections, we copy almost the full 256-byte page.. 17 indexed copies will copy 17 * 15 = 255 bytes.. the remaining byte we do outside the IRQ code as a standalone non-indexed byte copy. So:-

```asm6502
    lda BitmapAddress0 + $0200,x                                               //; 3 (   92) bytes   4 (   138) cycles
    sta BitmapAddress1 + $00c0,x                                               //; 3 (   95) bytes   5 (   143) cycles
    lda BitmapAddress0 + $020f,x                                               //; 3 (   98) bytes   4 (   147) cycles
... more code ...
    lda BitmapAddress0 + $02e1,x                                               //; 3 (  204) bytes   4 (   308) cycles
    sta BitmapAddress1 + $01a1,x                                               //; 3 (  207) bytes   5 (   313) cycles
    lda BitmapAddress0 + $02f0,x                                               //; 3 (  210) bytes   4 (   317) cycles
    sta BitmapAddress1 + $01b0,x                                               //; 3 (  213) bytes   5 (   322) cycles
//; note: BitmapAddress0 + $02ff isn't copied
```

Similar code is used to copy the screen data:-

```asm6502
    lda ScreenAddress0 + $0100,x                                               //; 3 ( 4577) bytes   4 (  6815) cycles
    sta ScreenAddress1 + $00d8,x                                               //; 3 ( 4580) bytes   5 (  6820) cycles
    lda ScreenAddress0 + $010f,x                                               //; 3 ( 4583) bytes   4 (  6824) cycles
    sta ScreenAddress1 + $00e7,x                                               //; 3 ( 4586) bytes   5 (  6829) cycles
... more code ...
```

Across 15 frames, there should be plenty of CPU time to do all this copying – we need spare CPU, after all, to additionally copy the sprite data, which I come back to add in later on (after 20px sprite interleave is setup).

---

## 20px Sprite Interleaving

The next tricky aspect to cover is how we manage to create an efficient sprite multiplex layout that allows for easy scrolling through the side borders. In this instance, I chose, again, to use 20px sprite interleave. This means updating the sprite indices every 20 rasterlines. I make the sprites mimic the screen scrolling, simply moving them 0-7 pixels up the screen before resetting on the frame flip ..

The positives to this method are that it’s relatively easy to multiplex the sprites without having tears – we just need to ensure that the sprites are placed such that the 20px point never occurs on bad lines – and we only need 1px of overlap, meaning that we save a little on memory compared to other methods (such as 16px sprite interleave) and we save on the amount of data that we need to copy to scroll the sprites.

With 20px interleave, we need 11 rows of sprites – meaning 44 sprites (~2.8kb of RAM) per buffer (so, with double buffering, 5.6kb).

You can read up about 20px sprite interleave here: [https://codebase64.org/doku.php?id=base:sprite_interleave](https://codebase64.org/doku.php?id=base:sprite_interleave)

Here’s how some of our sprite-data copy code looks:-

```asm6502
    dec VIC_D016                                                               //; 3 ( 6325) bytes   6 (  9446) cycles
    sty VIC_D016                                                               //; 3 ( 6328) bytes   4 (  9450) cycles
//; Line $fa
    lda SpriteDataAddress0 + $071e,x                                           //; 3 ( 6331) bytes   4 (  9454) cycles
    sta SpriteDataAddress1 + $0706,x                                           //; 3 ( 6334) bytes   5 (  9459) cycles
    lda SpriteDataAddress0 + $0721,x                                           //; 3 ( 6337) bytes   4 (  9463) cycles
    sta SpriteDataAddress1 + $0709,x                                           //; 3 ( 6340) bytes   5 (  9468) cycles
    lda SpriteDataAddress0 + $0724,x                                           //; 3 ( 6343) bytes   4 (  9472) cycles
    sta SpriteDataAddress1 + $070c,x                                           //; 3 ( 6346) bytes   5 (  9477) cycles
    lda SpriteDataAddress0 + $0727,x                                           //; 3 ( 6349) bytes   4 (  9481) cycles
    sta SpriteDataAddress1 + $070f,x                                           //; 3 ( 6352) bytes   5 (  9486) cycles
    lda SpriteDataAddress0 + $082a,x                                           //; 3 ( 6355) bytes   4 (  9490) cycles
    nop                                                                        //; 1 ( 6356) bytes   2 (  9492) cycles
    dec VIC_D016                                                               //; 3 ( 6359) bytes   6 (  9498) cycles
    sty VIC_D016                                                               //; 3 ( 6362) bytes   4 (  9502) cycles
```

So, yeah, very similar to the bitmap copying .. but complicated slightly by the reordering of lines due to the 20px interleave method.

With this added, our IRQ code should now have pretty much all the NOPs in our border code replaced with blit code. So we’re no longer “wasting” so much CPU.

---

## Colour Copy Frame

As mentioned earlier, the final frame of every 16, we copy the colour data. No indexing in this case so we just do this the brute-force way with something like:-

```asm6502
    stx VIC_D016                                                               //; 3 ( 3335) bytes   4 (  4545) cycles
    sty VIC_D016                                                               //; 3 ( 3338) bytes   4 (  4549) cycles
//; Line $91
    sta VIC_ColourMemory + $017c                                               //; 3 ( 3341) bytes   4 (  4553) cycles
    lda VIC_ColourMemory + $01a5                                               //; 3 ( 3344) bytes   4 (  4557) cycles
    sta VIC_ColourMemory + $017d                                               //; 3 ( 3347) bytes   4 (  4561) cycles
    lda VIC_ColourMemory + $01a6                                               //; 3 ( 3350) bytes   4 (  4565) cycles
    sta VIC_ColourMemory + $017e                                               //; 3 ( 3353) bytes   4 (  4569) cycles
    lda VIC_ColourMemory + $01a7                                               //; 3 ( 3356) bytes   4 (  4573) cycles
    sta VIC_ColourMemory + $017f                                               //; 3 ( 3359) bytes   4 (  4577) cycles
    lda VIC_ColourMemory + $01a8                                               //; 3 ( 3362) bytes   4 (  4581) cycles
    sta VIC_ColourMemory + $0180                                               //; 3 ( 3365) bytes   4 (  4585) cycles
    lda VIC_ColourMemory + $01a9                                               //; 3 ( 3368) bytes   4 (  4589) cycles
    sta VIC_ColourMemory + $0181                                               //; 3 ( 3371) bytes   4 (  4593) cycles
    stx VIC_D016                                                               //; 3 ( 3374) bytes   4 (  4597) cycles
    sty VIC_D016                                                               //; 3 ( 3377) bytes   4 (  4601) cycles
```

As mentioned before, we just need to make sure that VIC has finished with each line before we start writing to it. C64 is great for such things, of course, as you can calculate exactly where the raster beam is at every point in the code (with good, stable, predictable demo-style code, anyway ;p).

---

## New Line Update

Alongside copying bitmap/screen/colour data, we also need to update the bottom line with new data. For this, I use a separate function outside of the sideborder-opening IRQ code. The source data format will be explained later – please just accept it for what it is in this sample of the code:-

```asm6502
UpdateNewData_SRC0_DST0:
    ldx ZP_BitmapUpdateSRCIndex                                                //; 2 (    2) bytes   3 (     3) cycles
    ldy ZP_BitmapUpdateDSTIndex                                                //; 2 (    4) bytes   3 (     6) cycles
    lda ScrollData_Buffer0 + $00a0,x                                           //; 3 (    7) bytes   4 (    10) cycles
    sta BitmapAddress0 + $1e00,y                                               //; 3 (   10) bytes   5 (    15) cycles
    lda ScrollData_Buffer0 + $00dc,x                                           //; 3 (   13) bytes   4 (    19) cycles
... more code ...
    ldx ZP_SrcStreamedScrDataOffset                                            //; 2 (  138) bytes   3 (   207) cycles
    cpx #$ff                                                                   //; 2 (  140) bytes   2 (   209) cycles
    beq NoScrDataUpdate_SRC0_DST0                                              //; 2 (  142) bytes   2 (   211) cycles
    lda ScrollData_Buffer0 + $0aa0,x                                           //; 3 (  145) bytes   4 (   215) cycles
    sta ScreenAddress0 + $03c0,y                                               //; 3 (  148) bytes   5 (   220) cycles
    lda ScrollData_Buffer0 + $0aaf,x                                           //; 3 (  151) bytes   4 (   224) cycles
    sta ScreenAddress0 + $03cf,y                                               //; 3 (  154) bytes   5 (   229) cycles
    lda ScrollData_Buffer0 + $0ab9,x                                           //; 3 (  157) bytes   4 (   233) cycles
    sta ScreenAddress0 + $03d9,y                                               //; 3 (  160) bytes   5 (   238) cycles
NoScrDataUpdate_SRC0_DST0:
    ldx ZP_SrcStreamedSpriteDataOffset                                         //; 2 (  162) bytes   3 (   241) cycles
    bmi NoSpriteDataUpdate_SRC0_DST0                                           //; 2 (  164) bytes   2 (   243) cycles
    ldy ZP_SpriteDataIndex                                                     //; 2 (  166) bytes   3 (   246) cycles
    lda ScrollData_Buffer0 + $0be0,x                                           //; 3 (  169) bytes   4 (   250) cycles
    sta SpriteDataAddress0 + $0918,y                                           //; 3 (  172) bytes   5 (   255) cycles
    lda ScrollData_Buffer0 + $0c0c,x                                           //; 3 (  175) bytes   4 (   259) cycles
... more code ...
    sta SpriteDataAddress0 + $0a2d,y                                           //; 3 (  217) bytes   5 (   323) cycles
NoSpriteDataUpdate_SRC0_DST0:
    rts                                                                        //; 1 (  218) bytes   6 (   329) cycles
```

We have 8 functions similar to this – for all combinations of (SRC0, SRC1, SRC2, SRC3) and (DST0, DST1). 4 source-data buffers and 2 destination targets (because we’re double-buffering). We could have saved some memory, actually, by using indirect zeropage addressing – but at the expense of losing some CPU cycles. By my calculations, we would’ve saved ~1.2k at the expense of ~40-50 cycles per frame.

Note: The early-outs (NoSrcDataUpdate and NoSpriteDataUpdate) are so that we can call these functions every frame – and they’ll simply skip forward on frames where there’s no work to do.

---

## IRQ Loading – Sparkle and Spindle

In early versions of this demo part, I was using [LFT](https://csdb.dk/scener/?id=16473)‘s Spindle for streaming data from disk. With this, it actually wasn’t quite fast enough to give me 25fps scrolling… had I stuck with Spindle, as it was at the time at least, we would’ve had 16.666fps instead (1px scrolling per 3 frame).

I made the switch to Sparkle, a brand new IRQ loader created by Sparta (the one-man member of the demo “group” OMG (One Man Group)), and found that the part was much, much closer to hitting the holy grail of 25fps.. but it still wasn’t quite there.

![Sparkle 2 loader screen: Built with Sparkle 2, a C64 trackmo loader solution](https://c64demo.com/img/9jvRSddBbu-384.png)

One thing with these IRQ loaders for me was that they always just seemed to work but you never quite knew what they were doing under the hood.. they loaded data quickly.. but, if you needed that data just a tiny bit faster, what did you need to do in order to help that happen?

- Increase the buffer size perhaps? It might sound strange – but if you double the amount of data, chances are it will be less than double the amount of time to load.. so “on average” you have your data faster;
- Reorder the data for better compression?;
- Split the data up, removing empty parts?;
- Merge data segments together, adding in padding?

Without a more detailed understanding, it was going to be very difficult to figure out .. so I reached out to Sparta to find out whether he could advise. I’d previously done similar with LFT – but with no such luck (in fairness to LFT, he’s a coding and hardware genius and always very very busy in both his professional and hobby life – damn, the guy recently created a working *accordion* using 2x C64s and some old disk cases!).

Sparta and I had some long chats, bouncing ideas back and forth about how to better lay the data out (you can read detailed notes on this below) and from there became great friends .. he even joined our demo group, Genesis Project, meaning that I could then show him exactly what I was making without worrying about it leaking to rival demo crews before release ;p

---

## Data Streaming Buffers

For each new line of our scrolling bitmap, we need 320 bytes for the bitmap data, 40 bytes for screen data and 20 bytes for colour data (we save 50% by pairing 4bit colours) .. giving 380 bytes in total. The most optimal format that we found was to split the buffers:-

```clike
//; Stream Buffer 0
unsigned char COLData_Blocks01234567[20][8];     //; 20 bytes, 8 blocks
unsigned char MAPData_Blocks0123[320][4];        //; 320 bytes, 4 blocks
unsigned char MAPData_Blocks4567[320][4];        //; 320 bytes, 4 blocks
unsigned char SCRData_Blocks0123[40][4];         //; 40 bytes, 4 blocks
unsigned char SCRData_Blocks4567[40][4];         //; 40 bytes, 4 blocks
unsigned char SpriteData_Blocks0123[8][11][4];   //; 8 pixels high, 11 columns wide, 4 blocks
unsigned char SpriteData_Blocks4567[8][11][4];   //; 8 pixels high, 11 columns wide, 4 blocks
```

Pretty strange, I know, but there’s some “magic” going on here. Within each stream buffer we have 8 full lines of data (ie. 408 x 64px). We batch like this as it gives us easy indexing – without needing to have individual functions to deal with each block – and also some locality to help with data compression. Getting this layout right was crucial to ensuring that the part ran at 25fps.

The streaming buffers are also double buffered… so we also have a second set of 8 lines of data reserved in memory – in the same format of course – and we alternately stream into one buffer while the other is being read from to fill new bitmap data as the screen scrolls.

Annoyingly, one of our streaming buffers needed to go under ROM .. we puzzled over this for a long time as, yeah, this is never a nice thing to deal with .. but it seemed unavoidable, we just couldn’t reorganize the memory in any way that would help.

So.. we had to do some clever trickery (costing valuable cycles) in order to use this. For the COL data, we needed to read this memory under ROM.. but then we had to also write to ROM to update the colour memory ($d800).

Here’s how nice the colour update code is when we’re using the buffer that’s -not- under ROM:-

```asm6502
VSBB_FastScrollColourMemory1:
    .for (var Index = 0; Index < 20; Index++)
    {
        ldx ScrollData_Buffer1 + Index, y
        stx VIC_ColourMemory + 1000 - 40 + (Index * 2) + 0
        lda $9f00, x
        sta VIC_ColourMemory + 1000 - 40 + (Index * 2) + 1
    }
    rts
```

(nb. the LDA $9f00, x is using a precomputed table that simply divides X by 16 – this is how we compress our COL data into 20 bytes instead of 40)

Here’s the same code using the buffer that’s under ROM – using some quite hacky self-modifying code and some “magic numbers” to hit the right memory addresses (shoot us!):-

```asm6502
VSBB_FastScrollColourMemory0:
    inc $00
    dec $01
    .for (var Index = 19; Index >= 0; Index--)
    {
        ldx ScrollData_Buffer0 + Index, y
        .if (Index != 0)
        {
            stx ColourBlitCode + (11 * Index) + 1 - 2
        }
    }
    inc $01
    dec $00
ColourBlitCode:
    .for (var Index = 0; Index < 20; Index++)
    {
        .if (Index != 0)
        {
            ldx #$ff
        }
        stx VIC_ColourMemory + 1000 - 40 + (Index * 2) + 0
        lda $9f00, x
        sta VIC_ColourMemory + 1000 - 40 + (Index * 2) + 1
    }
    rts
```

So, yeah, as you can see, quite long winded … but … it works. The order of the data is intended to create a good balance between being in a nice format for quick blitting to the bottom of the screen and such that it compresses well to squeeze down the number of blocks to load from disk on each data streaming call. Getting this balance right took a lot of trial and error – with almost all the ideas here coming from our IRQ loading king, Sparta 🙂

---

## Memory Layout

Here’s how our final memory layout turned out for this demo part. There’re really very few little pockets of memory left – and, again, we’ve pretty much maxxed out the CPU. Given the amount of time it took to make this demo part, we were pretty lucky not to be looking at a large chunk of wasted time! (the counter to this is that, instead, we had something pretty damn special once it was all working)

```clike
//; MEMORY MAP
//; - Loaded
//; ---- Generated at runtime
//; ---- $02-04 Sparkle (Only during loads)
//; ---- $20-2f Various ZP variables
//; - $0280-$03ff Sparkle (ALWAYS)
//; ---- $0400-07ff Reserved demo stuff
//; - $0800-1fff Music
//; - $2000-7fff Code
//; ---- $8000-8aff Sprite Data 0
//; ---- $8c00-8fff Screen 0
//; - $9000-9dff Bitmap Data Buffer 0
//; - $9f00-9fff Nibble Conversion Table (Val = (Val >> 4))
//; ---- $a000-bf3f Bitmap 0
//; ---- $c000-caff Sprite Data 1
//; ---- $cc00-cfff Screen 1
//; - $d000-ddff Bitmap Data Buffer 1
//; ---- $e000-ff3f Bitmap 1
```

---

## SPOT – Improving Bitmap Colour Compression

In order to help file compression – vital for getting the data streaming working fast enough to hit the 25fps sweet spot – we needed some additional tricks. This is possibly a whole other blog post for Sparta to write at some point but, essentially, Sparta added some tricks to our bitmap conversion process to reorder and remap colours within the bitmap data – without changing the resultant bitmap (what you see on screen) at all.

My initial convertor used a “dumb” conversion.. for each char-square, it would scan to see what colours are used and it would place them into the SCR and COL data in the order that they appear. Sparta pointed out that this was far from optimal .. if we had, for example, a run of 4 chars using colours 3, 4 and 7, I could be generating SCR data of $34, $37, $43, $47 and COL data of $07, $04, $07, $03. A cleverer conversion would give use nicely compressable runs of colour – eg. SCR data being $34, $34, $34, $34 and COL data being $07, $07, $07, $07.

SPOT, Sparta’s Picture Optimizing Tool, started with this .. but added quite a few other tricks to improve compression.

We tested the tool against others that were available – and that have been made available since – and, trust me, it beat all of them in our test cases by quite a margin.

---

## Switching Between Single/Multicolour Bitmap Scrolling

The images used in the final demo were created by [Razorback](https://csdb.dk/scener/?id=27344) (of Genesis Project), aka Kristoffer Frisk. Some absolutely stunning work here, many commenting that this is the best art they’ve seen presented on the C64 in any form (demo, game or standalone graphics release). I have to wholeheartedly agree. Absolutely jawdropping work. In the below, the main multicolour bitmap is shown on the left .. and the hires bitmap on the right.

![Razorback's two tall scroller images: multicolour grim reaper with skull clock (left), hires end credits with sunflower (right)](https://c64demo.com/img/NqbZkIfFpw-637.png)

Here’s how we handled the switch between single and multicolour.. since the border-opening was all hardcoded into our fully unrolled assembly, we needed to use self-modifying-code (SMC) to inject the correct values to be setting on $d016 to enable/disable multicolour mode. Most of our D016 writes were using either dec/inc pairs (where the colour mode would persist – ie. we don’t need to change anything here)… but on occasion we had slightly different code, which did need changing, due to register value loss and/or needing slightly different timed instructions (eg. on badlines we would use an indexed write in order to lose an extra cycle (remember: C64/6510 doesn’t have a single cycle instruction, even NOPs take 2 cycles).

We did that using some code that looked like this:-

```clike
//; singlecolour mode
    ldx #D016_Value_38Rows_HI
    ldy #D016_Value_40Rows_HI
    lda #$0e //; $16 - D016_Value_40Rows_HI(8)
    stx ZP_D016_38Rows
    sty ZP_D016_40Rows
    jmp PatchD016Code
//; multicolour mode
    ldx #D016_Value_38Rows_HI + $10
    ldy #D016_Value_40Rows_HI + $10
    lda #$be
    stx ZP_D016_38Rows
    sty ZP_D016_40Rows
    jmp PatchD016Code
PatchD016Code:
    stx D016_38Cols_Load_0 + 1
    stx D016_38Cols_Load_1 + 1
... more code ...
    sty D016_40Cols_Load_0 + 1
... more code ...
    sta D016_IndexedSTA_74 + 1
    rts
```

And here’re some examples of where this is getting injected:-

```clike
D016_IndexedSTA_7:
    sta VIC_D016 - D016_Value_40Rows_MC,y                                      //; 3 ( 2013) bytes   5 (  3001) cycles
    sty VIC_D016                                                               //; 3 ( 2016) bytes   4 (  3005) cycles
```

```clike
D016_40Cols_Load_0:
    ldy #D016_Value_40Rows_MC                                                  //; 2 (   77) bytes   2 (   115) cycles
    dec VIC_D016                                                               //; 3 (   80) bytes   6 (   121) cycles
    sty VIC_D016                                                               //; 3 (   83) bytes   4 (   125) cycles
```

```clike
D016_38Cols_Load_7:
    lda #D016_Value_38Rows_MC                                                  //; 2 ( 2504) bytes   2 (  3734) cycles
    sta VIC_D016                                                               //; 3 ( 2507) bytes   4 (  3738) cycles
    sty VIC_D016                                                               //; 3 ( 2510) bytes   4 (  3742) cycles
```

---

## Wrapping Up

There’s quite a bit to take in from the above… it does show the amount of passion and energy that we put into this. All the little optimisation, data reorganisations, data mangling, the work done on Sparkle (the IRQ loader) and SPOT (picture optimiser), the sprite interleaving and so on .. every little piece was crucial to hit 25fps.

I had this effect working myself at 16.666fps and was “fairly” close to being able to do it at 25fps… but without the help from Sparta I would’ve failed.. and that would’ve definitely made this effect much, much less impressive. So my heartfelt thanks go to him.

Also, thanks to Razorback for this stunning piece of art. He delivered it early, before I even knew 100% for sure that the effect was possible – it actually spurred me on to get it done as, yeah, no way could I let this go to waste!
