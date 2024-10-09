const path = require('path')
const fs = require('fs')

const csvWriter = require('csv-writer').createObjectCsvWriter

const claimModel = require('./claims')
const organisationModel = require('./organisations')

const directoryPath = path.join(__dirname, '../data/dist/clawbacks')
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
      clawback.local_authority_code = school.location.localAuthorityCode
    } else {
      clawback.local_authority_code = 'UNKNOWN'
    }

    if (school?.establishmentType) {
      clawback.establishment_type_code = school.establishmentType
    } else {
      clawback.establishment_type_code = 'UNKNOWN'
    }

    clawback.clawback_amount = claim.clawback.totalAmount
    clawback.clawback_date = claim.clawback.submittedAt
    clawback.claim_status = claim.status

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
        { id: 'local_authority_code', title: 'local_authority_code' },
        { id: 'establishment_type_code', title: 'establishment_type_code' },
        { id: 'clawback_amount', title: 'clawback_amount' },
        { id: 'clawback_date', title: 'clawback_date' },
        { id: 'claim_status', title: 'claim_status' }
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
