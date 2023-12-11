class ExecutorWithAdditionalValueOnOldRatio {
  constructor(existingRatio, newRatio, additionalValue) {
    this.existingRatio = existingRatio;
    this.newRatio = newRatio;
    this.existingRatioValueTotal = 0;
    this.fNames = [];
    this.additionalValue = additionalValue;
    this.result = {};
    this.switchResult = {};
  }

  perform() {
    this.validate();
    this.calculateBuySellCall();
    const {sellCalls, buyCalls} = this.filtersBuySellCalls();
    sellCalls.sort((a, b) => a.newValue - b.newValue);
    buyCalls.sort((a, b) => b.newValue - a.newValue);
    console.table(sellCalls);
    console.table(buyCalls);
    console.table(this.result);

    sellCalls.forEach((sellCall) => {
      for (let i = 0; i < buyCalls.length; i += 1) {
        const sellValue = sellCall.newValue * -1;
        const buyCall = buyCalls[i];
        const buyValue = buyCall.newValue;
        console.log({buyValue, sellValue});
        if (buyValue > 0) {
          const buyAndSellDifference = buyValue - sellValue;
          console.log('bi =', i);
          console.log(`${sellCall.fName}-to-${buyCall.fName}`);
          console.log('buyAndSellDifference = ', buyAndSellDifference);
          this.switchResult[`${sellCall.fName}-to-${buyCall.fName}`] = this.switchResult[`${sellCall.fName}-to-${buyCall.fName}`] || [];
          if (buyAndSellDifference === 0) {
            this.switchResult[`${sellCall.fName}-to-${buyCall.fName}`].push( sellValue);
            sellCall.newValue = 0;
            buyCall.newValue = 0;
            break;
          } else if (buyAndSellDifference > 0) {
            this.switchResult[`${sellCall.fName}-to-${buyCall.fName}`].push( sellValue);
            sellCall.newValue = 0;
            buyCall.newValue = buyAndSellDifference;
            break;
          } else {
            this.switchResult[`${sellCall.fName}-to-${buyCall.fName}`].push( buyValue);
            sellCall.newValue = buyAndSellDifference;
            buyCall.newValue = 0;
            console.log('@', 'buyValue - sellValue = ', buyValue - sellValue);
          }
        }
      }
    });
    console.log(this.switchResult);
  }

  filtersBuySellCalls() {
    return this.fNames.reduce((acc, fName) => {
      if (this.result[fName].call === 'sell') {
        acc.sellCalls.push(this.result[fName]);
      }
      if (this.result[fName].call === 'buy') {
        acc.buyCalls.push(this.result[fName]);
      }
      return acc;
    }, {sellCalls: [], buyCalls: []});
  }

  calculateBuySellCall() {
    this.fNames.forEach((fName) => {
      const fundWithOldRatio = this.existingRatio[fName];
      const fundWithNewRatio = this.newRatio[fName];
      const differencePercentage = fundWithNewRatio.percentage - fundWithOldRatio.calculatedPercentage;

      this.result[fName] = {
        fName,
        oldPercentage: fundWithOldRatio.calculatedPercentage,
        oldValue: fundWithOldRatio.value,
        newPercentage: fundWithNewRatio.percentage,
        differencePercentage,
        additionalValue: fundWithOldRatio.additionalValue,
      };
      this.result[fName].oldPlusAdditionalValue = fundWithOldRatio.oldPlusAdditionalValue;
      this.result[fName].oldPlusDifferencePercentage = this.result[fName].oldPercentage + differencePercentage;
      if (differencePercentage < 0) {
        this.result[fName].call = 'sell';
        this.result[fName].newValue = this.existingRatioValueTotal * differencePercentage / 100;
        this.result[fName].postCallExecutionValue = fundWithOldRatio.oldPlusAdditionalValue + this.result[fName].newValue;
      } else if (differencePercentage > 0) {
        this.result[fName].call = 'buy';
        this.result[fName].newValue = this.existingRatioValueTotal * differencePercentage / 100;
        this.result[fName].postCallExecutionValue = fundWithOldRatio.oldPlusAdditionalValue + this.result[fName].newValue;
      } else {
        this.result[fName].newValue = fundWithOldRatio.oldPlusAdditionalValue;
        this.result[fName].postCallExecutionValue = this.result[fName].newValue;
        if (this.result[fName].newValue > this.result[fName].oldValue) {
          this.result[fName].call = 'buy';
        } else if (this.result[fName].newValue < this.result[fName].oldValue) {
          this.result[fName].call = 'sell';
        } else {
          this.result[fName].call = 'no-change';
        }
      }
      this.result[fName].swapValue = this.result[fName].newValue;
    });
  }

  validate() {
    this.fNames = Object.keys(this.newRatio);
    const newRatioPercentageTotal = this.fNames.reduce((acc, fName) => {
      acc += this.newRatio[fName].percentage;
      return acc;
    }, 0);
    if (newRatioPercentageTotal > 100) {
      const errorMessage = `new ratio(${newRatioPercentageTotal}) is greater than 100`;
      throw new Error(errorMessage);
    } else if (newRatioPercentageTotal < 100){
      const errorMessage = `new ratio(${newRatioPercentageTotal}) is less than 100`;
      throw new Error(errorMessage);
    }
    this.existingRatioValueTotal = this.fNames.reduce((acc, fName) => {
      acc += this.existingRatio[fName].value;
      return acc;
    }, 0);

    this.existingRatio = this.calculatePercentageBasedOnValues(this.fNames, this.existingRatioValueTotal, this.existingRatio);
    console.log({newRatioPercentageTotal, existingRatioValueTotal: this.existingRatioValueTotal});
    this.fNames.forEach((fName) => {
      const fund = this.existingRatio[fName];
      fund.additionalValue = fund.calculatedPercentage / 100 * this.additionalValue;
      fund.oldPlusAdditionalValue = fund.additionalValue + fund.value;
    });
    console.log(this.existingRatio);
    this.existingRatioValueTotal = this.fNames.reduce((acc, fName) => {
      acc += this.existingRatio[fName].value;
      return acc;
    }, 0);
  }

  calculatePercentageBasedOnValues(fNames, existingRatioValueTotal, ratioObject) {
    return fNames.reduce((acc, name) => {
      const fund = acc[name];
      fund.calculatedPercentage = fund.value / existingRatioValueTotal * 100;
      return acc;
    }, ratioObject);
  }
}

module.exports = ExecutorWithAdditionalValueOnOldRatio;
