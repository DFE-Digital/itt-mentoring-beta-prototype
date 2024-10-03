exports.parseData = (array) => {
  const claims = []

  array.forEach((item, i) => {
    const claim = {}

    claim.claim_reference = item[0]
    claim.school_urn = item[1]
    claim.school_name = item[2]
    claim.local_authority_code = item[3]
    claim.establishment_type_code = item[4]
    claim.claim_amount = item[5]
    claim.date_submitted = item[6]
    claim.claim_status = item[7]

    claims.push(claim)
  })

  return claims
}
