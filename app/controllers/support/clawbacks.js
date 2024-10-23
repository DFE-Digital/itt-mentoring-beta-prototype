const fs = require('fs')
const csv = require('csv-string')

const claimModel = require('../../models/claims')
const clawbackModel = require('../../models/clawbacks')
const activityLogModel = require('../../models/activity')

const Pagination = require('../../helpers/pagination')
const claimHelper = require('../../helpers/claims')
const clawbackHelper = require('../../helpers/clawbacks')
const filterHelper = require('../../helpers/filters')
const fundingHelper = require('../../helpers/funding')
const providerHelper = require('../../helpers/providers')
const schoolHelper = require('../../helpers/schools')
const statusHelper = require('../../helpers/statuses')
const utilHelper = require('../../helpers/utils')

const claimDecorator = require('../../decorators/claims')
const clawbackDecorator = require('../../decorators/clawbacks')

const settings = require('../../data/dist/prototype-settings')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIMS
/// ------------------------------------------------------------------------ ///

exports.list_claims_get = (req, res) => {
  // delete the filter and search data if the referrer is
  // the all claims, payments or clawbacks lists since they have
  // similar functionality
  const regex = /\/support\/claims(\/(payments|sampling)|(?=\?|$))/
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
            href: `/support/claims/clawbacks/remove-status-filter/${status}`
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
            href: `/support/claims/clawbacks/remove-provider-filter/${provider}`
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
            href: `/support/claims/clawbacks/remove-school-filter/${school}`
          }
        })
      })
    }
  }

  const statusArray = ['clawback_requested','clawback_in_progress','sampling_not_approved']

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

  res.render('../views/support/claims/clawbacks/index', {
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
      send: `/support/claims/clawbacks/send`,
      response: `/support/claims/clawbacks/response`,
      view: `/support/claims/clawbacks`,
      filters: {
        apply: '/support/claims/clawbacks',
        remove: '/support/claims/clawbacks/remove-all-filters'
      },
      search: {
        find: '/support/claims/clawbacks',
        remove: '/support/claims/clawbacks/remove-keyword-search'
      }
    }
  })
}

exports.removeStatusFilter = (req, res) => {
  req.session.data.filters.status = filterHelper.removeFilter(
    req.params.status,
    req.session.data.filters.status
  )
  res.redirect('/support/claims/clawbacks')
}

exports.removeSchoolFilter = (req, res) => {
  req.session.data.filters.school = filterHelper.removeFilter(
    req.params.school,
    req.session.data.filters.school
  )
  res.redirect('/support/claims/clawbacks')
}

exports.removeProviderFilter = (req, res) => {
  req.session.data.filters.provider = filterHelper.removeFilter(
    req.params.provider,
    req.session.data.filters.provider
  )
  res.redirect('/support/claims/clawbacks')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/support/claims/clawbacks')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/support/claims/clawbacks')
}

/// ------------------------------------------------------------------------ ///
/// SHOW CLAIM
/// ------------------------------------------------------------------------ ///

exports.show_claim_get = (req, res) => {
  // delete the request clawback data so we have an empty form later
  delete req.session.data.clawback

  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  const note = claim.notes.find(note => note.section === 'clawbacks')

  res.render('../views/support/claims/clawbacks/show', {
    claim,
    organisation,
    note,
    showOrganisationLink: true,
    showClawbackChangeLinks: true,
    actions: {
      requestClawback: `/support/claims/clawbacks/${req.params.claimId}/request`,
      approveClaim: `/support/claims/clawbacks/${req.params.claimId}/status/paid`,
      changeClawback: `/support/claims/clawbacks/${req.params.claimId}/request`,
      completeClawback: `/support/claims/clawbacks/${req.params.claimId}/status/clawback_complete`,
      back: `/support/claims/clawbacks`,
      cancel: `/support/claims/clawbacks`,
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

  res.render('../views/support/claims/clawbacks/confirm', {
    claim,
    organisation,
    status: req.params.claimStatus,
    actions: {
      save: `/support/claims/clawbacks/${req.params.claimId}/status/${req.params.claimStatus}`,
      back: `/support/claims/clawbacks/${req.params.claimId}`,
      cancel: `/support/claims/clawbacks/${req.params.claimId}`
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

  if (req.params.claimStatus === 'in_review') {
    res.redirect(`/support/claims/clawbacks/${req.params.claimId}`)
  } else {
    res.redirect(`/support/claims/clawbacks`)
  }
}

/// ------------------------------------------------------------------------ ///
/// REQUEST CLAWBACK
/// ------------------------------------------------------------------------ ///

exports.request_clawback_get = (req, res) => {
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  let clawback
  if (!req.session.data.clawback) {
    clawback = claim.clawback
  } else {
    clawback = req.session.data.clawback
  }

  res.render('../views/support/claims/clawbacks/request', {
    claim,
    organisation,
    clawback,
    actions: {
      save: `/support/claims/clawbacks/${req.params.claimId}/request`,
      back: `/support/claims/clawbacks/${req.params.claimId}`,
      cancel: `/support/claims/clawbacks/${req.params.claimId}`
    }
  })
}

exports.request_clawback_post = (req, res) => {
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  const errors = []

  if (!req.session.data.clawback.hours.length) {
    const error = {}
    error.fieldName = 'hours'
    error.href = '#hours'
    error.text = 'Enter the number of hours to clawback'
    errors.push(error)
  } else if (req.session.data.clawback.hours > claim.totalHours) {
    const error = {}
    error.fieldName = 'hours'
    error.href = '#hours'
    error.text = `Enter the number of hours between 1 and ${claim.totalHours}`
    errors.push(error)
  }

  if (!req.session.data.clawback.reason.length) {
    const error = {}
    error.fieldName = 'reason'
    error.href = '#reason'
    error.text = 'Enter the reason for clawback'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/claims/clawbacks/request', {
      claim,
      organisation,
      clawback: req.session.data.clawback,
      actions: {
        save: `/support/claims/clawbacks/${req.params.claimId}/request`,
        back: `/support/claims/clawbacks/${req.params.claimId}`,
        cancel: `/support/claims/clawbacks/${req.params.claimId}`
      },
      errors
    })
  } else {
    res.redirect(`/support/claims/clawbacks/${req.params.claimId}/request/check`)
  }
}

exports.check_clawback_request_get = (req, res) => {
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  req.session.data.clawback.totalAmount = clawbackHelper.calculateClawbackTotal(
    organisation,
    req.session.data.clawback.hours
  )

  req.session.data.clawback.fundingRate = 0
  if (organisation.location?.districtAdministrativeCode) {
    req.session.data.clawback.fundingRate = fundingHelper.getFundingRate(organisation.location.districtAdministrativeCode)
  }

  const hasClawbackDetails = !!(claim.clawback)

  res.render('../views/support/claims/clawbacks/check-your-answers', {
    claim,
    organisation,
    hasClawbackDetails,
    clawback: req.session.data.clawback,
    actions: {
      save: `/support/claims/clawbacks/${req.params.claimId}/request/check`,
      change: `/support/claims/clawbacks/${req.params.claimId}/request`,
      back: `/support/claims/clawbacks/${req.params.claimId}/request`,
      cancel: `/support/claims/clawbacks/${req.params.claimId}`
    }
  })
}

exports.check_clawback_request_post = (req, res) => {
  const claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  const hasClawbackDetails = !!(claim.clawback)

  clawbackModel.updateOne({
    claimId: req.params.claimId,
    userId: req.session.passport.user.id,
    claim: {
      status: 'clawback_requested'
    },
    clawback: req.session.data.clawback
  })

  if (hasClawbackDetails) {
    req.flash('success', 'Clawback request updated')
  } else {
    req.flash('success', 'Clawback requested')
  }
  res.redirect(`/support/claims/clawbacks/${req.params.claimId}`)
}

/// ------------------------------------------------------------------------ ///
/// SEND CLAIMS FOR CLAWBACK
/// ------------------------------------------------------------------------ ///

exports.send_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'clawback_requested')

  const hasClaims = !!claims.length

  const claimsCount = claims.length

  res.render('../views/support/claims/clawbacks/send', {
    hasClaims,
    claimsCount,
    actions: {
      save: `/support/claims/clawbacks/send`,
      back: `/support/claims/clawbacks`,
      cancel: `/support/claims/clawbacks`
    }
  })
}

exports.send_claims_post = (req, res) => {;
  const errors = []

  if (errors.length) {
    const claims = claimModel
      .findMany({ })
      .filter(claim => claim.status === 'clawback_requested')

    const hasClaims = !!claims.length

    const claimsCount = claims.length

    res.render('../views/support/claims/clawbacks/send', {
      hasClaims,
      claimsCount,
      actions: {
        save: `/support/claims/clawbacks/send`,
        back: `/support/claims/clawbacks`,
        cancel: `/support/claims/clawbacks`
      },
      errors
    })
  } else {
    // get all submitted claims
    const clawbacks = clawbackModel.findMany({
      status: 'clawback_requested'
    })

    // create a CSV file
    const filePath = clawbackModel.writeFile({
      clawbacks
    })

    const filename = utilHelper.getFilename(filePath)

    // update claim status to 'clawback_in_progress'
    clawbackModel.updateMany({
      userId: req.session.passport.user.id,
      currentStatus: 'clawback_requested',
      newStatus: 'clawback_in_progress'
    })

    // log the process
    activityLogModel.insertOne({
      title: 'Claims sent to ESFA for clawback',
      userId: req.session.passport.user.id,
      documents: [{
        title: 'Claims sent to ESFA',
        filename,
        href: `/support/claims/activity/downloads/${filename}`
      }]
    })

    req.flash('success', 'Claims sent to ESFA')
    res.redirect('/support/claims/clawbacks')
  }
}

/// ------------------------------------------------------------------------ ///
/// IMPORT CLAIM CLAWBACK RESPONSE
/// ------------------------------------------------------------------------ ///

exports.response_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'clawback_in_progress')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/clawbacks/response', {
    hasClaims,
    actions: {
      save: `/support/claims/clawbacks/response`,
      back: `/support/claims/clawbacks`,
      cancel: `/support/claims/clawbacks`
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
      .filter(claim => claim.status === 'clawback_in_progress')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/clawbacks/response', {
      hasClaims,
      actions: {
        save: `/support/claims/clawbacks/response`,
        back: `/support/claims/clawbacks`,
        cancel: `/support/claims/clawbacks`
      },
      errors
    })
  } else {
    // get the CSV delimiter
    const delimiter = csv.detect(req.file.path)
    // read the raw CSV data
    const raw = fs.readFileSync(req.file.path, 'utf8')
    // parse the CSV data
    let clawbacks = []
    csv.readAll(raw, delimiter, data => {
      clawbacks = data
    })

    // remove header row from the clawbacks array
    clawbacks.shift()

    // put the data into the session for use later
    clawbacks = clawbackHelper.parseData(clawbacks)

    // decorate clawback data with claim ID
    clawbacks = clawbacks.map(clawback => {
      return clawback = clawbackDecorator.decorate(clawback)
    })

    req.session.data.clawbacks = clawbacks
    req.session.data.filePath = req.file.path

    res.redirect('/support/claims/clawbacks/response/review')
  }
}

exports.review_response_claims_get = (req, res) => {
  let clawbacks = req.session.data.clawbacks

  const claimsCount = clawbacks.length

  const pagination = new Pagination(clawbacks, req.query.page, settings.pageSize)
  clawbacks = pagination.getData()

  res.render('../views/support/claims/clawbacks/review', {
    clawbacks,
    claimsCount,
    pagination,
    actions: {
      save: `/support/claims/clawbacks/response/review`,
      back: `/support/claims/clawbacks/response`,
      cancel: `/support/claims/clawbacks`
    }
  })
}

exports.review_response_claims_post = (req, res) => {
  const clawbacks = req.session.data.clawbacks

  clawbacks.forEach(clawback => {
    claimModel.updateOne({
      organisationId: clawback.organisationId,
      claimId: clawback.claimId,
      userId: req.session.passport.user.id,
      claim: {
        status: clawback.claim_status
      }
    })
  })

  const filename = utilHelper.getFilename(req.session.data.filePath)

  // log the process
  activityLogModel.insertOne({
    title: 'ESFA clawback response uploaded',
    userId: req.session.passport.user.id,
    documents: [{
      title: 'ESFA clawback response',
      filename,
      href: `/support/claims/activity/downloads/${filename}`
    }]
  })

  // ,
  // note: {
  //   text: clawback.claim_unsuccessful_reason,
  //   userId: req.session.passport.user.id,
  //   section: 'clawbacks',
  //   category: clawback.claim_status
  // }

  req.flash('success', 'ESFA response uploaded')
  res.redirect('/support/claims/clawbacks')
}

/// ------------------------------------------------------------------------ ///
/// DOWNLOAD CLAIMS LIST - FOR ESFA
/// ------------------------------------------------------------------------ ///

exports.download_claims_get = (req, res) => {
  const hasError = req.query.error
  res.render('../views/support/claims/clawbacks/download', {
    hasError,
    actions: {
      download: `/support/claims/clawbacks/download`
    }
  })
}

exports.download_claims_post = (req, res) => {

  req.flash('success', 'Claims downloaded')
  res.redirect(`/support/claims/clawbacks/download`)
}
