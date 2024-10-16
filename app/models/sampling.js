const path = require('path')

const csvWriter = require('csv-writer').createObjectCsvWriter

const directoryPath = path.join(__dirname, '../uploads')

exports.writeFile = (params) => {
  if (params.key && params.sample) {
    const suffix = new Date().toISOString()
    const fileName = `sampling-${params.key}-${suffix}`
    const filePath = directoryPath + '/' + fileName + '.csv'

    // create the CSV headers
    const csv = csvWriter({
      path: filePath,
      header: [
        { id: 'claim_reference', title: 'claim_reference' },
        { id: 'school_urn', title: 'school_urn' },
        { id: 'school_name', title: 'school_name' },
        { id: 'school_postcode', title: 'school_postcode' },
        { id: 'mentor_full_name', title: 'mentor_full_name' },
        { id: 'mentor_hours_of_training', title: 'claim_hours_of_training' },
        { id: 'claim_assured', title: 'claim_assured' },
        { id: 'claim_not_assured_reason', title: 'claim_not_assured_reason' }
      ]
    })

    // write the CSV data
    csv.writeRecords(params.sample)
      .then(() => {
        console.log('CSV file written successfully')
      })
      .catch((error) => {
        console.error('Error writing CSV file:', error)
      })

    return filePath
  }
}
