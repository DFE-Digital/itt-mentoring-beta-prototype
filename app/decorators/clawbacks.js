const claimModel = require('../models/claims')

exports.decorate = (item) => {
  const claims = claimModel.findMany({})

  const claim = claims.find(claim => claim.reference === item.claim_reference)

  if (claim?.id) {
    item.claimId = claim.id
  }

  if (claim?.organisationId) {
    item.organisationId = claim.organisationId
  }

  return item
}
