const providerModel = require('../models/providers')

exports.getProviderOptions = (selectedItem) => {
  const options = providerModel.findMany({})
  const items = []

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.id
    item.id = option.id
    item.checked = (selectedItem && selectedItem.includes(option.id)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getProviderName = (query) => {
  const provider = providerModel.findOne({ query })

  let label = query

  if (provider) {
    label = provider.name
  }

  return label
}
