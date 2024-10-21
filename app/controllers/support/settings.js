const claimWindowModel = require('../../models/claim-windows')

const arrayHelper = require('../../helpers/arrays')
const dateHelper = require('../../helpers/dates')
const validationHelper = require('../../helpers/validators')

exports.show_settings_get = (req, res) => {

  res.render('../views/support/settings/index', {

  })
}


exports.list_claim_windows_get = (req, res) => {
  delete req.session.data.window

  const windows = claimWindowModel.findMany()

  windows.sort((a, b) => {
    return new Date(b.opensAt) - new Date(a.opensAt)
      || new Date(b.closesAt) - new Date(a.closesAt)
  })

  res.render('../views/support/settings/windows/list', {
    windows,
    actions: {
      new: '/support/settings/windows/new',
      view:  '/support/settings/windows',
      back: '/support/settings'
    }
  })
}

exports.show_claim_window_get = (req, res) => {
  delete req.session.data.window

  const window = claimWindowModel.findOne({
    windowId: req.params.windowId
  })

  res.render('../views/support/settings/windows/show', {
    window,
    actions: {
      change:  `/support/settings/windows/${req.params.windowId}/edit`,
      delete:  `/support/settings/windows/${req.params.windowId}/delete`,
      back: '/support/settings/windows'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW CLAIM WINDOW
/// ------------------------------------------------------------------------ ///

exports.new_claim_window_get = (req, res) => {

  res.render('../views/support/settings/windows/edit', {
    window: req.session.data.window,
    actions: {
      save: '/support/settings/windows/new',
      back: '/support/settings/windows',
      cancel: '/support/settings/windows'
    }
  })
}

exports.new_claim_window_post = (req, res) => {
  req.session.data.window.opensAt = arrayHelper.removeEmpty(req.session.data.window.opensDate)

  if (req.session.data.window.opensAt) {
    req.session.data.window.opensAt = dateHelper.arrayToDateObject(req.session.data.window.opensDate)
  }

  req.session.data.window.closesAt = arrayHelper.removeEmpty(req.session.data.window.closesDate)

  if (req.session.data.window.closesAt) {
    req.session.data.window.closesAt = dateHelper.arrayToDateObject(req.session.data.window.closesDate)
  }

  const errors = []

  if (req.session.data.window.opensAt === undefined) {
    const error = {}
    error.fieldName = 'date-window-opens'
    error.href = '#date-window-opens'
    error.text = 'Enter date the window opens'
    errors.push(error)
  }

  if (req.session.data.window.closesAt === undefined) {
    const error = {}
    error.fieldName = 'date-window-closes'
    error.href = '#date-window-closes'
    error.text = 'Enter date the window closes'
    errors.push(error)
  }

  if (req.session.data.window.academicYear === undefined) {
    const error = {}
    error.fieldName = 'academic-year'
    error.href = '#academic-year'
    error.text = 'Select an academic year'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/settings/windows/edit', {
      window: req.session.data.window,
      actions: {
        save: '/support/settings/windows/new',
        back: '/support/settings/windows/new',
        cancel: '/support/settings/windows'
      },
      errors
    })
  } else {

    // req.flash('success', 'Claim window added')
    res.redirect('/support/settings/windows/new/check')
  }
}

exports.new_claim_window_check_get = (req, res) => {

  res.render('../views/support/settings/windows/check-your-answers', {
    window: req.session.data.window,
    actions: {
      save: '/support/settings/windows/new/check',
      change: '/support/settings/windows/new',
      back: '/support/settings/windows/new',
      cancel: '/support/settings/windows'
    }
  })
}

exports.new_claim_window_check_post = (req, res) => {
  claimWindowModel.insertOne({
    userId: req.session.passport.user.id,
    window: req.session.data.window
  })

  delete req.session.data.window

  req.flash('success', 'Claim window added')
  res.redirect('/support/settings/windows')

}

/// ------------------------------------------------------------------------ ///
/// EDIT CLAIM WINDOW
/// ------------------------------------------------------------------------ ///

exports.edit_claim_window_get = (req, res) => {
  const currentWindow = claimWindowModel.findOne({
    windowId: req.params.windowId
  })

  if (req.session.data.window) {
    window = req.session.data.window
  } else {
    window = currentWindow
  }

  window.opensDate = dateHelper.dateToArray(new Date(window.opensAt))
  window.closesDate = dateHelper.dateToArray(new Date(window.closesAt))

  res.render('../views/support/settings/windows/edit', {
    currentWindow,
    window,
    actions: {
      save: `/support/settings/windows/${req.params.windowId}/edit`,
      back: '/support/settings/windows',
      cancel: '/support/settings/windows'
    }
  })
}

exports.edit_claim_window_post = (req, res) => {
  const currentWindow = claimWindowModel.findOne({
    windowId: req.params.windowId
  })

  req.session.data.window.opensAt = arrayHelper.removeEmpty(req.session.data.window.opensDate)

  if (req.session.data.window.opensAt) {
    req.session.data.window.opensAt = dateHelper.arrayToDateObject(req.session.data.window.opensDate)
  }

  req.session.data.window.closesAt = arrayHelper.removeEmpty(req.session.data.window.closesDate)

  if (req.session.data.window.closesAt) {
    req.session.data.window.closesAt = dateHelper.arrayToDateObject(req.session.data.window.closesDate)
  }

  // console.log(validationHelper.isValidDate(req.session.data.window.opensAt));
  // console.log(req.session.data.window.opensAt);


  const errors = []

  // if (!validationHelper.isValidDate(req.session.data.window.opensAt)) {
  //   const error = {}
  //   error.fieldName = 'date-window-opens'
  //   error.href = '#date-window-opens'
  //   error.text = 'Enter date the window opens'
  //   errors.push(error)
  // }

  // if (!validationHelper.isValidDate(req.session.data.window.closesAt)) {
  //   const error = {}
  //   error.fieldName = 'date-window-closes'
  //   error.href = '#date-window-closes'
  //   error.text = 'Enter date the window closes'
  //   errors.push(error)
  // }

  // if (req.session.data.window.academicYear === undefined) {
  //   const error = {}
  //   error.fieldName = 'academic-year'
  //   error.href = '#academic-year'
  //   error.text = 'Select an academic year'
  //   errors.push(error)
  // }

  if (errors.length) {
    res.render('../views/support/settings/windows/edit', {
      currentWindow,
      window: req.session.data.window,
      actions: {
        save: `/support/settings/windows/${req.params.windowId}/edit`,
        back: '/support/settings/windows',
        cancel: '/support/settings/windows'
      },
      errors
    })
  } else {

    // req.flash('success', 'Claim window updated')
    res.redirect(`/support/settings/windows/${req.params.windowId}/edit/check`)
  }
}

exports.edit_claim_window_check_get = (req, res) => {
  const currentWindow = claimWindowModel.findOne({
    windowId: req.params.windowId
  })

  res.render('../views/support/settings/windows/check-your-answers', {
    currentWindow,
    window: req.session.data.window,
    actions: {
      save: `/support/settings/windows/${req.params.windowId}/edit/check`,
      change: `/support/settings/windows/${req.params.windowId}/edit`,
      back: `/support/settings/windows/${req.params.windowId}/edit`,
      cancel: '/support/settings/windows'
    }
  })
}

exports.edit_claim_window_check_post = (req, res) => {
  claimWindowModel.updateOne({
    windowId: req.params.windowId,
    userId: req.session.passport.user.id,
    window: req.session.data.window
  })

  delete req.session.data.window

  req.flash('success', 'Claim window updated')
  res.redirect(`/support/settings/windows/${req.params.windowId}`)

}

/// ------------------------------------------------------------------------ ///
/// DELETE CLAIM WINDOW
/// ------------------------------------------------------------------------ ///

exports.delete_claim_window_get = (req, res) => {
  const window = claimWindowModel.findOne({
    windowId: req.params.windowId
  })

  res.render('../views/support/settings/windows/delete', {
    window,
    actions: {
      save: `/support/settings/windows/${req.params.windowId}/delete`,
      back: `/support/settings/windows/${req.params.windowId}`,
      cancel: `/support/settings/windows/${req.params.windowId}`
    }
  })
}

exports.delete_claim_window_post = (req, res) => {
  claimWindowModel.deleteOne({
    windowId: req.params.windowId
  })

  req.flash('success', 'Claim window removed')
  res.redirect(`/support/settings/windows`)
}
