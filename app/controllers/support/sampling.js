const fs = require('fs')
const csv = require('csv-string')

const claimModel = require('../../models/claims')
const samplingModel = require('../../models/sampling')
const activityLogModel = require('../../models/activity')

const Pagination = require('../../helpers/pagination')
const claimHelper = require('../../helpers/claims')
const filterHelper = require('../../helpers/filters')
const providerHelper = require('../../helpers/providers')
const samplingHelper = require('../../helpers/sampling')
const schoolHelper = require('../../helpers/schools')
const statusHelper = require('../../helpers/statuses')
const utilHelper = require('../../helpers/utils')

const claimDecorator = require('../../decorators/claims')
const samplingDecorator = require('../../decorators/sampling')

const settings = require('../../data/dist/prototype-settings')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIMS
/// ------------------------------------------------------------------------ ///

exports.list_claims_get = (req, res) => {
  // delete the filter and search data if the referrer is
  // the all claims, payments or clawbacks lists since they have
  // similar functionality
  const regex = /\/support\/claims(\/(payments|clawbacks)|(?=\?|$))/
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

  const hasFilters = !!((statuses?.length > 0) ||
  (schools?.length > 0) ||
    (providers?.length > 0))

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
            href: `/support/claims/sampling/remove-status-filter/${status}`
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
            href: `/support/claims/sampling/remove-provider-filter/${provider}`
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
            href: `/support/claims/sampling/remove-school-filter/${school}`
          }
        })
      })
    }
  }

  const statusArray = ['sampling_in_progress', 'sampling_provider_not_approved']

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

  res.render('../views/support/claims/sampling/index', {
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
      upload: '/support/claims/sampling/upload',
      response: '/support/claims/sampling/response',
      view: '/support/claims/sampling',
      filters: {
        apply: '/support/claims/sampling',
        remove: '/support/claims/sampling/remove-all-filters'
      },
      search: {
        find: '/support/claims/sampling',
        remove: '/support/claims/sampling/remove-keyword-search'
      }
    }
  })
}

exports.removeStatusFilter = (req, res) => {
  req.session.data.filters.status = filterHelper.removeFilter(
    req.params.status,
    req.session.data.filters.status
  )
  res.redirect('/support/claims/sampling')
}

exports.removeSchoolFilter = (req, res) => {
  req.session.data.filters.school = filterHelper.removeFilter(
    req.params.school,
    req.session.data.filters.school
  )
  res.redirect('/support/claims/sampling')
}

exports.removeProviderFilter = (req, res) => {
  req.session.data.filters.provider = filterHelper.removeFilter(
    req.params.provider,
    req.session.data.filters.provider
  )
  res.redirect('/support/claims/sampling')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/support/claims/sampling')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/support/claims/sampling')
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

  const note = claim.notes.find(note => note.section === 'sampling')

  res.render('../views/support/claims/sampling/show', {
    claim,
    organisation,
    note,
    showOrganisationLink: true,
    actions: {
      approveClaim: `/support/claims/sampling/${req.params.claimId}/status/paid`,
      rejectClaim: `/support/claims/sampling/${req.params.claimId}/status/sampling_not_approved`,
      providerRejectClaim: `/support/claims/sampling/${req.params.claimId}/status/sampling_provider_not_approved`,
      requestClawback: `/support/claims/sampling/${req.params.claimId}/status/clawback_requested`,
      back: '/support/claims/sampling',
      cancel: '/support/claims/sampling',
      organisations: '/support/organisations'
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

  res.render('../views/support/claims/sampling/confirm', {
    claim,
    organisation,
    status: req.params.claimStatus,
    actions: {
      save: `/support/claims/sampling/${req.params.claimId}/status/${req.params.claimStatus}`,
      back: `/support/claims/sampling/${req.params.claimId}`,
      cancel: `/support/claims/sampling/${req.params.claimId}`
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

  if (req.params.claimStatus === 'sampling_provider_not_approved') {
    res.redirect(`/support/claims/sampling/${req.params.claimId}`)
  } else {
    res.redirect('/support/claims/sampling')
  }
}

/// ------------------------------------------------------------------------ ///
/// SEND CLAIMS FOR SAMPLING
/// ------------------------------------------------------------------------ ///

exports.upload_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'paid')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/sampling/upload', {
    hasClaims,
    actions: {
      save: '/support/claims/sampling/upload',
      back: '/support/claims/sampling',
      cancel: '/support/claims/sampling'
    }
  })
}

exports.upload_claims_post = (req, res) => {
  const errors = []

  if (!req.file) {
    const error = {}
    error.fieldName = 'sample'
    error.href = '#sample'
    error.text = 'Select a CSV file to upload'
    errors.push(error)
  } else {
    if (req.file.mimetype !== 'text/csv') {
      const error = {}
      error.fieldName = 'sample'
      error.href = '#sample'
      error.text = 'The selected file must be a CSV'
      errors.push(error)
      // delete the incorrect file
      fs.unlinkSync(req.file.path)
    } else if (!req.file.size) {
      const error = {}
      error.fieldName = 'sample'
      error.href = '#sample'
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
      .filter(claim => claim.status === 'paid')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/sampling/upload', {
      hasClaims,
      actions: {
        save: '/support/claims/sampling/upload',
        back: '/support/claims/sampling',
        cancel: '/support/claims/sampling'
      },
      errors
    })
  } else {
    // get the CSV delimiter
    const delimiter = csv.detect(req.file.path)
    // read the raw CSV data
    const raw = fs.readFileSync(req.file.path, 'utf8')
    // parse the CSV data
    let claims = []
    csv.readAll(raw, delimiter, data => {
      claims = data
    })

    // remove header row from the claims array
    claims.shift()

    // put the data into the session for use later
    claims = samplingHelper.parseSamplingData(claims)

    // decorate payment data with claim ID
    claims = claims.map(item => {
      return item = samplingDecorator.decorate(item)
    })

    req.session.data.claims = claims

    // delete the file now it's not needed
    fs.unlinkSync(req.file.path)

    res.redirect('/support/claims/sampling/upload/review')
  }
}

exports.review_upload_claims_get = (req, res) => {
  let claims = req.session.data.claims

  const claimsCount = claims.length

  const pagination = new Pagination(claims, req.query.page, settings.pageSize)
  claims = pagination.getData()

  const pageHeading = 'Are you sure you want to upload the sampling data?'
  const warningText = 'Each accredited provider included in the sample data will receive an email instructing them to assure their partner schools’ claim.'
  const buttonLabel = 'Upload data'

  res.render('../views/support/claims/sampling/review', {
    claims,
    claimsCount,
    pagination,
    pageHeading,
    warningText,
    buttonLabel,
    actions: {
      save: '/support/claims/sampling/upload/review',
      back: '/support/claims/sampling/upload',
      cancel: '/support/claims/sampling'
    }
  })
}

exports.review_upload_claims_post = (req, res) => {
  const claims = req.session.data.claims

  claims.forEach(claim => {
    claim.claim_status = 'sampling_in_progress'

    claimModel.updateOne({
      organisationId: claim.organisationId,
      claimId: claim.claimId,
      userId: req.session.passport.user.id,
      claim: {
        status: claim.claim_status,
        note: {
          text: claim.sample_reason,
          userId: req.session.passport.user.id,
          section: 'sampling',
          category: claim.claim_status
        }
      }
    })
  })

  // group the claims by provider and parse the data into separate files
  const providerSamples = samplingHelper.parseProviderSampleData(claims)

  // setup an array to store documents
  const documents = []

  for (const [key, value] of Object.entries(providerSamples)) {
    const document = {}
    document.title = value.name

    // key is the provider slug, value is the data:
    // provider name and slug and sample
    const filePath = samplingModel.writeFile({
      key,
      sample: value.sample
    })

    document.filename = utilHelper.getFilename(filePath)
    document.href = `/support/claims/activity/downloads/${document.filename}`

    documents.push(document)
  }

  // log the process and link to the sample files
  activityLogModel.insertOne({
    title: 'Sampling data uploaded',
    userId: req.session.passport.user.id,
    documents
  })

  // clear the claims data after use
  delete req.session.data.claims

  req.flash('success', 'Sampling data uploaded')
  res.redirect('/support/claims/sampling')
}

/// ------------------------------------------------------------------------ ///
/// UPLOAD CLAIM SAMPLING PROVIDER RESPONSE
/// ------------------------------------------------------------------------ ///

exports.response_claims_get = (req, res) => {
  const claims = claimModel
    .findMany({ })
    .filter(claim => claim.status === 'sampling_in_progress')

  const hasClaims = !!claims.length

  res.render('../views/support/claims/sampling/response', {
    hasClaims,
    actions: {
      save: '/support/claims/sampling/response',
      back: '/support/claims/sampling',
      cancel: '/support/claims/sampling'
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
      .filter(claim => claim.status === 'sampling_in_progress')

    const hasClaims = !!claims.length

    res.render('../views/support/claims/sampling/response', {
      hasClaims,
      actions: {
        save: '/support/claims/sampling/response',
        back: '/support/claims/sampling',
        cancel: '/support/claims/sampling'
      },
      errors
    })
  } else {
    // get the CSV delimiter
    const delimiter = csv.detect(req.file.path)
    // read the raw CSV data
    const raw = fs.readFileSync(req.file.path, 'utf8')
    // parse the CSV data
    let claims = []
    csv.readAll(raw, delimiter, data => {
      claims = data
    })

    // remove header row from the claims array
    claims.shift()

    // put the data into the session for use later
    claims = samplingHelper.parseProviderResponseData(claims)

    // decorate payment data with claim ID
    claims = claims.map(item => {
      return item = samplingDecorator.decorate(item)
    })

    req.session.data.claims = claims
    req.session.data.filePath = req.file.path

    res.redirect('/support/claims/sampling/response/review')
  }
}

exports.review_response_claims_get = (req, res) => {
  let claims = req.session.data.claims

  const claimsCount = claims.length

  const pagination = new Pagination(claims, req.query.page, settings.pageSize)
  claims = pagination.getData()

  const pageHeading = 'Are you sure you want to upload the provider’s response?'
  const buttonLabel = 'Upload response'

  res.render('../views/support/claims/sampling/review', {
    claims,
    claimsCount,
    pagination,
    pageHeading,
    buttonLabel,
    actions: {
      save: '/support/claims/sampling/response/review',
      back: '/support/claims/sampling/response',
      cancel: '/support/claims/sampling'
    }
  })
}

exports.review_response_claims_post = (req, res) => {
  const responses = req.session.data.claims

  // uploaded claims are one line per mentor, we need to group by claim
  const claims = samplingHelper.groupClaimsByClaimId(responses)

  claims.forEach(claim => {
    const unapprovedMentors = claim.mentors.filter(mentor =>
      mentor.claim_assured === false ||  ['false','no'].includes(mentor.claim_assured.toLowerCase())
    )

    const hasUnapprovedMentor = unapprovedMentors.length > 0

    const unapprovedReasons = hasUnapprovedMentor
    ? unapprovedMentors.map(mentor => `${mentor.mentor_full_name}: ${mentor.claim_not_assured_reason}`).join('; ')
    : null

    const claimStatus = hasUnapprovedMentor ? 'sampling_provider_not_approved' : 'paid'

    claimModel.updateOne({
      organisationId: claim.organisationId,
      claimId: claim.claimId,
      userId: req.session.passport.user.id,
      claim: {
        status: claimStatus,
        note: {
          text: unapprovedReasons,
          userId: req.session.passport.user.id,
          section: 'sampling',
          category: claimStatus
        }
      }
    })
  })

  // TODO: split the file by provider and log each provider data against their name
  const filename = utilHelper.getFilename(req.session.data.filePath)

  // log the process
  activityLogModel.insertOne({
    title: 'Provider sampling response uploaded',
    userId: req.session.passport.user.id,
    documents: [{
      title: 'Provider sampling response',
      filename,
      href: `/support/claims/activity/downloads/${filename}`
    }]
  })

  // clear data after use
  delete req.session.data.claims
  delete req.session.data.filePath

  req.flash('success', 'Provider response uploaded')
  res.redirect('/support/claims/sampling')
}

/// ------------------------------------------------------------------------ ///
/// DOWNLOAD CLAIMS LIST - FOR PROVIDERS
/// ------------------------------------------------------------------------ ///

exports.download_claims_get = (req, res) => {
  const hasError = req.query.error
  res.render('../views/support/claims/sampling/download', {
    hasError,
    actions: {
      download: '/support/claims/sampling/download'
    }
  })
}

exports.download_claims_post = (req, res) => {
  req.flash('success', 'Claims downloaded')
  res.redirect('/support/claims/sampling/download')
}
