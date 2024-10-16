const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/dist/activity')

exports.findMany = (params) => {
  // to prevent errors, check if directoryPath exists and if not, create
  // if (!fs.existsSync(directoryPath)) {
  //   fs.mkdirSync(directoryPath)
  // }

  const raw = fs.readFileSync(directoryPath + '/activity.json')
  const activityLog = JSON.parse(raw)

  return activityLog
}

exports.findOne = (params) => {
  const raw = fs.readFileSync(directoryPath + '/activity.json')
  const activityLog = JSON.parse(raw)

  const activity = activityLog.find(activity => activity.id === params.activityId)

  return activity
}

exports.insertOne = (params) => {
  const activity = this.findMany()

  const log = {}
  log.id = uuid()
  log.createdAt = new Date()
  log.createdBy = params.userId
  log.title = params.title

  if (params.text) {
    log.text = params.text
  }

  if (params.documents) {
    log.documents = params.documents
  }

  // add the item to the activity log
  activity.push(log)

  // ==================================================
  // write the activity log back to disk
  // ==================================================

  // file path for the activity log
  const filePath = directoryPath + '/activity.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(activity)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)
}
