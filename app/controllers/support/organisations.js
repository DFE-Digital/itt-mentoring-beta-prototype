const organisationModel = require('../../models/organisations')

const providerModel = require('../../models/providers')
const schoolModel = require('../../models/schools')

const Pagination = require('../../helpers/pagination')
const utilsHelper = require('../../helpers/utils')

exports.list_organisations_get = (req, res) => {
  // Clean out data from add organisation flow if present
  delete req.session.data.organisation
  delete req.session.data.provider
  delete req.session.data.school
  delete req.session.data.type

  // Search
  const keywords = req.session.data.keywords
  const hasSearch = !!((keywords))

  // Filters
  const organisationType = null

  let organisationTypes
  if (req.session.data.filters?.organisationType) {
    organisationTypes = utilsHelper.getCheckboxValues(organisationType, req.session.data.filters.organisationType)
  }

  const hasFilters = !!((organisationTypes?.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (organisationTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Organisation type' },
        items: organisationTypes.map((organisationType) => {
          return {
            text: utilsHelper.getOrganisationTypeLabel(organisationType),
            href: `/support/organisations/remove-organisationType-filter/${organisationType}`
          }
        })
      })
    }
  }

  let selectedOrganisationType
  if (req.session.data.filters?.organisationType) {
    selectedOrganisationType = req.session.data.filters.organisationType
  }

  const organisationTypeFilterItems = utilsHelper.getOrganisationTypeFilterItems(selectedOrganisationType)

  // Get list of all organisations
  let organisations = organisationModel.findMany({
    keywords,
    organisationTypes: selectedOrganisationType
  })
  const organisationsCount = organisations.length

  // Sort organisations alphabetically by name
  organisations.sort((a, b) => {
    return a.name.localeCompare(b.name) || a.type.localeCompare(b.type)
  })


  let pageSize = 25
  let pagination = new Pagination(organisations, req.query.page, pageSize)
  organisations = pagination.getData()

  res.render('../views/support/organisations/list', {
    organisations,
    organisationsCount,
    pagination,
    selectedFilters,
    hasFilters,
    hasSearch,
    keywords,
    organisationTypeFilterItems,
    actions: {
      new: '/support/organisations/new',
      view: '/support/organisations',
      filters: {
        apply: '/support/organisations',
        remove: '/support/organisations/remove-all-filters'
      },
      search: {
        find: '/support/organisations',
        remove: '/support/organisations/remove-keyword-search'
      }
    }
  })
}

exports.removeOrganisationTypeFilter = (req, res) => {
  req.session.data.filters.organisationType = utilsHelper.removeFilter(
    req.params.organisationType,
    req.session.data.filters.organisationType
  )
  res.redirect('/support/organisations')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/support/organisations')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/support/organisations')
}

/// ------------------------------------------------------------------------ ///
/// SHOW ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.show_organisation_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/support/organisations/show', {
    organisation,
    actions: {
      back: `/support/organisations/${req.params.organisationId}`,
      change: `/support/organisations/${req.params.organisationId}`,
      delete: `/support/organisations/${req.params.organisationId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// ADD ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.new_get = (req, res) => {
  let save = '/support/organisations/new'
  let back = '/support/organisations'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  res.render('../views/support/organisations/new/type', {
    actions: {
      save,
      back,
      cancel: '/support/organisations'
    }
  })
}

exports.new_post = (req, res) => {
  let save = '/support/organisations/new'
  let back = '/support/organisations'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  const errors = []

  if (!req.session.data.type) {
    const error = {}
    error.fieldName = "type"
    error.href = "#type"
    error.text = "Select an organisation type"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/new/type', {
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    if (req.query.referrer === 'check') {
      res.redirect('/support/organisations/new/check')
    } else {
      if (req.session.data.type === 'provider') {
        res.redirect('/support/organisations/new/provider')
      } else {
        res.redirect('/support/organisations/new/school')
      }
    }
  }
}

exports.new_provider_get = (req, res) => {
  delete req.session.data.school
  delete req.session.data.provider

  let save = '/support/organisations/new/provider'
  let back = '/support/organisations/new'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  res.render('../views/support/organisations/new/provider/find', {
    actions: {
      save,
      back,
      cancel: '/support/organisations'
    }
  })
}

exports.new_provider_post = (req, res) => {
  let save = '/support/organisations/new/provider'
  let back = '/support/organisations/new'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  const errors = []

  if (!req.session.data.provider.name.length) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Enter a provider name, UKPRN, URN or postcode'
    errors.push(error)

    res.render('../views/support/organisations/new/provider/find', {
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    const providers = providerModel.findMany({
      query: req.session.data.provider.name
    })

    if (providers.length > 1) {
      res.redirect('/support/organisations/new/provider/choose')
    } else {
      const organisation = organisationModel.findMany({ keywords: req.session.data.provider.name })

      if (organisation.length) {
        const error = {}
        error.fieldName = 'provider'
        error.href = '#provider'
        error.text = 'Provider already exists'
        errors.push(error)
      }

      if (errors.length) {
        res.render('../views/support/organisations/new/provider/find', {
          actions: {
            save,
            back,
            cancel: '/support/organisations'
          },
          errors
        })
      } else {
        const organisation = providerModel.findOne({ query: req.session.data.provider.name })
        organisation.type = 'provider'

        req.session.data.organisation = organisation

        res.redirect('/support/organisations/new/check')
      }
    }
  }
}

exports.new_choose_provider_get = (req, res) => {
  const providers = providerModel.findMany({
    query: req.session.data.provider.name
  })

  // store total number of results
  const providerCount = providers.length

  // parse the provider results for use in macro
  let providerItems = []
  providers.forEach(provider => {
    const item = {}
    item.text = provider.name
    item.value = provider.urn || provider.ukprn || provider.address.postcode
    item.hint = {
      text: `${provider.address.town}, ${provider.address.postcode}`
    }
    providerItems.push(item)
  })

  // sort items alphabetically
  providerItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  providerItems = providerItems.slice(0,15)

  let save = '/support/organisations/new/provider/choose'
  let back = '/support/organisations/new/provider'

  // if (req.query.referrer === 'check') {
  //   save += '?referrer=check'
  //   back = '/support/organisations/new/check'
  // }

  res.render('../views/support/organisations/new/provider/choose', {
    providerItems,
    providerCount,
    searchTerm: req.session.data.provider.name,
    actions: {
      save,
      back,
      cancel: '/support/organisations'
    }
  })
}

exports.new_choose_provider_post = (req, res) => {
  const providers = providerModel.findMany({
    query: req.session.data.provider.name
  })

  // store total number of results
  const providerCount = providers.length

  // parse the provider results for use in macro
  let providerItems = []
  providers.forEach(provider => {
    const item = {}
    item.text = provider.name
    item.value = provider.urn || provider.ukprn || provider.address.postcode
    item.hint = {
      text: `${provider.address.town}, ${provider.address.postcode}`
    }
    providerItems.push(item)
  })

  // sort items alphabetically
  providerItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  providerItems = providerItems.slice(0,15)

  let save = '/support/organisations/new/provider/choose'
  let back = '/support/organisations/new/provider'

  // if (req.query.referrer === 'check') {
  //   save += '?referrer=check'
  //   back = '/support/organisations/new/check'
  // }

  const errors = []

  const organisation = organisationModel.findMany({
    keywords: req.session.data.provider.id
  })

  if (!req.session.data.provider.id) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Select a provider'
    errors.push(error)
  } else if (organisation.length) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Provider already exists'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/new/provider/choose', {
      providerItems,
      providerCount,
      searchTerm: req.session.data.provider.name,
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    const organisation = providerModel.findOne({ query: req.session.data.provider.id })

    req.session.data.organisation = organisation

    res.redirect('/support/organisations/new/check')
  }
}

exports.new_school_get = (req, res) => {
  delete req.session.data.school
  delete req.session.data.provider

  let save = '/support/organisations/new/school'
  let back = '/support/organisations/new'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  res.render('../views/support/organisations/new/school/find', {
    actions: {
      save,
      back,
      cancel: '/support/organisations'
    }
  })
}

exports.new_school_post = (req, res) => {
  let save = '/support/organisations/new/school'
  let back = '/support/organisations/new'

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = '/support/organisations/new/check'
  }

  const errors = []

  if (!req.session.data.school.name.length) {
    const error = {}
    error.fieldName = 'school'
    error.href = '#school'
    error.text = 'Enter a school name, URN or postcode'
    errors.push(error)

    res.render('../views/support/organisations/new/school/find', {
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    const schools = schoolModel.findMany({
      query: req.session.data.school.name
    })

    if (schools.length > 1) {
      res.redirect('/support/organisations/new/school/choose')
    } else {
      const organisation = organisationModel.findMany({ keywords: req.session.data.school.name })

      if (organisation.length) {
        const error = {}
        error.fieldName = 'school'
        error.href = '#school'
        error.text = 'School already exists'
        errors.push(error)
      }

      if (errors.length) {
        res.render('../views/support/organisations/new/school/find', {
          actions: {
            save,
            back,
            cancel: '/support/organisations'
          },
          errors
        })
      } else {
        const organisation = schoolModel.findOne({ query: req.session.data.school.name })
        organisation.type = 'school'

        req.session.data.organisation = organisation

        res.redirect('/support/organisations/new/check')
      }
    }
  }
}

exports.new_choose_school_get = (req, res) => {
  const schools = schoolModel.findMany({
    query: req.session.data.school.name
  })

  // store total number of results
  const schoolCount = schools.length

  // parse the school results for use in macro
  let schoolItems = []
  schools.forEach(school => {
    const item = {}
    item.text = school.name
    item.value = school.urn || school.address.postcode
    item.hint = {
      text: `${school.address.town}, ${school.address.postcode}`
    }
    schoolItems.push(item)
  })

  // sort items alphabetically
  schoolItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  schoolItems = schoolItems.slice(0,15)

  let save = '/support/organisations/new/school/choose'
  let back = '/support/organisations/new/school'

  // if (req.query.referrer === 'check') {
  //   save += '?referrer=check'
  //   back = '/support/organisations/new/check'
  // }

  res.render('../views/support/organisations/new/school/choose', {
    schoolItems,
    schoolCount,
    searchTerm: req.session.data.school.name,
    actions: {
      save,
      back,
      cancel: '/support/organisations'
    }
  })
}

exports.new_choose_school_post = (req, res) => {
  const schools = schoolModel.findMany({
    query: req.session.data.school.name
  })

  // store total number of results
  const schoolCount = schools.length

  // parse the school results for use in macro
  let schoolItems = []
  schools.forEach(school => {
    const item = {}
    item.text = school.name
    item.value = school.urn || school.address.postcode
    item.hint = {
      text: `${school.address.town}, ${school.address.postcode}`
    }
    schoolItems.push(item)
  })

  // sort items alphabetically
  schoolItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  schoolItems = schoolItems.slice(0,15)

  let save = '/support/organisations/new/school/choose'
  let back = '/support/organisations/new/school'

  // if (req.query.referrer === 'check') {
  //   save += '?referrer=check'
  //   back = '/support/organisations/new/check'
  // }

  const errors = []

  const organisation = organisationModel.findMany({
    keywords: req.session.data.school.id
  })

  if (!req.session.data.school.id) {
    const error = {}
    error.fieldName = 'school'
    error.href = '#school'
    error.text = 'Select a school'
    errors.push(error)
  } else if (organisation.length) {
    const error = {}
    error.fieldName = 'school'
    error.href = '#school'
    error.text = 'School already exists'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/organisations/new/school/choose', {
      schoolItems,
      schoolCount,
      searchTerm: req.session.data.school.name,
      actions: {
        save,
        back,
        cancel: '/support/organisations'
      },
      errors
    })
  } else {
    const organisation = schoolModel.findOne({ query: req.session.data.school.id })
    organisation.type = 'school'

    req.session.data.organisation = organisation

    res.redirect('/support/organisations/new/check')
  }
}

exports.new_check_get = (req, res) => {
  let back = '/support/organisations/new/provider'
  if (req.session.data.organisation.type === 'school') {
    back = '/support/organisations/new/school'
  }

  res.render('../views/support/organisations/new/check-your-answers', {
    organisation: req.session.data.organisation,
    actions: {
      save: '/support/organisations/new/check',
      back,
      cancel: '/support/organisations',
      change: '/support/organisations/new'
    }
  })
}

exports.new_check_post = (req, res) => {
  organisationModel.insertOne({
    organisation: req.session.data.organisation
  })

  delete req.session.data.organisation
  delete req.session.data.provider
  delete req.session.data.school
  delete req.session.data.type

  req.flash('success', 'Organisation added')
  res.redirect(`/support/organisations`)
}
