exports.getLocalAuthorityDistrictOptions = () => { // selectedItem
  const items = []

  const options = require('../data/dist/ons/local-authority-districts')

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    // item.checked = (selectedItem && selectedItem.includes(option.code)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getLocalAuthorityDistrictLabel = (code) => {
  const options = require('../data/dist/ons/local-authority-districts')
  const option = options.find(option => option.code === code)

  let label = code

  if (option) {
    label = option.name
  }

  return label
}

exports.getParliamentaryConstituencyOptions = () => { // selectedItem
  const items = []

  const options = require('../data/dist/ons/parliamentary-constituencies')

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    // item.checked = (selectedItem && selectedItem.includes(option.code)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getParliamentaryConstituencyLabel = (code) => {
  const options = require('../data/dist/ons/parliamentary-constituencies')
  const option = options.find(option => option.code === code)

  let label = code

  if (option) {
    label = option.name
  }

  return label
}

exports.getRegionOptions = () => { // selectedItem
  const items = []

  const options = require('../data/dist/ons/regions')

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    // item.checked = (selectedItem && selectedItem.includes(option.code)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getRegionLabel = (code) => {
  const options = require('../data/dist/ons/regions')
  const option = options.find(option => option.code === code)

  let label = code

  if (option) {
    label = option.name
  }

  return label
}
