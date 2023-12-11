const Executor = require('./executor-with-additional-value-on-old-ratio');

const existingRatio= {
  ni50: {percentage:47.8, value: 253687.62},
  nxt50: {percentage:52.2, value: 280424.92},
  mid150: {percentage:0, value: 0},
  sm250: {percentage:0, value: 0},
  stf: {percentage:0, value: 0},
  gld: {percentage:0, value: 0},
};

const newRatio= {
  ni50: {percentage:21.7},
  nxt50: {percentage:21.7},
  mid150: {percentage:21.7},
  sm250: {percentage:21.7},
  stf: {percentage:13.2},
  gld: {percentage:0},
};

const executorInstance = new Executor(existingRatio, newRatio, 0);
executorInstance.perform();
// console.log(executorInstance.result);
console.table(executorInstance.result);
