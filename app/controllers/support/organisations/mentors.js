const mentorModel = require('../../../models/mentors')
const organisationModel = require('../../../models/organisations')
const teacherModel = require('../../../models/teachers')

const Pagination = require('../../../helpers/pagination')
const validationHelper = require('../../../helpers/validators')

/// ------------------------------------------------------------------------ ///
/// LIST MENTOR
/// ------------------------------------------------------------------------ ///

exports.mentor_list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let mentors = mentorModel.findMany({ organisationId: req.params.organisationId })

  mentors.sort((a, b) => {
    return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)
  })

  // TODO: get pageSize from settings
  let pageSize = 25
  let pagination = new Pagination(mentors, req.query.page, pageSize)
  mentors = pagination.getData()

  delete req.session.data.mentor

  res.render('../views/support/organisations/mentors/list', {
    organisation,
    mentors,
    pagination,
    actions: {
      new: `/support/organisations/${req.params.organisationId}/mentors/new`,
      view: `/support/organisations/${req.params.organisationId}/mentors`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW MENTOR
/// ------------------------------------------------------------------------ ///

exports.mentor_details = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentor = mentorModel.findOne({ mentorId: req.params.mentorId })

  res.render('../views/support/organisations/mentors/show', {
    organisation,
    mentor,
    actions: {
      change: `/support/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/edit?referrer=change`,
      delete: `/support/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/delete`,
      back: `/support/organisations/${req.params.organisationId}/mentors`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW MENTOR
/// ------------------------------------------------------------------------ ///

exports.new_mentor_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/support/organisations/${req.params.organisationId}/mentors`
  if (req.query.referrer === 'check') {
    back = `/support/organisations/${req.params.organisationId}/mentors/new/check`
  }

  res.render('../views/support/organisations/mentors/find', {
    organisation,
    mentor: req.session.data.mentor,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/mentors/new`,
      back,
      cancel: `/support/organisations/${req.params.organisationId}/mentors`
    }
  })
}

exports.new_mentor_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const errors = []

  const mentor = mentorModel.findOne({
    organisationId: req.params.organisationId,
    trn: req.session.data.mentor.trn
  })

  if (!req.session.data.mentor.trn.length) {
    const error = {}
    error.fieldName = 'mentor'
    error.href = '#mentor'
    error.text = 'Enter a teacher reference number (TRN)'
    errors.push(error)
  } else if (!validationHelper.isValidTRN(req.session.data.mentor.trn)) {
    const error = {}
    error.fieldName = 'mentor'
    error.href = '#mentor'
    error.text = 'Enter a valid teacher reference number (TRN)'
    errors.push(error)
  } else if (mentor) {
    const error = {}
    error.fieldName = 'mentor'
    error.href = '#mentor'
    error.text = 'The mentor has already been added'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/mentors/find', {
      organisation,
      mentor: req.session.data.mentor,
      actions: {
        save: `/support/organisations/${req.params.organisationId}/mentors/new`,
        back: `/support/organisations/${req.params.organisationId}/mentors`,
        cancel: `/support/organisations/${req.params.organisationId}/mentors`
      },
      errors
    })
  } else {
    res.redirect(`/support/organisations/${req.params.organisationId}/mentors/new/check`)
  }
}

exports.new_mentor_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentor = teacherModel.findOne({ query: req.session.data.mentor.trn })

  res.render('../views/support/organisations/mentors/check-your-answers', {
    organisation,
    mentor,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/mentors/new/check`,
      back: `/support/organisations/${req.params.organisationId}/mentors/new`,
      change: `/support/organisations/${req.params.organisationId}/mentors/new?referrer=check`,
      cancel: `/support/organisations/${req.params.organisationId}/mentors`
    }
  })
}

exports.new_mentor_check_post = (req, res) => {
  const mentor = teacherModel.findOne({ query: req.session.data.mentor.trn })

  mentorModel.saveOne({
    organisationId: req.params.organisationId,
    mentor
  })

  delete req.session.data.mentor

  req.flash('success', 'Mentor added')
  res.redirect(`/support/organisations/${req.params.organisationId}/mentors`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE MENTOR
/// ------------------------------------------------------------------------ ///

exports.delete_mentor_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentor = mentorModel.findOne({
    organisationId: req.params.organisationId,
    mentorId: req.params.mentorId
  })

  res.render('../views/support/organisations/mentors/delete', {
    organisation,
    mentor,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/delete`,
      back: `/support/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}`,
      cancel: `/support/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}`
    }
  })
}

exports.delete_mentor_post = (req, res) => {
  mentorModel.deleteOne({
    organisationId: req.params.organisationId,
    mentorId: req.params.mentorId
  })

  req.flash('success', 'Mentor removed')
  res.redirect(`/support/organisations/${req.params.organisationId}/mentors`)
}
