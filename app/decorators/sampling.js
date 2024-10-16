const claimModel = require('../models/claims')
const providerHelper = require('../helpers/providers')
const utilHelper = require('../helpers/utils')

exports.decorate = (item) => {
  const claims = claimModel.findMany({})

  const claim = claims.find(claim => claim.reference === item.claim_reference)

  if (claim?.id) {
    item.claimId = claim.id
  }

  if (claim?.organisationId) {
    item.organisationId = claim.organisationId
  }

  if (claim?.providerId) {
    item.providerName = providerHelper.getProviderName(claim.providerId)
    item.providerNameSlug = utilHelper.slugify(item.providerName)
  }

  return item
}
