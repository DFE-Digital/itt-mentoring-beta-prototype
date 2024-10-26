const settingModel = require('../models/settings')

exports.settings_form_get = (req, res) => {
  const settings = require('../data/dist/settings.json')
  res.render('../views/settings/index', {
    settings,
    actions: {
      save: '/settings',
      home: '/organisations'
    }
  })
}

exports.settings_form_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render('../views/settings/index', {
      settings: req.session.data.settings,
      actions: {
        save: '/settings',
        home: '/organisations'
      },
      errors
    })
  } else {
    settingModel.update({
      settings: req.session.data.settings
    })

    req.flash('success', 'Settings updated')
    res.redirect('/settings')
  }
}

exports.reset_data_get = (req, res) => {
  res.render('../views/settings/data', {
    actions: {
      save: '/settings/reset-data',
      home: '/organisations'
    }
  })
}

exports.reset_data_post = (req, res) => {
  delete req.session.data
  settingModel.reset()
  res.redirect('/sign-out')
}
