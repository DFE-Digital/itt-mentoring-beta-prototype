const userModel = require('../models/users')
const organisationModel = require('../models/organisations')

const Pagination = require('../helpers/pagination')
const validationHelper = require('../helpers/validators')

const settings = require('../data/dist/prototype-settings')

/// ------------------------------------------------------------------------ ///
/// SHOW USER
/// ------------------------------------------------------------------------ ///

exports.user_list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let users = userModel.findMany({ organisationId: req.params.organisationId })

  users.sort((a, b) => {
    return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)
  })

  const pagination = new Pagination(users, req.query.page, settings.pageSize)
  users = pagination.getData()

  delete req.session.data.user

  res.render('../views/users/list', {
    organisation,
    users,
    pagination,
    actions: {
      new: `/organisations/${req.params.organisationId}/users/new`,
      view: `/organisations/${req.params.organisationId}/users`,
      back: '/'
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW USER
/// ------------------------------------------------------------------------ ///

exports.user_details = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  const signedInUser = userModel.findOne({ userId: req.session.passport.user.id })

  res.render('../views/users/show', {
    organisation,
    user,
    signedInUser,
    actions: {
      change: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit?referrer=change`,
      delete: `/organisations/${req.params.organisationId}/users/${req.params.userId}/delete`,
      back: `/organisations/${req.params.organisationId}/users`,
      cancel: `/organisations/${req.params.organisationId}/users`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW USER
/// ------------------------------------------------------------------------ ///

exports.new_user_get = (req, res) => {
  let back = `/organisations/${req.params.organisationId}/users`
  if (req.query.referrer === 'check') {
    back = `/organisations/${req.params.organisationId}/users/new/check`
  }

  res.render('../views/users/edit', {
    user: req.session.data.user,
    actions: {
      save: `/organisations/${req.params.organisationId}/users/new`,
      back,
      cancel: `/organisations/${req.params.organisationId}/users`
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

  const user = userModel.findOne({
    organisationId: req.params.organisationId,
    email: req.session.data.user.email
  })

  if (!req.session.data.user.email.length) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (!validationHelper.isValidEmail(req.session.data.user.email)) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  } else if (user) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Email address already in use'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/users/edit', {
      user: req.session.data.user,
      actions: {
        save: `/organisations/${req.params.organisationId}/users/new`,
        back: `/organisations/${req.params.organisationId}/users`,
        cancel: `/organisations/${req.params.organisationId}/users`
      },
      errors
    })
  } else {
    res.redirect(`/organisations/${req.params.organisationId}/users/new/check`)
  }
}

exports.new_user_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/users/check-your-answers', {
    organisation,
    user: req.session.data.user,
    actions: {
      save: `/organisations/${req.params.organisationId}/users/new/check`,
      back: `/organisations/${req.params.organisationId}/users/new`,
      change: `/organisations/${req.params.organisationId}/users/new?referrer=check`,
      cancel: `/organisations/${req.params.organisationId}/users`
    }
  })
}

exports.new_user_check_post = (req, res) => {
  userModel.saveOne({
    organisationId: req.params.organisationId,
    user: req.session.data.user
  })

  delete req.session.data.user

  req.flash('success', 'User added')
  res.redirect(`/organisations/${req.params.organisationId}/users`)
}

/// ------------------------------------------------------------------------ ///
/// EDIT USER
/// ------------------------------------------------------------------------ ///

exports.edit_user_get = (req, res) => {
  const currentUser = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  let user
  if (req.session.data.user) {
    user = req.session.data.user
  } else {
    user = currentUser
  }

  res.render('../views/users/edit', {
    currentUser,
    user,
    actions: {
      save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
      back: `/organisations/${req.params.organisationId}/users/${req.params.userId}`,
      cancel: `/organisations/${req.params.organisationId}/users/${req.params.userId}`
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

  if (!validationHelper.isValidEmail(req.session.data.user.email)) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/users/edit', {
      user: req.session.data.user,
      actions: {
        save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
        back: `/organisations/${req.params.organisationId}/users/${req.params.userId}`,
        cancel: `/organisations/${req.params.organisationId}/users/${req.params.userId}`
      },
      errors
    })
  } else {
    // userModel.saveOne({
    //   organisationId: req.params.organisationId,
    //   userId: req.params.userId,
    //   user: req.session.data.user
    // })
    //
    // req.flash('success', 'User updated')
    res.redirect(`/organisations/${req.params.organisationId}/users/${req.params.userId}/edit/check`)
  }
}

exports.edit_user_check_get = (req, res) => {
  const currentUser = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  res.render('../views/users/check-your-answers', {
    currentUser,
    user: req.session.data.user,
    referrer: 'change',
    actions: {
      save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit/check`,
      back: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
      change: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit?referrer=change`,
      cancel: `/organisations/${req.params.organisationId}/users/${req.params.userId}`
    }
  })
}

exports.edit_user_check_post = (req, res) => {
  userModel.saveOne({
    organisationId: req.params.organisationId,
    userId: req.params.userId,
    user: req.session.data.user
  })

  delete req.session.data.user

  req.flash('success', 'User updated')
  res.redirect(`/organisations/${req.params.organisationId}/users/${req.params.userId}`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE USER
/// ------------------------------------------------------------------------ ///

exports.delete_user_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ organisationId: req.params.organisationId, userId: req.params.userId })

  res.render('../views/users/delete', {
    organisation,
    user,
    actions: {
      save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/delete`,
      back: `/organisations/${req.params.organisationId}/users/${req.params.userId}`,
      cancel: `/organisations/${req.params.organisationId}/users/${req.params.userId}`
    }
  })
}

exports.delete_user_post = (req, res) => {
  userModel.deleteOne({
    organisationId: req.params.organisationId,
    userId: req.params.userId
  })

  req.flash('success', 'User removed')
  res.redirect(`/organisations/${req.params.organisationId}/users`)
}
