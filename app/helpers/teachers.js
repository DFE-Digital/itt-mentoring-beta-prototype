const teacherModel = require('../models/teachers')

exports.getTeacherName = (trn) => {
  const teacher = teacherModel.findOne({ trn: trn })

  let label = trn

  if (teacher) {
    label = `${teacher.firstName} ${teacher.lastName}`
  }

  return label
}
