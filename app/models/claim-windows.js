const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/dist/settings')

exports.findMany = (params) => {
  const raw = fs.readFileSync(directoryPath + '/claim-windows.json')
  const windows = JSON.parse(raw)

  return windows
}

exports.findOne = (params) => {
  const windows = this.findMany()
  let window = {}

  if (params.windowId) {
    window = windows.find(window => window.id === params.windowId)
  }

  return window
}

exports.insertOne = (params) => {
  const raw = fs.readFileSync(directoryPath + '/claim-windows.json')
  const windows = JSON.parse(raw)

  if (params.window) {
    const window = {}
    const opensAt = new Date(params.window.opensAt)
    // opensAt.setUTCHours(0, 0, 0, 0)
    const closesAt = new Date(params.window.closesAt)
    closesAt.setUTCHours(23, 59, 59, 999)

    window.id = uuid()
    window.opensAt = opensAt
    window.closesAt = closesAt
    window.academicYear = params.window.academicYear

    window.createdAt = new Date()
    window.createdBy = params.userId

    windows.push(window)
  }

  // ==================================================
  // write the claim windows back to disk
  // ==================================================

  // file path for the activity log
  const filePath = directoryPath + '/claim-windows.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(windows)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)
}

exports.updateOne = (params) => {
  const raw = fs.readFileSync(directoryPath + '/claim-windows.json')
  const windows = JSON.parse(raw)

  if (params.window) {
    const index = windows.findIndex((item) => item.id === params.windowId)
    const window = {}
    const opensAt = new Date(params.window.opensAt)
    // opensAt.setUTCHours(0, 0, 0, 0)
    const closesAt = new Date(params.window.closesAt)
    closesAt.setUTCHours(23, 59, 59, 999)

    window.opensAt = opensAt
    window.closesAt = closesAt
    window.academicYear = params.window.academicYear

    window.updateAt = new Date()
    window.updatedBy = params.userId

    // if the item is found, update the object
    if (index !== -1) {
      windows[index] = { ...windows[index], ...window }
    } else {
      console.log("Item with the specified ID not found")
    }
  }

  // ==================================================
  // write the claim windows back to disk
  // ==================================================

  // file path for the activity log
  const filePath = directoryPath + '/claim-windows.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(windows)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)
}

exports.deleteOne = (params) => {
  const raw = fs.readFileSync(directoryPath + '/claim-windows.json')
  const windows = JSON.parse(raw)

  if (params.windowId) {
    const index = windows.findIndex((item) => item.id === params.windowId)

    // if the item is found, update the object
    if (index !== -1) {
      windows.splice(index, 1)
    } else {
      console.log("Item with the specified ID not found")
    }
  }

  // ==================================================
  // write the claim windows back to disk
  // ==================================================

  // file path for the activity log
  const filePath = directoryPath + '/claim-windows.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(windows)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)
}
