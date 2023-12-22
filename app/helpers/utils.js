exports.arrayToList = (array, join = ', ', final = ' and ') => {
  const arr = array.slice(0)

  const last = arr.pop()

  if (array.length > 1) {
    return arr.join(join) + final + last
  }

  return last
}

exports.slugify = (text) => {
  return text.trim()
    .toLowerCase()
    // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[^\w\s-]/g, '')
    // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/[\s_-]+/g, '-')
    // remove leading, trailing -
    .replace(/^-+|-+$/g, '')
}

exports.arrayToDateObject = (array) => {
  return new Date(array[2], array[1] - 1, array[0])
}

exports.getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name)
    ? name
    : [name].filter((name) => {
        return name !== '_unchecked'
      })) || data && (Array.isArray(data) ? data : [data])
}

exports.removeFilter = (value, data) => {
  // do this check because if coming from overview page for example,
  // the query/param will be a string value, not an array containing a string
  if (Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}


exports.getSelectedOrganisationTypeItems = (selectedItems, baseHref = '/support/organisations') => {
  const items = []

  selectedItems.forEach((thing) => {
    const item = {}
    item.text = thing.text
    item.href = `${baseHref}/remove-type-filter/${thing.value}`

    items.push(item)
  })

  return items
}

exports.getOrganisationTypeFilterItems = (selectedItems) => {
  const options = require('../data/organisation-types')

  const items = []

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    item.checked = (selectedItems && selectedItems.includes(option.code)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getOrganisationTypeLabel = (code) => {
  const types = require('../data/organisation-types')
  let label = code

  if (code) {
    label = types.find(type => type.code === code).name
  }

  return label
}
