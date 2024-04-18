const organisationModel = require('../models/organisations')

exports.page_not_found = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  res.render('../views/errors/404', {
    organisation
  })
}

exports.unexpected_error = (req, res) => {
  res.render('../views/errors/500')
}

exports.service_unavailable = (req, res) => {
  res.render('../views/errors/503')
}

exports.unauthorised = (req, res) => {
  res.render('../views/errors/unauthorised')
}
