
const claimModel = require('../../models/claims')
const paymentModel = require('../../models/payments')

exports.list_claims_get = (req, res) => {
  res.render('../views/support/claims/payments/index', {
    actions: {
      export: `/support/claims/payments/export`,
      response: `/support/claims/payments/response`,
      view: `/support/claims/payments`
    }
  })
}

exports.export_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'submitted')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/payments/export', {
    hasClaims,
    actions: {
      save: `/support/claims/payments/export`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.export_claims_post = (req, res) => {
  const errors = []

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'submitted')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/payments/export', {
      hasClaims,
      actions: {
        save: `/support/claims/payments/export`,
        back: `/support/claims/payments`,
        cancel: `/support/claims/payments`
      },
      errors
    })
  } else {
    // get all submitted claims
    const payments = paymentModel.findMany({
      status: 'submitted'
    })

    // create a CSV file
    paymentModel.writeFile({
      payments
    })

    // update claim status to 'pending_payment'
    paymentModel.updateMany({
      userId: req.session.passport.user.id,
      currentStatus: 'submitted',
      newStatus: 'payment_pending'
    })

    req.flash('success', 'Claims sent to ESFA')
    res.redirect('/support/claims/payments')
  }
}

exports.claims_response_get = (req, res) => {
  res.render('../views/support/claims/payments/response', {
    actions: {
      save: `/support/claims/payments/response`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.claims_response_post = (req, res) => {
  const errors = []

  if (errors.length) {

    res.render('../views/support/claims/payments/response', {
      actions: {
        save: `/support/claims/payments/response`,
        back: `/support/claims/payments`,
        cancel: `/support/claims/payments`
      },
      errors
    })
  } else {
    req.flash('success', 'ESFA reponse uploaded')
    res.redirect('/support/claims/payments')
  }
}

exports.export_claims_details_get = (req, res) => {
  res.render('../views/support/claims/payments/show', {
    actions: {
      back: `/support/claims/payments`
    }
  })
}
