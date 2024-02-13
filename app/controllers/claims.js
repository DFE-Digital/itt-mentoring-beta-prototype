const claimModel = require('../models/claims')
const mentorHelper = require('../helpers/mentors')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIM
/// ------------------------------------------------------------------------ ///

exports.claim_list = (req, res) => {
  const claims = claimModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.claim
  delete req.session.data.mentor
  delete req.session.data.mentorChoices
  delete req.session.data.position

  res.render('../views/claims/list', {
    claims,
    actions: {
      new: `/organisations/${req.params.organisationId}/claims/new`,
      view: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW CLAIM
/// ------------------------------------------------------------------------ ///


/// ------------------------------------------------------------------------ ///
/// NEW CLAIM
/// ------------------------------------------------------------------------ ///

exports.new_claim_get = (req, res) => {
  res.render('../views/claims/provider', {
    claim: req.session.data.claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new`,
      back: `/organisations/${req.params.organisationId}/claims`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_post = (req, res) => {
  const errors = []

  if (!req.session.data.claim?.provider) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Select a provider'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/claims/provider', {
      claim: req.session.data.claim,
      actions: {
        save: `/organisations/${req.params.organisationId}/claims/new`,
        back: `/organisations/${req.params.organisationId}/claims`,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/claims/new/mentors`)
  }
}

exports.new_claim_mentors_get = (req, res) => {
  const mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  res.render('../views/claims/mentors', {
    mentorOptions,
    mentorChoices: req.session.data.mentorChoices,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/mentors`,
      back: `/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_mentors_post = (req, res) => {
  const mentorOptions = mentorHelper.getMentorOptions({ organisationId: req.params.organisationId })

  const errors = []

  // if (!req.session.data.claim.mentorChoices.length) {
  //   const error = {}
  //   error.fieldName = 'mentorChoices'
  //   error.href = '#mentorChoices'
  //   error.text = 'Select a mentor'
  //   errors.push(error)
  // }

  if (errors.length) {
    res.render('../views/claims/mentors', {
      mentorOptions,
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
  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  res.render('../views/claims/hours', {
    mentorTrn,
    position,
    mentor: req.session.data.mentor,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/hours`,
      back: `/organisations/${req.params.organisationId}/claims/new/mentors`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_hours_post = (req, res) => {
  const position = req.session.data.position
  const mentorTrn = req.session.data.mentorChoices[position]

  const errors = []

  // if (!req.session.data.claim.mentors[position].hours) {
  //   const error = {}
  //   error.fieldName = 'hours'
  //   error.href = '#hours'
  //   error.text = 'Select the number of hours'
  //   errors.push(error)
  // }

  if (errors.length) {
    res.render('../views/claims/hours', {
      mentorTrn,
      position,
      mentor: req.session.data.mentor,
      actions: {
        save: `/organisations/${req.params.organisationId}/claims/new/hours`,
        back: `/organisations/${req.params.organisationId}/claims/new/mentors`,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    // put the submitted the mentor information into the mentors array in the claim
    req.session.data.claim.mentors.push(req.session.data.mentor)

    // if we've iterated through all the mentors, go to the check page
    if (req.session.data.position === (req.session.data.mentorChoices.length - 1)) {
      // delete the position info as no longer needed
      delete req.session.data.position

      // delete the mentor object as no longer needed
      delete req.session.data.mentor

      res.redirect(`/organisations/${req.params.organisationId}/claims/new/check`)
    } else {
      // increment the position to track where we are in the flow
      req.session.data.position += 1

      // redirct the user back to the hours page to add info for the next mentor
      res.redirect(`/organisations/${req.params.organisationId}/claims/new/hours`)
    }

  }
}

exports.new_claim_check_get = (req, res) => {

  res.render('../views/claims/check-your-answers', {
    claim: req.session.data.claim,
    mentorChoices: req.session.data.mentorChoices,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/check`,
      back: `/organisations/${req.params.organisationId}/claims/new/hours`,
      change: `/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_check_post = (req, res) => {
  claimModel.insertOne({
    organisationId: req.params.organisationId,
    claim: req.session.data.claim
  })

  delete req.session.data.claim

  req.flash('success', 'Claim added')
  res.redirect(`/organisations/${req.params.organisationId}/claims`)
}
