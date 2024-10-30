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

exports.isClaimWindowOpen = () => {
  const currentDate = new Date()

  // iterate through each item in the claim windows array
  for (let window of claimWindows) {
    const opensAt = new Date(window.opensAt)
    const closesAt = new Date(window.closesAt)

    // check if current date is between opensAt and closesAt
    if (currentDate >= opensAt && currentDate <= closesAt) {
      return true
    }
  }

  return false
}
