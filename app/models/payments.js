const path = require('path')
// const fs = require('fs')
// const { v4: uuid } = require('uuid')

// const CSV = require('csv-string')
const csvWriter = require('csv-writer').createObjectCsvWriter

const claimModel = require('./claims')
const organisationModel = require('./organisations')

const directoryPath = path.join(__dirname, '../uploads')

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
      payment.school_local_authority = school.location.localAuthorityCode
    } else {
      payment.school_local_authority = 'UNKNOWN'
    }

    if (school?.establishmentType) {
      payment.school_establishment_type = school.establishmentType
    } else {
      payment.school_establishment_type = 'UNKNOWN'
    }

    if (school?.establishmentGroup) {
      payment.school_establishment_type_group = school.establishmentGroup
    } else {
      payment.school_establishment_type_group = 'UNKNOWN'
    }

    payment.claim_amount = claim.totalAmount
    payment.claim_submission_date = claim.submittedAt
    payment.claim_status = claim.status
    payment.claim_unpaid_reason = ''

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

    // create the CSV headers
    const csv = csvWriter({
      path: filePath,
      header: [
        { id: 'claim_reference', title: 'claim_reference' },
        { id: 'school_urn', title: 'school_urn' },
        { id: 'school_name', title: 'school_name' },
        { id: 'school_local_authority', title: 'school_local_authority' },
        { id: 'school_establishment_type', title: 'school_establishment_type' },
        { id: 'school_establishment_type_group', title: 'school_establishment_type_group' },
        { id: 'claim_amount', title: 'claim_amount' },
        { id: 'claim_submission_date', title: 'claim_submission_date' },
        { id: 'claim_status', title: 'claim_status' },
        { id: 'claim_unpaid_reason', title: 'claim_unpaid_reason' }
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
