const fs = require('fs')
const csv = require('csv-string')

const claimModel = require('../../models/claims')
const paymentModel = require('../../models/payments')

const Pagination = require('../../helpers/pagination')
const paymentHelper = require('../../helpers/payments')
const filterHelper = require('../../helpers/filters')
const providerHelper = require('../../helpers/providers')
const schoolHelper = require('../../helpers/schools')

const claimDecorator = require('../../decorators/claims')
const paymentDecorator = require('../../decorators/payments')

const settings = require('../../data/dist/settings')

exports.list_claims_get = (req, res) => {
  // Search
  const keywords = req.session.data.keywords
  const hasSearch = !!((keywords))

  // Filters
  const school = null
  const provider = null

  let schools
  if (req.session.data.filters?.school) {
    schools = filterHelper.getCheckboxValues(school, req.session.data.filters.school)
  }

  let providers
  if (req.session.data.filters?.provider) {
    providers = filterHelper.getCheckboxValues(provider, req.session.data.filters.provider)
  }

  const hasFilters = !!((schools?.length > 0)
    || (providers?.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (schools?.length) {
      selectedFilters.categories.push({
        heading: { text: 'School' },
        items: schools.map((school) => {
          return {
            text: schoolHelper.getSchoolName(school),
            href: `/support/claims/payments/remove-school-filter/${school}`
          }
        })
      })
    }

    if (providers?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Accredited provider' },
        items: providers.map((provider) => {
          return {
            text: providerHelper.getProviderName(provider),
            href: `/support/claims/payments/remove-provider-filter/${provider}`
          }
        })
      })
    }
  }

  // get filter items
  const filterSchoolItems = schoolHelper.getSchoolOptions(schools)
  const filterProviderItems = providerHelper.getProviderOptions(providers)

  // Get list of all claims
  let claims = claimModel.findMany({})

  // add details of school to each claim
  if (claims.length) {
    claims = claims.map(claim => {
      return claim = claimDecorator.decorate(claim)
    })
  }

  claims = claims.filter(claim => ['information_needed','information_sent'].includes(claim.status))

  const hasClaims = !!claims.length

  if (schools?.length) {
    claims = claims.filter(claim => {
      return schools.includes(claim.organisationId)
    })
  }

  if (providers?.length) {
    claims = claims.filter(claim => {
      return providers.includes(claim.providerId)
    })
  }

  if (keywords?.length) {
    claims = claims.filter(claim => claim.reference.toLowerCase().includes(keywords.toLowerCase()))
  }

  const pagination = new Pagination(claims, req.query.page, settings.pageSize)
  claims = pagination.getData()

  res.render('../views/support/claims/payments/index', {
    claims,
    pagination,
    selectedFilters,
    hasFilters,
    hasSearch,
    hasClaims,
    keywords,
    filterSchoolItems,
    filterProviderItems,
    actions: {
      export: `/support/claims/payments/send`,
      response: `/support/claims/payments/receive`,
      view: `/support/claims/payments`,
      filters: {
        apply: '/support/claims/payments',
        remove: '/support/claims/payments/remove-all-filters'
      },
      search: {
        find: '/support/claims/payments',
        remove: '/support/claims/payments/remove-keyword-search'
      }
    }
  })
}

exports.removeSchoolFilter = (req, res) => {
  req.session.data.filters.school = filterHelper.removeFilter(
    req.params.school,
    req.session.data.filters.school
  )
  res.redirect('/support/claims/payments')
}

exports.removeProviderFilter = (req, res) => {
  req.session.data.filters.provider = filterHelper.removeFilter(
    req.params.provider,
    req.session.data.filters.provider
  )
  res.redirect('/support/claims/payments')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/support/claims/payments')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/support/claims/payments')
}

/// ------------------------------------------------------------------------ ///
/// SHOW CLAIM
/// ------------------------------------------------------------------------ ///

exports.show_claim_get = (req, res) => {
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  res.render('../views/support/claims/payments/show', {
    claim,
    organisation,
    actions: {
      informationSent: `/support/claims/payments/${req.params.claimId}/status/information_sent`,
      paymentNotApproved: `/support/claims/payments/${req.params.claimId}/status/not_paid`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// UPDATE CLAIM STATUS
/// ------------------------------------------------------------------------ ///

exports.update_claim_status_get = (req, res) => {
  const claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claimModel.updateOne({
    organisationId: claim.organisationId,
    claimId: claim.id,
    claim: {
      status: req.params.claimStatus
    }
  })

  if (req.params.claimStatus === 'information_sent') {
    req.flash('success', 'Claim marked as information sent')
    res.redirect(`/support/claims/payments/${req.params.claimId}`)
  } else {
    req.flash('success', 'Claim marked as payment not approved')
    res.redirect(`/support/claims/payments`)
  }
}

/// ------------------------------------------------------------------------ ///
/// SEND CLAIMS FOR PAYMENT
/// ------------------------------------------------------------------------ ///

exports.send_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'submitted')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/payments/send', {
    hasClaims,
    actions: {
      save: `/support/claims/payments/send`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.send_claims_post = (req, res) => {
  console.log(req.file);

  const errors = []

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'submitted')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/payments/send', {
      hasClaims,
      actions: {
        save: `/support/claims/payments/send`,
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

exports.send_claims_confirmation_get = (req, res) => {
  res.render('../views/support/claims/payments/confirmation', {
    actions: {
      claims: '/support/claims'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// IMPORT CLAIM PAYMENT RESPONSE
/// ------------------------------------------------------------------------ ///

exports.receive_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'payment_pending')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/payments/receive', {
    hasClaims,
    actions: {
      save: `/support/claims/payments/receive`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.receive_claims_post = (req, res) => {
  const errors = []

  // console.log(req.file)

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

  // other errors:
  // the selected file has the incorrect number of fields
  // the selected file contains incorrect headers
  //
  // if the file contains an error in a line of data, we reject the entire file

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'payment_pending')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/payments/receive', {
      hasClaims,
      actions: {
        save: `/support/claims/payments/receive`,
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
    payments = paymentHelper.parseData(payments)

    // decorate payment data with claim ID
    payments = payments.map(payment => {
      return payment = paymentDecorator.decorate(payment)
    })

    req.session.data.payments = payments

    // delete the file now it's not needed
    fs.unlinkSync(req.file.path)

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
      back: `/support/claims/payments/receive`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.review_claims_post = (req, res) => {
  const payments = req.session.data.payments

  payments.forEach(payment => {
    claimModel.updateOne({
      organisationId: payment.organisationId,
      claimId: payment.claimId,
      userId: req.session.passport.user.id,
      claim: {
        status: payment.claim_status
      }
    })
  })

  req.flash('success', 'ESFA reponse uploaded')
  res.redirect('/support/claims/payments')
}

exports.send_claims_details_get = (req, res) => {
  res.render('../views/support/claims/payments/show', {
    actions: {
      back: `/support/claims/payments`
    }
  })
}
