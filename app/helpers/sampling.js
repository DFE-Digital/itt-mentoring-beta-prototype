const claimModel = require('../models/claims')
const organisationModel = require('../models/organisations')

exports.parseSamplingData = (array) => {
  const claims = []

  array.forEach((item, i) => {
    const claim = {}

    claim.claim_reference = item[0]
    claim.school_urn = item[1]
    claim.school_name = item[2]
    claim.claim_submission_date = item[3]
    claim.sample_reason = item[4]

    claims.push(claim)
  })

  return claims
}

exports.parseProviderSampleData = (array) => {
  array.sort((a, b) => {
    a.providerName.localeCompare(b.providerName)
  })

  const providerSamples = {}

  array.forEach((item, i) => {
    const claim = claimModel.findOne({ reference: item.claim_reference })
    const school = organisationModel.findOne({ organisationId: claim.organisationId })

    if (!providerSamples[item.providerNameSlug]) {
      providerSamples[item.providerNameSlug] = {}
      providerSamples[item.providerNameSlug].slug = item.providerNameSlug
      providerSamples[item.providerNameSlug].name = item.providerName
      providerSamples[item.providerNameSlug].sample = []
    }

    claim.mentors.forEach((mentor, i) => {
      const sample = {}

      sample.claim_reference = claim.reference
      sample.school_urn = school.urn
      sample.school_name = school.name
      sample.school_postcode = school.address.postcode ? school.address.postcode : ''
      sample.mentor_full_name = mentor.name
      sample.mentor_hours_of_training = mentor.otherHours ? mentor.otherHours : mentor.hours
      sample.claim_assured = ''
      sample.claim_not_assured_reason = ''

      providerSamples[item.providerNameSlug].sample.push(sample)
    })
  })

  return providerSamples
}

exports.parseProviderResponseData = (array) => {
  const claims = []

  array.forEach((item, i) => {
    const claim = {}

    claim.claim_reference = item[0]
    claim.school_urn = item[1]
    claim.school_name = item[2]
    claim.school_postcode = item[3]
    claim.mentor_full_name = item[4]
    claim.mentor_hours_of_training = item[5]
    claim.claim_assured = item[6]
    claim.claim_not_assured_reason = item[7]

    claims.push(claim)
  })

  return claims
}


exports.groupClaimsByClaimId = (data) => {
  const groupedClaims = data.reduce((acc, item) => {
    const {
      claimId,
      claim_reference,
      school_urn,
      school_name,
      school_postcode,
      organisationId,
      providerName,
      providerNameSlug,
      mentor_full_name,
      mentor_hours_of_training,
      claim_assured,
      claim_not_assured_reason,
    } = item;

    if (!acc[claimId]) {
      acc[claimId] = {
        claimId,
        claim_reference,
        school_urn,
        school_name,
        school_postcode,
        organisationId,
        providerName,
        providerNameSlug,
        mentors: [],
      };
    }

    acc[claimId].mentors.push({
      mentor_full_name,
      mentor_hours_of_training,
      claim_assured,
      claim_not_assured_reason,
    });

    return acc;
  }, {});

  return Object.values(groupedClaims);
}
