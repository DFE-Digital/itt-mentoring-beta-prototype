const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const organisationModel = require('./organisations')

const directoryPath = path.join(__dirname, '../data/dist/mentors/')

exports.findMany = (params) => {
  // to prevent errors, check if directoryPath exists and if not, create
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath)
  }

  let mentors = []

  let documents = fs.readdirSync(directoryPath, 'utf8')

  // Only get JSON documents
  documents = documents.filter(doc => doc.match(/.*\.(json)/ig))

  documents.forEach((filename) => {
    const raw = fs.readFileSync(directoryPath + '/' + filename)
    const data = JSON.parse(raw)
    mentors.push(data)
  })

  if (params.organisationId) {
    mentors = mentors.filter(mentor => {
      return mentor.organisations.find(organisation => organisation.id === params.organisationId)
    })
  }

  return mentors
}

exports.findOne = (params) => {
  let mentors = []

  if (params.organisationId) {
    mentors = this.findMany({ organisationId: params.organisationId })
  } else {
    mentors = this.findMany({})
  }

  let mentor = {}

  if (params.mentorId) {
    mentor = mentors.find(mentor => mentor.id === params.mentorId)
  }

  if (parseInt(params.trn)) {
    mentor = mentors.find(mentor => mentor.trn === parseInt(params.trn))
  }

  return mentor
}

exports.saveOne = (params) => {
  let mentor = {}

  if (params.organisationId) {
    if (params.mentorId) {
      mentor = this.updateOne(params)
    } else {
      const mentorExists = this.findOne({ trn: params.mentor.trn })

      if (mentorExists) {
        mentor = this.updateOne(params)
      } else {
        mentor = this.insertOne(params)
      }
    }
  }

  return mentor
}

exports.insertOne = (params) => {
  const mentor = {}

  if (params.organisationId) {
    mentor.id = uuid()

    if (params.mentor.firstName) {
      mentor.firstName = params.mentor.firstName
    }

    if (params.mentor.lastName) {
      mentor.lastName = params.mentor.lastName
    }

    if (params.mentor.trn) {
      mentor.trn = params.mentor.trn
    }

    mentor.organisations = []

    const o = organisationModel.findOne({ organisationId: params.organisationId })

    const organisation = {}
    organisation.id = o.id
    organisation.name = o.name

    mentor.organisations.push(organisation)

    mentor.createdAt = new Date()

    const filePath = directoryPath + '/' + mentor.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(mentor)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return mentor
}

exports.updateOne = (params) => {
  let mentor
  if (params.mentorId) {
    mentor = this.findOne({ mentorId: params.mentorId })
  } else {
    mentor = this.findOne({ trn: params.mentor.trn })
  }

  if (mentor) {
    if (params.mentor.firstName) {
      mentor.firstName = params.mentor.firstName
    }

    if (params.mentor.lastName) {
      mentor.lastName = params.mentor.lastName
    }

    if (params.mentor.trn) {
      mentor.trn = params.mentor.trn
    }

    const organisationExists = mentor.organisations.find(
      organisation => organisation.id === params.organisationId
    )

    if (!organisationExists) {
      const o = organisationModel.findOne({ organisationId: params.organisationId })

      const organisation = {}
      organisation.id = o.id
      organisation.name = o.name

      mentor.organisations.push(organisation)
    }

    mentor.updatedAt = new Date()

    const filePath = directoryPath + '/' + mentor.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(mentor)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return mentor
}

exports.deleteOne = (params) => {
  if (params.organisationId && params.mentorId) {
    const mentor = this.findOne({ mentorId: params.mentorId })

    mentor.organisations = mentor.organisations.filter(
      organisation => organisation.id !== params.organisationId
    )

    mentor.updatedAt = new Date()

    const filePath = directoryPath + '/' + mentor.id + '.json'

    if (mentor.organisations.length) {
      // create a JSON sting for the submitted data
      const fileData = JSON.stringify(mentor)
      // write the JSON data
      fs.writeFileSync(filePath, fileData)
    } else {
      // remove the mentor altogether since they're no longer associated with an
      // organisation
      fs.unlinkSync(filePath)
    }
  }
}
