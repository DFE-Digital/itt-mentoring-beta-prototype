const claimModel = require('../models/claims')
const mentorModel = require('../models/mentors')
const organisationModel = require('../models/organisations')
const providerModel = require('../models/providers')

const Pagination = require('../helpers/pagination')
const claimHelper = require('../helpers/claims')
const fundingHelper = require('../helpers/funding')
const mentorHelper = require('../helpers/mentors')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIM
/// ------------------------------------------------------------------------ ///

exports.claim_list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let claims = claimModel.findMany({ organisationId: req.params.organisationId })
  const mentors = mentorModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.claim
  delete req.session.data.mentor
  delete req.session.data.mentorChoices
  delete req.session.data.position

  claims.sort((a, b) => {
    return new Date(b.submittedAt) - new Date(a.submittedAt)
      || new Date(b.updatedAt) - new Date(a.updatedAt)
      || new Date(b.createdAt) - new Date(a.createdAt)
  })

  // TODO: get pageSize from settings
  let pageSize = 25
  let pagination = new Pagination(claims, req.query.page, pageSize)
  claims = pagination.getData()

  res.render('../views/claims/list', {
    organisation,
    claims,
    mentors,
    pagination,
    actions: {
      new: `/organisations/${req.params.organisationId}/claims/new`,
      view: `/organisations/${req.params.organisationId}/claims`,
      mentors: `/organisations/${req.params.organisationId}/mentors`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW CLAIM
/// ------------------------------------------------------------------------ ///

exports.claim_details = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const claim = claimModel.findOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  claim.totalHours = claimHelper.calculateClaimTotalHours(
    claim.mentors
  )

  res.render('../views/claims/show', {
    organisation,
    claim,
    actions: {
      change: '#',
      delete: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}/delete`,
      back: `/organisations/${req.params.organisationId}/claims`,
      cancel: `/organisations/${req.params.organisationId}/claims`,
      submit: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}/check`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW CLAIM
/// ------------------------------------------------------------------------ ///

exports.new_claim_get = (req, res) => {
  let back = `/organisations/${req.params.organisationId}/claims`
  let save = `/organisations/${req.params.organisationId}/claims/new`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}`
  }

  if (!req.session.data.claim) {
    req.session.data.claim = {}
  }

  res.render('../views/claims/provider', {
    claim: req.session.data.claim,
    actions: {
      save,
      back,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_post = (req, res) => {
  let back = `/organisations/${req.params.organisationId}/claims`
  let save = `/organisations/${req.params.organisationId}/claims/new`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}`
  }

  const errors = []

  if (!req.session.data.provider.name.length) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Enter an accredited provider name, UKPRN, URN or postcode'
    errors.push(error)

    res.render('../views/claims/provider', {
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    const provider = providerModel.findOne({ query: req.session.data.provider.name })

    req.session.data.claim.providerId = provider.id

    if (req.query.referrer === 'check') {
      res.redirect(`/organisations/${req.params.organisationId}/claims/new/check`)
    } else {
      res.redirect(`/organisations/${req.params.organisationId}/claims/new/mentors`)
    }
  }
}

exports.new_claim_mentors_get = (req, res) => {
  const mentorsCount = mentorModel.findMany({ organisationId: req.params.organisationId }).length
  let mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  mentorOptions = mentorOptions.filter(mentor => {
    const mentorHours = claimHelper.getProviderMentorTotalHours({
      providerId: req.session.data.claim.providerId,
      trn: mentor.value
    })

    if (mentorHours < 20) {
      return mentor
    }
  })

  const mentorOptionsCount = mentorOptions.length

  res.render('../views/claims/mentors', {
    claim: req.session.data.claim,
    mentorsCount,
    mentorOptions,
    mentorOptionsCount,
    mentorChoices: req.session.data.mentorChoices,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/mentors`,
      back: `/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_mentors_post = (req, res) => {
  const mentorsCount = mentorModel.findMany({ organisationId: req.params.organisationId }).length
  let mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  mentorOptions = mentorOptions.filter(mentor => {
    const mentorHours = claimHelper.getProviderMentorTotalHours({
      providerId: req.session.data.claim.providerId,
      trn: mentor.value
    })

    if (mentorHours < 20) {
      return mentor
    }
  })

  const mentorOptionsCount = mentorOptions.length

  const errors = []

  if (!req.session.data.mentorChoices.length) {
    const error = {}
    error.fieldName = 'mentorChoices'
    error.href = '#mentorChoices'
    error.text = 'Select a mentor'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/claims/mentors', {
      claim: req.session.data.claim,
      mentorsCount,
      mentorOptions,
      mentorOptionsCount,
      mentorChoices: req.session.data.mentorChoices,
      actions: {
        save: `/organisations/${req.params.organisationId}/claims/new/mentors`,
        back: `/organisations/${req.params.organisationId}/claims/new`,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    // instantiate the mentors array for use later
    req.session.data.claim.mentors = []

    // set the position counter so we can iterate through the mentors and keep track
    req.session.data.position = 0

    res.redirect(`/organisations/${req.params.organisationId}/claims/new/hours`)
  }
}

exports.new_claim_hours_get = (req, res) => {
  let back = `/organisations/${req.params.organisationId}/claims/new/mentors`
  let save = `/organisations/${req.params.organisationId}/claims/new/hours`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}&position=${req.query.position}`
  }

  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  const mentorHours = claimHelper.getProviderMentorTotalHours({
    providerId: req.session.data.claim.providerId,
    trn: mentorTrn
  })

  const mentorRemainingHours = 20 - mentorHours

  let mentor = req.session.data.mentor
  if (req.query.referrer === 'check') {
    mentor = req.session.data.claim.mentors[position]
  }

  res.render('../views/claims/hours', {
    claim: req.session.data.claim,
    mentorTrn,
    position,
    mentor,
    mentorRemainingHours,
    actions: {
      save,
      back,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_hours_post = (req, res) => {
  let back = `/organisations/${req.params.organisationId}/claims/new/mentors`
  let save = `/organisations/${req.params.organisationId}/claims/new/hours`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}&position=${req.query.position}`
  }

  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  const mentorHours = claimHelper.getProviderMentorTotalHours({
    providerId: req.session.data.claim.providerId,
    trn: mentorTrn
  })

  const mentorRemainingHours = 20 - mentorHours

  let mentor = req.session.data.mentor
  if (req.query.referrer === 'check') {
    mentor = req.session.data.claim.mentors[position]
  }

  const errors = []

  if (!req.session.data.mentor.hours) {
    const error = {}
    error.fieldName = 'hours'
    error.href = '#hours'
    error.text = 'Select the hours of training'
    errors.push(error)
  } else if (req.session.data.mentor.hours === 'other') {
    if (!req.session.data.mentor.otherHours.length) {
      const error = {}
      error.fieldName = 'otherHours'
      error.href = '#otherHours'
      error.text = 'Enter the number of hours'
      errors.push(error)
    } else if (
      isNaN(req.session.data.mentor.otherHours)
      || req.session.data.mentor.otherHours < 1
      || req.session.data.mentor.otherHours > mentorRemainingHours
    ) {
      const error = {}
      error.fieldName = 'otherHours'
      error.href = '#otherHours'
      error.text = `Enter the number of hours between 1 and ${mentorRemainingHours}`
      errors.push(error)
    }
    // else if (!Number.isInteger(req.session.data.mentor.otherHours)) {
    //   const error = {}
    //   error.fieldName = 'otherHours'
    //   error.href = '#otherHours'
    //   error.text = 'Enter whole numbers up to a maximum of 20 hours'
    //   errors.push(error)
    // }
  }

  if (errors.length) {
    res.render('../views/claims/hours', {
      claim: req.session.data.claim,
      mentorTrn,
      position,
      mentor,
      mentorRemainingHours,
      actions: {
        save,
        back,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    // if (req.query.referrer === 'check') {



    // } else {
      // put the submitted the mentor information into the mentors array in the claim
      req.session.data.claim.mentors.push(req.session.data.mentor)

      // delete the mentor object as no longer needed
      delete req.session.data.mentor

      // if we've iterated through all the mentors, go to the check page
      if (req.session.data.position === (req.session.data.mentorChoices.length - 1)) {
        // delete the position info as no longer needed
        delete req.session.data.position

        res.redirect(`/organisations/${req.params.organisationId}/claims/new/check`)
      } else {
        // increment the position to track where we are in the flow
        req.session.data.position += 1

        // redirct the user back to the hours page to add info for the next mentor
        res.redirect(`/organisations/${req.params.organisationId}/claims/new/hours`)
      }
    // }
  }
}

exports.new_claim_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const position = req.session.data.claim.mentors.length - 1

  req.session.data.claim.totalHours = claimHelper.calculateClaimTotalHours(
    req.session.data.claim.mentors
  )

  req.session.data.claim.totalAmount = claimHelper.calculateClaimTotal(
    organisation,
    req.session.data.claim.mentors
  )

  res.render('../views/claims/check-your-answers', {
    organisation,
    claim: req.session.data.claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/check`,
      back: `/organisations/${req.params.organisationId}/claims/new/hours?position=${position}`,
      change: `/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_check_post = (req, res) => {
  const errors = []

  // TODO: check claim is valid

  if (errors.length) {
    res.redirect(`/organisations/${req.params.organisationId}/claims/rejected`)
  } else {
    req.session.data.claim.reference = claimHelper.generateClaimID()
    req.session.data.claim.status = 'submitted'

    const claim = claimModel.insertOne({
      organisationId: req.params.organisationId,
      userId: req.session.passport.user.id,
      claim: req.session.data.claim
    })

    delete req.session.data.claim
    delete req.session.data.provider

    // TODO: route based on button clicked - submit vs save
    // req.flash('success', 'Claim added')

    res.redirect(`/organisations/${req.params.organisationId}/claims/${claim.id}/confirmation`)
  }
}

exports.new_claim_confirmation_get = (req, res) => {
  const claim = claimModel.findOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  res.render('../views/claims/confirmation', {
    claim,
    actions: {
      back: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_rejection_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  delete req.session.data.claim

  res.render('../views/claims/rejection', {
    organisation,
    actions: {
      back: `/organisations/${req.params.organisationId}/claims`,
      new: `/organisations/${req.params.organisationId}/claims/new`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT CLAIM
/// ------------------------------------------------------------------------ ///

exports.edit_claim_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const claim = claimModel.findOne({ claimId: req.params.claimId })

  req.session.data.claim = claim

  req.session.data.claim.totalHours = claimHelper.calculateClaimTotalHours(
    req.session.data.claim.mentors
  )

  res.render('../views/claims/declaration', {
    organisation,
    claim: req.session.data.claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}/check`,
      back: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}`,
      change: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}`,
      cancel: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}`
    }
  })
}

exports.edit_claim_check_post = (req, res) => {
  req.session.data.claim.status = 'submitted'

  claimModel.updateOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId,
    userId: req.session.passport.user.id,
    claim: req.session.data.claim
  })

  delete req.session.data.claim

  // TODO: route based on button clicked - submit vs save
  // req.flash('success', 'Claim updated')

  res.redirect(`/organisations/${req.params.organisationId}/claims/${req.params.claimId}/confirmation`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE CLAIM
/// ------------------------------------------------------------------------ ///

exports.delete_claim_get = (req, res) => {
  // const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const claim = claimModel.findOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  res.render('../views/claims/delete', {
    // organisation,
    claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}/delete`,
      back: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}`,
      cancel: `/organisations/${req.params.organisationId}/claims/${req.params.claimId}`
    }
  })
}

exports.delete_claim_post = (req, res) => {
  claimModel.deleteOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  req.flash('success', 'Claim deleted')
  res.redirect(`/organisations/${req.params.organisationId}/claims`)
}
