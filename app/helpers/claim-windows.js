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
