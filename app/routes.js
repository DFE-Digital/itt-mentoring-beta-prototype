//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const settings = require('./data/settings')

/// ------------------------------------------------------------------------ ///
/// Flash messaging
/// ------------------------------------------------------------------------ ///
const flash = require('connect-flash')
router.use(flash())

/// ------------------------------------------------------------------------ ///
/// User authentication
/// ------------------------------------------------------------------------ ///
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const authenticationModel = require('./models/authentication')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// Authentication
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = authenticationModel.findOne({
      username: username,
      password: password,
      active: true
    })
    if (user) { return done(null, user) }
    return done(null, false)
  }
))

router.use(passport.initialize())
router.use(passport.session())

// Controller modules
const accountController = require('./controllers/account')
const authenticationController = require('./controllers/authentication')
const contentController = require('./controllers/content')
const organisationController = require('./controllers/organisations')
const userController = require('./controllers/users')

const supportOrganisationController = require('./controllers/support/organisations')
const supportOrganisationUserController = require('./controllers/support/organisation-users')

// Authentication middleware
const checkIsAuthenticated = (req, res, next) => {
  if (req.session.passport) {
    // the signed in user
    res.locals.passport = req.session.passport

    // the base URL for navigation
    if (req.session.passport.user?.type === 'support') {
      res.locals.baseUrl = `/support/organisations/${req.params.organisationId}`
    } else {
      res.locals.baseUrl = `/organisations/${req.params.organisationId}`
    }

    next()
  } else {
    delete req.session.data
    res.redirect('/sign-in')
  }
}

/// ------------------------------------------------------------------------ ///
/// ALL ROUTES
/// ------------------------------------------------------------------------ ///

router.all('*', (req, res, next) => {
  res.locals.settings = settings
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

/// ------------------------------------------------------------------------ ///
/// AUTHENTICATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/sign-in', authenticationController.sign_in_get)
router.post('/sign-in', passport.authenticate('local', {
  successRedirect: '/auth',
  failureRedirect: '/sign-in',
  failureFlash: 'Enter valid sign-in details'
}))

router.get('/auth', authenticationController.auth_get)

router.get('/sign-out', authenticationController.sign_out_get)

router.get('/register', authenticationController.register_get)
router.post('/register', authenticationController.register_post)

router.get('/confirm-email', authenticationController.confirm_email_get)
router.post('/confirm-email', authenticationController.confirm_email_post)

router.get('/resend-code', authenticationController.resend_code_get)
router.post('/resend-code', authenticationController.resend_code_post)

router.get('/forgotten-password', authenticationController.forgotten_password_get)
router.post('/forgotten-password', authenticationController.forgotten_password_post)

router.get('/verification-code', authenticationController.verification_code_get)
router.post('/verification-code', authenticationController.verification_code_post)

router.get('/create-password', authenticationController.create_password_get)
router.post('/create-password', authenticationController.create_password_post)

router.get('/password-reset', authenticationController.password_reset_get)
router.post('/password-reset', authenticationController.password_reset_post)

router.get('/registration-complete', authenticationController.registration_complete_get)

router.get('/terms-and-conditions', authenticationController.terms_and_conditions_get)

/// ------------------------------------------------------------------------ ///
/// YOUR ACCOUNT ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/account', checkIsAuthenticated, accountController.user_account)

/// ------------------------------------------------------------------------ ///
/// ORGANISATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/details', checkIsAuthenticated, organisationController.show_organisation_get)

router.get('/organisations/:organisationId', checkIsAuthenticated, organisationController.organisation)

router.get('/organisations', checkIsAuthenticated, organisationController.list_organisations_get)

router.get('/', checkIsAuthenticated, (req, res) => {
  if (req.session.passport.user?.type === 'support') {
    res.redirect('/support/organisations')
  } else {
    res.redirect('/organisations')
  }
})

/// ------------------------------------------------------------------------ ///
/// USER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_user_get)
router.post('/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_user_post)

router.get('/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_user_check_get)
router.post('/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_user_check_post)

router.get('/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_user_get)
router.post('/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_user_post)

router.get('/organisations/:organisationId/users/:userId/edit/check', checkIsAuthenticated, userController.edit_user_check_get)
router.post('/organisations/:organisationId/users/:userId/edit/check', checkIsAuthenticated, userController.edit_user_check_post)

router.get('/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_user_get)
router.post('/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_user_post)

router.get('/organisations/:organisationId/users/:userId', checkIsAuthenticated, userController.user_details)

router.get('/organisations/:organisationId/users', checkIsAuthenticated, userController.user_list)


/// ------------------------------------------------------------------------ ///
/// ------------------------------------------------------------------------ ///
/// SUPPORT ROUTES
/// ------------------------------------------------------------------------ ///
/// ------------------------------------------------------------------------ ///

/// ------------------------------------------------------------------------ ///
/// SUPPORT - USER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/organisations/:organisationId/users/new', checkIsAuthenticated, supportOrganisationUserController.new_user_get)
router.post('/support/organisations/:organisationId/users/new', checkIsAuthenticated, supportOrganisationUserController.new_user_post)

router.get('/support/organisations/:organisationId/users/new/check', checkIsAuthenticated, supportOrganisationUserController.new_user_check_get)
router.post('/support/organisations/:organisationId/users/new/check', checkIsAuthenticated, supportOrganisationUserController.new_user_check_post)

router.get('/support/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, supportOrganisationUserController.edit_user_get)
router.post('/support/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, supportOrganisationUserController.edit_user_post)

router.get('/support/organisations/:organisationId/users/:userId/edit/check', checkIsAuthenticated, supportOrganisationUserController.edit_user_check_get)
router.post('/support/organisations/:organisationId/users/:userId/edit/check', checkIsAuthenticated, supportOrganisationUserController.edit_user_check_post)

router.get('/support/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, supportOrganisationUserController.delete_user_get)
router.post('/support/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, supportOrganisationUserController.delete_user_post)

router.get('/support/organisations/:organisationId/users/:userId', checkIsAuthenticated, supportOrganisationUserController.user_details)

router.get('/support/organisations/:organisationId/users', checkIsAuthenticated, supportOrganisationUserController.user_list)

/// ------------------------------------------------------------------------ ///
/// SUPPORT - ORGANISATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/organisations/new', checkIsAuthenticated, supportOrganisationController.new_get)
router.post('/support/organisations/new', checkIsAuthenticated, supportOrganisationController.new_post)

router.get('/support/organisations/new/provider', checkIsAuthenticated, supportOrganisationController.new_provider_get)
router.post('/support/organisations/new/provider', checkIsAuthenticated, supportOrganisationController.new_provider_post)

router.get('/support/organisations/new/school', checkIsAuthenticated, supportOrganisationController.new_school_get)
router.post('/support/organisations/new/school', checkIsAuthenticated, supportOrganisationController.new_school_post)

router.get('/support/organisations/new/check', checkIsAuthenticated, supportOrganisationController.new_check_get)
router.post('/support/organisations/new/check', checkIsAuthenticated, supportOrganisationController.new_check_post)

// router.get('/', checkIsAuthenticated, (req, res) => {
//   res.redirect('/organisations')
// })

router.get('/support/organisations/remove-organisationType-filter/:organisationType', checkIsAuthenticated, supportOrganisationController.removeOrganisationTypeFilter)

router.get('/support/organisations/remove-all-filters', checkIsAuthenticated, supportOrganisationController.removeAllFilters)

router.get('/support/organisations/remove-keyword-search', checkIsAuthenticated, supportOrganisationController.removeKeywordSearch)

router.get('/support/organisations/:organisationId', checkIsAuthenticated, supportOrganisationController.show_organisation_get)

router.get('/support/organisations', checkIsAuthenticated, supportOrganisationController.list_organisations_get)

/// ------------------------------------------------------------------------ ///
/// GENERAL ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/accessibility', contentController.accessibility)

router.get('/cookies', contentController.cookies)

router.get('/privacy', contentController.privacy)

router.get('/terms', contentController.terms)

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/provider-suggestions', organisationController.provider_suggestions_json)

router.get('/school-suggestions', organisationController.school_suggestions_json)
