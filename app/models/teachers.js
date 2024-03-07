exports.findMany = (params) => {
  let teachers = require('../data/dist/teachers/teachers.json')

  if (params.query?.length) {
    const query = params.query.toUpperCase()
    return teachers.filter(teacher =>
      teacher.trn?.toString().includes(query)
      || teacher.nationalInsuranceNumber?.toUpperCase().includes(query)
     )
  }

  return teachers
}

exports.findOne = (params) => {
  let teachers = require('../data/dist/teachers/teachers.json')

  if (params.query?.length) {
    const query = params.query.toUpperCase()
    return teachers.find(teacher =>
      teacher.trn?.toString().includes(query)
      || teacher.nationalInsuranceNumber?.toUpperCase().includes(query)
     )
  } else {
    return null
  }
}
