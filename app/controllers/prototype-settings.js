const settingModel = require('../models/prototype-settings')

exports.settings_form_get = (req, res) => {
  const settings = require('../data/dist/prototype-settings.json')

  res.render('../views/prototype-settings/index', {
    settings,
    actions: {
      save: `/prototype-settings`,
      home: '/organisations'
    }
  })
}

exports.settings_form_post = (req, res) => {
  const errors = []

  settingModel.update({
    settings: req.session.data.settings
  })

  if (errors.length) {
    res.render('../views/prototype-settings/index', {
      wordCount,
      actions: {
        save: `/prototype-settings`,
        home: '/organisations'
      },
      errors
    })
  } else {
    req.flash('success', 'Prototype settings updated')
    res.redirect('/prototype-settings')
  }
}

exports.reset_data_get = (req, res) => {
  res.render('../views/prototype-settings/data', {
    actions: {
      save: `/prototype-settings/reset-data`,
      home: '/organisations'
    }
  })
}

exports.reset_data_post = (req, res) => {
  delete req.session.data
  settingModel.reset()
  res.redirect('/sign-out')
}
