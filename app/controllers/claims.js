const claimModel = require('../models/claims')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIM
/// ------------------------------------------------------------------------ ///

exports.claim_list = (req, res) => {
  const claims = claimModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.claim

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

  res.render('../views/claims/mentors', {
    claim: req.session.data.claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/mentors`,
      back: `/organisations/${req.params.organisationId}/claims/new`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_mentors_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render('../views/claims/mentors', {
      claim: req.session.data.claim,
      actions: {
        save: `/organisations/${req.params.organisationId}/claims/new/mentors`,
        back: `/organisations/${req.params.organisationId}/claims/new`,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/claims/new/hours`)
  }
}

exports.new_claim_hours_get = (req, res) => {

  res.render('../views/claims/hours', {
    claim: req.session.data.claim,
    actions: {
      save: `/organisations/${req.params.organisationId}/claims/new/hours`,
      back: `/organisations/${req.params.organisationId}/claims/new/mentors`,
      cancel: `/organisations/${req.params.organisationId}/claims`
    }
  })
}

exports.new_claim_hours_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render('../views/claims/hours', {
      claim: req.session.data.claim,
      actions: {
        save: `/organisations/${req.params.organisationId}/claims/new/hours`,
        back: `/organisations/${req.params.organisationId}/claims/new/mentors`,
        cancel: `/organisations/${req.params.organisationId}/claims`
      },
      errors
    })
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/claims/new/check`)
  }
}


exports.new_claim_check_get = (req, res) => {

  res.render('../views/claims/check-your-answers', {
    claim: req.session.data.claim,
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
