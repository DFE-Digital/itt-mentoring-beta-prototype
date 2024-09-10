const fs = require('fs')
const path = require('path')
const { rimrafSync } = require('rimraf')

const directoryPath = path.join(__dirname, '../data/dist/')

exports.update = (params) => {
  let settings = require('../data/dist/settings')

  if (params.settings.useLogin) {
    settings.useLogin = params.settings.useLogin
  }

  if (params.settings.showStartPage) {
    settings.showStartPage = params.settings.showStartPage
  }

  if (params.settings.showDeadlineBanner) {
    settings.showDeadlineBanner = params.settings.showDeadlineBanner
  }

  if (params.settings.pageSize) {
    settings.pageSize = params.settings.pageSize
  }

  const filePath = directoryPath + '/settings.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(settings)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)

  return settings
}

exports.reset = () => {
  const sourceDirectory = path.join(__dirname, '../data/seed')
  const destinationDirectory = path.join(__dirname, '../data/dist')

  const copy = (source, destination) => {
    if (!fs.existsSync(destinationDirectory)) {
      console.log('Creating directory: ' + destinationDirectory)
      fs.mkdirSync(destinationDirectory)
    }

    const list = fs.readdirSync(source)
    let sourceFile, destinationFile

    list.forEach((file) => {
      sourceFile = source + '/' + file
      destinationFile = destination + '/' + file

      const stat = fs.statSync(sourceFile)
      if (stat && stat.isDirectory()) {
        try {
          console.log('Creating directory: ' + destinationFile)
          fs.mkdirSync(destinationFile)
        } catch (e) {
          console.log('Directory already exists: ' + destinationFile)
        }
        copy(sourceFile, destinationFile)
      } else {
        try {
          if (!destinationFile.includes('.gitkeep') && !destinationFile.includes('README.md')) {
            console.log('Copying file: ' + destinationFile)
            fs.writeFileSync(destinationFile, fs.readFileSync(sourceFile))
          }
        } catch (e) {
          console.log('Could’t copy file: ' + destinationFile)
        }
      }
    })
  }

  const remove = (destination) => {
    console.log('Removing directory: ' + destination)
    rimrafSync(destination)
  }

  remove(destinationDirectory)

  copy(sourceDirectory, destinationDirectory)
}
