exports.parseData = (array) => {
  const claims = []

  array.forEach((item, i) => {
    const claim = {}

    claim.claim_reference = item[0]
    claim.school_urn = item[1]
    claim.school_name = item[2]
    claim.school_local_authority = item[3]
    claim.school_establishment_type = item[4]
    claim.school_establishment_type_group = item[5]
    claim.claim_amount = item[6]
    claim.claim_submission_date = item[7]
    claim.claim_status = item[8]
    claim.sampling_reason = item[9]

    claims.push(claim)
  })

  return claims
}
