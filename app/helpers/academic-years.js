const claimWindows = require('../data/dist/settings/claim-windows')

exports.getAcademicYear = (date) => {
  // find the academic year for a given date
  const item = claimWindows.find((item) =>
    new Date(date) >= new Date(item.opensAt)
    && new Date(date) <= new Date(item.closesAt)
  )

  // if the item is found, return its academic year
  if (item) {
    return item.academicYear
  } else {
    console.log("No item found for the specified date")
    return null
  }
}

exports.getAcademicYearLabel = (code) => {

}
