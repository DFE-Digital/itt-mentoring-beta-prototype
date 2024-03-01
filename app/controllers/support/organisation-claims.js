const claimModel = require('../../models/claims')
const mentorModel = require('../../models/mentors')
const organisationModel = require('../../models/organisations')
const claimHelper = require('../../helpers/claims')
const mentorHelper = require('../../helpers/mentors')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIM
/// ------------------------------------------------------------------------ ///

exports.claim_list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const claims = claimModel.findMany({ organisationId: req.params.organisationId })
  const mentors = mentorModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.claim
  delete req.session.data.mentor
  delete req.session.data.mentorChoices
  delete req.session.data.position

  res.render('../views/support/organisations/claims/list', {
    organisation,
    claims,
    mentors,
    actions: {
      new: `/support/organisations/${req.params.organisationId}/claims/new`,
      view: `/support/organisations/${req.params.organisationId}/claims`,
      mentors: `/support/organisations/${req.params.organisationId}/mentors`
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

  res.render('../views/support/organisations/claims/show', {
    organisation,
    claim,
    actions: {
      change: '#',
      delete: `/support/organisations/${req.params.organisationId}/claims/${req.params.claimsId}/delete`,
      back: `/support/organisations/${req.params.organisationId}/claims`,
      cancel: `/support/organisations/${req.params.organisationId}/claims`,
      submit: '#'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW CLAIM
/// ------------------------------------------------------------------------ ///

exports.new_claim_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/support/organisations/${req.params.organisationId}/claims`
  let save = `/support/organisations/${req.params.organisationId}/claims/new`
  if (req.query.referrer === 'check') {
    back = `/support/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}`
  }

  res.render('../views/support/organisations/claims/provider', {
    organisation,
    claim: req.session.data.claim,
    actions: {
      save,
      back,
      cancel: `/support/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/support/organisations/${req.params.organisationId}/claims`
  let save = `/support/organisations/${req.params.organisationId}/claims/new`
  if (req.query.referrer === 'check') {
    back = `/support/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}`
  }

  const errors = []

  if (!req.session.data.claim?.provider) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Select a provider'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/claims/provider', {
      organisation,
      claim: req.session.data.claim,
      actions: {
        save,
        back,
        cancel: `/support/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    if (req.query.referrer === 'check') {
      res.redirect(`/support/organisations/${req.params.organisationId}/claims/new/check`)
    } else {
      res.redirect(`/support/organisations/${req.params.organisationId}/claims/new/mentors`)
    }
  }
}

exports.new_claim_mentors_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  res.render('../views/support/organisations/claims/mentors', {
    organisation,
    claim: req.session.data.claim,
    mentorOptions,
    mentorChoices: req.session.data.mentorChoices,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/claims/new/mentors`,
      back: `/support/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/support/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_mentors_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  const errors = []

  if (!req.session.data.mentorChoices.length) {
    const error = {}
    error.fieldName = 'mentorChoices'
    error.href = '#mentorChoices'
    error.text = 'Select a mentor'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/claims/mentors', {
      organisation,
      claim: req.session.data.claim,
      mentorOptions,
      mentorChoices: req.session.data.mentorChoices,
      actions: {
        save: `/support/organisations/${req.params.organisationId}/claims/new/mentors`,
        back: `/support/organisations/${req.params.organisationId}/claims/new`,
        cancel: `/support/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    // instantiate the mentors array for use later
    req.session.data.claim.mentors = []

    // set the position counter so we can iterate through the mentors and keep track
    req.session.data.position = 0

    res.redirect(`/support/organisations/${req.params.organisationId}/claims/new/hours`)
  }
}

exports.new_claim_hours_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/support/organisations/${req.params.organisationId}/claims/new/mentors`
  let save = `/support/organisations/${req.params.organisationId}/claims/new/hours`
  if (req.query.referrer === 'check') {
    back = `/support/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}&position=${req.query.position}`
  }

  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  let mentor = req.session.data.mentor
  if (req.query.referrer === 'check') {
    mentor = req.session.data.claim.mentors[position]
  }

  res.render('../views/support/organisations/claims/hours', {
    organisation,
    claim: req.session.data.claim,
    mentorTrn,
    position,
    mentor,
    actions: {
      save,
      back,
      cancel: `/support/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_hours_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/support/organisations/${req.params.organisationId}/claims/new/mentors`
  let save = `/support/organisations/${req.params.organisationId}/claims/new/hours`
  if (req.query.referrer === 'check') {
    back = `/support/organisations/${req.params.organisationId}/claims/new/check`
    save += `?referrer=${req.query.referrer}&position=${req.query.position}`
  }

  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  let mentor = req.session.data.mentor
  if (req.query.referrer === 'check') {
    mentor = req.session.data.claim.mentors[position]
  }

  const errors = []

  if (!req.session.data.mentor.hours) {
    const error = {}
    error.fieldName = 'hours'
    error.href = '#hours'
    error.text = 'Select the number of hours'
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
      || req.session.data.mentor.otherHours > 20
    ) {
      const error = {}
      error.fieldName = 'otherHours'
      error.href = '#otherHours'
      error.text = 'Enter the number of hours between 1 and 20'
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
    res.render('../views/support/organisations/claims/hours', {
      organisation,
      claim: req.session.data.claim,
      mentorTrn,
      position,
      mentor,
      actions: {
        save,
        back,
        cancel: `/support/organisations/${req.params.organisationId}/claims`
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

        res.redirect(`/support/organisations/${req.params.organisationId}/claims/new/check`)
      } else {
        // increment the position to track where we are in the flow
        req.session.data.position += 1

        // redirct the user back to the hours page to add info for the next mentor
        res.redirect(`/support/organisations/${req.params.organisationId}/claims/new/hours`)
      }
    // }
  }
}

exports.new_claim_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const position = req.session.data.claim.mentors.length - 1

  res.render('../views/support/organisations/claims/check-your-answers', {
    organisation,
    claim: req.session.data.claim,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/claims/new/check`,
      back: `/support/organisations/${req.params.organisationId}/claims/new/hours?position=${position}`,
      change: `/support/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/support/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_check_post = (req, res) => {
  // TODO move into claimModel.insertOne function?
  req.session.data.claim.reference = claimHelper.generateClaimID()

  req.session.data.claim.status = 'draft'

  claimModel.insertOne({
    organisationId: req.params.organisationId,
    claim: req.session.data.claim
  })

  delete req.session.data.claim

  req.flash('success', 'Claim added')
  res.redirect(`/support/organisations/${req.params.organisationId}/claims`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE CLAIM
/// ------------------------------------------------------------------------ ///

exports.delete_claim_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const claim = claimModel.findOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  res.render('../views/support/organisations/claims/delete', {
    organisation,
    claim,
    actions: {
      save: `/support/organisations/${req.params.organisationId}/claims/${req.params.claimId}/delete`,
      back: `/support/organisations/${req.params.organisationId}/claims/${req.params.claimId}`,
      cancel: `/support/organisations/${req.params.organisationId}/claims/${req.params.claimId}`
    }
  })
}

exports.delete_claim_post = (req, res) => {
  claimModel.deleteOne({
    organisationId: req.params.organisationId,
    claimId: req.params.claimId
  })

  req.flash('success', 'Claim deleted')
  res.redirect(`/support/organisations/${req.params.organisationId}/claims`)
}
