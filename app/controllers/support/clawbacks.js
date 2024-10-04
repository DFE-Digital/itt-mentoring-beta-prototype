const claimModel = require('../../models/claims')

const Pagination = require('../../helpers/pagination')
const claimHelper = require('../../helpers/claims')
const filterHelper = require('../../helpers/filters')
const providerHelper = require('../../helpers/providers')
const schoolHelper = require('../../helpers/schools')
const statusHelper = require('../../helpers/statuses')

const claimDecorator = require('../../decorators/claims')

const settings = require('../../data/dist/settings')

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
  }

  const statusArray = ['clawback_requested','clawback_complete']

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
      upload: `/support/claims/clawbacks/upload`,
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
  let claim = claimModel.findOne({
    claimId: req.params.claimId
  })

  claim = claimDecorator.decorate(claim)

  const organisation = claim.school

  res.render('../views/support/claims/clawbacks/show', {
    claim,
    organisation,
    actions: {
      clawbackRequired: `/support/claims/clawbacks/${req.params.claimId}/status/clawback_requested`,
      samplingApproved: `/support/claims/clawbacks/${req.params.claimId}/status/paid`,
      back: `/support/claims/clawbacks`,
      cancel: `/support/claims/clawbacks`
    }
  })
}
