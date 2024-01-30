exports.findMany = (params) => {
  let schools = require('../data/schools/schools.json')

  if (params.query?.length) {
    const query = params.query.toLowerCase()
    return schools.filter(school =>
      school.name.toLowerCase().includes(query)
      || school.urn?.toString().includes(query)
      || school.address?.postcode?.toLowerCase().includes(query)
     )
  }

  return schools
}

exports.findOne = (params) => {
  let schools = require('../data/schools/schools.json')

  if (params.query?.length) {
    const query = params.query.toLowerCase()
    return schools.find(school =>
      school.name.toLowerCase().includes(query)
      || school.urn?.toString().includes(query)
      || school.address?.postcode?.toLowerCase().includes(query)
     )
  } else {
    return null
  }
}
