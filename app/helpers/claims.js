const claimModel = require('../models/claims')

const fundingHelper = require('./funding')

exports.generateClaimID = () => {
  // Generate a random number, convert it to base 36, and extract digits 2 to 10
  // The substring starts at index 2 to skip the "0." part of the decimal result from Math.random()
  let claimID = Math.random().toString(36).substring(2, 10)

  // Ensure the ID is 8 characters long
  if (claimID.length < 8) {
    // If it's shorter than 8, recursively generate another ID (rare case)
    return this.generateClaimID()
  }

  return claimID
}

exports.calculateClaimTotalHours = (mentors) => {
  let totalHours = 0

  if (mentors) {
    const mentorHours = mentors.map(mentor => {
      if (mentor.hours === 'other') {
        return parseInt(mentor.otherHours)
      } else {
        return parseInt(mentor.hours)
      }
    })

    const initialHours = 0

    totalHours = mentorHours.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      initialHours
    )
  }

  return totalHours
}

exports.calculateClaimTotal = (organisation, mentors) => {
  const totalHours = this.calculateClaimTotalHours(mentors)

  let fundingRate = 0
  if (organisation.location?.districtAdministrativeCode) {
    fundingRate = fundingHelper.getFundingRate(organisation.location.districtAdministrativeCode)
  }

  const totalAmount = fundingRate * totalHours

  return totalAmount
}

exports.getClaimStatusClasses = (status) => {
  let classes = 'govuk-tag--blue'

  if (status && status === 'draft') {
    classes = 'govuk-tag--grey'
  }

  return classes
}

exports.getProviderMentorTotalHours = (params) => {
  let totalHours = 0

  if (params.providerId && params.trn) {
    const claims = claimModel.findMany({ providerId: params.providerId })

    const mentorClaims = claims.filter(claim => {
      return claim.mentors.find(mentor => parseInt(mentor.trn) === parseInt(params.trn))
    })

    mentorClaims.forEach(claim => {
      claim?.mentors.forEach(mentor => {
        if (parseInt(mentor.trn) === parseInt(params.trn)) {
          if (mentor.hours === 'other') {
            totalHours += parseInt(mentor.otherHours)
          } else {
            totalHours += parseInt(mentor.hours)
          }
        }
      })
    })
  }

  return totalHours
}

exports.parseData = (claims) => {
  const items = []

  claims.forEach((claim) => {
    const item = {}

    item.claim_reference = claim.reference
    item.school_urn = claim.school.urn
    item.school_name = claim.school.name

    if (claim.school?.location?.localAuthorityCode) {
      item.local_authority_code = claim.school.location.localAuthorityCode
    } else {
      item.local_authority_code = 'UNKNOWN'
    }

    if (claim.school?.establishmentType) {
      item.establishment_type_code = claim.school.establishmentType
    } else {
      item.establishment_type_code = 'UNKNOWN'
    }

    item.claim_amount = claim.totalAmount
    item.date_submitted = claim.submittedAt
    item.claim_status = claim.status

    items.push(item)
  })

  return items
}
