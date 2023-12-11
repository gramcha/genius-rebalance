const Executor = require('./executor-with-additional-value-on-old-ratio');

const existingRatio= {
  ni50: {percentage:25, value: 25},
  nxt50: {percentage:10, value: 10},
  mid150: {percentage:25, value: 25},
  sm250: {percentage:20, value: 20},
  stf: {percentage:10, value: 10},
  gld: {percentage:10, value: 10},
};

const newRatio= {
  ni50: {percentage:20},
  nxt50: {percentage:10},
  mid150: {percentage:10},
  sm250: {percentage:10},
  stf: {percentage:25},
  gld: {percentage:25},
};

const executorInstance = new Executor(existingRatio, newRatio, 10);
executorInstance.perform();
// console.log(executorInstance.result);
console.table(executorInstance.result);
