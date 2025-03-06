const { DateTime } = require('luxon')

const claimWindows = require('../data/dist/settings/claim-windows')

exports.getClaimWindows = () => {
  return claimWindows
}

exports.getCurrentClaimWindow = () => {
  const claimWindows = this.getClaimWindows()

  claimWindows.sort((a, b) => {
    return new Date(b.opensAt) - new Date(a.opensAt)
      || new Date(b.closesAt) - new Date(a.closesAt)
  })

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
