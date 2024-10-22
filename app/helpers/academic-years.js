const claimWindows = require('../data/dist/settings/claim-windows')
const academicYears = require('../data/dist/settings/academic-years')

exports.getAcademicYear = (date) => {
  // find the academic year for a given date
  const item = claimWindows.find((item) =>
    new Date(date) >= new Date(item.opensAt)
    && new Date(date) <= new Date(item.closesAt)
  )

  // if the item is found, return its academic year
  if (item) {
    return item.academicYear
  } else {
    console.log("No item found for the specified date")
    return null
  }
}

exports.getAcademicYears = () => {
  return academicYears.filter((academicYear) => academicYear.active === true)
}

exports.getCurrentAcademicYear = () => {
  const academicYears = this.getAcademicYears()

  // sort academic years newest to oldest
  academicYears.sort((a, b) => {
    return b.code.localeCompare(a.code)
  })

  return academicYears[0]
}

exports.getAcademicYearOptions = (selectedItem) => {
  const items = []

  academicYears.forEach((academicYear, i) => {
    const item = {}

    item.text = academicYear.name
    item.value = academicYear.code
    item.id = academicYear.id
    item.checked = (selectedItem && selectedItem.includes(academicYear.code)) ? 'checked' : ''

    if (academicYear.active) {
      items.push(item)
    }
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getAcademicYearLabel = (code) => {
  let label

  const academicYear = academicYears.find((academicYear) => academicYear.code === code)

  if (academicYear) {
    label = academicYear.name
  }

  return label
}
