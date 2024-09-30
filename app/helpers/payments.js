exports.parseData = (array) => {
  const payments = []

  array.forEach((item, i) => {
    const payment = {}

    payment.claim_reference = item[0]
    payment.school_urn = item[1]
    payment.school_name = item[2]
    payment.local_authority_code = item[3]
    payment.establishment_type_code = item[4]
    payment.claim_amount = item[5]
    payment.date_submitted = item[6]
    payment.claim_status = item[7]

    payments.push(payment)
  })

  return payments
}
