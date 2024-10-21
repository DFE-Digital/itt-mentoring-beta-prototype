exports.show_settings_get = (req, res) => {

  res.render('../views/support/settings/index', {

  })
}


exports.show_claim_windows_get = (req, res) => {

  res.render('../views/support/settings/windows/list', {
    actions: {
      new: '/support/settings/windows/new',
      change:  '/support/settings/windows',
      back: '/support/settings'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW CLAIM WINDOW
/// ------------------------------------------------------------------------ ///

exports.new_claim_window_get = (req, res) => {

  res.render('../views/support/settings/windows/edit', {
    actions: {
      save: '/support/settings/windows/new',
      back: '/support/settings/windows',
      cancel: '/support/settings/windows'
    }
  })
}

exports.new_claim_window_post = (req, res) => {

  const errors = []

  if (errors.length) {
    res.render('../views/support/settings/windows/edit', {
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
    actions: {
      save: '/support/settings/windows/new/check',
      back: '/support/settings/windows/new',
      cancel: '/support/settings/windows'
    }
  })
}

exports.new_claim_window_check_post = (req, res) => {

  req.flash('success', 'Claim window added')
  res.redirect('/support/settings/windows')

}

/// ------------------------------------------------------------------------ ///
/// EDIT CLAIM WINDOW
/// ------------------------------------------------------------------------ ///

exports.edit_claim_window_get = (req, res) => {

  res.render('../views/support/settings/windows/edit', {
    actions: {
      save: `/support/settings/windows/${req.params.windowId}`,
      back: '/support/settings/windows',
      cancel: '/support/settings/windows'
    }
  })
}

exports.edit_claim_window_post = (req, res) => {

  const errors = []

  if (errors.length) {
    res.render('../views/support/settings/windows/edit', {
      actions: {
        save: `/support/settings/windows/${req.params.windowId}`,
        back: '/support/settings/windows',
        cancel: '/support/settings/windows'
      },
      errors
    })
  } else {

    // req.flash('success', 'Claim window updated')
    res.redirect('/support/settings/windows')
  }
}

exports.edit_claim_window_check_get = (req, res) => {

  res.render('../views/support/settings/windows/check-your-answers', {
    actions: {
      save: '/support/settings/windows/new/check',
      back: '/support/settings/windows/new',
      cancel: '/support/settings/windows'
    }
  })
}

exports.edit_claim_window_check_post = (req, res) => {

  req.flash('success', 'Claim window updated')
  res.redirect('/support/settings/windows')

}
