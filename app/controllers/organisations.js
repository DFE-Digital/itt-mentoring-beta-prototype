const contentModel = require('../models/content')
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
  if (organisation.type === 'school') {
    if (organisation?.conditionsAgreed) {
      res.redirect(`/organisations/${req.params.organisationId}/claims`)
    } else {
      res.redirect(`/organisations/${req.params.organisationId}/conditions`)
    }
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/details`)
  }
}

/// ------------------------------------------------------------------------ ///
/// AGREE TO GRANT CONDITIONS
/// ------------------------------------------------------------------------ ///

exports.organisation_conditions_get = (req, res) => {
  const organisation = organisationModel.findOne({
    organisationId: req.params.organisationId
  })

  const conditions = contentModel.findOne({
    fileName: 'grant-conditions'
  })

  res.render('../views/organisations/conditions', {
    organisation,
    content: conditions.content,
    actions: {
      back: `/organisations/${req.params.organisationId}`,
      save: `/organisations/${req.params.organisationId}/conditions`
    }
  })
}

exports.organisation_conditions_post = (req, res) => {
  organisationModel.updateOne({
    organisationId: req.params.organisationId,
    userId: req.session.passport.user.id,
    organisation: {
      conditionsAgreed: true
    }
  })

  req.flash('success', 'Grant conditions accepted')
  res.redirect(`/organisations/${req.params.organisationId}`)
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
