# Fonts for vector PDF export

The PDF generator draws text as glyph outlines, so the browser needs local TTF
files it can load with opentype.js. These files also cover Latin and Cyrillic.

## Source

Downloaded from the Google Fonts repository (SIL Open Font License 1.1):

- https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Italic%5Bopsz%2Cwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Italic%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/robotomono/RobotoMono%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/robotomono/RobotoMono-Italic%5Bwght%5D.ttf

All families are licensed under the SIL Open Font License, Version 1.1
(https://openfontlicense.org). The fonts are redistributed here under the same
license.

## Generated instances

The files in this folder are static instances produced with fontTools 4.68:

1. `instantiateVariableFont` pins `wght` to 400 (Regular/Italic) or 700
   (Bold/BoldItalic); Inter also pins `opsz` to 14.
2. `pyftsubset` keeps the glyphs for
   `U+0020-007E,U+00A0-00FF,U+0400-045F,U+0451,U+2010-2027,U+20AC,U+20BD,U+2116,U+2122`
   (including lowercase Cyrillic «ё», U+0451) with all layout features
   (including kerning), output as TTF.

The result is 16 static (non-variable) TTFs used only by the PDF exporter.
Regenerate them if the upstream fonts or the character set change.
