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
