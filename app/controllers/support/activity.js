const path = require('path')

const activityLogModel = require('../../models/activity')

const Pagination = require('../../helpers/pagination')

const settings = require('../../data/dist/prototype-settings')

exports.list_activity_get = (req, res) => {
  let activity = activityLogModel.findMany()

  activity.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  activity.forEach(acitvityItem => {
    if (acitvityItem.documents.length) {
      acitvityItem.documents.sort((a, b) => {
        return a.title.localeCompare(b.title)
      })
    }
  })

  const pagination = new Pagination(activity, req.query.page, settings.pageSize)
  activity = pagination.getData()

  res.render('../views/support/claims/activity/index', {
    activity,
    pagination,
    actions: {
      show: '/support/claims/activity'
    }
  })
}

exports.show_activity_get = (req, res) => {
  const activity = activityLogModel.findOne({
    activityId: req.params.activityId
  })

  if (activity.documents.length) {
    activity.documents.sort((a, b) => {
      return a.title.localeCompare(b.title)
    })
  }

  let documents = activity.documents
  const pagination = new Pagination(documents, req.query.page, settings.pageSize)
  documents = pagination.getData()

  res.render('../views/support/claims/activity/show', {
    activity,
    documents,
    pagination,
    actions: {
      back: '/support/claims/activity'
    }
  })
}

exports.download_activity_get = (req, res) => {
  const directoryPath = path.join(__dirname, '../../data/dist/downloads')

  // if (req.query.type === 'payments') {
  //   directoryPath = path.join(__dirname, '../../data/dist/payments')
  // } else if (req.query.type === 'sampling') {
  //   directoryPath = path.join(__dirname, '../../data/dist/sampling')
  // } else if (req.query.type === 'clawbacks') {
  //   directoryPath = path.join(__dirname, '../../data/dist/clawbacks')
  // }

  const fileName = req.params.fileName
  const filePath = directoryPath + '/' + fileName

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error downloading the file:', err)
      res.status(500).send('Error downloading the file')
    }
  })
}
