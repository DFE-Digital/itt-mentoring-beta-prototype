const organisationModel = require('../models/organisations')

const providerModel = require('../models/providers')
const schoolModel = require('../models/schools')

exports.list_organisations_get = (req, res) => {
  if (req.session.passport.user.organisations && req.session.passport.user.organisations.length > 1) {
    const organisations = req.session.passport.user.organisations

    res.render('../views/organisations/list', {
      organisations
    })
  } else if (req.session.passport.user.organisations.length === 1) {
    const organisationId = req.session.passport.user.organisations[0].id
    res.redirect(`/organisations/${organisationId}`)
  } else {
    res.redirect('/support/organisations')
  }
}

/// ------------------------------------------------------------------------ ///
/// ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.organisation = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  // put the selected organisation into the passport object
  // for use around the service
  req.session.passport.organisation = organisation
  res.redirect(`/organisations/${req.params.organisationId}/details`)
}

/// ------------------------------------------------------------------------ ///
/// SHOW ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.show_organisation_get = (req, res) => {
  const organisation = organisationModel.findOne({
    organisationId: req.params.organisationId
  })

  res.render('../views/organisations/show', {
    organisation,
    actions: {
      back: `/organisations/${req.params.organisationId}`,
      change: `/organisations/${req.params.organisationId}`,
      delete: `/organisations/${req.params.organisationId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE DATA
/// ------------------------------------------------------------------------ ///

exports.provider_suggestions_json = (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let providers
  providers = providerModel.findMany(req.query)

  providers.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  // TODO: slice data to only return max n records

  res.json(providers)
}

exports.school_suggestions_json = (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let schools
  schools = schoolModel.findMany(req.query)

  schools.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  // TODO: slice data to only return max n records

  res.json(schools)
}
