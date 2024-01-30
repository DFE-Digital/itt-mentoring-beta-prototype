const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/users/')

exports.findMany = (params) => {
  let users = []

  let documents = fs.readdirSync(directoryPath, 'utf8')

  // Only get JSON documents
  documents = documents.filter(doc => doc.match(/.*\.(json)/ig))

  documents.forEach((filename) => {
    const raw = fs.readFileSync(directoryPath + '/' + filename)
    const data = JSON.parse(raw)
    users.push(data)
  })


  users = users.filter(user => {
    return !user.organisations.length
  })

  return users
}

exports.findOne = (params) => {
  const users = this.findMany()
  let user = {}

  if (params.userId) {
    user = users.find(user => user.id === params.userId)
  }

  if (params.email) {
    user = users.find(user => user.email === params.email)
  }

  return user
}

exports.saveOne = (params) => {
  let user = {}

  if (params.userId) {
    user = this.updateOne(params)
  } else {
    const userExists = this.findOne({ email: params.user.email })

    if (userExists) {
      user = this.updateOne(params)
    } else {
      user = this.insertOne(params)
    }
  }

  return user
}

exports.insertOne = (params) => {
  const user = {}

  user.id = uuid()

  if (params.user.firstName) {
    user.firstName = params.user.firstName
  }

  if (params.user.lastName) {
    user.lastName = params.user.lastName
  }

  if (params.user.email) {
    user.email = params.user.email
    user.username = params.user.email
  }

  user.password = 'bat'

  user.organisations = []

  user.active = true
  user.createdAt = new Date()

  const filePath = directoryPath + '/' + user.id + '.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(user)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)

  return user
}

exports.updateOne = (params) => {
  let user
  if (params.userId) {
    user = this.findOne({ userId: params.userId })
  } else {
    user = this.findOne({ email: params.user.email })
  }

  if (user) {
    if (params.user.firstName) {
      user.firstName = params.user.firstName
    }

    if (params.user.lastName) {
      user.lastName = params.user.lastName
    }

    if (params.user.email) {
      user.email = params.user.email
    }

    user.active = true
    user.updatedAt = new Date()

    const filePath = directoryPath + '/' + user.id + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(user)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return user
}

exports.deleteOne = (params) => {
  if (params.userId) {
    const filePath = directoryPath + '/' + params.userId + '.json'
    // remove the user altogether since they're no longer associated with an
    // organisation
      fs.unlinkSync(filePath)
  }
}
