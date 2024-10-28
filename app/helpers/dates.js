exports.arrayToDateObject = (array) => {
  return new Date(Date.UTC(array[2], array[1] - 1, array[0]))
}

exports.dateToArray = (date) => {
  return [
    date.getDate(),       // Day (1-31)
    date.getMonth() + 1,  // Month (0-11, so add 1 to get 1-12)
    date.getFullYear()    // Year (e.g., 2023)
  ]
}
