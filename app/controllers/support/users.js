const userModel = require('../../models/support-users')
const validationHelper = require('../../helpers/validators')

/// ------------------------------------------------------------------------ ///
/// LIST USERS
/// ------------------------------------------------------------------------ ///

exports.user_list = (req, res) => {
  const users = userModel.findMany({ organisationId: req.params.organisationId })

  users.sort((a, b) => {
    return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)
  })

  delete req.session.data.user

  res.render('../views/support/users/list', {
    users,
    actions: {
      new: `/support/users/new`,
      view: `/support/users`,
      back: `/support`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW USER
/// ------------------------------------------------------------------------ ///

exports.user_details = (req, res) => {
  const user = userModel.findOne({ userId: req.params.userId })

  const signedInUser = userModel.findOne({ userId: req.session.passport.user.id })

  res.render('../views/support/users/details', {
    user,
    signedInUser,
    actions: {
      change: `/support/users/${req.params.userId}/edit?referrer=change`,
      delete: `/support/users/${req.params.userId}/delete`,
      back: `/support/users`,
      cancel: `/support/users`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW USER
/// ------------------------------------------------------------------------ ///

exports.new_user_get = (req, res) => {
  let back = `/support/users`
  if (req.query.referrer === 'check') {
    back = `/support/users/new/check`
  }

  res.render('../views/support/users/edit', {
    user: req.session.data.user,
    actions: {
      save: `/support/users/new`,
      back,
      cancel: `/support/users`
    }
  })
}

exports.new_user_post = (req, res) => {
  const errors = []

  if (!req.session.data.user.firstName.length) {
    const error = {}
    error.fieldName = 'firstName'
    error.href = '#firstName'
    error.text = 'Enter a first name'
    errors.push(error)
  }

  if (!req.session.data.user.lastName.length) {
    const error = {}
    error.fieldName = 'lastName'
    error.href = '#lastName'
    error.text = 'Enter a last name'
    errors.push(error)
  }

  const isValidEmail = !!(
    validationHelper.isValidEmail(req.session.data.user.email)
    && validationHelper.isValidEducationEmail(req.session.data.user.email)
  )

  if (!req.session.data.user.email.length) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (!isValidEmail) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter a Department for Education email address in the correct format, like name@education.gov.uk'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/users/edit', {
      user: req.session.data.user,
      actions: {
        save: `/support/users/new`,
        back: `/support/users`,
        cancel: `/support/users`
      },
      errors
    })
  } else {
    res.redirect(`/support/users/new/check`)
  }
}

exports.new_user_check_get = (req, res) => {
  res.render('../views/support/users/check-your-answers', {
    user: req.session.data.user,
    actions: {
      save: `/support/users/new/check`,
      back: `/support/users/new`,
      change: `/support/users/new?referrer=check`,
      cancel: `/support/users`
    }
  })
}

exports.new_user_check_post = (req, res) => {
  userModel.saveOne({
    user: req.session.data.user
  })

  delete req.session.data.user

  req.flash('success', 'User added')
  res.redirect(`/support/users`)
}

/// ------------------------------------------------------------------------ ///
/// EDIT USER
/// ------------------------------------------------------------------------ ///

exports.edit_user_get = (req, res) => {
  const currentUser = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  if (req.session.data.user) {
    user = req.session.data.user
  } else {
    user = currentUser
  }

  res.render('../views/support/users/edit', {
    currentUser,
    user,
    actions: {
      save: `/support/users/${req.params.userId}/edit`,
      back: `/support/users/${req.params.userId}`,
      cancel: `/support/users/${req.params.userId}`
    }
  })
}

exports.edit_user_post = (req, res) => {
  const errors = []

  if (!req.session.data.user.firstName.length) {
    const error = {}
    error.fieldName = 'firstName'
    error.href = '#firstName'
    error.text = 'Enter a first name'
    errors.push(error)
  }

  if (!req.session.data.user.lastName.length) {
    const error = {}
    error.fieldName = 'lastName'
    error.href = '#lastName'
    error.text = 'Enter a last name'
    errors.push(error)
  }

  const isValidEmail = !!(
    validationHelper.isValidEmail(req.session.data.user.email)
    && validationHelper.isValidEducationEmail(req.session.data.user.email)
  )

  if (!req.session.data.user.email.length) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (!isValidEmail) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter a Department for Education email address in the correct format, like name@education.gov.uk'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/support/users/edit', {
      user: req.session.data.user,
      actions: {
        save: `/support/users/${req.params.userId}/edit`,
        back: `/support/users/${req.params.userId}`,
        cancel: `/support/users/${req.params.userId}`
      },
      errors
    })
  } else {
    res.redirect(`/support/users/${req.params.userId}/edit/check`)
  }
}

exports.edit_user_check_get = (req, res) => {
  const currentUser = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  res.render('../views/support/users/check-your-answers', {
    currentUser,
    user: req.session.data.user,
    referrer: 'change',
    actions: {
      save: `/support/users/${req.params.userId}/edit/check`,
      back: `/support/users/${req.params.userId}/edit`,
      change: `/support/users/${req.params.userId}/edit?referrer=change`,
      cancel: `/support/users/${req.params.userId}`
    }
  })
}

exports.edit_user_check_post = (req, res) => {
  userModel.saveOne({
    userId: req.params.userId,
    user: req.session.data.user
  })

  delete req.session.data.user

  req.flash('success', 'User updated')
  res.redirect(`/support/users/${req.params.userId}`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE USER
/// ------------------------------------------------------------------------ ///

exports.delete_user_get = (req, res) => {
  const user = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  res.render('../views/support/users/delete', {
    user,
    actions: {
      save: `/support/users/${req.params.userId}/delete`,
      back: `/support/users/${req.params.userId}`,
      cancel: `/support/users/${req.params.userId}`
    }
  })
}

exports.delete_user_post = (req, res) => {
  userModel.deleteOne({
    userId: req.params.userId
  })

  req.flash('success', 'User removed')
  res.redirect(`/support/users`)
}
