'use strict';

class Prices {

  startByte = 0;
  endByte = -1;

  constructor({ start, end }:{ start?: number, end?: number }) {
    this.startByte = start || 0;
    this.endByte = end || -1;
  }
}

module.exports = Prices;
