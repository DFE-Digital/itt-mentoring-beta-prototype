const path = require('path')
const fs = require('fs')

const directoryPath = path.join(__dirname, '../data/dist/organisations/')

exports.findMany = (params) => {
  // to prevent errors, check if directoryPath exists and if not, create
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath)
  }

  let organisations = []

  let documents = fs.readdirSync(directoryPath, 'utf8')

  // Only get JSON documents
  documents = documents.filter(doc => doc.match(/.*\.(json)/ig))

  documents.forEach((filename) => {
    const raw = fs.readFileSync(directoryPath + '/' + filename)
    const data = JSON.parse(raw)
    organisations.push(data)
  })

  if (params.organisationTypes?.length) {
    organisations = organisations.filter(
      organisation => params.organisationTypes.includes(organisation.type)
    )
  }

  if (params.keywords?.length || params.query?.length) {
    const keywords = params.keywords?.toLowerCase() || params.query?.toLowerCase()
    organisations = organisations.filter(organisation =>
      organisation.name.toLowerCase().includes(keywords) ||
      organisation.code?.toLowerCase().includes(keywords) ||
      organisation.ukprn?.toString().includes(keywords) ||
      organisation.urn?.toString().includes(keywords) ||
      organisation.address?.postcode?.toLowerCase().includes(keywords)
    )
  }

  return organisations
}

exports.findOne = (params) => {
  let organisation = {}

  if (params.organisationId) {
    const filePath = directoryPath + '/' + params.organisationId + '.json'

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath)
      organisation = JSON.parse(raw)
    }
  }

  return organisation
}

exports.insertOne = (params) => {
  let organisation

  if (params.organisation) {
    organisation = params.organisation

    // hard code the private beta flag to false since all new schools will
    // in public beta
    organisation.privateBetaSchool = false

    organisation.createdAt = new Date()

    const filePath = directoryPath + '/' + organisation.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(organisation)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }
}

exports.updateOne = (params) => {
  let organisation

  if (params.organisationId) {
    organisation = this.findOne({ organisationId: params.organisationId })

    if (typeof (params.organisation?.conditionsAgreed) === 'boolean') {
      if (params.organisation.conditionsAgreed) {
        organisation.conditionsAgreed = true
        organisation.conditionsAgreedBy = params.userId
        organisation.conditionsAgreedAt = new Date()
      } else {
        organisation.conditionsAgreed = false
        delete organisation.conditionsAgreedBy
        delete organisation.conditionsAgreedAt
      }
    }

    organisation.updatedAt = new Date()

    const filePath = directoryPath + '/' + params.organisationId + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(organisation)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return organisation
}

exports.deleteOne = (params) => {
  if (params.organisationId) {
    const filePath = directoryPath + '/' + params.organisationId + '.json'
    fs.unlinkSync(filePath)
  }
}
