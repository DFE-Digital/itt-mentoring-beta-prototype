exports.getFundingRate = (localAuthorityCode) => {
  let rate = 0

  const data = require('../data/funding/funding-rates')

  const funding = data.find(item => item.localAuthorityCode === localAuthorityCode)

  if (funding) {
    rate = funding.fundingRate
  }

  return rate
}

exports.getFundingRegionLabel = (localAuthorityCode) => {
  let label

  const data = require('../data/funding/funding-rates')

  const funding = data.find(item => item.localAuthorityCode === localAuthorityCode)

  if (funding) {
    label = funding.fundingRegion
  }

  return label
}
