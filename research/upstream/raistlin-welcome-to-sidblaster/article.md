# Welcome to SIDBlaster

- URL: https://c64demo.com/welcome-to-sidblaster/
- Author: Raistlin (Genesis Project)
- Published: 2025-05-06
- Level: intermediate
- Tags: 6502, c64, sid, music, tools
- Licence: CC BY 4.0 for text, CC BY 4.0 or MIT for code (https://creativecommons.org/licenses/by/4.0/)

> SIDBlaster, a tool that emulates C64 SID tunes to trace every memory access, so it can relocate, disassemble, optimise and link them to players.

Assumes: SID files: load, init and play addresses; 6502 indirect addressing and self-modifying code

## SIDBlaster: Breathing New Life Into C64 Music

Grab SIDBlaster here: [github.com/RobertTroughton/SIDBlaster](https://github.com/RobertTroughton/SIDBlaster)

There's something magical about the sound of the Commodore 64's SID chip. Those distinctive bleeps and bloops have a warmth and character that continues to inspire musicians and demosceners decades after the computer's heyday. As someone who's been fascinated by this music for years, I've often found myself wanting to dig deeper into these musical masterpieces, but constantly hitting roadblocks when trying to modify them.

That's why I created SIDBlaster, a specialized tool for working with SID music files from the Commodore 64. Let me take you on a journey through this project - from the initial frustrations that sparked its creation to the inner workings that make it tick.

## Why I Created SIDBlaster

For years, I've been frustrated by the lack of good tools for working with SID music. I wanted to be able to:

- Extract visualizer data to create cool effects synchronized with the music
- Add custom hooks to trigger events at specific moments in songs
- Optimize SID tunes for both memory usage and performance
- Reliably relocate music code to different memory addresses

The existing solutions were either unreliable, difficult to use, or simply couldn't handle complex SID files with their sometimes arcane programming tricks. I needed something that would truly understand the intricacies of 6510 assembly and the way SID music is structured.

As I explained to a fellow demoscener: "It's like trying to renovate an ancient building - you can't just start knocking down walls until you understand exactly how the structure works."

## Planning the Tool

I approached SIDBlaster with a few key principles in mind:

1. **Be thorough in analysis**: Trace every memory access to fully understand what each byte is doing
2. **Preserve functionality**: Any modifications should result in identical sound output
3. **Enable creativity**: Make it easy to link music with custom players and effects
4. **Provide insights**: Help users understand how their SID music works

The project naturally divided into several key components:

- A cycle-accurate 6510 CPU emulator
- Memory access tracing and classification
- Disassembly and analysis tools
- Player linking capabilities
- Verification systems to ensure modifications work correctly

## The Player Linking Feature

One of the features I'm most proud of is the player linking system. Most C64 demos combine music with visual effects, but creating this combination has traditionally been quite tricky.

With SIDBlaster, you can simply run:

```
SIDBlaster music.sid music.prg -player=SimpleBitmap -playeraddr=$0900
```

And voilà - your music is automatically combined with a visual player routine! The player will handle all the details of initializing and playing the music at the right moments, while you can focus on creating amazing visuals.

Here's a simple example of what our SimpleBitmap player looks like:

```assembly
* = PlayerADDR

InitIRQ:
	sei                 ; Disable interrupts
	lda #$35            ; Bank out BASIC ROM
	sta $01
	jsr VSync           ; Wait for vertical sync
	lda #$00
	sta $d011           ; Turn off screen
	sta $d020           ; Black border
	jsr SIDInit         ; Initialize the music

	; Set up raster interrupt
	lda #<MusicIRQ
	sta $fffe
	lda #>MusicIRQ
	sta $ffff
    
	; Main music player interrupt routine
MusicIRQ:
	inc $d020           ; Flash border for timing visualization  
	jsr SIDPlay         ; Play one frame of music
	dec $d020           ; End border flash
	asl $d019           ; Acknowledge interrupt
	rti                 ; Return from interrupt
```

The beauty of this system is its modularity. You can create your own custom player by simply dropping a new .asm file into the SIDPlayers directory, and SIDBlaster will handle all the tricky linking work. Want a player that displays a bitmap? Shows a scroller? Creates a plasma effect? Just create the player code and SIDBlaster does the rest.

## How SIDBlaster Works

### The Emulation Core

At the heart of SIDBlaster is a specialized 6510 CPU emulator. It's -only- a CPU emulator, built with the sole intent of being able to run SID code and to track and analyze everything it does - not to actually output sound or graphics. It tracks every memory read, write, and execution, building up a detailed map of how the music code interacts with memory.

The CPU emulation is cycle-accurate - which will come into its own later when we start to look at adding profiling and optimization features. It even handles all the illegal opcodes - including, as best it can, the truly unstable ones.

### Memory Classification

One of the most important parts of SIDBlaster is how it classifies memory. For every byte in the C64's address space, we track:

- Whether it's executed as code
- Whether it's read or written as data
- Whether it's the target of a jump or branch
- Where the data came from, if it's copied from elsewhere

This classification is represented by a set of flags:

```c++
enum class MemoryType : u8 {
	Unknown = 0,        	// Memory whose purpose hasn't been determined
	Code = 1 << 0,      	// Memory containing executable code
	Data = 1 << 1,      	// Memory containing data
	LabelTarget = 1 << 2, 	// Memory that is the target of a jump or call
	Accessed = 1 << 3   	// Memory that has been accessed during execution
};
```

By running the music play routines many thousands of times (30000 by default - because (50 * 10 * 60) gives 10mins' play), we build up a complete picture of how the music code behaves. This allows us to confidently modify it without breaking anything.

### Memory Optimization: Clearing the Unused

One interesting feature is SIDBlaster's ability to identify truly unused memory in a SID file. Many SID files contain "junk" data - bytes that are never read, written, or executed. By identifying these bytes, we can zero them out, which significantly improves compression.

Here's a snippet from the disassembly writer that handles this:

```c++
int CodeFormatter::formatDataBytes(
	std::ostream& file,
	u16& pc,
	std::span<const u8> originalMemory,
	u16 originalBase,
	u16 endAddress,
	const std::map<u16, RelocEntry>& relocationBytes,
	std::span<const MemoryType> memoryTags) const {

	int unusedByteCount = 0;

	while (pc < endAddress && (memoryTags[pc] & MemoryType::Data)) {

		// ... [other code]

		// Check if unused (not accessed)
		bool isUnused = !(memoryTags[pc] & (MemoryType::Accessed | MemoryType::LabelTarget));

		if (isUnused) {
			byte = 0;  // Always zero out unused bytes to help with compression
			unusedByteCount++;
		}

		// ... [other code]
		
	}

	return unusedByteCount;
}
```

In my tests, this can often reduce SID file sizes by 8-10% after compression. Useful in many ways already - but this will come into its own later on when we can reliably REMOVE such code and data and not just blank it out.

## The Relocation Challenge

One of the trickiest aspects of SID music files is relocating them to different memory addresses. This is crucial for demos where you need to carefully manage memory usage.

The reason this is challenging is that many SID files use various forms of self-modifying code and indirect addressing. For example, they might use tables of address pointers like this:

```assembly
JumpTableLo:
	.byte &lt;Routine1, &lt;Routine2, &lt;Routine3, &lt;Routine4, &lt;Routine5
JumpTableHi:
	.byte &gt;Routine1, &gt;Routine2, &gt;Routine3, &gt;Routine4, &gt;Routine5
	
	; Later in the code:
	ldx CurrentIndex
	lda JumpTableLo,x   ; Load low byte of address
	sta ZP_0 + 0
	lda JumpTableHi,x   ; Load high byte of address
	sta ZP_0 + 1
	
	ldy CurrentIndexCounter
	jmp (ZP_0), y 	    ; Jump to the address in the table
```

If you relocate this code without updating both the table entries and any code that modifies them, it will break. SIDBlaster handles this by tracking the propagation of addresses through memory.

### Indirect Addressing Detection

Here's how we handle indirect addressing:

1. During emulation, we detect when the code reads from a zero page address and uses it as a pointer
2. We trace where those zero page values came from
3. We identify tables of addresses that need to be updated during relocation

For example:

```assembly
	lda #&lt;MusicData		; Low byte of address
	sta $fb
	lda #&gt;MusicData		; High byte of address 
	sta $fc
	ldy #0
	lda ($fb),y			; Indirect access
```

SIDBlaster would track that `$fb`/`$fc` form a pointer to `MusicData`, and that any relocation needs to update both the immediate values in the code and potentially any copies of those values elsewhere in memory.

## Example: Multi-Level Pointer Tracing

Let's look at a concrete example of how SIDBlaster handles complex relocation scenarios. Consider this pattern that appears in many SID files:

```assembly
	lda #&lt;MusicData		; Low byte of address
	sta $fb
	lda #&gt;MusicData		; High byte of address 
	sta $fc
	ldy #0
	lda ($fe),y			; Indirect access

	; ... [other code]
	
	; Now copy secondary table onto the original
	ldy #15
1loop:
	lda BackupMusicData, y
	sta MusicData,y
	dey
	bpl !loop-

    ; ... [other code]
	
	; Copy third table onto the second AND the first
	ldy #15
1loop:
	lda SecondaryBackupMusicData, y
	sta BackupMusicData,y
	sta MusicData,y
	dey
	bpl !loop-
```

This code reads indirect data through a vector at $fe/ff. That vector points to MusicData. BUT... later on, BackupMusicData is copied on top of MusicData. And SecondaryBackupMusicData is copied on top of both MusicData and BackupMusicData. So, if you are to reliably relocate this code (and data), you need to update:

1. The addresses in the primary table
2. The addresses in the backup table
3. The addresses in the secondary backup table

SIDBlaster tracks this entire chain of memory operations, so it knows that all these values need to be updated during relocation.

## Current Limitations

SIDBlaster isn't perfect yet. There are still some challenging scenarios:

### Self-Modifying Low Bytes Only

Some SID composers use tricks where they only modify the low byte of an address, assuming the high byte won't change:

```assembly
	lda #$00
	sta JumpTarget+1  ; Only modifying the low byte of the target address
	jmp JumpTarget
```

If relocation causes the high byte to change, this code breaks. SIDBlaster detects these cases and warns about them, but can't automatically fix them in all scenarios.

### Complex Memory Layout Dependencies

Some SID files have code that depends on specific memory layout patterns, such as:

```assembly
jumpTableLoPtrs: .byte $00, $06, $0c, $12

	ldy jumpTableIndex
	lda jumpTableLoPtrs, y
	sta OurJump + 1
	
OurJump:
	jmp $1000
```

Such code can be problematic. It's only modifying the low-byte of the pointer that will be jumped to. values, as you can see, range from $00-$12 ($1000, $1006, $100c and $1012). If we relocate to $10f0, for example, then we have a problem. Adding $f0 to the values in the table will overflow - and our new jump points would be incorrect ($10f0, $10f6, $10f6 and _$1002_ (which should of course be $1102)).

## Future Possibilities

What excites me most about SIDBlaster is what it enables for the future. Once we have fully analyzed and editable ASM files, we can:

### Easy SID Register Write Capture

One of the most exciting possibilities is the ability to easily capture writes to SID registers without affecting audio quality or performance. This is invaluable for creating visualizers that react to exactly what's happening in the music:

```assembly
; Automatic instrumentation of SID register writes
	lda #$80
	sta $d404				; Original SID write

; Becomes:
	lda #$80
	sta $d404				; Original SID write
	jsr LogSIDWrite_00_04	; Added hook that records the write
```

Since we understand exactly what the music code is doing, we can add these hooks with minimal overhead, making it much easier to synchronize visuals with the music.

### Strip Unused Data

We can automatically remove unused data sections, saving precious memory:

```
Before optimization:
$1000-$1FFF: Music data (4096 bytes)

After optimization:
$1000-$18FF: Music data (2304 bytes)
Saved: 1792 bytes!
```

### Remove Unreachable Code

Dead code elimination is another powerful optimization:

```assembly
; Before optimization
    jmp SkipSection
    
DeadCode:
    lda #$00    ; This code is never executed
    sta $d020
    rts
    
SkipSection:
    lda #$01
    sta $d020

; After optimization
SkipSection:
    lda #$01
    sta $d020
```

### Optimize Branch Instructions

Many SID files contain branches that are always taken or never taken:

```assembly
; Before optimization
    lda #$00
    beq AlwaysTaken  ; This branch is always taken
    sta $d020        ; This code is never executed
AlwaysTaken:
    lda #$01

; After optimization
    lda #$01
```

## Conclusion

SIDBlaster is a labour of love for the Commodore 64 scene. It's about preserving the magic of SID music while making it more accessible and flexible for modern demoscene productions.

There's still work to be done, but I'm excited about the possibilities this opens up for the C64 community. Whether you're creating a new demo, optimizing old music, or just curious about how SID tunes work under the hood, I hope SIDBlaster can be a valuable tool in your arsenal.

Download SIDBlaster today: [github.com/RobertTroughton/SIDBlaster](https://github.com/RobertTroughton/SIDBlaster)
