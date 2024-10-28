// schools that have onboarded
const organisationModel = require('../models/organisations')
// all schools
const schoolModel = require('../models/schools')

exports.getSchoolOptions = (selectedItem) => {
  const options = organisationModel.findMany({})
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

exports.getSchoolName = (id) => {
  const school = organisationModel.findOne({ organisationId: id })

  let label = id

  if (school) {
    label = school.name
  }

  return label
}
