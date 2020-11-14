'use strict';

const {
  DataType,
} = require('@athombv/data-types');

function arrayToBuf(buf, v, i) {
  i = i || 0;
  v = typeof v !== 'undefined' ? v : [];
  const [Type] = this.args;
  const countSize = Math.abs(this.length);
  let size = countSize;
  if (!Array.isArray(v)) throw new TypeError(`expected array, got ${v}`);
  if (countSize) {
    buf.writeIntLE(v.length, i, countSize);
  }
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const j in v) {
    const res = Type.toBuffer(buf, v[j], i + size);
    if (Type.length > 0) size += Type.length;
    else if (Buffer.isBuffer(res)) size += res.length;
    else size += res;
  }
  return size;
}

function arrayFromBuf(buf, i, returnLength) {
  i = i || 0;
  const [Type] = this.args;
  const countSize = Math.abs(this.length);

  const count = (countSize) ? buf.readUIntLE(i, countSize) : Infinity;
  let length = countSize;
  const res = [];
  while (i + length < buf.length && res.length < count) {
    const entry = Type.fromBuffer(buf, i + length, true);
    if (Type.length > 0) {
      res.push(entry);
      length += Type.length;
    } else {
      if (entry.length <= 0) break;
      res.push(entry.result);
      length += entry.length;
    }
  }
  if (returnLength) {
    return {
      result: res, length,
    };
  }
  return res;
}

/* eslint-disable */
const LocalDataTypes = {
  array: (...arg) => new DataType(72, '_array', -0, arrayToBuf, arrayFromBuf, ...arg),
};

/* eslint-enable */
module.exports = LocalDataTypes;
