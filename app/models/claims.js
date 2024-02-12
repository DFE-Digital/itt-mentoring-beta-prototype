const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/claims/')

exports.findMany = (params) => {
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
