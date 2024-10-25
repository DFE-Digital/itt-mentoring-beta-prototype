exports.findMany = (params) => {
  let providers = require('../data/dist/providers/providers.json')
  // remove Scottish and Welsh providers
  providers = providers.filter((provider) =>
    provider.location.regionCode !== 'S' &&
    provider.location.regionCode !== 'W')

  if (params.query?.length) {
    const query = params.query.toLowerCase()
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(query) ||
      provider.ukprn?.toString().includes(query) ||
      provider.urn?.toString().includes(query) ||
      provider.address?.postcode?.toLowerCase().includes(query)
    )
  }

  return providers
}

exports.findOne = (params) => {
  const providers = require('../data/dist/providers/providers.json')

  if (params.query?.length) {
    const query = params.query.toLowerCase()
    return providers.find(provider =>
      provider.name.toLowerCase().includes(query) ||
      provider.ukprn?.toString().includes(query) ||
      provider.urn?.toString().includes(query) ||
      provider.address?.postcode?.toLowerCase().includes(query) ||
      provider.id === query
    )
  } else {
    return null
  }
}
