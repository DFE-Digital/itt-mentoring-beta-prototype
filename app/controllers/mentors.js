const claimModel = require('../models/claims')
const mentorModel = require('../models/mentors')
const organisationModel = require('../models/organisations')
const teacherModel = require('../models/teachers')

const Pagination = require('../helpers/pagination')
const arrayHelper = require('../helpers/arrays')
const dateHelper = require('../helpers/dates')
const validationHelper = require('../helpers/validators')

/// ------------------------------------------------------------------------ ///
/// SHOW MENTOR
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

  res.render('../views/mentors/list', {
    organisation,
    mentors,
    pagination,
    actions: {
      new: `/organisations/${req.params.organisationId}/mentors/new`,
      view: `/organisations/${req.params.organisationId}/mentors`,
      back: '/'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW MENTOR
/// ------------------------------------------------------------------------ ///

exports.mentor_details = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentor = mentorModel.findOne({ mentorId: req.params.mentorId })

  res.render('../views/mentors/show', {
    organisation,
    mentor,
    actions: {
      change: `/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/edit?referrer=change`,
      delete: `/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/delete`,
      back: `/organisations/${req.params.organisationId}/mentors`,
      cancel: `/organisations/${req.params.organisationId}/mentors`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW MENTOR
/// ------------------------------------------------------------------------ ///

exports.new_mentor_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/organisations/${req.params.organisationId}/mentors`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/mentors/new/check`
  }

  res.render('../views/mentors/find', {
    organisation,
    mentor: req.session.data.mentor,
    actions: {
      save: `/organisations/${req.params.organisationId}/mentors/new`,
      back,
      cancel: `/organisations/${req.params.organisationId}/mentors`
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

  req.session.data.mentor.dateOfBirth = arrayHelper.removeEmpty(req.session.data.mentor.dob)

  if (req.session.data.mentor.dateOfBirth) {
    req.session.data.mentor.dateOfBirth = dateHelper.arrayToDateObject(req.session.data.mentor.dob)
  }

  if (!req.session.data.mentor.trn.length) {
    const error = {}
    error.fieldName = 'trn'
    error.href = '#trn'
    error.text = 'Enter a teacher reference number (TRN)'
    errors.push(error)
  } else if (!validationHelper.isValidTRN(req.session.data.mentor.trn)) {
    const error = {}
    error.fieldName = 'trn'
    error.href = '#trn'
    error.text = 'Enter a valid teacher reference number (TRN)'
    errors.push(error)
  } else if (mentor) {
    const error = {}
    error.fieldName = 'trn'
    error.href = '#trn'
    error.text = 'The mentor has already been added'
    errors.push(error)
  }

  if (req.session.data.mentor.dateOfBirth === undefined) {
    const error = {}
    error.fieldName = 'dob'
    error.href = '#dob'
    error.text = 'Enter a date of birth'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/mentors/find', {
      organisation,
      mentor: req.session.data.mentor,
      actions: {
        save: `/organisations/${req.params.organisationId}/mentors/new`,
        back: `/organisations/${req.params.organisationId}/mentors`,
        cancel: `/organisations/${req.params.organisationId}/mentors`
      },
      errors
    })
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/mentors/new/check`)
  }
}

exports.new_mentor_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const mentor = teacherModel.findOne({
    trn: req.session.data.mentor.trn,
    dob: req.session.data.mentor.dateOfBirth
  })

  res.render('../views/mentors/check-your-answers', {
    organisation,
    mentor,
    actions: {
      save: `/organisations/${req.params.organisationId}/mentors/new/check`,
      back: `/organisations/${req.params.organisationId}/mentors/new`,
      change: `/organisations/${req.params.organisationId}/mentors/new?referrer=check`,
      cancel: `/organisations/${req.params.organisationId}/mentors`
    }
  })
}

exports.new_mentor_check_post = (req, res) => {
  const mentor = teacherModel.findOne({
    trn: req.session.data.mentor.trn,
    dob: req.session.data.mentor.dateOfBirth
  })

  mentorModel.saveOne({
    organisationId: req.params.organisationId,
    mentor
  })

  delete req.session.data.mentor

  req.flash('success', 'Mentor added')
  res.redirect(`/organisations/${req.params.organisationId}/mentors`)
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

  const claims = claimModel
    .findMany({ organisationId: req.params.organisationId })
    .filter(claim => {
      if (claim.mentors) {
        return claim.mentors.find(
          claimMentor => parseInt(claimMentor.trn) === parseInt(mentor.trn)
        )
      }
    })

  const hasClaims = !!claims.length

  res.render('../views/mentors/delete', {
    organisation,
    mentor,
    hasClaims,
    actions: {
      save: `/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}/delete`,
      back: `/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}`,
      cancel: `/organisations/${req.params.organisationId}/mentors/${req.params.mentorId}`
    }
  })
}

exports.delete_mentor_post = (req, res) => {
  mentorModel.deleteOne({
    organisationId: req.params.organisationId,
    mentorId: req.params.mentorId
  })

  req.flash('success', 'Mentor removed')
  res.redirect(`/organisations/${req.params.organisationId}/mentors`)
}
