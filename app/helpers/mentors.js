const mentorModel = require('../models/mentors')

exports.getMentorOptions = (params) => {
  const items = []

  const mentors = mentorModel.findMany({ organisationId: params.organisationId })

  mentors.forEach((mentor, i) => {
    const item = {}

    item.text = `${mentor.firstName} ${mentor.lastName}`
    item.value = mentor.trn
    item.id = mentor.id

    item.hint = {}
    item.hint.text = mentor.trn

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getMentorName = (trn) => {
  const mentor = mentorModel.findOne({ trn })

  let label = trn

  if (mentor) {
    label = `${mentor.firstName} ${mentor.lastName}`
  }

  return label
}
