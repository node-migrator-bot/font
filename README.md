# font

Work in progress but it currently reads a lot of info already.


## Usage

```
npm install font
```

```javascript
var font = require('font');

// get an array of fonts from the OS's font directory
font.listFonts();

// loads a file from either the font directory or a full path
font.loadFont('filename.ttf')

// the constructor and prototype
font.Font
```

## Provides

It's currently very much not done but here's what you get so far:


```javascript
{ name: 'THESANSMONO-9-BLACK',
  index: 
   { version: [ 0, 1, 0, 0 ],
     tables: 16,
     range: 256,
     selector: 4,
     shift: 0,
     tableIndex: 
      { LTSH: { checksum: 3244564258, offset: 1484, length: 253 },
        OS2: { checksum: 2283441823, offset: 392, length: 96 },
        VDMX: { checksum: 1818129373, offset: 1740, length: 1504 },
        cmap: { checksum: 2017951296, offset: 9048, length: 1858 },
        cvt: { checksum: 53611393, offset: 11468, length: 42 },
        fpgm: { checksum: 106535991, offset: 10908, length: 371 },
        glyf: { checksum: 401431820, offset: 11512, length: 48500 },
        hdmx: { checksum: 585734230, offset: 3244, length: 5804 },
        head: { checksum: 4007011577, offset: 268, length: 54 },
        hhea: { checksum: 101712464, offset: 324, length: 36 },
        hmtx: { checksum: 1161901745, offset: 488, length: 996 },
        loca: { checksum: 2345778054, offset: 60012, length: 500 },
        maxp: { checksum: 51053014, offset: 360, length: 32 },
        name: { checksum: 2013066169, offset: 60512, length: 776 },
        post: { checksum: 4163660325, offset: 61288, length: 582 },
        prep: { checksum: 1084743514, offset: 11280, length: 186 } } },
  os2: 
   { version: 3,
     avgCharWidth: 600,
     weightClass: 'Ultra-bold',
     widthClass: 'Medium',
     type: 0,
     subscript: { size: { x: 650, y: 650 }, offset: { x: 0, y: 150 } },
     superscript: { size: { x: 650, y: 650 }, offset: { x: 0, y: 500 } },
     strikeout: { size: 50, position: 225 },
     class: 'No Classification',
     subclass: 'No Classification',
     panose: 
      { familyType: 'Text and Display',
        weight: 'Heavy',
        proportion: 'Monospaced' },
     unicodePages: 
      { '0000-007F': 'Basic Latin',
        '0080-00FF': 'Latin-1 Supplement ',
        '0100-017F': 'Latin Extended-A ',
        '0180-024F': 'Latin Extended-B ',
        '02B0-02FF': 'Spacing Modifier Letters ',
        'A700-A71F': 'Modifier Tone Letters',
        '0370-03FF': 'Greek and Coptic ',
        '2000-206F': 'General Punctuation',
        '2E00-2E7F': 'Supplemental Punctuation ',
        '2100-214F': 'Letterlike Symbols ',
        '2200-22FF': 'Mathematical Operators ',
        '2A00-2AFF': 'Supplemental Mathematical Operators',
        '27C0-27EF': 'Miscellaneous Mathematical Symbols-A ',
        '2980-29FF': 'Miscellaneous Mathematical Symbols-B ',
        '25A0-25FF': 'Geometric Shapes ',
        'E000-F8FF': 'Private Use Area (plane 0) ',
        'FB00-FB4F': 'Alphabetic Presentation Forms' },
     vendorID: 'MaPm',
     selection: [],
     firstCharIndex: 32,
     lastCharIndex: 64258,
     typographic: { ascender: 750, descender: -250, lineGap: 200 },
     windowTypographic: { ascender: 921, descender: 259 },
     codePages: 
      [ 'Latin 1',
        'Turkish',
        'Vietnamese',
        'Macintosh Character Set (US Roman)',
        'IBM Turkish',
        'WE/Latin 1' ],
     xHeight: 497,
     capHeight: 675,
     defaultChar: 0,
     breakChar: 32,
     maxContext: 0 } }
```