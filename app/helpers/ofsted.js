exports.getOfstedRatingOptions = () => { // selectedItem
  const items = []

  let options = require('../data/dist/ofsted/ratings')

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

exports.getOfstedRatingLabel = (code) => {
  const options = require('../data/dist/ofsted/ratings')
  const option = options.find(option => option.code === code)

  let label = code

  if (option) {
    label = option.name
  }

  return label
}
