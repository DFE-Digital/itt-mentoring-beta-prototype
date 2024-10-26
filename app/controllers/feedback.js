const validationHelper = require('../helpers/validators')

exports.feedback_form_get = (req, res) => {
  res.render('../views/feedback/index', {
    wordCount: 200,
    actions: {
      save: '/feedback',
      home: '/organisations'
    }
  })
}

exports.feedback_form_post = (req, res) => {
  const errors = []
  const wordCount = 200

  if (!req.session.data.feedback?.satisfaction) {
    const error = {}
    error.fieldName = 'satisfaction'
    error.href = '#feedback-satisfaction'
    error.text = 'Select how you feel about this service'
    errors.push(error)
  }

  if (!req.session.data.feedback?.details.length) {
    const error = {}
    error.fieldName = 'details'
    error.href = '#feedback-details'
    error.text = 'Enter details about how we could improve this service'
    errors.push(error)
  } else if (!validationHelper.isValidWordCount(req.session.data.feedback.details, wordCount)) {
    const error = {}
    error.fieldName = 'details'
    error.href = '#feedback-details'
    error.text = `Details must be ${wordCount} words or fewer`
    errors.push(error)
  }

  if (req.session.data.feedback?.email &&
    !validationHelper.isValidEmail(req.session.data.feedback.email)) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#feedback-email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/feedback/index', {
      wordCount,
      actions: {
        save: '/feedback',
        home: '/organisations'
      },
      errors
    })
  } else {
    res.redirect('/feedback/confirmation')
  }
}

exports.feedback_confirmation_get = (req, res) => {
  delete req.session.data.feedback
  res.render('../views/feedback/confirmation', {
    actions: {
      home: '/organisations'
    }
  })
}
