const fs = require('fs')
const csv = require('csv-string')

const claimModel = require('../../models/claims')
const paymentModel = require('../../models/payments')

const Pagination = require('../../helpers/pagination')
const paymentHelper = require('../../helpers/payments')

const settings = require('../../data/dist/settings')

exports.list_claims_get = (req, res) => {
  res.render('../views/support/claims/payments/index', {
    actions: {
      export: `/support/claims/payments/export`,
      response: `/support/claims/payments/import`,
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
  console.log(req.file);

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

exports.import_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'payment_pending')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/payments/import', {
    hasClaims,
    actions: {
      save: `/support/claims/payments/import`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.import_claims_post = (req, res) => {
  const errors = []

  console.log(req.file)
  console.log(req.file.mimetype)

  if (!req.file) {
    const error = {}
    error.fieldName = 'payments'
    error.href = '#payments'
    error.text = 'Select a CSV file to upload'
    errors.push(error)
  } else {
    if (req.file.mimetype !== 'text/csv') {
      const error = {}
      error.fieldName = 'payments'
      error.href = '#payments'
      error.text = 'The selected file must be a CSV'
      errors.push(error)
      // delete the incorrect file
      fs.unlinkSync(req.file.path)
    } else if (!req.file.size) {
      const error = {}
      error.fieldName = 'payments'
      error.href = '#payments'
      error.text = 'The selected file is empty'
      errors.push(error)
      // delete the incorrect file
      fs.unlinkSync(req.file.path)
    }
  }

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'payment_pending')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/payments/import', {
      hasClaims,
      actions: {
        save: `/support/claims/payments/import`,
        back: `/support/claims/payments`,
        cancel: `/support/claims/payments`
      },
      errors
    })
  } else {
    // get the CSV delimiter
    const delimiter = csv.detect(req.file.path)
    // read the raw CSV data
    const raw = fs.readFileSync(req.file.path, 'utf8')
    // parse the CSV data
    let payments = []
    csv.readAll(raw, delimiter, data => {
      payments = data
    })

    // remove header row from the payments array
    payments.shift()

    // put the data into the session for use later
    req.session.data.payments = paymentHelper.parseData(payments)

    res.redirect('/support/claims/payments/review')
  }
}

exports.review_claims_get = (req, res) => {
  let payments = req.session.data.payments

  const paymentsCount = payments.length

  const pagination = new Pagination(payments, req.query.page, settings.pageSize)
  payments = pagination.getData()

  res.render('../views/support/claims/payments/review', {
    payments,
    paymentsCount,
    pagination,
    actions: {
      save: `/support/claims/payments/review`,
      back: `/support/claims/payments/import`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.review_claims_post = (req, res) => {
  const errors = []

  if (errors.length) {

    res.render('../views/support/claims/payments/review', {
      actions: {
        save: `/support/claims/payments/review`,
        back: `/support/claims/payments/import`,
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
