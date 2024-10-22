const organisationModel = require('../models/organisations')
const claimHelper = require('../helpers/claims')
const providerHelper = require('../helpers/providers')
const academicYearHelper = require('../helpers/academic-years')

exports.decorate = (claim) => {
  const organisation = organisationModel.findOne({ organisationId: claim.organisationId })

  if (claim.submittedAt) {
    claim.academicYear = academicYearHelper.getAcademicYear(claim.submittedAt)
  } else {
    claim.academicYear = academicYearHelper.getAcademicYear(claim.createdAt)
  }

  claim.totalHours = claimHelper.calculateClaimTotalHours(
    claim.mentors
  )

  claim.providerName = providerHelper.getProviderName(claim.providerId)

  if (organisation) {
    claim.school = organisation
  }

  return claim
}
