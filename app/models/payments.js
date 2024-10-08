const path = require('path')
// const fs = require('fs')
// const { v4: uuid } = require('uuid')

// const CSV = require('csv-string')
const csvWriter = require('csv-writer').createObjectCsvWriter

const claimModel = require('./claims')
const organisationModel = require('./organisations')

const directoryPath = path.join(__dirname, '../data/dist/payments')

exports.findMany = (params) => {
  const payments = []

  const claims = claimModel.findMany({
    status: params.status
  })

  claims.forEach((claim) => {
    const payment = {}

    const school = organisationModel.findOne({
      organisationId: claim.organisationId
    })

    payment.claim_reference = claim.reference
    payment.school_urn = school.urn
    payment.school_name = school.name

    if (school?.location?.localAuthorityCode) {
      payment.local_authority_code = school.location.localAuthorityCode
    } else {
      payment.local_authority_code = 'UNKNOWN'
    }

    if (school?.establishmentType) {
      payment.establishment_type_code = school.establishmentType
    } else {
      payment.establishment_type_code = 'UNKNOWN'
    }

    payment.claim_amount = claim.totalAmount
    payment.date_submitted = claim.submittedAt
    payment.claim_status = claim.status

    payments.push(payment)
  })

  return payments
}

exports.updateMany = (params) => {
  const claims = claimModel.findMany({
    status: params.currentStatus
  })

  claims.forEach((claim) => {
    claimModel.updateOne({
      organisationId: claim.organisationId,
      claimId: claim.id,
      claim: {
        status: params.newStatus
      },
      userId: params.userId
    })
  })
}

exports.writeFile = (params) => {
  if (params.payments) {
    const fileName = "payments-" + new Date().toISOString()
    const filePath = directoryPath + '/' + fileName + '.csv'
    // const filePath = directoryPath + '/' + uuid() + '.csv'

    // create the CSV headers
    const csv = csvWriter({
      path: filePath,
      header: [
        { id: 'claim_reference', title: 'claim_reference' },
        { id: 'school_urn', title: 'school_urn' },
        { id: 'school_name', title: 'school_name' },
        { id: 'local_authority_code', title: 'local_authority_code' },
        { id: 'establishment_type_code', title: 'establishment_type_code' },
        { id: 'claim_amount', title: 'claim_amount' },
        { id: 'date_submitted', title: 'date_submitted' },
        { id: 'claim_status', title: 'claim_status' }
      ]
    })

    // write the CSV data
    csv.writeRecords(params.payments)
      .then(() => {
        console.log('CSV file written successfully')
      })
      .catch((error) => {
        console.error('Error writing CSV file:', error)
      })

    return filePath
  }
}
