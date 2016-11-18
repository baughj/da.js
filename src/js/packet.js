function randomRange(max) {
  return Math.floor(Math.random() * max);
}

function getBytes(value) {
  var bytes = [];
  for (var i = 0; i < value.length; i++) {
    bytes.push(value.charCodeAt(i));
  }

  return bytes;
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function ClientPacket(opcode) {
  this.opcode = opcode;
  this.sequence = 0;
  this.position = 0;
  this.body = [];
}

Object.assign(ClientPacket.prototype, {
  dialogCRCTable: [
    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50A5, 0x60C6, 0x70E7,
    0x8108, 0x9129, 0xA14A, 0xB16B, 0xC18C, 0xD1AD, 0xE1CE, 0xF1EF,
    0x1231, 0x0210, 0x3273, 0x2252, 0x52B5, 0x4294, 0x72F7, 0x62D6,
    0x9339, 0x8318, 0xB37B, 0xA35A, 0xD3BD, 0xC39C, 0xF3FF, 0xE3DE,
    0x2462, 0x3443, 0x0420, 0x1401, 0x64E6, 0x74C7, 0x44A4, 0x5485,
    0xA56A, 0xB54B, 0x8528, 0x9509, 0xE5EE, 0xF5CF, 0xC5AC, 0xD58D,
    0x3653, 0x2672, 0x1611, 0x0630, 0x76D7, 0x66F6, 0x5695, 0x46B4,
    0xB75B, 0xA77A, 0x9719, 0x8738, 0xF7DF, 0xE7FE, 0xD79D, 0xC7BC,
    0x48C4, 0x58E5, 0x6886, 0x78A7, 0x0840, 0x1861, 0x2802, 0x3823,
    0xC9CC, 0xD9ED, 0xE98E, 0xF9AF, 0x8948, 0x9969, 0xA90A, 0xB92B,
    0x5AF5, 0x4AD4, 0x7AB7, 0x6A96, 0x1A71, 0x0A50, 0x3A33, 0x2A12,
    0xDBFD, 0xCBDC, 0xFBBF, 0xEB9E, 0x9B79, 0x8B58, 0xBB3B, 0xAB1A,
    0x6CA6, 0x7C87, 0x4CE4, 0x5CC5, 0x2C22, 0x3C03, 0x0C60, 0x1C41,
    0xEDAE, 0xFD8F, 0xCDEC, 0xDDCD, 0xAD2A, 0xBD0B, 0x8D68, 0x9D49,
    0x7E97, 0x6EB6, 0x5ED5, 0x4EF4, 0x3E13, 0x2E32, 0x1E51, 0x0E70,
    0xFF9F, 0xEFBE, 0xDFDD, 0xCFFC, 0xBF1B, 0xAF3A, 0x9F59, 0x8F78,
    0x9188, 0x81A9, 0xB1CA, 0xA1EB, 0xD10C, 0xC12D, 0xF14E, 0xE16F,
    0x1080, 0x00A1, 0x30C2, 0x20E3, 0x5004, 0x4025, 0x7046, 0x6067,
    0x83B9, 0x9398, 0xA3FB, 0xB3DA, 0xC33D, 0xD31C, 0xE37F, 0xF35E,
    0x02B1, 0x1290, 0x22F3, 0x32D2, 0x4235, 0x5214, 0x6277, 0x7256,
    0xB5EA, 0xA5CB, 0x95A8, 0x8589, 0xF56E, 0xE54F, 0xD52C, 0xC50D,
    0x34E2, 0x24C3, 0x14A0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
    0xA7DB, 0xB7FA, 0x8799, 0x97B8, 0xE75F, 0xF77E, 0xC71D, 0xD73C,
    0x26D3, 0x36F2, 0x0691, 0x16B0, 0x6657, 0x7676, 0x4615, 0x5634,
    0xD94C, 0xC96D, 0xF90E, 0xE92F, 0x99C8, 0x89E9, 0xB98A, 0xA9AB,
    0x5844, 0x4865, 0x7806, 0x6827, 0x18C0, 0x08E1, 0x3882, 0x28A3,
    0xCB7D, 0xDB5C, 0xEB3F, 0xFB1E, 0x8BF9, 0x9BD8, 0xABBB, 0xBB9A,
    0x4A75, 0x5A54, 0x6A37, 0x7A16, 0x0AF1, 0x1AD0, 0x2AB3, 0x3A92,
    0xFD2E, 0xED0F, 0xDD6C, 0xCD4D, 0xBDAA, 0xAD8B, 0x9DE8, 0x8DC9,
    0x7C26, 0x6C07, 0x5C64, 0x4C45, 0x3CA2, 0x2C83, 0x1CE0, 0x0CC1,
    0xEF1F, 0xFF3E, 0xCF5D, 0xDF7C, 0xAF9B, 0xBFBA, 0x8FD9, 0x9FF8,
    0x6E17, 0x7E36, 0x4E55, 0x5E74, 0x2E93, 0x3EB2, 0x0ED1, 0x1EF0
  ],


  header: function() {
    var bufferLength = this.body.length + 4;
    var buffer = [];

    buffer.push(0xAA);
    buffer.push(uint8((bufferLength - 3) / 256));
    buffer.push(uint8(bufferLength - 3));
    buffer.push(this.opcode);

    return buffer
  },

  bodyWithHeader: function() {
    return this.header().concat(this.body);
  },

  buffer: function() {
    return new Uint8Array(this.bodyWithHeader()).buffer;
  },

  toString: function() {
    var output = "";
    var body = this.bodyWithHeader();

    for (var i in body) {
      var hex = body[i].toString(16);
      output += "{0}{1} ".format(hex.length > 1 ? "" : "0", hex);
    }

    return output.trim().toUpperCase();
  },

  write: function(buffer) {
    this.body = this.body.concat(buffer);
  },

  writeByte: function(value) {
    this.body.push(uint8(value));
  },

  writeSbyte: function(value) {
    this.body.push(int8(value));
  },

  writeBoolean: function(value) {
    this.body.push(value ? 0x01 : 0x00);
  },

  writeInt16: function(value) {
    var value = int16(value);
    this.body.push((value >> 8) & 0xFF);
    this.body.push(value & 0xFF);
  },

  writeUint16: function(value) {
    var value = uint16(value);
    this.body.push((value >> 8) & 0xFF);
    this.body.push(value & 0xFF);
  },

  writeInt32: function(value) {
    var value = int32(value);
    this.body.push((value >> 24) & 0xFF);
    this.body.push((value >> 16) & 0xFF);
    this.body.push((value >> 8) & 0xFF);
    this.body.push(value & 0xFF);
  },

  writeUint32: function(value) {
    var value = uint32(value);
    this.body.push((value >> 24) & 0xFF);
    this.body.push((value >> 16) & 0xFF);
    this.body.push((value >> 8) & 0xFF);
    this.body.push(value & 0xFF);
  },

  writeString: function(value) {
    var buffer = getBytes(value);
    this.body = this.body.concat(buffer);
    this.position += buffer.length;
  },

  writeString8: function(value) {
    var buffer = getBytes(value);
    this.body.push(buffer.length);
    this.body = this.body.concat(buffer);
    this.position += buffer.length + 1;
  },

  writeString16: function(value) {
    var buffer = getBytes(value);
    this.body.push((value >> 8) & 0xFF);
    this.body.push(value & 0xFF);
    this.body = this.body.concat(buffer);
    this.position += buffer.length + 2;
  },

  encrypt: function(crypto) {
    if (!isEncryptedOpcode(this.opcode, PacketType.Client)) {
      return;
    }

    var specialKeySeed = randomRange(0xFFFF);
    var specialEncrypt = isSpecialEncryptedOpcode(this.opcode, PacketType.Client);

    this.body.push(0);

    var a = uint16(uint16(specialKeySeed) % 65277 + 256);
    var b = uint8(((specialKeySeed & 0xFF0000) >> 16) % 155 + 100);

    if (specialEncrypt) {
      var specialKey = generateSpecialKey(a, b, crypto.specialKeyTable);
      this.body.push(this.opcode);
      this.body = transform(this.body, specialKey, crypto.salt, this.sequence);
    }
    else {
      this.body = transform(this.body, crypto.basicKey, crypto.salt, this.sequence);
    }

    var hash = hexToBytes(md5([this.opcode, this.sequence].concat(this.body)));

    this.body.push(hash[13]);
    this.body.push(hash[3]);
    this.body.push(hash[11]);
    this.body.push(hash[7]);

    a ^= 0x7470;
    b ^= 0x23;

    this.body.push(uint8(a));
    this.body.push(b);
    this.body.push(uint8(a >> 8));

    this.body.unshift(this.sequence);
  },

  generateDialogHelper: function() {
    var crc = 0;

    for (var i = 0; this.body.length - 6; i++) {
      crc = this.body[6 + i] ^ ((crc << 8) ^ this.dialogCRCTable[crc >> 8]);
    }

    this.body[0] = random.randint(0, 255);
    this.body[1] = random.randint(0, 255);
    this.body[2] = (this.body.length - 4) / 256;
    this.body[3] = (this.body.length - 4) % 256;
    this.body[4] = crc / 256;
    this.body[5] = crc % 256;
  },

  encryptDialog: function() {
    this.body = this.body.slice(0, 6)
      .concat(this.body.slice(0, this.body.length - 6))
      .concat(this.body.slice(6));

    this.generateDialogHelper();

    var length = this.body[2] << 8 | this.body[3];
    var xPrime = this.body[0] - 0x2D;
    var x = this.body[1] ^ xPrime;
    var y = x + 0x72;
    var z = x + 0x28;
    this.body[2] ^= y;
    this.body[3] ^= (y + 1) % 256;

    for (var i = 0; i < length; i++) {
      this.body[4 + i] ^= (z + i) % 256;
    }
  }
});


function ServerPacket(buffer) {
  this.opcode = buffer[3];
  this.sequence = 0;
  this.position = 0;
  this.body = buffer.slice(3);
}

Object.assign(ServerPacket.prototype, {
  toArray: function() {
    var bufferLength = this.body.length + 4;
    var buffer = [];

    buffer.push(0xAA);
    buffer.push(uint8((bufferLength - 3) / 256));
    buffer.push(uint8(bufferLength - 3));
    buffer.push(this.opcode);

    if (this.sequence) {
      buffer.push(this.sequence);
    }

    return buffer.concat(this.body);
  },

  toString: function() {
    var output = "";
    var bodyArray = this.toArray();

    for (var i in bodyArray) {
      var hex = bodyArray[i].toString(16);
      output += "{0}{1} ".format(hex.length > 1 ? "" : "0", hex);
    }

    return output.trim().toUpperCase();
  },

  read: function(length) {
    if (this.position + length > this.body.length) {
      return 0;
    }

    var buffer = this.body.slice(this.position, length);
    this.position += length;

    return buffer;
  },

  readByte: function() {
    if (this.position + 1 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position];
    this.position += 1;

    return value;
  },

  readSbyte: function() {
    if (this.position + 1 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position];
    this.position += 1;

    return value;
  },

  readBoolean: function() {
    if (this.position + 1 > this.body.length) {
      return false;
    }

    var value = this.body[this.position] != 0;
    this.position += 1;

    return value;
  },

  readInt16: function() {
    if (this.position + 2 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position] << 8 | this.body[this.position + 1];
    this.position += 2;

    return value;
  },

  readUint16: function() {
    if (this.position + 2 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position] << 8 | this.body[this.position + 1];
    this.position += 2;

    return value;
  },

  readInt32: function() {
    if (this.position + 4 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position] << 24 | this.body[this.position + 1] << 16 | this.body[this.position + 2] << 8 | this.body[this.position + 3];
    this.position += 4;

    return int32(value);
  },

  readUint32: function() {
    if (this.position + 4 > this.body.length) {
      return 0;
    }

    var value = this.body[this.position] << 24 | this.body[this.position + 1] << 16 | this.body[this.position + 2] << 8 | this.body[this.position + 3];
    this.position += 4;

    return value;
  },

  readString8: function() {
    if (this.position + 1 > this.body.length) {
      return "";
    }

    var length = this.body[this.position]
    var position = this.position + 1

    if (position + length > this.body.length) {
      return "";
    }

    var buffer = this.body.slice(position, position + length);
    this.position += length + 1;

    return String.fromCharCode.apply(null, buffer)
  },

  readString16: function() {
    if (this.position + 2 > this.body.length) {
      return "";
    }

    var length = this.body[this.position] << 8 | this.body[this.position + 1];
    var position = this.position + 2;

    if (position + length > this.body.length) {
      return "";
    }

    var buffer = this.body.slice(position, position + length);
    this.position += length + 2;

    return String.fromCharCode.apply(null, buffer);
  },

  decrypt: function(crypto) {
    if (!isEncryptedOpcode(this.opcode, PacketType.Server)) {
      this.body.shift();
      return;
    }

    this.body.shift();
    this.sequence = this.body.shift();
    this.body = this.body.slice(0, this.body.length - 3);

    if (isSpecialEncryptedOpcode(this.opcode, PacketType.Server)) {
      var a = uint16(this.body[this.body.length - 1] << 8 | this.body[this.body.length - 3]) ^ 0x6474;
      var b = this.body[this.body.length - 2] ^ 0x24;
      var specialKey = generateSpecialKey(a, b, crypto.specialKeyTable);
      this.body = transform(this.body, specialKey, crypto.salt, this.sequence);
    }
    else {
      this.body = transform(this.body, crypto.basicKey, crypto.salt, this.sequence);
    }
  }
});

PacketType = {
  Client: 0,
  Server: 1
};
