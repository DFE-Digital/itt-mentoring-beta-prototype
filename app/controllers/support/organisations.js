const organisationModel = require('../../models/organisations')

exports.list_organisations_get = (req, res) => {
  const organisations = organisationModel.findMany({})

  organisations.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  res.render('../views/support/organisations/list', {
    organisations
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.show_organisation_get = (req, res) => {
  const organisation = organisationModel.findOne({
    organisationId: req.params.organisationId
  })

  res.render('../views/support/organisations/show', {
    organisation,
    actions: {
      back: `/support/organisations/${req.params.organisationId}`,
      change: `/support/organisations/${req.params.organisationId}`,
      delete: `/support/organisations/${req.params.organisationId}/delete`
    }
  })
}
