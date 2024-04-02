const organisationModel = require('../models/organisations')
const providerHelper = require('../helpers/providers')

exports.decorate = (claim) => {
  const organisation = organisationModel.findOne({ organisationId: claim.organisationId })

  claim.providerName = providerHelper.getProviderName(claim.providerId)

  if (organisation) {
    claim.school = organisation
  }

  return claim
}
