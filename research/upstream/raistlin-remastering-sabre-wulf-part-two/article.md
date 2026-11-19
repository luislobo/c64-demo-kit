# Remastering Sabre Wulf - Part Two

- URL: https://c64demo.com/remastering-sabre-wulf-part-two/
- Author: Raistlin (Genesis Project)
- Published: 2023-10-24
- Series: Remastering Sabre Wulf
- Level: intermediate
- Tags: 6502, c64, game dev, retro gaming, sprites
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)
- Releases: Sabre Wulf Remastered Preview V0.1 by Genesis Project (2022) https://csdb.dk/release/?id=225069; Sabre Wulf Remastered Preview V0.5 by Genesis Project (2025) https://csdb.dk/release/?id=258098

> Sabre Wulf Remastered part two: reading the C64 keyboard and joystick, 16-bit player movement, and driving Sabre Man's animations.

Assumes: Remastering Sabre Wulf, part one (https://c64demo.com/remastering-sabre-wulf-part-one/); CIA keyboard and joystick ports

## Summary

Once the map and screens were in place, as detailed in [Part 1](/remastering-sabre-wulf-part-one/), we of course chose that the player sprite should be added - then we could start to look at walking around the map, streaming data from disk as needed.

---

## Keyboard and Joystick Control

Adding keyboard and joystick checking needed a bit of a refresher for me .. as a demo coder, I would barely use either in my old coding efforts - most of the time, we only cared about the SPACE bar..! After much reading of [C-Hacking](https://codebase64.org/doku.php?id=magazines:chacking6#three-key_rollover_for_the_c-128_and_c-64) and [Codebase64](https://codebase64.org/doku.php?id=base:scanning_the_keyboard_the_correct_and_non_kernal_way), along with various C64 coding forums, I eventually ended up with the following - which needs calling once per frame:-

```asm6502
    Control_Joystick:       .byte $00
    Control_Keys_Rows:      .fill 8, $00

    KeyRowMap:              .fill 8, $ff - (1 << i)



    UpdateKeyboardAndJoystick:

            lda #$ff
            sta $dc02    //; Port A: read and write
            lda #$00
            sta $dc03    //; Port B: read only

    //; update keyboard
            ldx #$07
        !loop:0
            lda KeyRowMap, x
            sta $dc00
            lda $dc01
            sta Control_Keys_Rows, x
            dex
            bpl !loop-

    //; update joystick
            lda #$00
            sta $dc02    //; Port A: only
            lda $dc00
            and #$1f
            eor #$1f
            sta Control_Joystick

            rts
```

Honestly, I don't know much about how this stuff works .. but I know that I "mostly" get the data out that I require.. I can detect the keys that I need to, and the joystick movements, and I will revisit this at a later date if I need to... for example, to optimise out that KeyRowMap table.

The 8 rows for the keyboard relate to the following table (from the afore-mentioned c-hacking article):-

||$80|$40|$20|$10|$08|$04|$02|$01|
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|0: $fe|DOWN|F5|F3|F1|F7|RIGHT|RETURN|DELETE|
|1: $fd|LEFT-SH|E|S|Z|4|A|W|3|
|2: $fb|X|T|F|C|6|D|R|5|
|3: $f7|V|U|H|B|8|G|Y|7|
|4: $ef|N|O|K|M|0|J|I|9|
|5: $df|,|@|:|.|-|L|P|+|
|6: $bf|/|^|=|RGHT-SH|HOME|;|*|\|
|7: $7f|&nbsp; STOP&nbsp; &nbsp; |&nbsp; &nbsp; &nbsp; &nbsp; Q&nbsp; &nbsp; &nbsp; &nbsp; |&nbsp; COMM&nbsp; &nbsp; |&nbsp; &nbsp; SPC&nbsp; &nbsp; |&nbsp; &nbsp; &nbsp; &nbsp; 2&nbsp; &nbsp; &nbsp; &nbsp;|&nbsp; CTRL&nbsp; &nbsp; |&nbsp; &nbsp; &nbsp; _&nbsp; &nbsp; &nbsp; |&nbsp; &nbsp; &nbsp; 1&nbsp; &nbsp; &nbsp; |

With this function and the table above it's easy to check for various keys ... for example, I want to detect the M key in order to bring up the in-game map.. so I'm looking for row 4 and bit $10. I do that with just:-

```asm6502
            lda Control_Keys_Rows + 4
            and #$10
            beq MKeyPressed
```

Note that the bit is CLEAR when M is pressed.. the BEQ triggers only if AND #$10 returns ZERO.

---

## Player Movement

With that done, the next thing is to add in movement of our player character, the little Sabre Man guy. Here we're going to add in another little improvement over the original game with 16-bit movement, just to make everything feel just a little bit more smooth.

I use something like the following to store sprite positions for the player, critters and everything else:-

```asm6502
    SpriteXPosLo:           .fill 8, $00
    SpriteXPosHi:           .fill 8, $00
    SpriteXPosMSB:          .fill 8, $00
    SpriteYPosHi:           .fill 8, $00
    SpriteYPosLo:           .fill 8, $00
```

Along with some code like below that takes the above data to update the VIC registers (I do this safely in an IRQ triggered somewhere in the top border):-

```asm6502
    SpriteMSBPairs:         .fill 8, [$00, (1 << i)]

    UpdateVICSprites:
            .for (var i = 0; i < 8; i++)
            {
                lda SpriteXPosHi + i
                sta VIC_Sprite0X + (i * 2)
        
                lda SpriteYPosHi + i
                clc
                adc #(50 + 8)
                sta VIC_Sprite0Y + (i * 2)
            }

            lda SpriteXPosMSB + 0
            .for (var i = 1; i < 8; i++)
            {
                ldy SpriteXPosMSB + i
                ora SpriteMSBPairs + (i * 2), y
            }
            sta VIC_SpriteXMSB
```

The following values define the movement speeds for the player - I left these as global variables in case I later need to change them or to add further variations.

```asm6502
    .var PlayerMoveSpeed_X_Running = $02a0
    .var PlayerMoveSpeed_X_Fighting = $0230
    .var PlayerMoveSpeed_Y_Running = $0230
    .var PlayerMoveSpeed_Y_Fighting = $01c0
    
    PlayerMoveSpeeds_Index: .byte $00
    PlayerMoveSpeedsXLo:    .byte <PlayerMoveSpeed_X_Running, <PlayerMoveSpeed_X_Fighting
    PlayerMoveSpeedsXHi:    .byte >PlayerMoveSpeed_X_Running, >PlayerMoveSpeed_X_Fighting
    PlayerMoveSpeedsYLo:    .byte <PlayerMoveSpeed_Y_Running, <PlayerMoveSpeed_Y_Fighting
    PlayerMoveSpeedsYHi:    .byte >PlayerMoveSpeed_Y_Running, >PlayerMoveSpeed_Y_Fighting
```

And we handle movement with something along the lines of this:-

```asm6502
            Move_NW:  jsr WalkW
            Move_N:   jmp WalkN

            Move_NE:  jsr WalkN
            Move_E:   jmp WalkE

            Move_SE:  jsr WalkE
            Move_S:   jmp WalkS

            Move_SW:  jsr WalkS
            Move_W:   jmp WalkW

            WalkW:
               ldy bIsPlayerFighting
               lda NewSpriteXPosLo + PlayerSpriteIndex
               sec
               sbc PlayerMoveSpeedsXLo, y
               sta NewSpriteXPosLo + PlayerSpriteIndex
               lda NewSpriteXPosHi + PlayerSpriteIndex
               sbc PlayerMoveSpeedsXHi, y
               sta NewSpriteXPosHi + PlayerSpriteIndex
               lda NewSpriteXPosMSB + PlayerSpriteIndex
               sbc #$00
               sta NewSpriteXPosMSB + PlayerSpriteIndex
               rts

//; plus similar code for WalkE, WalkN and WalkS.
```

A quirk with Sabre Wulf is that the "fight direction" is retained.. technically you only sword-fight left (West) and right (East) - but if you travel only up (North) or down (South) while holding the FIRE button, you will continue to fight facing the way that you were previously .. so if the player was swinging his sword while moving to the right, and then started moving up, their sword would continue swinging to the right. This is an important gameplay mechanic to help the player when travelling upward and downward through small passages. This mechanic is handled neatly with a simple variable that's set in the WalkE/WalkW functions:-

```asm6502
            WalkW:
               lda #FACE_DIR_W
               sta CurrentPlayerFaceDirection
```

The WalkW function is called when moving NorthWest, West or SouthWest .. and WalkE called for NorthEast, East and SouthEast... so it's only when moving directly North or South that it won't be updated - and so the old direction is retained.

---

## Player Animation

Here's the (current) complete set of animation frames for our main character, Sabre Man, showing our new animations on the left and the original on the right:-

|Animation|New|Original|
|:---:|:---:|:---:|
|Idle<br>2 Frames<br>(No Original)|![Sabre Man idle animation, new 2-frame multicolour version](https://c64demo.com/img/t6hkBp7TNJ-444.png)|![](https://c64demo.com/img/CxQ10bDWdJ-444.png)|
|Running East<br>6 Frames<br>(3 Original)|![Sabre Man run-east animation, new 6-frame multicolour version](https://c64demo.com/img/ARauejAnrK-444.png)|![Sabre Man run-east animation, original 3-frame single-colour version](https://c64demo.com/img/EBBMfceL2p-444.png)|
|Running West<br>6 Frames<br>(3 Original)|![Sabre Man run-west animation, new 6-frame multicolour version](https://c64demo.com/img/PxxNGldidW-444.png)|![Sabre Man run-west animation, original 3-frame single-colour version](https://c64demo.com/img/BajOqpxrH8-444.png)|
|Running North<br>4 Frames<br>(3 Original)|![Sabre Man run-north animation, new 4-frame multicolour version](https://c64demo.com/img/iDiDIEkO4Q-444.png)|![Sabre Man run-north animation, original 3-frame single-colour version](https://c64demo.com/img/3vQ_PoGYF_-444.png)|
|Running South<br>4 Frames<br>(3 Original)|![Sabre Man run-south animation, new 4-frame multicolour version](https://c64demo.com/img/M0XC7ucysK-444.png)|![Sabre Man run-south animation, original 3-frame single-colour version](https://c64demo.com/img/Pni2wDc_GI-444.png)|
|Fighting East<br>4 Frames<br>(6 Original)|![Sabre Man fight-east animation, new 4-frame multicolour version](https://c64demo.com/img/wvdRPhLgpK-444.png)|![Sabre Man fight-east animation, original 6-frame single-colour version](https://c64demo.com/img/kiQGg0MtnA-444.png)|
|Fighting West<br>4 Frames<br>(6 Original)|![Sabre Man fight-west animation, new 4-frame multicolour version](https://c64demo.com/img/of4A8Qo8lq-444.png)|![Sabre Man fight-west animation, original 6-frame single-colour version](https://c64demo.com/img/rdR77ArwJ--444.png)|
|Lifting An Amulet<br>2 Frames<br>(No Original)|![Sabre Man amulet-lifting animation, new 2-frame multicolour version](https://c64demo.com/img/flwPRhFDt4-444.png)|![](https://c64demo.com/img/CxQ10bDWdJ-444.png)|
|Death (Facing East)<br>3 Frames<br>(3 Original)|![Sabre Man death facing east animation, new 3-frame multicolour version](https://c64demo.com/img/T-TpugW0KD-444.png)|![Sabre Man death facing east animation, original 3-frame single-colour version](https://c64demo.com/img/j-yB3Ywlnh-444.png)|
|Death (Facing West)<br>3 Frames<br>(3 Original)|![Sabre Man death facing west animation, new 3-frame multicolour version](https://c64demo.com/img/_qTEkK7qzm-444.png)|![Sabre Man death facing west animation, original 3-frame single-colour version](https://c64demo.com/img/sbTJbN6IsJ-444.png)|

The code that I use for dealing with the animations in game is surprisingly simple. The main animation-driver for the player is just:-

```asm6502
    PlayerSpriteAnimDelayCounter: .byte $00
    PlayerSpriteAnimVal:          .byte StaticSprites_SabreMan_WalkE
    PlayerSpriteAnimNumFrames:    .byte StaticSprites_SabreMan_WalkE_Num
    PlayerSpriteAnimDelay:        .byte 4

	DoPlayerAnim:

		AnimDelayCounter:
			ldy #$00
			iny

			ldx PlayerSpriteAnimFrame

			cpy PlayerSpriteAnimDelay
			bcc NotNewAnim

			ldy #$00

			inx
		NotNewAnim:
			cpx PlayerSpriteAnimNumFrames
			bcc NotEndFrame
			ldx #$00
		NotEndFrame:
			stx PlayerSpriteAnimFrame
			txa
			clc
			adc PlayerSpriteAnimVal
			sta SpriteVals + 0

			sty AnimDelayCounter

			rts
```

For each animation, we have a certain number of frames (as shown in the table above). We store this in **PlayerSpriteAnimNumFrames** and, of course, update this whenever the player's animation state changes. We have an animation delay, **PlayerSpriteAnimDelay**, which is the number of display frames that need to pass before using a new animation frame. Right now, we're delaying by 4 frames for most animations (meaning they're updating at 12.5fps on PAL) and 8 frames for the idle animation (6.25fps). **PlayerSpriteAnimVal** simply gives the sprite index for the first frame of the current animation.

Choosing the actual animation is a simple matter of acting on the joystick input and, along with moving the player sprite, selecting the correct animation set. Likewise, for special events - such as picking up an amulet or dying - we need to override joystick control completely (freeze the player and hijack the animation).

---

## Driving Player Movement And Animation

In order to keep things as simple as possible, I use an "action table" that's driven by the joystick control system in order to both move the player and to activate the relevant animation frames. The gist of this is seen below:-

```asm6502
   .var MOVE_DIR_NIL = 0
   .var MOVE_DIR_N   = 1
   .var MOVE_DIR_NE  = 2
   .var MOVE_DIR_E   = 3
   .var MOVE_DIR_SE  = 4
   .var MOVE_DIR_S   = 5
   .var MOVE_DIR_SW  = 6
   .var MOVE_DIR_W   = 7
   .var MOVE_DIR_NW  = 8

   Joystick_To_ActionTableIndex: .byte (MOVE_DIR_NIL * 6), (MOVE_DIR_N   * 6), (MOVE_DIR_S   * 6), (MOVE_DIR_NIL * 6)
                                 .byte (MOVE_DIR_W   * 6), (MOVE_DIR_NW  * 6), (MOVE_DIR_SW  * 6), (MOVE_DIR_W   * 6)
                                 .byte (MOVE_DIR_E   * 6), (MOVE_DIR_NE  * 6), (MOVE_DIR_SE  * 6), (MOVE_DIR_E   * 6)
                                 .byte (MOVE_DIR_NIL * 6), (MOVE_DIR_N   * 6), (MOVE_DIR_S   * 6), (MOVE_DIR_NIL * 6)

   JoystickActionTable:          .byte MOVE_DIR_NIL, <Move_NIL, >Move_NIL, StaticSprites_SabreMan_Idle,  StaticSprites_SabreMan_Idle_Num,  8
                                 .byte MOVE_DIR_N,   <Move_N,   >Move_N,   StaticSprites_SabreMan_WalkN, StaticSprites_SabreMan_WalkN_Num, 4
                                 .byte MOVE_DIR_NE,  <Move_NE,  >Move_NE,  StaticSprites_SabreMan_WalkN, StaticSprites_SabreMan_WalkN_Num, 4
                                 .byte MOVE_DIR_E,   <Move_E,   >Move_E,   StaticSprites_SabreMan_WalkE, StaticSprites_SabreMan_WalkE_Num, 4
                                 .byte MOVE_DIR_SE,  <Move_SE,  >Move_SE,  StaticSprites_SabreMan_WalkS, StaticSprites_SabreMan_WalkS_Num, 4
                                 .byte MOVE_DIR_S,   <Move_S,   >Move_S,   StaticSprites_SabreMan_WalkS, StaticSprites_SabreMan_WalkS_Num, 4
                                 .byte MOVE_DIR_SW,  <Move_SW,  >Move_SW,  StaticSprites_SabreMan_WalkS, StaticSprites_SabreMan_WalkS_Num, 4
                                 .byte MOVE_DIR_W,   <Move_W,   >Move_W,   StaticSprites_SabreMan_WalkW, StaticSprites_SabreMan_WalkW_Num, 4
                                 .byte MOVE_DIR_NW,  <Move_NW,  >Move_NW,  StaticSprites_SabreMan_WalkN, StaticSprites_SabreMan_WalkN_Num, 4

			lda Control_Joystick
			and #$0f
			tay
			ldx Joystick_To_ActionTableIndex, y
			lda JoystickActionTable + 0, x
			sta CurrentPlayerMoveDirection
			lda JoystickActionTable + 1, x
			sta JumpToMoveHere + 1
			lda JoystickActionTable + 2, x
			sta JumpToMoveHere + 2
			lda JoystickActionTable + 3, x
			sta PlayerSpriteAnimVal
			lda JoystickActionTable + 4, x
			sta PlayerSpriteAnimNumFrames
			lda JoystickActionTable + 5, x
			sta PlayerSpriteAnimDelay

		JumpToMoveHere:
			jsr Move_NIL

```

**JoystickActionTable** is really the driving factor here. From there I can store off the current move direction of the player (needed for code that I will talk about at a later date), lo/hi JMP addresses for the movement function we'll use for the player, the starting sprite index for the animation to be used, the number of frames for the animation, and the animation delay. Joystick_To_ActionTableIndex simply maps from the 16 values that we get from **Control_Joystick** into the relevant move function.

The move functions that we're jumping into here are the same ones I described much earlier.

---

## Wrapping Up

Note that I'm not giving you here the complete code to write your own game, or your own Sabre Wulf, I'm just meandering my way around the code as I write this, probably forgetting about huge, important chunks of it... but hopefully some of this helps.

As I said in Part 1, I'm honestly NOT a _game coder_. Despite nearly 30 years in the industry, I've spent 95% of my time working on engine code, optimizations, editor tools and that sort of thing .. other than the first game that I worked on, Destruction Derby, I've barely touched what I would call "game code". If you're a season game developer and you're looking at what I'm doing here in abject horror, feel free to reach out and let me know. Sabre Wulf Remastered still has quite some way to go to be finished - so you still have time to help us make it into something awesome :-)

Until next time!
