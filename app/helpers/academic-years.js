const { DateTime } = require('luxon')

const claimWindows = require('../data/dist/settings/claim-windows')
const academicYears = require('../data/dist/settings/academic-years')

/**
 * Convert a date input (string or Date) into a Luxon DateTime instance.
 * If parsing fails, returns null.
 */
const toDateTime = (dateInput) => {
  if (!dateInput) {
    return null
  }

  // If it's already a Date object, convert from that; otherwise assume ISO string
  const dt = (dateInput instanceof Date)
    ? DateTime.fromJSDate(dateInput)
    : DateTime.fromISO(dateInput)

  return dt.isValid ? dt : null
}

/**
 * Returns the academic year (e.g., "2023/24") that contains the given date
 */
exports.getAcademicYear = (date) => {
  const targetDate = toDateTime(date)

  // If date is invalid, return null early
  if (!targetDate) {
    console.warn('Invalid date passed to getAcademicYear')
    return null
  }

  // Look up the first claim window that includes the targetDate
  const windowItem = claimWindows.find(item => {
    const opensAt = toDateTime(item.opensAt)
    const closesAt = toDateTime(item.closesAt)
    if (!opensAt || !closesAt) return false // skip invalid dates

    return targetDate >= opensAt && targetDate <= closesAt
  })

  if (!windowItem) {
    console.log('No item found for the specified date')
    return null
  }

  return windowItem.academicYear
}

/**
 * Returns all active academic years
 */
exports.getAcademicYears = () => {
  return academicYears.filter((ay) => ay.active === true)
}

/**
 * Returns the newest academic year
 * (assumes codes are something like "2023/24" and that sorting by descending code is valid)
 */
exports.getCurrentAcademicYear = () => {
  // We can directly invoke getAcademicYears without `this`
  const activeYears = exports.getAcademicYears()

  // Sort descending by code
  activeYears.sort((a, b) => b.code.localeCompare(a.code))

  return activeYears[0]
}

/**
 * Builds a list of academic year options for use in a form, marking the selected items
 */
exports.getAcademicYearOptions = (selectedItems = []) => {
  const items = academicYears
    .filter(ay => ay.active)
    .map(ay => {
      return {
        text: ay.name,
        value: ay.code,
        id: ay.id,
        checked: selectedItems.includes(ay.code) ? 'checked' : ''
      }
    })

  // Sort by text ascending
  items.sort((a, b) => a.text.localeCompare(b.text))

  return items
}

/**
 * Returns the display name ("2023/24") given an academic year code
 */
exports.getAcademicYearLabel = (code) => {
  const ay = academicYears.find((ay) => ay.code === code)
  return ay ? ay.name : undefined
}

/**
 * Checks whether the provided code matches the "current" academic year
 * based on the current system date
 */
exports.isCurrentAcademicYear = (code) => {
  const now = DateTime.now()

  return claimWindows.some(window => {
    const opensAt = toDateTime(window.opensAt)
    const closesAt = toDateTime(window.closesAt)
    if (!opensAt || !closesAt) return false

    return (
      now >= opensAt &&
      now <= closesAt &&
      window.academicYear === code
    )
  })
}

// exports.getAcademicYear = (date) => {
//   // find the academic year for a given date
//   const item = claimWindows.find((item) =>
//     new Date(date) >= new Date(item.opensAt)
//     && new Date(date) <= new Date(item.closesAt)
//   )

//   // if the item is found, return its academic year
//   if (item) {
//     return item.academicYear
//   } else {
//     console.log("No item found for the specified date")
//     return null
//   }
// }

// exports.getAcademicYears = () => {
//   return academicYears.filter((academicYear) => academicYear.active === true)
// }

// exports.getCurrentAcademicYear = () => {
//   const academicYears = this.getAcademicYears()

//   // sort academic years newest to oldest
//   academicYears.sort((a, b) => {
//     return b.code.localeCompare(a.code)
//   })

//   return academicYears[0]
// }

// exports.getAcademicYearOptions = (selectedItem) => {
//   const items = []

//   academicYears.forEach((academicYear, i) => {
//     const item = {}

//     item.text = academicYear.name
//     item.value = academicYear.code
//     item.id = academicYear.id
//     item.checked = (selectedItem && selectedItem.includes(academicYear.code)) ? 'checked' : ''

//     if (academicYear.active) {
//       items.push(item)
//     }
//   })

//   items.sort((a, b) => {
//     return a.text.localeCompare(b.text)
//   })

//   return items
// }

// exports.getAcademicYearLabel = (code) => {
//   let label

//   const academicYear = academicYears.find((academicYear) => academicYear.code === code)

//   if (academicYear) {
//     label = academicYear.name
//   }

//   return label
// }

// exports.isCurrentAcademicYear = (code) => {
//   const currentDate = new Date()

//   for (let window of claimWindows) {
//     const opensAt = new Date(window.opensAt)
//     const closesAt = new Date(window.closesAt)

//     // Check if current date is between opensAt and closesAt and
//     // if academicYear matches target academic year
//     if (currentDate >= opensAt && currentDate <= closesAt && window.academicYear === code) {
//       return true
//     }
//   }

//   return false
// }
