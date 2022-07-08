const uuid = require('uuid').v4;

const orderTypes = {
  buy: 'buy',
  sell: 'sell',
  reverseOrderType: function (type) {
    return type === this.buy ? this.sell : this.buy;
  }
};

class Order {
  constructor({ type, amount, orderedBy}) {
    this.id = uuid();
    this.type = type;
    this.amount = amount;
    this.orderedBy = orderedBy;
    this.lock = true;
    this.lockedBy = orderedBy;
  }
}

module.exports = {
  orderTypes,
  Order
};