exports.findMany = (params) => {
  let teachers = require('../data/dist/teachers/teachers.json')

  if (params.trn) {
    teachers = teachers.filter(teacher =>
      teacher.trn.toString() === params.trn
     )
  }

  if (params.dob) {
    teachers = teachers.filter(teacher => teacher.dateOfBirth === params.dob)
  }

  if (params.nino) {
    teachers = teachers.filter(teacher =>
      teacher.nationalInsuranceNumber.toUpperCase() === params.nino.toUpperCase()
     )
  }

  return teachers
}

exports.findOne = (params) => {
  const teachers = require('../data/dist/teachers/teachers.json')

  let teacher

  if (params.trn && params.dob) {
    teacher = teachers.find(teacher =>
      teacher.trn.toString() === params.trn
      && teacher.dateOfBirth === params.dob
    )
  }

  return teacher
}
