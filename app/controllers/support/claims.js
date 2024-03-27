const claimModel = require('../../models/claims')

const Pagination = require('../../helpers/pagination')
const filterHelper = require('../../helpers/filters')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIMS
/// ------------------------------------------------------------------------ ///

exports.list_claims_get = (req, res) => {
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
            text: filterHelper.getFilterALabel(status),
            href: `/support/claims/remove-status-filter/${status}`
          }
        })
      })
    }

    if (schools?.length) {
      selectedFilters.categories.push({
        heading: { text: 'School' },
        items: schools.map((school) => {
          return {
            text: filterHelper.getFilterBLabel(school),
            href: `/support/claims/remove-school-filter/${school}`
          }
        })
      })
    }

    if (providers?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Provider' },
        items: providers.map((provider) => {
          return {
            text: filterHelper.getFilterCLabel(provider),
            href: `/support/claims/remove-provider-filter/${provider}`
          }
        })
      })
    }
  }

  // get filter items
  const filterStatusItems = filterHelper.getFilterAItems(statuses)
  const filterSchoolItems = filterHelper.getFilterBItems(schools)
  const filterProviderItems = filterHelper.getFilterCItems(providers)

  // Get list of all claims
  let claims = claimModel.findMany({
    keywords,
    statuses
  })

  // Sort claims alphabetically by name
  // claims.sort((a, b) => {
  //   return a.name.localeCompare(b.name) || a.type.localeCompare(b.type)
  // })

  let pageSize = 25
  let pagination = new Pagination(claims, req.query.page, pageSize)
  claims = pagination.getData()

  res.render('../views/support/claims/list', {
    claims,
    pagination,
    selectedFilters,
    hasFilters,
    hasSearch,
    keywords,
    filterStatusItems,
    filterSchoolItems,
    filterProviderItems,
    actions: {
      new: '/support/claims/new',
      view: '/support/claims',
      filters: {
        apply: '/support/claims',
        remove: '/support/claims/remove-all-filters'
      },
      search: {
        find: '/support/claims',
        remove: '/support/claims/remove-keyword-search'
      }
    }
  })
}

exports.removeStatusFilter = (req, res) => {
  req.session.data.filters.status = filterHelper.removeFilter(
    req.params.status,
    req.session.data.filters.status
  )
  res.redirect('/support/claims')
}

exports.removeSchoolFilter = (req, res) => {
  req.session.data.filters.school = filterHelper.removeFilter(
    req.params.school,
    req.session.data.filters.school
  )
  res.redirect('/support/claims')
}

exports.removeProviderFilter = (req, res) => {
  req.session.data.filters.provider = filterHelper.removeFilter(
    req.params.provider,
    req.session.data.filters.provider
  )
  res.redirect('/support/claims')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/support/claims')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/support/claims')
}

/// ------------------------------------------------------------------------ ///
/// SHOW CLAIM
/// ------------------------------------------------------------------------ ///

exports.show_claim_get = (req, res) => {
  const claim = claimModel.findOne({ claimId: req.params.claimId })

  res.render('../views/support/claims/show', {
    claim,
    actions: {
      back: `/support/claims`
    }
  })
}