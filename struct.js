/*
 * js-struct.js - Utility to assist in parsing c-style structs from an ArrayBuffer
 */

/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// TODO: Ugh, this is messy. Do it differentely soon, please!
var nextStructId = 0;



function Struct(){ return Struct.create.apply(this, arguments) }

Struct.prototype.isStruct = true;

module.exports = global.Struct = Object.defineProperties(Struct, {
  /**
  * Defines a single byte integer value (byte/char).
  * @param name Property name
  */
  int8: {
    value: function(name) {
      return { name: name, readCode: "v.getInt8(o);", byteLength: 1, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines an unsigned single byte integer value (ubyte/uchar).
  * @param name Property name
  */
  uint8: {
    value: function(name) {
      return { name: name, readCode: "v.getUint8(o);", byteLength: 1, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines a two byte integer value (short).
  * @param name Property name
  */
  int16: {
    value: function(name) {
      return { name: name, readCode: "v.getInt16(o);", byteLength: 2, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines an unsigned two byte integer value (ushort).
  * @param name Property name
  */
  uint16: {
    value: function(name) {
      return { name: name, readCode: "v.getUint16(o);", byteLength: 2, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines a four byte integer value (int/long).
  * @param name Property name
  */
  int32: {
    value: function(name) {
      return { name: name, readCode: "v.getInt32(o);", byteLength: 4, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines an unsigned four byte integer value (uint/ulong).
  * @param name Property name
  */
  uint32: {
    value: function(name) {
      return { name: name, readCode: "v.getUint32(o);", byteLength: 4, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines a four byte floating point value (float).
  * @param name Property name
  */
  float32: {
    value: function(name) {
      return { name: name, readCode: "v.getFloat32(o);", byteLength: 4, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines an eight byte floating point value (double).
  * @param name Property name
  */
  float64: {
    value: function(name) {
      return { name: name, readCode: "v.getFloat64(o);", byteLength: 8, defaultValue: 0, structProperty: true };
    }
  },

  /**
  * Defines a fixed-length ASCII string.
  * Will always read the number of characters specified, but the returned string will truncate at the first null char.
  * @param name Property name
  * @param length Number of characters to read
  */
  string: {
    value: function(name, length) {
      var code = [
        "(function(o) {",
        "  var str = \"\";",
        "  for (var j = 0; j < " + length + "; ++j) {",
        "    var char = v.getUint8(o+j);",
        "    if(char === 0) break;",
        "    str += String.fromCharCode(char);",
        "  }",
        "  return str;",
        "})(o);"
      ].join('\n');
      return {
        name: name,
        readCode: code,
        byteLength: length,
        defaultValue: "",
        structProperty: true
      };
    }
  },

  /**
  * Defines a fixed-length array of structs or primitives
  * @param name Property name
  * @param type struct or primitive type to read
  * @param length Number of elements to read. Total bytes read will be type.byteLength * length
  */
  array: {
    value: function(name, type, length, callback) {
      var code = [
        "(function(o) {",
        "  var aa = new Array(" + length + "), av;",
        "  for(var j = 0; j < " + length + "; ++j) {",
        "    av = " + type.readCode + "",
        "    o += " + type.byteLength + ";",
        "    aa[j] = av;",
        "  }",
        "  if(st.callback) st.callback(o);",
        "  return aa",
        "})(o);"
      ].join('\n');
      return {
        name: name,
        readCode: code,
        byteLength: type.byteLength * length,
        defaultValue: null,
        array: true,
        structProperty: true,
        callback: callback
      };
    }
  },

  /**
  * Defines a nested struct
  * @param name Property name
  * @param struct Struct to read
  */
  struct: {
    value: function(name, struct) {
      return {
        name: name,
        readCode: struct.readCode,
        byteLength: struct.byteLength,
        defaultValue: null,
        struct: true,
        structProperty: true
      };
    }
  },

  /**
  * Defines a number of the bytes to be skipped over.
  * @param length Number of bytes to be skipped
  */
  skip: {
    value: function(length) {
      return {
        name: null,
        readCode: "null;\n",
        byteLength: length,
        structProperty: true
      };
    }
  },

  /**
  * Compiles the code to read a struct from the struct's definition
  * @param structDef Object sequentially defining the binary types to read
  * @param prototype Optional, additional prototypes to apply to the returned struct object
  * @returns An object containing a "readStructs" function that can read an array of the defined type from an ArrayBuffer
  */
  create: {
    value: function(/* collected via arguments */) {
      var type;
      var properties = arguments[arguments.length-1].structProperty ? {} : arguments[arguments.length-1];
      var byteLength = 0;
      var struct = Object.create(Struct.prototype, properties);

      // This new struct will be assigned a unique name so that instances can be easily constructed later.
      // It is not recommended that you use these names for anything outside this class, as they are not
      // intended to be stable from run to run.
      Object.defineProperty(struct, "struct_type_id", { value: "struct_id_" + nextStructId});
      Object.defineProperty(this, struct.struct_type_id, { value: struct });
      nextStructId += 1;

      // Build the code to read a single struct, calculate byte lengths, and define struct properties
      var readCode = "(function(o) { var st = Object.create(Struct." + struct.struct_type_id + ");\n";
      for (var i = 0; i < arguments.length; ++i) {
        type = arguments[i];
        if (!type.structProperty) continue;
        if (type.name) {
          Object.defineProperty(struct, type.name, _(type.defaultValue));
          readCode += "st." + type.name + " = " + type.readCode + "\n";
        }
        readCode += "o += " + type.byteLength + ";\n";
        byteLength += type.byteLength;
      }
      readCode += 'if(st.callback) st.callback(o);';
      readCode += "return st; })(o);";

      // Build the code to read an array of this struct type
      var parseScript = [
        "count = count || 1;",
        "var a = new Array(count);",
        "var s;",
        // TODO: I should be able to specify a length here (count * this.byteLength), but it consistently gives me an INDEX_SIZE_ERR. Wonder why?
        "var v = new DataView(arrayBuffer, offset);",
        "var o = 0, so = 0;",
        "for (var i = 0; i < count; ++i) {",
        "  so = o;",
        "  s = " + readCode,
        "  o += this.byteLength;",
        "  if(callback) callback(s, offset+so);",
        "  a[i] = s;",
        "}",
        "if(a.length === 1) a = a[0];",
        "return a;"
      ].join('\n');

      var parseFunc = new Function("arrayBuffer", "offset", "count", "callback", parseScript);

      return Object.defineProperties(struct, {
        readCode:    _(readCode),
        byteLength:  _(byteLength),
        readStructs: _(parseFunc, false)
      });
    }
  },

  //
  // Utility functions to read simple arrays of data from a buffer
  //

  /**
  * Read an ASCII string from an ArrayBuffer
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param length Optional, number of characters to read. If not given will read until a NULL char is reached
  */
  readString: {
    value: function(buffer, offset, length) {
      var str = "", charBuffer;
      if (length) {
        charBuffer = new Uint8Array(buffer, offset, length);

        for (var i = 0; i < length; ++i) {
          var char = charBuffer[i];
          if (char === 0) { break; }
          str += String.fromCharCode(char);
        }
      } else {
        charBuffer = new Uint8Array(buffer, offset);

        var i = 0;
        while (true) {
          var char = charBuffer[i++];
          if (char === 0) break;
          str += String.fromCharCode(char);
        }
      }
      return str;
    }
  },

  // I wonder if there's a more efficent way to do these that doesn't run afoul the offset restrictions of TypedArrays

  /**
  * Read an array of 8 bit integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readInt8Array: {
    value: function(buffer, offset, elements) {
      var array = new Int8Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getInt8(i);
      }
      return array;
    }
  },

  /**
  * Read an array of 8 bit unsigned integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readUint8Array: {
    value: function(buffer, offset, elements) {
      var array = new Uint8Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getUint8(i);
      }
      return array;
    }
  },

  /**
  * Read an array of 16 bit integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readInt16Array: {
    value: function(buffer, offset, elements) {
      var array = new Int16Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getInt16(i*2);
      }
      return array;
    }
  },

  /**
  * Read an array of 16 bit unsigned integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readUint16Array: {
    value: function(buffer, offset, elements) {
      var array = new Uint16Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getUint16(i*2);
      }
      return array;
    }
  },

  /**
  * Read an array of 32 bit integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readInt32Array: {
    value: function(buffer, offset, elements) {
      var array = new Int32Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getInt32(i*4);
      }
      return array;
    }
  },

  /**
  * Read an array of 32 bit unsigned integers
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of integers to read
  */
  readUint32Array: {
    value: function(buffer, offset, elements) {
      var array = new Uint32Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getUint32(i*4);
      }
      return array;
    }
  },

  /**
  * Read an array of 32 bit floats
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of floats to read
  */
  readFloat32Array: {
    value: function(buffer, offset, elements) {
      var array = new Float32Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getFloat32(i*4);
      }
      return array;
    }
  },

  /**
  * Read an array of 64 bit floats
  * @param buffer Buffer to read from
  * @param offset Offset in bytes to start reading at
  * @param elements Number of floats to read
  */
  readFloat64Array: {
    value: function(buffer, offset, elements) {
      var array = new Float64Array(elements);
      var v = new DataView(buffer, offset);
      for (var i = 0; i < elements; ++i) {
        array[i] = v.getFloat64(i*8);
      }
      return array;
    }
  },
});



function _(v,h){ return { enumerable: !h, configurable: true, writable: true, value: v } }