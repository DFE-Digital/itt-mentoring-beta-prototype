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

exports.isClaimWindowOpen = (currentDate) => {
  if (!(currentDate instanceof Date) || isNaN(currentDate)) {
    throw new Error('Invalid date provided to isClaimWindowOpen')
  }

  return claimWindows.some(window => {
    const opensAt = new Date(window.opensAt)
    const closesAt = new Date(window.closesAt)
    return currentDate >= opensAt && currentDate <= closesAt
  })
}
