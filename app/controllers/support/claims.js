const path = require('path')
const csvWriter = require('csv-writer').createObjectCsvWriter

const claimModel = require('../../models/claims')

const Pagination = require('../../helpers/pagination')
const academicYearHelper = require('../../helpers/academic-years')
const claimHelper = require('../../helpers/claims')
const filterHelper = require('../../helpers/filters')
const providerHelper = require('../../helpers/providers')
const schoolHelper = require('../../helpers/schools')
const statusHelper = require('../../helpers/statuses')

const claimDecorator = require('../../decorators/claims')

const settings = require('../../data/dist/prototype-settings')

/// ------------------------------------------------------------------------ ///
/// LIST CLAIMS
/// ------------------------------------------------------------------------ ///

exports.list_claims_get = (req, res) => {
  // delete the filter and search data if the referrer is either
  // payments, sampling or clawbacks since they have similar functionality
  const regex = /\/support\/claims\/(payments|sampling|clawbacks)/
  if (regex.test(req.headers.referer)) {
    delete req.session.data.filters
    delete req.session.data.keywords
  }

  // Search
  const keywords = req.session.data.keywords
  const hasSearch = !!((keywords))

  // Filters
  const academicYear = null
  const status = null
  const school = null
  const provider = null

  let academicYears
  if (req.session.data.filters?.academicYear) {
    academicYears = filterHelper.getCheckboxValues(academicYear, req.session.data.filters.academicYear)
  }

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

  const hasFilters = !!((academicYears?.length > 0)
    || (statuses?.length > 0)
    || (schools?.length > 0)
    || (providers?.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (academicYears?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Academic year' },
        items: academicYears.map((academicYear) => {
          return {
            text: academicYearHelper.getAcademicYearLabel(academicYear),
            href: `/support/claims/remove-academic-year-filter/${academicYear}`
          }
        })
      })
    }

    if (statuses?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Status' },
        items: statuses.map((status) => {
          return {
            text: claimHelper.getClaimStatusLabel(status),
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
            text: schoolHelper.getSchoolName(school),
            href: `/support/claims/remove-school-filter/${school}`
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
            href: `/support/claims/remove-provider-filter/${provider}`
          }
        })
      })
    }
  }

  // get filter items
  const filterAcademicYearItems = academicYearHelper.getAcademicYearOptions(academicYears)
  const filterStatusItems = statusHelper.getClaimStatusOptions(statuses)
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

  // TODO: Decorate claim with provider and school names, school address so we can search?

  // claims = claims.filter(claim => {
  //   return claim.status !== 'draft'
  // })

  if (academicYears?.length) {
    claims = claims.filter(claim => {
      return academicYears.includes(claim.academicYear)
    })
  }

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
    // claims = claims.filter(claim => {
    //   return claim.school.name.toLowerCase().includes(keywords.toLowerCase())
    //     || claim.school.urn?.toString().includes(keywords)
    //     || claim.school.address?.postcode?.toLowerCase().includes(keywords.toLowerCase())
    // })

    claims = claims.filter(claim => claim.reference.toLowerCase().includes(keywords.toLowerCase()))
  }

  // Sort claims alphabetically by name
  // claims.sort((a, b) => {
  //   return a.name.localeCompare(b.name) || a.type.localeCompare(b.type)
  // })

  const pagination = new Pagination(claims, req.query.page, settings.pageSize)
  claims = pagination.getData()

  res.render('../views/support/claims/list', {
    claims,
    pagination,
    selectedFilters,
    hasFilters,
    hasSearch,
    keywords,
    filterAcademicYearItems,
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
      },
      download: '/support/claims/download'
    }
  })
}

exports.removeAcademicYearFilter = (req, res) => {
  req.session.data.filters.academicYear = filterHelper.removeFilter(
    req.params.academicYear,
    req.session.data.filters.academicYear
  )
  res.redirect('/support/claims')
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
/// DOWNLOAD CLAIMS
/// ------------------------------------------------------------------------ ///

exports.download_claims_get = async (req, res) => {
  // Search
  const keywords = req.session.data.keywords

  // Filters
  const academicYear = null
  const status = null
  const school = null
  const provider = null

  let academicYears
  if (req.session.data.filters?.status) {
    academicYears = filterHelper.getCheckboxValues(academicYear, req.session.data.filters.academicYear)
  }

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

  // Get list of all claims
  let claims = claimModel.findMany({})

  // add details of school to each claim
  if (claims.length) {
    claims = claims.map(claim => {
      return claim = claimDecorator.decorate(claim)
    })
  }

  if (academicYears?.length) {
    claims = claims.filter(claim => {
      return academicYears.includes(claim.academicYear)
    })
  }

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

  // parse claims as CSV
  const records = claimHelper.parseData(claims)

  const directoryPath = path.join(__dirname, '../../data/dist/downloads/')
  const fileName = "claims-" + new Date().toISOString()
  const filePath = directoryPath + '/' + fileName + '.csv'

  // create the CSV headers
  const csv = csvWriter({
    path: filePath,
    header: [
      { id: 'claim_reference', title: 'claim_reference' },
      { id: 'school_urn', title: 'school_urn' },
      { id: 'school_name', title: 'school_name' },
      { id: 'school_local_authority', title: 'school_local_authority' },
      { id: 'school_establishment_type', title: 'school_establishment_type' },
      { id: 'school_establishment_type_group', title: 'school_establishment_type_group' },
      { id: 'claim_amount', title: 'claim_amount' },
      { id: 'claim_submission_date', title: 'claim_submission_date' },
      { id: 'claim_status', title: 'claim_status' }
    ]
  })

  // write the CSV data and send to browser
  csv.writeRecords(records)
    .then(() => {
      console.log('CSV file written successfully')
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName + '.csv');
      res.sendFile(filePath);
    })
    .catch((error) => {
      console.error('Error writing CSV file:', error)
      res.status(500).send('Error generating CSV file')
    })
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

  res.render('../views/support/claims/show', {
    organisation,
    claim,
    showOrganisationLink: true,
    showClawbackChangeLinks: false,
    actions: {
      informationSent: `/support/claims/payments/${req.params.claimId}/status/payment_information_sent`,
      rejectClaim: `/support/claims/payments/${req.params.claimId}/status/not_paid`,
      requestReview: `/support/claims/sampling/${req.params.claimId}/status/clawback_requested`,
      samplingApproved: `/support/claims/sampling/${req.params.claimId}/status/paid`,
      back: `/support/claims`,
      organisations: `/support/organisations`
    }
  })
}
