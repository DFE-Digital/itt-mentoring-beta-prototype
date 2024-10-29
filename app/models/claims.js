const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const academicYearHelper = require('../helpers/academic-years')

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

  // School
  if (params.organisationId) {
    claims = claims.filter(claim => claim.organisationId === params.organisationId)
  }

  // Accredited provider
  if (params.providerId) {
    claims = claims.filter(claim => claim.providerId === params.providerId)
  }

  // Claim status
  if (params.status) {
    claims = claims.filter(claim => claim.status === params.status)
  }

  // Claim academic year
  if (params.academicYear) {
    claims = claims.filter(claim => claim.academicYear === params.academicYear)
  }

  return claims
}

exports.findOne = (params) => {
  const claims = this.findMany(params)
  let claim = {}

  if (params.claimId || params.reference) {
    claim = claims.find(claim =>
      claim.id === params.claimId ||
      claim.reference === params.reference
    )

    if (claim.notes) {
      claim.notes.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }
  }

  return claim
}

exports.insertOne = (params) => {
  const claim = {}

  if (params.organisationId) {
    claim.id = uuid()

    claim.organisationId = params.organisationId

    if (params.claim.reference) {
      claim.reference = params.claim.reference.toUpperCase()
    }

    if (params.claim.providerId) {
      claim.providerId = params.claim.providerId
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
        if (params.userId) {
          claim.submittedBy = params.userId
        }

        claim.submittedAt = new Date()
      }
    }

    if (params.userId) {
      claim.createdBy = params.userId
    }

    claim.createdAt = new Date()

    if (claim.submittedAt) {
      claim.academicYear = academicYearHelper.getAcademicYear(claim.submittedAt)
    } else {
      claim.academicYear = academicYearHelper.getAcademicYear(claim.createdAt)
    }

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
      claimId: params.claimId
    })

    // add a notes array if it doesn't exist
    if (!claim.notes) {
      claim.notes = []
    }

    if (params.claim.providerId) {
      claim.providerId = params.claim.providerId
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
        if (params.userId) {
          claim.submittedBy = params.userId
        }

        claim.submittedAt = new Date()
      }
    }

    claim.updatedAt = new Date()

    if (params.claim.note) {
      const note = params.claim.note
      note.createdAt = claim.updatedAt

      claim.notes.push(note)
    }

    if (params.userId) {
      claim.updatedBy = params.userId
    }

    if (claim.submittedAt) {
      claim.academicYear = academicYearHelper.getAcademicYear(claim.submittedAt)
    } else {
      claim.academicYear = academicYearHelper.getAcademicYear(claim.createdAt)
    }

    const filePath = directoryPath + '/' + params.claimId + '.json'

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
