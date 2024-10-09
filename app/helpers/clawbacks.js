const fundingHelper = require('./funding')

exports.calculateClawbackTotal = (organisation, hours = 0) => {
  let fundingRate = 0
  if (organisation.location?.districtAdministrativeCode) {
    fundingRate = fundingHelper.getFundingRate(organisation.location.districtAdministrativeCode)
  }

  const totalAmount = fundingRate * hours

  return totalAmount
}
