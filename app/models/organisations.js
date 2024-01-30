const path = require('path')
const fs = require('fs')

const directoryPath = path.join(__dirname, '../data/organisations/')

exports.findMany = (params) => {
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
      organisation.name.toLowerCase().includes(keywords)
      || organisation.code?.toLowerCase().includes(keywords)
      || organisation.ukprn?.toString().includes(keywords)
      || organisation.urn?.toString().includes(keywords)
      || organisation.address?.postcode?.toLowerCase().includes(keywords)
     )
  }

  return organisations
}

exports.findOne = (params) => {
  let organisation = {}

  if (params.organisationId) {
    const filePath = directoryPath + '/' + params.organisationId + '.json'

    const raw = fs.readFileSync(filePath)
    organisation = JSON.parse(raw)
  }

  return organisation
}

exports.insertOne = (params) => {
  let organisation

  if (params.organisation) {
    organisation = params.organisation

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

    if (params.organisation.trainingWithDisabilities !== undefined) {
      organisation.trainingWithDisabilities = params.organisation.trainingWithDisabilities
    }

    if (params.organisation.send !== undefined) {
      organisation.send = params.organisation.send
    }

    if (params.organisation.specialClasses !== undefined) {
      organisation.specialClasses = params.organisation.specialClasses
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

}
