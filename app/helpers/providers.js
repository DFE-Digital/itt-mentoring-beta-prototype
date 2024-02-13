const providerModel = require('../models/providers')

exports.getProviderOptions = (params) => {
  const items = []



  return items
}


exports.getProviderName = (query) => {
  const provider = providerModel.findOne({ query })

  let label = query

  if (provider) {
    label = provider.name
  }

  return label
}
