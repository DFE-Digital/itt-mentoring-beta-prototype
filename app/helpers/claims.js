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

exports.calculateClaimTotal = (organisation, mentors) => {
  const mentorHours = mentors.map(mentor => {
    if (mentor.hours === 'other') {
      return parseInt(mentor.otherHours)
    } else {
      return parseInt(mentor.hours)
    }
  })

  const initialHours = 0

  const totalHours = mentorHours.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    initialHours
  )

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
