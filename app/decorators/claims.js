const organisationModel = require('../models/organisations')
const claimHelper = require('../helpers/claims')
const providerHelper = require('../helpers/providers')

exports.decorate = (claim) => {
  const organisation = organisationModel.findOne({ organisationId: claim.organisationId })

  claim.totalHours = claimHelper.calculateClaimTotalHours(
    claim.mentors
  )

  claim.providerName = providerHelper.getProviderName(claim.providerId)

  if (organisation) {
    claim.school = organisation
  }

  return claim
}
