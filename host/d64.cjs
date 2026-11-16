/**
 * Algorithm: allocate a 35-track image, initialize BAM/free bits and directory,
 * reserve track 18 metadata, select data sectors with ten-sector interleave,
 * link 254-byte PRG chunks, and emit one closed PRG entry and its block count.
 * Why: disk packaging works without emulator tooling. Interleave gives a 1541
 * time to transfer a block before the next block rotates past; SD2IEC ignores
 * the rotational cost but follows the same chain. The last sector stores used+1.
 * Tradeoff: single file/directory sector only; not a general disk editor, GEOS
 * filesystem, extended-track image writer or full Unicode/PETSCII name converter.
 * Detailed guide: docs/ALGORITHMS.md
 */
// Standard 35-track D64, one closed PRG in a single-sector directory.
// Format reference: https://vice-emu.sourceforge.io/vice_17.html (D64 section).
const sectors=t=>t<=17?21:t<=24?19:t<=30?18:17;
function offset(t,s){if(t<1||t>35||s<0||s>=sectors(t))throw Error('Invalid disk sector');let n=s;for(let i=1;i<t;i++)n+=sectors(i);return n*256;}
function petscii(text,size){if(!/^[\x20-\x5f]+$/.test(text)||text.length>size)throw Error('Disk names must be uppercase ASCII and fit their field');const b=Buffer.alloc(size,0xa0);b.write(text,'ascii');return b;}
function createD64(prg,{diskName='DEMO',diskId='00',filename='DEMO'}={}){
 if(prg.length<2)throw Error('PRG needs a two-byte load address');
 const disk=Buffer.alloc(174848),bam=disk.subarray(offset(18,0),offset(18,0)+256),dir=disk.subarray(offset(18,1),offset(18,1)+256);
 bam[0]=18;bam[1]=1;bam[2]=0x41;
 for(let t=1;t<=35;t++){bam[t*4]=sectors(t);for(let s=0;s<sectors(t);s++)bam[t*4+1+(s>>3)]|=1<<(s&7);}
 const use=(t,s)=>{bam[t*4]--;bam[t*4+1+(s>>3)]&=255^(1<<(s&7));};
 use(18,0);use(18,1);petscii(diskName,16).copy(bam,0x90);bam.fill(0xa0,0xa0,0xab);petscii(diskId,2).copy(bam,0xa2);bam.write('2A',0xa5,'ascii');dir[1]=255;
 // Ten-sector interleave gives the 1541 time to transfer one block before
 // the next block rotates past the head. SD2IEC also accepts this ordering.
 const free=[];for(let t=1;t<=35;t++)if(t!==18){const n=sectors(t),taken=new Set();let s=0;for(let i=0;i<n;i++){while(taken.has(s))s=(s+1)%n;free.push([t,s]);taken.add(s);s=(s+10)%n;}}
 const blocks=Math.ceil(prg.length/254);if(blocks>free.length)throw Error('Program does not fit a D64');
 for(let i=0;i<blocks;i++){
  const[t,s]=free[i],at=offset(t,s),n=Math.min(254,prg.length-i*254);use(t,s);
  if(i+1<blocks){disk[at]=free[i+1][0];disk[at+1]=free[i+1][1];}else disk[at+1]=n+1;
  prg.copy(disk,at+2,i*254,i*254+n);
 }
 dir[2]=0x82;dir[3]=free[0][0];dir[4]=free[0][1];petscii(filename,16).copy(dir,5);dir.writeUInt16LE(blocks,30);return disk;
}
module.exports={sectors,offset,createD64};
