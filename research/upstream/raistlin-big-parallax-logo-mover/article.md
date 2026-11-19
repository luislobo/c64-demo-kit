# Big Layered Logo Mover

- URL: https://c64demo.com/big-parallax-logo-mover/
- Author: Raistlin (Genesis Project)
- Published: 2022-03-30
- Series: Memento Mori
- Level: hard
- Tags: 6502, c64, sprites, multiplexing, raster irqs, code generation
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Memento Mori by Genesis Project (2020) https://csdb.dk/release/?id=195841

> How the huge swinging Memento Mori logo works on the C64: a packed charset logo over an x-expanded sprite layer, with interleaved IRQ code.

Assumes: 20px sprite interleave (https://c64demo.com/sprite-interleave/); Cycle-timed IRQ code with interleaved work (https://c64demo.com/memento-mori-all-border-double-dypp/); Charset splits with $d018

## Summary

In Memento Mori, we presented something that people hadn’t really seen on C64 before – a huge logo swinger with a huge sprite swinger as well… filling pretty much the whole screen for each layer. Take a look here:-
Video: <https://www.youtube.com/watch?v=ob5GHijbWSg>
*Video: [Memento Mori by Genesis Project](https://www.youtube.com/watch?v=ob5GHijbWSg), the full demo, including the big Memento Mori logo swinging over its out-of-phase sprite layer.*

It was funny seeing people’s reactions to this .. for example, ChisWicked ([https://www.twitch.tv/chiswicked](https://www.twitch.tv/chiswicked) showed it during his Twitch stream, with Shallan50k ([https://www.twitch.tv/shallan50k](https://www.twitch.tv/shallan50k)) saying that it must be VSP (Variable Screen Position). I could’ve used VSP for this, I guess.. but I didn’t… I rarely use VSP, actually, as it’s one of those VIC bugs that has proven to be just a little bit unstable – some C64s needing repair in order to make them “VSP safe”… or, of course, LFT’s SafeVSP method can be used – but that’s so restrictive that it’s near-impossible to use for most demos and games, certainly if they want to do anything more complicated.

---

## How Does It Work?

There are 2 layers in use here:-

- full-screen charset-logo;
- near-full-screen underlaid x-expanded single colour sprite carpet.

The logo is a 3-colour (2 colours plus transparency) MC one at 2264x192px (1132×192 double pixels). Made by Facet.\

![The full-width Memento Mori charset logo by Facet, with skull and face crescent moons as the O letters](https://c64demo.com/img/Uzj1JK-xMN-1024.png)

The sprite underlay comes from a 1024x160px image – once x-expanded, the “effective” size is of course 2048x160px:-

![Full 1024x160 sprite underlay of brown ornamental scrollwork; the right half is the left rotated 180 degrees](https://c64demo.com/img/4hFRwW7EXc-1024.png)

---

## Memory Considerations

Considering the above, there are several things we need to think about – and whether they can be compressed:-

- the big logo, uncompressed, would be 54,336 bytes (2264 * 192 / 8);
- the sprite underlay, 20,480 bytes (1024 * 160 / 8).

Neither is, of course, acceptable. So we compress…

---

## Compressing the Logo

For the logo, we started by packing it into multiple charsets – with the proviso that we had to fit a whole char-line into each charset. We start from the top char-line, pack that into a charset, then try adding the 2nd charline, 3rd, 4th, etc .. until it no longer fits.

Our first version used 8 charsets I believe (16k)… but we could do better .. so we had our tech artist, Ksubi, make some very minor modifications in order to align things better for packing. When finished, the changes were minor – you really couldn’t see them unless you directly compared the logos side by side, with a magnifying glass). And… the whole thing now fit into 3 charsets – a HUGE improvement.

Split into charsets, we of course needed a table of the char indices – at 2264x192px, this would be 283×24 chars .. ie. 6,792 bytes for our table. Optimising for duplicate strips, we get that down to 6144 bytes (256×24 – meaning that there were 27 dupe strips) plus 283 bytes for our dedupe table. Not a -massive- saving – but necessary – it brings the number of columns that we have to a perfectly round 256 (making it easy to index, of course).

---

## Compressing the Sprite Layer

The sprite layer we compress by the fact that the right half is just a 180-degree rotated copy of the left. That’s all that we do in this case, bringing it down to 10,240 bytes by storing just the 512x160px image.

There’s a small other change that I make to the sprite data – but I’ll go into that later on when I’m explaining how the sprite blit code works.

![The stored 512x160 left half of the sprite underlay, the only half kept in memory](https://c64demo.com/img/DUv5qorS8c-512.png)

---

## Creating the IRQ Interleaved Code

My approach for this effect was much like my all-border double DYPP. I would have function(s) for doing all of the VIC-timed work – changing $d018 to split the charset at the appropriate points, multiplexing the sprites and so forth – and then interleaving within that the code for updating the screen as the logo scrolled.

This required:-

- changing $d018 at the correct moment (calculated by looking at how many char lines fit into each charset – in our case, it was 7, 9 and 8 char lines respectively.. so we would change $d018 at ~ lines 50, 50+(7*8) and 50+((7+9)*8)… ie. 50, 106 and 178;
- updating sprite y values around every 21 rasterlines – anywhere within the current sprite row will do;
- very precisely changing the sprite values every 20 rasterlines. We use the 20px sprite interleave technique – which means that for the 160px tall sprite carpet, we only need an array of 8×8 sprites (64 sprites in total, ie. 4k of memory);
- spare cycles used for plotting the screen.

I double-buffered the screen – so I needed 2 copies of the above, one for each. In total I had 12,782 bytes for this IRQ code.

Here’s a snippet of my code – again, generated using my “Raistlin Code Generator”:-

```asm6502
        ldy ScreenColumns + 4                                                                                           //; 3 (  691) bytes   4 (   919) cycles
        lda PackedStrips + ( 0 * 256),y                                                                                 //; 3 (  694) bytes   4 (   923) cycles
        sta ScreenAddress1 + ( 0 * 40) +  4                                                                             //; 3 (  697) bytes   4 (   927) cycles
        lda PackedStrips + ( 1 * 256),y                                                                                 //; 3 (  700) bytes   4 (   931) cycles
        sta ScreenAddress1 + ( 1 * 40) +  4                                                                             //; 3 (  703) bytes   4 (   935) cycles
        lda PackedStrips + ( 2 * 256),y                                                                                 //; 3 (  706) bytes   4 (   939) cycles
        sta ScreenAddress1 + ( 2 * 40) +  4                                                                             //; 3 (  709) bytes   4 (   943) cycles
        lda #$f7                                                                                                        //; 2 (  711) bytes   2 (   945) cycles
    Bank0_Row1_SP01:
        ldx #$09                                                                                                        //; 2 (  713) bytes   2 (   947) cycles
        sax SpriteVals0 + 0                                                                                             //; 3 (  716) bytes   4 (   951) cycles
        stx SpriteVals0 + 1                                                                                             //; 3 (  719) bytes   4 (   955) cycles
    Bank0_Row1_SP23:
        ldx #$19                                                                                                        //; 2 (  721) bytes   2 (   957) cycles
        sax SpriteVals0 + 2                                                                                             //; 3 (  724) bytes   4 (   961) cycles
        stx SpriteVals0 + 3                                                                                             //; 3 (  727) bytes   4 (   965) cycles
    Bank0_Row1_SP45:
        ldx #$29                                                                                                        //; 2 (  729) bytes   2 (   967) cycles
        sax SpriteVals0 + 4                                                                                             //; 3 (  732) bytes   4 (   971) cycles
        stx SpriteVals0 + 5                                                                                             //; 3 (  735) bytes   4 (   975) cycles
    Bank0_Row1_SP67:
        ldx #$39                                                                                                        //; 2 (  737) bytes   2 (   977) cycles
        sax SpriteVals0 + 6                                                                                             //; 3 (  740) bytes   4 (   981) cycles
        stx SpriteVals0 + 7                                                                                             //; 3 (  743) bytes   4 (   985) cycles
        nop                                                                                                             //; 1 (  744) bytes   2 (   987) cycles
        lda PackedStrips + ( 3 * 256),y                                                                                 //; 3 (  747) bytes   4 (   991) cycles
        sta ScreenAddress1 + ( 3 * 40) +  4                                                                             //; 3 (  750) bytes   4 (   995) cycles
        lda PackedStrips + ( 4 * 256),y                                                                                 //; 3 (  753) bytes   4 (   999) cycles
```

ScreenColumns is a 39-byte table that I update as the logo moves – it contains the column-indices stored within our 283-byte deduped column data… PackedStrips contains the unique columns from our logo – stored in a 256×24 arrangement for easy indexing:-

```clike
    unsigned char PackedStrips[24][256];
```

So we can access any row of the data using:-

```asm6502
    lda PackedStrips + (row * 256), y
```

Please also note lines 8-24 in the ASM above. With 20px interleave, there are 2 tricky things to overcome:-

- where you start to change SpriteVals needs to be precisely timed;
- you should change them all as quickly as possible.

So, yeah, this SAX trickery is needed to satisfy that last point. You don’t have time to be loading all 8 sprite indices, or using INX or other. Note: SAX stores X&A – so by setting A to #$f7 as I do, I’m blanking out bit 3 (8)… meaning that the above is setting the sprite indices to $01, $09, $11, $19, …, $39 respectively. We only save 8 cycles by using SAX – but 20px sprite interleave doesn’t work if you don’t do that.

Note: for a typical screen, we have sprite indices placed in a layout something like:-

|     |     |     |     |     |     |     |     |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| $00 | $08 | $10 | $18 | $20 | $28 | $30 | $38 |
| $01 | $09 | $11 | $19 | $21 | $29 | $31 | $39 |
| $02 | $0a | $12 | $1a | $22 | $2a | $32 | $3a |
| $03 | $0b | $13 | $1b | $23 | $2b | $33 | $3b |
| $04 | $0c | $14 | $1c | $24 | $2c | $34 | $3c |
| $05 | $0d | $15 | $1d | $25 | $2d | $35 | $3d |
| $06 | $0e | $16 | $1e | $26 | $2e | $36 | $3e |
| $07 | $0f | $17 | $1f | $27 | $2f | $37 | $3f |

But… as we swing the sprite layer, we scroll and wrap these indices also – so we could also have (for example) $18, $20, $28, $30, $38, $00, $08, $10 on the top row.

---

## Sprite Blitting

With all of that done, the final thing to consider is the blitting of the sprite data. Our max scrollspeed is 8px per frame – so we will only ever need to update one column of the sprite data at a time.

As we’re using 20px sprite interleave, it gets quite complicated. Here’s a snippet from the start of our code:-

```asm6502
    DoLeftBlit:
        ldy #(0 * 64 +  0 * 3)                                                                                          //; 2 (    2) bytes   2 (     2) cycles
        lda BlitData + (  0 * 64),x                                                                                     //; 3 (    5) bytes   4 (     6) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (    7) bytes   5 (    11) cycles
        ldy #(0 * 64 +  0 * 3)                                                                                          //; 2 (    9) bytes   2 (    13) cycles
        lda BlitData + ( 84 * 64),x                                                                                     //; 3 (   12) bytes   4 (    17) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (   14) bytes   5 (    22) cycles
        ldy BlitData + (  1 * 64),x                                                                                     //; 3 (   17) bytes   4 (    26) cycles
        lda FlipByteTable,y                                                                                             //; 3 (   20) bytes   4 (    30) cycles
        ldy #(0 * 64 +  1 * 3)                                                                                          //; 2 (   22) bytes   2 (    32) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (   24) bytes   5 (    37) cycles
        ldy BlitData + ( 85 * 64),x                                                                                     //; 3 (   27) bytes   4 (    41) cycles
        lda FlipByteTable,y                                                                                             //; 3 (   30) bytes   4 (    45) cycles
        ldy #(0 * 64 +  1 * 3)                                                                                          //; 2 (   32) bytes   2 (    47) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (   34) bytes   5 (    52) cycles
        ldy #(0 * 64 +  2 * 3)                                                                                          //; 2 (   36) bytes   2 (    54) cycles
        lda BlitData + (  2 * 64),x                                                                                     //; 3 (   39) bytes   4 (    58) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (   41) bytes   5 (    63) cycles
        ldy #(0 * 64 +  2 * 3)                                                                                          //; 2 (   43) bytes   2 (    65) cycles
        lda BlitData + ( 86 * 64),x                                                                                     //; 3 (   46) bytes   4 (    69) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (   48) bytes   5 (    74) cycles
```

And here’s some from a point where the sprite interleaving has just kicked in (the first change due to the interleave happens at rasterline 41):-

```asm6502
        ldy #(1 * 64 + 19 * 3)                                                                                          //; 2 (  679) bytes   2 (  1038) cycles
        lda BlitData + ( 40 * 64),x                                                                                     //; 3 (  682) bytes   4 (  1042) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (  684) bytes   5 (  1047) cycles
        ldy BlitData + (103 * 64),x                                                                                     //; 3 (  687) bytes   4 (  1051) cycles
        lda FlipByteTable,y                                                                                             //; 3 (  690) bytes   4 (  1055) cycles
        ldy #(1 * 64 + 19 * 3)                                                                                          //; 2 (  692) bytes   2 (  1057) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (  694) bytes   5 (  1062) cycles
        ldy #(1 * 64 + 20 * 3)                                                                                          //; 2 (  696) bytes   2 (  1064) cycles
        lda BlitData + ( 20 * 64),x                                                                                     //; 3 (  699) bytes   4 (  1068) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (  701) bytes   5 (  1073) cycles
        ldy #(1 * 64 + 20 * 3)                                                                                          //; 2 (  703) bytes   2 (  1075) cycles
        lda BlitData + (104 * 64),x                                                                                     //; 3 (  706) bytes   4 (  1079) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (  708) bytes   5 (  1084) cycles
        ldy #(2 * 64 +  0 * 3)                                                                                          //; 2 (  710) bytes   2 (  1086) cycles
        lda BlitData + ( 42 * 64),x                                                                                     //; 3 (  713) bytes   4 (  1090) cycles
        sta (ZP_SpriteBlitPtr0),y                                                                                       //; 2 (  715) bytes   5 (  1095) cycles
        ldy #(2 * 64 +  0 * 3)                                                                                          //; 2 (  717) bytes   2 (  1097) cycles
        lda BlitData + (126 * 64),x                                                                                     //; 3 (  720) bytes   4 (  1101) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (  722) bytes   5 (  1106) cycles
```

Note line 10 above.. it breaks the pattern as we go from (40*64), back to (20*64) and then continue as normal with (42*64).

Let me just give you my entire C++ function for generating the above:-

```clike
void BigMMLogo_OutputBlitCode(LPTSTR Filename)
{
    CodeGen code(Filename);
    for (int Loop = 0; Loop < 2; Loop++)
    {
        if (Loop == 0)
        {
            code.OutputFunctionLine(fmt::format("DoLeftBlit"));
        }
        else
        {
            code.OutputFunctionLine(fmt::format("DoRightBlit"));
        }
        for (int SpriteIndex = 0; SpriteIndex < 4; SpriteIndex++)
        {
            int MinYSrc0 = (SpriteIndex + 0) * 20;
            int MaxYSrc0 = MinYSrc0 + 20;
            int MinYSrc1 = (SpriteIndex + 4) * 20;
            int MaxYSrc1 = MinYSrc1 + 20;
            for (int YPixel = 0; YPixel < 21; YPixel++)
            {
                int SrcY0 = ((SpriteIndex + 0) * 21) + YPixel;
                if (SrcY0 > MaxYSrc0)
                    SrcY0 -= 21;
                int SrcY1 = ((SpriteIndex + 4) * 21) + YPixel;
                if (SrcY1 > MaxYSrc1)
                    SrcY1 -= 21;
                if (Loop != 0)
                {
                    SrcY0 = 159 - SrcY0;
                    SrcY1 = 159 - SrcY1;
                }
                if ((SrcY0 & 1) == Loop)
                {
                    code.OutputCodeLine(LDY_IMM, fmt::format("#({:d} * 64 + {:2d} * 3)", SpriteIndex, YPixel));
                    code.OutputCodeLine(LDA_ABX, fmt::format("BlitData + ({:3d} * 64)", SrcY0));
                    code.OutputCodeLine(STA_IZY, fmt::format("ZP_SpriteBlitPtr0"));
                }
                else
                {
                    code.OutputCodeLine(LDY_ABX, fmt::format("BlitData + ({:3d} * 64)", SrcY0));
                    code.OutputCodeLine(LDA_ABY, fmt::format("FlipByteTable"));
                    code.OutputCodeLine(LDY_IMM, fmt::format("#({:d} * 64 + {:2d} * 3)", SpriteIndex, YPixel));
                    code.OutputCodeLine(STA_IZY, fmt::format("ZP_SpriteBlitPtr0"));
                }
                if ((SrcY1 & 1) == Loop)
                {
                    code.OutputCodeLine(LDY_IMM, fmt::format("#({:d} * 64 + {:2d} * 3)", SpriteIndex, YPixel));
                    code.OutputCodeLine(LDA_ABX, fmt::format("BlitData + ({:3d} * 64)", SrcY1));
                    code.OutputCodeLine(STA_IZY, fmt::format("ZP_SpriteBlitPtr1"));
                }
                else
                {
                    code.OutputCodeLine(LDY_ABX, fmt::format("BlitData + ({:3d} * 64)", SrcY1));
                    code.OutputCodeLine(LDA_ABY, fmt::format("FlipByteTable"));
                    code.OutputCodeLine(LDY_IMM, fmt::format("#({:d} * 64 + {:2d} * 3)", SpriteIndex, YPixel));
                    code.OutputCodeLine(STA_IZY, fmt::format("ZP_SpriteBlitPtr1"));
                }
                code.OutputBlankLine();
            }
        }
        code.OutputCodeLine(RTS);
        code.OutputBlankLine();
    }
}
```

Let’s talk about lines 42-48 and 55-61 now – since these include a “cunning plan” that I hinted at in the “Compressing the Sprite Layer” block above… here, on alternate pixel lines, I am x-flipping the pixel data. If you remember, the right side of our background sprite image is the same as the left side but rotated by 180 degrees… which is the same as flipping the image in both X and Y. A flip in X will result in all the bits of our data being flipped left-to-right as well. If we had 2 functions for “flipped or not”, the version needing to flip the data would be much more expensive than the other – meaning that we’d be using much more cycles drawing the right-side the left.

We balance that by flipping exactly half of our data – so that we -always- need to flip half the data, and not the other half, whether we’re drawing the left or the right side… so, we have 2 blit functions, DoLeftBlit and DoRightBlit, that use the exact same number of cycles (2174 cycles in this case).

The flip happens in ASM here:-

```asm6502
        ldy BlitData + (103 * 64),x                                                                                     //; 3 (  687) bytes   4 (  1051) cycles
        lda FlipByteTable,y                                                                                             //; 3 (  690) bytes   4 (  1055) cycles
        ldy #(1 * 64 + 19 * 3)                                                                                          //; 2 (  692) bytes   2 (  1057) cycles
        sta (ZP_SpriteBlitPtr1),y                                                                                       //; 2 (  694) bytes   5 (  1062) cycles
```

FlipByteTable is just a 256-byte table where I’ve, yeah, x-flipped the bits. Something like this:-

```clike
    unsigned char* FlipByteLookup = new unsigned char[256];
    for (int Index = 0; Index < 256; Index++)
    {
        FlipByteLookup[Index] = FlipByte(Index);
    }
    WriteBinaryFile(L"Out\\6502\\FlipByteLookup.bin", FlipByteLookup, 256);
```

```clike
unsigned char FlipByte(unsigned char Byte)
{
    unsigned char Value = 0;
    Value |= (Byte & 1) << 7;     //; Bit 0 => Bit 7
    Value |= (Byte & 2) << 5;     //; Bit 1 => Bit 6
    Value |= (Byte & 4) << 3;     //; Bit 2 => Bit 5
    Value |= (Byte & 8) << 1;     //; Bit 3 => Bit 4
    Value |= (Byte & 16) >> 1;    //; Bit 4 => Bit 3
    Value |= (Byte & 32) >> 3;    //; Bit 5 => Bit 2
    Value |= (Byte & 64) >> 5;    //; Bit 6 => Bit 1
    Value |= (Byte & 128) >> 7;   //; Bit 7 => Bit 0
    return Value;
}
```

---

## Swinging the Logo and Sprite Data

I won’t go into too much detail here as the remaining code should be pretty self-explanatory…

With updating the columns for the logo swinger, I simply use the following function – where input X is set to be the x-char position of our swing:-

```asm6502
SetScreenColumns:
        .for (var XChar = 0; XChar < 39; XChar++)
        {
            lda LogoStripIndices + XChar, x
            sta ScreenColumns + XChar
        }
        rts
```

To use this, of course, we then just need 2 sintables – one with the value that goes into $d016 (which should be something like “7 – (sinx % 8)”, the other with the char distance (“sinx / 8”).

Finally, here’s my code for swinging and issuing the call to blit the sprite data to the edges of the screen:-

```asm6502
SpriteBlitAddresses_Lo:
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
        .byte 0, 1, 2
SpriteBlitAddresses_Hi:
        .byte >(Base_BankAddress + 0 * 8 * 64), >(Base_BankAddress + 0 * 8 * 64), >(Base_BankAddress + 0 * 8 * 64)
        .byte >(Base_BankAddress + 1 * 8 * 64), >(Base_BankAddress + 1 * 8 * 64), >(Base_BankAddress + 1 * 8 * 64)
        .byte >(Base_BankAddress + 2 * 8 * 64), >(Base_BankAddress + 2 * 8 * 64), >(Base_BankAddress + 2 * 8 * 64)
        .byte >(Base_BankAddress + 3 * 8 * 64), >(Base_BankAddress + 3 * 8 * 64), >(Base_BankAddress + 3 * 8 * 64)
        .byte >(Base_BankAddress + 4 * 8 * 64), >(Base_BankAddress + 4 * 8 * 64), >(Base_BankAddress + 4 * 8 * 64)
        .byte >(Base_BankAddress + 5 * 8 * 64), >(Base_BankAddress + 5 * 8 * 64), >(Base_BankAddress + 5 * 8 * 64)
        .byte >(Base_BankAddress + 6 * 8 * 64), >(Base_BankAddress + 6 * 8 * 64), >(Base_BankAddress + 6 * 8 * 64)
        .byte >(Base_BankAddress + 7 * 8 * 64), >(Base_BankAddress + 7 * 8 * 64), >(Base_BankAddress + 7 * 8 * 64)
DontBlit:
        rts
FillNewSpriteData:
        ldy FrameOf256
FillNewSpriteData_Y:
    Ptr_SinTable_2:
        ldx SinTables_BlitInputColumn, y
        bmi DontBlit
    Ptr_SinTable_1:
        lda SinTables_BlitOutputColumn, y
        tay
        lda SpriteBlitAddresses_Lo, y
        sta ZP_SpriteBlitPtr0 + 0
        sta ZP_SpriteBlitPtr1 + 0
        lda SpriteBlitAddresses_Hi, y
        sta ZP_SpriteBlitPtr0 + 1
        ora #$01
        sta ZP_SpriteBlitPtr1 + 1
        cpx #$40
        bcc LeftBlit
        txa
        eor #$7f
        tax
        jmp DoRightBlit
    LeftBlit:
        jmp DoLeftBlit
```

So we have 2 tables …

- SinTables_BlitInputColumn contains:-
  - $ff if we don’t need to blit (eg. for the extremities of the logo – beyond the first row of all-zeros)
  - $00-$3f for the column index for left-blitting
  - $40-$7f for the column index for right-blitting (we EOR it with $7f so it’s flipped back to $00-$3f)

- SinTables_BlitOutputColumn contains the spritedata column (0-23) into which we need to blit.

I should really leave that as a “for the user to do” section .. but, hell, here’s my function for generating all the sine data that I use for this effect – please don’t laugh too hard at my outdated C++ …

```clike
void BigMMLogo_CalcSinTables(LPTSTR OutSinBINFilename)
{
    static const int SinTableLength = 512;
    static const double Amplitude = 1024.0 - 160.0;
    int SinTable[SinTableLength];
    for (int Index = 0; Index < SinTableLength; Index++)
    {
        double Angle = ((double)Index * 2 * PI) / (double)SinTableLength + 48 * PI / 32;
        double SinVal = sin(Angle);
        double XVal = SinVal * Amplitude + Amplitude;
        int iXVal = (int)XVal;
        SinTable[Index] = iXVal;
    }
    int LogoSinTable[SinTableLength];
    for (int Index = 0; Index < SinTableLength; Index++)
    {
        double Angle = ((double)Index * 2 * PI) / (double)SinTableLength + 50 * PI / 32;
        double SinVal = sin(Angle);
        double XVal = SinVal * 980 + 980;
        int iXVal = (int)XVal;
        LogoSinTable[Index] = iXVal;
    }
    unsigned char cSinTables[6][SinTableLength];
    for (int Index = 0; Index < SinTableLength; Index++)
    {
        int LastIndex = (Index + SinTableLength - 1) % SinTableLength;
        int XVal = SinTable[Index];
        int XColumn = XVal / 16;
        int LastXVal = SinTable[LastIndex];
        int LastXColumn = LastXVal / 16;
        XVal = max(0, XVal);
        int SpriteX = 47 - (XVal % 48);
        cSinTables[0][Index] = (unsigned char)SpriteX;
        int SpriteIndex = 7 - (XVal / 48) % 8;
        cSinTables[1][Index] = (unsigned char)SpriteIndex;
        int InputBlitColumn = 0xff;
        int OutputBlitColumn = 0x00;
        if (XColumn < LastXColumn)
        {
            InputBlitColumn = max(0, min(127, XColumn));
            OutputBlitColumn = (23 - (((SpriteIndex + 7) % 8) * 3 + SpriteX / 16)) % 24;
        }
        if (XColumn > LastXColumn)
        {
            InputBlitColumn = max(0, min(127, XColumn + 23));
            OutputBlitColumn = (23 - (((SpriteIndex + 7) % 8) * 3 + SpriteX / 16) + 23) % 24;
        }
        cSinTables[2][Index] = (unsigned char)OutputBlitColumn;
        cSinTables[3][Index] = (unsigned char)InputBlitColumn;
        int LogoXPosThisFrame = min(LogoSinTable[Index], 245 * 8 - 1);
        int LogoXPosNextFrame = min(LogoSinTable[(Index + 1) % SinTableLength], 245 * 8 - 1);
        cSinTables[4][Index] = (7 - (LogoXPosThisFrame & 7)) + 0x10;
        cSinTables[5][Index] = (LogoXPosNextFrame / 8);
    }
    WriteBinaryFile(OutSinBINFilename, cSinTables, sizeof(cSinTables));
}
```

---

## Wrapping Up

And there we have it … if anything, this effect should demonstrate quite nicely that you don’t need complex VIC trickery in order to pull off cool and dramatic demo effects. The work done in C++ in generating the assembly code, the compressed and half-flipped data formats and so on and so forth .. all of that is equally as important, if not more than, the resultant 6510 ASM code.

Until next time!

PS. Since I mentioned ChisWicked’s Twitch stream above .. feel free to checkout his viewing of Memento Mori, and commentary, here:-
Video: <https://www.youtube.com/watch?v=4h3Dn1v7r-w>
*Video: [Function 2020 demo party C64 review by ChisWicked](https://www.youtube.com/watch?v=4h3Dn1v7r-w), with his stream's viewing of and commentary on Memento Mori.*
