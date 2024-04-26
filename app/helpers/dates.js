
exports.arrayToDateObject = (array) => {
  return new Date(Date.UTC(array[2], array[1] - 1, array[0]))
}
