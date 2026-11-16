param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [ValidateSet('Auto','Alpha','Luma')][string]$Mode='Auto',
    [ValidateRange(0,255)][int]$Threshold=128,
    [switch]$Invert
)
# Deterministic PNG/JPEG/BMP/GIF -> 320x200, one-bit VIC-II bitmap.
# The bitmap has no header or palette: exactly 8000 bytes in VIC cell order.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$sourceBitmap=[System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $InputPath).Path)
try {
    $scale=[Math]::Min(320.0/$sourceBitmap.Width,200.0/$sourceBitmap.Height)
    $fitWidth=[Math]::Max(1,[int][Math]::Round($sourceBitmap.Width*$scale))
    $fitHeight=[Math]::Max(1,[int][Math]::Round($sourceBitmap.Height*$scale))
    $left=[int][Math]::Floor((320-$fitWidth)/2)
    $top=[int][Math]::Floor((200-$fitHeight)/2)
    $pixels=[System.Drawing.Color[,]]::new($fitWidth,$fitHeight)
    $hasTransparency=$false
    for($y=0;$y -lt $fitHeight;$y++){
        for($x=0;$x -lt $fitWidth;$x++){
            $sx=[Math]::Min($sourceBitmap.Width-1,[int][Math]::Floor(($x+0.5)*$sourceBitmap.Width/$fitWidth))
            $sy=[Math]::Min($sourceBitmap.Height-1,[int][Math]::Floor(($y+0.5)*$sourceBitmap.Height/$fitHeight))
            $pixel=$sourceBitmap.GetPixel($sx,$sy)
            $pixels[$x,$y]=$pixel
            if($pixel.A -lt 255){$hasTransparency=$true}
        }
    }
    $useAlpha=($Mode -eq 'Alpha') -or (($Mode -eq 'Auto') -and $hasTransparency)
    $bytes=[byte[]]::new(8000)
    for($y=0;$y -lt $fitHeight;$y++){
        for($x=0;$x -lt $fitWidth;$x++){
            $pixel=$pixels[$x,$y]
            $value=if($useAlpha){$pixel.A}else{(0.2126*$pixel.R+0.7152*$pixel.G+0.0722*$pixel.B)*$pixel.A/255}
            $on=$value -ge $Threshold
            if($Invert){$on=-not $on}
            if($on){
                $px=$x+$left;$py=$y+$top
                $at=[int][Math]::Floor($py/8)*320+[int][Math]::Floor($px/8)*8+($py%8)
                $bytes[$at]=$bytes[$at] -bor (128 -shr ($px%8))
            }
        }
    }
    [System.IO.File]::WriteAllBytes([System.IO.Path]::GetFullPath($OutputPath),$bytes)
    Write-Output ('Saved 8000-byte C64 bitmap; fitted '+$fitWidth+'x'+$fitHeight+'; alpha mode: '+$useAlpha)
} finally {$sourceBitmap.Dispose()}
