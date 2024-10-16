const activityLogModel = require('../../models/activity')

const Pagination = require('../../helpers/pagination')

exports.list_activity_get = (req, res) => {
  let activity = activityLogModel.findMany()

  activity.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  res.render('../views/support/claims/activity/index', {
    activity,
    actions: {
      show: `/support/claims/activity`
    }
  })
}
