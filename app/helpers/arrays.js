const _ = require('lodash')

// Remove empty items from arrays / coerce empty to false
// Returns false if no items remaining
exports.removeEmpty = (items) => {
  // Handle empty
  if (!items) return

  // Handle strings
  if (_.isString(items)) {
    if (items != null && items !== '') return items
    else return
  }

  // Handle arrys
  if (_.isArray(items)) {
    const output = items.filter(item => {
      return (item && (item !== ''))
    })
    // Don't return emtpy arrays
    if (output.length) return output
    else return
  }
}
