const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/dist/claims/')

exports.findMany = (params) => {
  // to prevent errors, check if directoryPath exists and if not, create
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath)
  }

  let claims = []

  let documents = fs.readdirSync(directoryPath, 'utf8')

  // Only get JSON documents
  documents = documents.filter(doc => doc.match(/.*\.(json)/ig))

  documents.forEach((filename) => {
    const raw = fs.readFileSync(directoryPath + '/' + filename)
    const data = JSON.parse(raw)
    claims.push(data)
  })

  if (params.organisationId) {
    claims = claims.filter(claim => claim.organisationId === params.organisationId)
  }

  return claims
}

exports.findOne = (params) => {
  const claims = this.findMany(params)
  let claim = {}

  if (params.claimId) {
    claim = claims.find(claim => claim.id === params.claimId)
  }

  return claim
}

exports.insertOne = (params) => {
  let claim = {}

  if (params.organisationId) {
    claim.id = uuid()

    claim.organisationId = params.organisationId

    if (params.claim.reference) {
      claim.reference = params.claim.reference.toUpperCase()
    }

    if (params.claim.provider) {
      claim.provider = params.claim.provider
    }

    if (params.claim.mentors) {
      claim.mentors = params.claim.mentors
    }

    if (params.claim.totalAmount) {
      claim.totalAmount = params.claim.totalAmount
    }

    if (params.claim.status) {
      claim.status = params.claim.status

      if (params.claim.status === 'submitted') {
        claim.submittedAt = new Date()
      }
    }

    claim.createdAt = new Date()

    const filePath = directoryPath + '/' + claim.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(claim)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return claim
}

exports.updateOne = (params) => {
  let claim = {}

  if (params.organisationId && params.claimId) {
    claim = this.findOne({
      organisationId: params.organisationId,
      claimId: params.claimId,
    })

    if (params.claim.provider) {
      claim.provider = params.claim.provider
    }

    if (params.claim.mentors) {
      claim.mentors = params.claim.mentors
    }

    if (params.claim.totalAmount) {
      claim.totalAmount = params.claim.totalAmount
    }

    if (params.claim.status) {
      claim.status = params.claim.status

      if (!claim.submittedAt && params.claim.status === 'submitted') {
        claim.submittedAt = new Date()
      }
    }

    claim.updatedAt = new Date()

    const filePath = directoryPath + '/' + claim.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(claim)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return claim
}

exports.deleteOne = (params) => {
  if (params.organisationId && params.claimId) {
    const filePath = directoryPath + '/' + params.claimId + '.json'
    fs.unlinkSync(filePath)
  }
}
