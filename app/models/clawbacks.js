const path = require('path')
const fs = require('fs')

const csvWriter = require('csv-writer').createObjectCsvWriter

const claimModel = require('./claims')
const organisationModel = require('./organisations')

const directoryPath = path.join(__dirname, '../uploads')
const claimDirectoryPath = path.join(__dirname, '../data/dist/claims')

exports.findMany = (params) => {
  const clawbacks = []

  const claims = claimModel.findMany({
    status: params.status
  })

  claims.forEach((claim) => {
    const clawback = {}

    const school = organisationModel.findOne({
      organisationId: claim.organisationId
    })

    clawback.claim_reference = claim.reference
    clawback.school_urn = school.urn
    clawback.school_name = school.name

    if (school?.location?.localAuthorityCode) {
      clawback.school_local_authority = school.location.localAuthorityCode
    } else {
      clawback.school_local_authority = 'UNKNOWN'
    }

    if (school?.establishmentType) {
      clawback.school_establishment_type = school.establishmentType
    } else {
      clawback.school_establishment_type = 'UNKNOWN'
    }

    if (school?.establishmentGroup) {
      clawback.school_establishment_type_group = school.establishmentGroup
    } else {
      clawback.school_establishment_type_group = 'UNKNOWN'
    }

    clawback.clawback_amount = claim.clawback.totalAmount
    clawback.claim_submission_date = claim.submittedAt
    clawback.claim_status = claim.status
    // clawback.clawback_unsuccessful_reason = ''

    clawbacks.push(clawback)
  })

  return clawbacks
}

exports.updateOne = (params) => {
  console.log(params);

  let claim = {}

  if (params.claimId) {
    claim = claimModel.findOne({
      claimId: params.claimId,
    })

    if (params.claim.status) {
      claim.status = params.claim.status
    }

    if (params.userId) {
      claim.updatedBy = params.userId
    }

    claim.updatedAt = new Date()

    if (params.clawback) {
      claim.clawback = {}
      claim.clawback.hours = params.clawback.hours
      claim.clawback.fundingRate = params.clawback.fundingRate
      claim.clawback.totalAmount = params.clawback.totalAmount
      claim.clawback.reason = params.clawback.reason
      claim.clawback.userId = params.userId
      claim.clawback.submittedAt = claim.updatedAt
    }

    const filePath = claimDirectoryPath + '/' + params.claimId + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(claim)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return claim
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
  if (params.clawbacks) {
    const fileName = "clawbacks-" + new Date().toISOString()
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
        { id: 'clawback_amount', title: 'clawback_amount' },
        { id: 'claim_submission_date', title: 'claim_submission_date' },
        { id: 'claim_status', title: 'claim_status' }
        // ,
        // { id: 'clawback_unsuccessful_reason', title: 'clawback_unsuccessful_reason' }
      ]
    })

    // write the CSV data
    csv.writeRecords(params.clawbacks)
      .then(() => {
        console.log('CSV file written successfully')
      })
      .catch((error) => {
        console.error('Error writing CSV file:', error)
      })

    return filePath
  }
}
