const organisationModel = require('../models/organisations')
const schoolModel = require('../models/schools')

exports.getSchoolOptions = (params) => {
  const items = []



  return items
}


exports.getSchoolName = (id) => {
  const school = organisationModel.findOne({ organisationId: id })

  let label = id

  if (school) {
    label = school.name
  }

  return label
}
