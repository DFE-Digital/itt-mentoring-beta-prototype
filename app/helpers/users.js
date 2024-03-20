const userModel = require('../models/users')

exports.getUserName = (userId) => {
  const user = userModel.findOne({ userId })

  let label = userId

  if (user) {
    label = `${user.firstName} ${user.lastName}`
  }

  return label
}
