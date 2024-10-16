const fs = require('fs')
const csv = require('csv-string')

const claimModel = require('../../models/claims')
const paymentModel = require('../../models/payments')
const activityLogModel = require('../../models/activity')

const Pagination = require('../../helpers/pagination')
const claimHelper = require('../../helpers/claims')
const filterHelper = require('../../helpers/filters')
const paymentHelper = require('../../helpers/payments')
const providerHelper = require('../../helpers/providers')
const schoolHelper = require('../../helpers/schools')
const statusHelper = require('../../helpers/statuses')

const claimDecorator = require('../../decorators/claims')
const paymentDecorator = require('../../decorators/payments')

const settings = require('../../data/dist/settings')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIMS
/// ------------------------------------------------------------------------ ///

exports.list_claims_get = (req, res) => {
  // delete the filter and search data if the referrer is
  // the all claims,sampling or clawbacks lists since they have
  // similar functionality
  const regex = /\/support\/claims(\/(sampling|clawbacks)|(?=\?|$))/
  if (regex.test(req.headers.referer)) {
    delete req.session.data.filters
    delete req.session.data.keywords
  }

  // Search
  const keywords = req.session.data.keywords
  const hasSearch = !!((keywords))

  // Filters
  const status = null
  const school = null
  const provider = null

  let statuses
  if (req.session.data.filters?.status) {
    statuses = filterHelper.getCheckboxValues(status, req.session.data.filters.status)
  }

  let schools
  if (req.session.data.filters?.school) {
    schools = filterHelper.getCheckboxValues(school, req.session.data.filters.school)
  }

  let providers
  if (req.session.data.filters?.provider) {
    providers = filterHelper.getCheckboxValues(provider, req.session.data.filters.provider)
  }

  const hasFilters = !!((statuses?.length > 0)
  || (schools?.length > 0)
    || (providers?.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (statuses?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Status' },
        items: statuses.map((status) => {
          return {
            text: claimHelper.getClaimStatusLabel(status),
            href: `/support/claims/payments/remove-status-filter/${status}`
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
  }

  const statusArray = ['payment_information_requested','payment_information_sent']

  // get filter items
  let filterStatusItems = statusHelper.getClaimStatusOptions(statuses)
  filterStatusItems = filterStatusItems.filter(status => statusArray.includes(status.value))

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

  claims = claims.filter(claim => statusArray.includes(claim.status))

  const hasClaims = !!claims.length

  if (statuses?.length) {
    claims = claims.filter(claim => {
      return statuses.includes(claim.status)
    })
  }

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
    filterStatusItems,
    filterSchoolItems,
    filterProviderItems,
    actions: {
      send: `/support/claims/payments/send`,
      response: `/support/claims/payments/response`,
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

exports.removeStatusFilter = (req, res) => {
  req.session.data.filters.status = filterHelper.removeFilter(
    req.params.status,
    req.session.data.filters.status
  )
  res.redirect('/support/claims/payments')
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

  const note = claim.notes.find(note => note.section === 'payments')

  res.render('../views/support/claims/payments/show', {
    claim,
    organisation,
    note,
    showOrganisationLink: true,
    actions: {
      informationSent: `/support/claims/payments/${req.params.claimId}/status/payment_information_sent`,
      approveClaim: `/support/claims/payments/${req.params.claimId}/status/paid`,
      rejectClaim: `/support/claims/payments/${req.params.claimId}/status/not_paid`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`,
      organisations: `/support/organisations`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// UPDATE CLAIM STATUS
/// ------------------------------------------------------------------------ ///

exports.update_claim_status_get = (req, res) => {
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  res.render('../views/support/claims/payments/confirm', {
    claim,
    organisation,
    status: req.params.claimStatus,
    actions: {
      save: `/support/claims/payments/${req.params.claimId}/status/${req.params.claimStatus}`,
      back: `/support/claims/payments/${req.params.claimId}`,
      cancel: `/support/claims/payments/${req.params.claimId}`
    }
  })
}

exports.update_claim_status_post = (req, res) => {
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

  req.flash('success', 'Claim updated')

  if (req.params.claimStatus === 'payment_information_sent') {
    res.redirect(`/support/claims/payments/${req.params.claimId}`)
  } else {
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

  const claimsCount = claims.length

  res.render('../views/support/claims/payments/send', {
    hasClaims,
    claimsCount,
    actions: {
      save: `/support/claims/payments/send`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.send_claims_post = (req, res) => {;
  const errors = []

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'submitted')

    const hasClaims = !!claims.length

    const claimsCount = claims.length

    res.render('../views/support/claims/payments/send', {
      hasClaims,
      claimsCount,
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

    // update claim status to 'payment_in_progress'
    paymentModel.updateMany({
      userId: req.session.passport.user.id,
      currentStatus: 'submitted',
      newStatus: 'payment_in_progress'
    })

    // log the process
    activityLogModel.insertOne({
      title: 'Claims sent to ESFA for payment',
      userId: req.session.passport.user.id,
      documents: [{
        title: 'Claims sent to ESFA',
        filename: 'payments.csv',
        href: '#'
      }]
    })

    req.flash('success', 'Claims sent to ESFA')
    res.redirect('/support/claims/payments')
  }
}

/// ------------------------------------------------------------------------ ///
/// IMPORT CLAIM PAYMENT RESPONSE
/// ------------------------------------------------------------------------ ///

exports.response_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => ['payment_in_progress','payment_information_sent'].includes(claim.status))

  const hasClaims = !!claims.length

  res.render('../views/support/claims/payments/response', {
    hasClaims,
    actions: {
      save: `/support/claims/payments/response`,
      back: `/support/claims/payments`,
      cancel: `/support/claims/payments`
    }
  })
}

exports.response_claims_post = (req, res) => {
  const errors = []

  if (!req.file) {
    const error = {}
    error.fieldName = 'response'
    error.href = '#response'
    error.text = 'Select a CSV file to upload'
    errors.push(error)
  } else {
    if (req.file.mimetype !== 'text/csv') {
      const error = {}
      error.fieldName = 'response'
      error.href = '#response'
      error.text = 'The selected file must be a CSV'
      errors.push(error)
      // delete the incorrect file
      fs.unlinkSync(req.file.path)
    } else if (!req.file.size) {
      const error = {}
      error.fieldName = 'response'
      error.href = '#response'
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
      .filter(claim => ['payment_in_progress','payment_information_sent'].includes(claim.status))

    const hasClaims = !!claims.length

    res.render('../views/support/claims/payments/response', {
      hasClaims,
      actions: {
        save: `/support/claims/payments/response`,
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

    res.redirect('/support/claims/payments/response/review')
  }
}

exports.review_claims_get = (req, res) => {
  let payments = req.session.data.payments

  const claimsCount = payments.length

  const pagination = new Pagination(payments, req.query.page, settings.pageSize)
  payments = pagination.getData()

  res.render('../views/support/claims/payments/review', {
    payments,
    claimsCount,
    pagination,
    actions: {
      save: `/support/claims/payments/response/review`,
      back: `/support/claims/payments/response`,
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
        status: payment.claim_status,
        note: {
          text: payment.claim_unpaid_reason,
          userId: req.session.passport.user.id,
          section: 'payments',
          category: payment.claim_status
        }
      }
    })
  })

  // log the process
  activityLogModel.insertOne({
    title: 'ESFA payment response uploaded',
    userId: req.session.passport.user.id,
    documents: [{
      title: 'ESFA payment response',
      filename: 'payment-response.csv',
      href: '#'
    }]
  })

  req.flash('success', 'ESFA response uploaded')
  res.redirect('/support/claims/payments')
}

/// ------------------------------------------------------------------------ ///
/// DOWNLOAD CLAIMS LIST - FOR ESFA
/// ------------------------------------------------------------------------ ///

exports.download_claims_get = (req, res) => {
  const hasError = req.query.error
  res.render('../views/support/claims/payments/download', {
    hasError,
    actions: {
      download: `/support/claims/payments/download`
    }
  })
}

exports.download_claims_post = (req, res) => {

  req.flash('success', 'Claims downloaded')
  res.redirect(`/support/claims/payments/download`)
}
