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
