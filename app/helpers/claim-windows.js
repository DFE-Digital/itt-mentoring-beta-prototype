const { DateTime } = require('luxon')

const claimWindows = require('../data/dist/settings/claim-windows')

/**
 * Sorts the claim windows by the most recent open date (descending),
 * falling back to most recent close date (descending) in case of ties,
 * and returns the first (most recently opened) claim window.
 *
 * @returns {Object|undefined} The "current" claim window object if available,
 * otherwise `undefined` if `claimWindows` is empty.
 */
exports.getCurrentClaimWindow = () => {
  claimWindows.sort((a, b) => {
    const aOpens = DateTime.fromISO(a.opensAt)
    const bOpens = DateTime.fromISO(b.opensAt)
    const aCloses = DateTime.fromISO(a.closesAt)
    const bCloses = DateTime.fromISO(b.closesAt)

    // Compare opensAt descending
    const opensDiff = bOpens.toMillis() - aOpens.toMillis()
    if (opensDiff !== 0) {
      return opensDiff
    }

    // If there's a tie on opensAt, compare closesAt descending
    return bCloses.toMillis() - aCloses.toMillis()
  })

  // After sorting, return the top item (the most recently opened window)
  return claimWindows[0]
}

/**
 * Checks whether the provided date (JS Date) falls within any claim window.
 * Using Luxon for consistent and predictable date parsing & comparison.
 */
exports.isClaimWindowOpen = (currentDate) => {
  // Convert currentDate (a JS Date) into a Luxon DateTime
  const current = DateTime.fromJSDate(currentDate)

  // Return true if any window is "open" for the given date.
  return claimWindows.some(window => {
    // Parse the window’s opensAt and closesAt as Luxon DateTime
    const opensAt = DateTime.fromISO(window.opensAt)
    const closesAt = DateTime.fromISO(window.closesAt)

    // Compare using Luxon DateTime objects
    return current >= opensAt && current <= closesAt
  })
}
