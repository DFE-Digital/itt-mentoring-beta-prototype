exports.getClaimStatusOptions = (selectedItem) => {
  const options = require('../data/dist/statuses/claim-statuses')

  // sort the status options by sortOrder
  options.sort((a, b) => {
    return a.sortOrder - b.sortOrder
  })

  const items = []

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    item.checked = (selectedItem && selectedItem.includes(option.code)) ? 'checked' : ''

    items.push(item)
  })

  return items
}
