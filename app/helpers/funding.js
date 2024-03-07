exports.getFundingRate = (localAuthorityCode) => {
  let rate = 0

  const data = require('../data/dist/funding/funding-rates')

  const funding = data.find(item => item.localAuthorityCode === localAuthorityCode)

  if (funding) {
    rate = funding.fundingRate
  }

  return rate
}

exports.getFundingAreaLabel = (localAuthorityCode) => {
  let label

  const data = require('../data/dist/funding/funding-rates')

  const funding = data.find(item => item.localAuthorityCode === localAuthorityCode)

  if (funding) {
    label = funding.fundingArea
  }

  return label
}
