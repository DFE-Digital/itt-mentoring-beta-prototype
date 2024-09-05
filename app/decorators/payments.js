const claimModel = require('../models/claims')

exports.decorate = (payment) => {
  const claims = claimModel.findMany({})

  const claim = claims.find(claim => claim.reference === payment.claim_reference)

  if (claim?.id) {
    payment.claimId = claim.id
  }

  if (claim?.organisationId) {
    payment.organisationId = claim.organisationId
  }

  return payment
}
