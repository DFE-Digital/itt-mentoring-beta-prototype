//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const settings = require('./data/dist/settings')

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

/// ------------------------------------------------------------------------ ///
/// File uploads
/// ------------------------------------------------------------------------ ///
const path = require('path')
const multer = require('multer')

// create a separate storage variable for each type of file
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, 'uploads'))
  },
  filename:  (req, file, callback) => {
    const uniqueSuffix = new Date()
    callback(null, file.fieldname + '-' + uniqueSuffix.toISOString() + '.csv')
  }
})

const upload = multer({
  storage
  // ,
  // fileFilter: (req, file, callback) => {
  //   if (file.mimetype === 'text/csv') {
  //     callback(null, true)
  //   } else {
  //     return callback(new Error('Invalid mimetype'))
  //   }
  // }
})

/// ------------------------------------------------------------------------ ///
/// Controller modules
/// ------------------------------------------------------------------------ ///
const accountController = require('./controllers/account')
const authenticationController = require('./controllers/authentication')
const claimController = require('./controllers/claims')
const contentController = require('./controllers/content')
const errorController = require('./controllers/errors')
const feedbackController = require('./controllers/feedback')
const mentorController = require('./controllers/mentors')
const organisationController = require('./controllers/organisations')
const settingController = require('./controllers/settings')
const userController = require('./controllers/users')

const supportOrganisationController = require('./controllers/support/organisations')
const supportOrganisationClaimController = require('./controllers/support/organisations/claims')
const supportOrganisationMentorController = require('./controllers/support/organisations/mentors')
const supportOrganisationUserController = require('./controllers/support/organisations/users')
const supportUserController = require('./controllers/support/users')
const supportClaimController = require('./controllers/support/claims')

const supportPaymentController = require('./controllers/support/payments')
const supportSamplingController = require('./controllers/support/sampling')
const supportClawbackController = require('./controllers/support/clawbacks')
const supportActivityController = require('./controllers/support/activity')

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
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only

  for (let settingName of Object.keys(settings)) {
    res.locals[settingName] = settings[settingName]
  }

  next()
})

router.get('/', (req, res) => {
  if (settings.showStartPage === 'true' || process.env.SHOW_START_PAGE === 'true') {
    res.render('start')
  } else {
    res.redirect('/sign-in')
  }
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

router.get('/organisations/:organisationId/conditions', checkIsAuthenticated, organisationController.organisation_conditions_get)
router.post('/organisations/:organisationId/conditions', checkIsAuthenticated, organisationController.organisation_conditions_post)

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
/// MENTOR ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/mentors/new', checkIsAuthenticated, mentorController.new_mentor_get)
router.post('/organisations/:organisationId/mentors/new', checkIsAuthenticated, mentorController.new_mentor_post)

router.get('/organisations/:organisationId/mentors/new/check', checkIsAuthenticated, mentorController.new_mentor_check_get)
router.post('/organisations/:organisationId/mentors/new/check', checkIsAuthenticated, mentorController.new_mentor_check_post)

router.get('/organisations/:organisationId/mentors/:mentorId/delete', checkIsAuthenticated, mentorController.delete_mentor_get)
router.post('/organisations/:organisationId/mentors/:mentorId/delete', checkIsAuthenticated, mentorController.delete_mentor_post)

router.get('/organisations/:organisationId/mentors/:mentorId', checkIsAuthenticated, mentorController.mentor_details)

router.get('/organisations/:organisationId/mentors', checkIsAuthenticated, mentorController.mentor_list)

/// ------------------------------------------------------------------------ ///
/// CLAIM ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/claims/new', checkIsAuthenticated, claimController.new_claim_get)
router.post('/organisations/:organisationId/claims/new', checkIsAuthenticated, claimController.new_claim_post)

router.get('/organisations/:organisationId/claims/new/choose', checkIsAuthenticated, claimController.new_choose_provider_get)
router.post('/organisations/:organisationId/claims/new/choose', checkIsAuthenticated, claimController.new_choose_provider_post)

router.get('/organisations/:organisationId/claims/new/mentors', checkIsAuthenticated, claimController.new_claim_mentors_get)
router.post('/organisations/:organisationId/claims/new/mentors', checkIsAuthenticated, claimController.new_claim_mentors_post)

router.get('/organisations/:organisationId/claims/new/hours', checkIsAuthenticated, claimController.new_claim_hours_get)
router.post('/organisations/:organisationId/claims/new/hours', checkIsAuthenticated, claimController.new_claim_hours_post)

router.get('/organisations/:organisationId/claims/new/check', checkIsAuthenticated, claimController.new_claim_check_get)
router.post('/organisations/:organisationId/claims/new/check', checkIsAuthenticated, claimController.new_claim_check_post)

router.get('/organisations/:organisationId/claims/new/rejection', checkIsAuthenticated, claimController.new_claim_rejection_get)

router.get('/organisations/:organisationId/claims/:claimId/confirmation', checkIsAuthenticated, claimController.new_claim_confirmation_get)

router.get('/organisations/:organisationId/claims/:claimId/check', checkIsAuthenticated, claimController.edit_claim_check_get)
router.post('/organisations/:organisationId/claims/:claimId/check', checkIsAuthenticated, claimController.edit_claim_check_post)

router.get('/organisations/:organisationId/claims/:claimId/delete', checkIsAuthenticated, claimController.delete_claim_get)
router.post('/organisations/:organisationId/claims/:claimId/delete', checkIsAuthenticated, claimController.delete_claim_post)

router.get('/organisations/:organisationId/claims/:claimId', checkIsAuthenticated, claimController.show_claim_get)

router.get('/organisations/:organisationId/claims', checkIsAuthenticated, claimController.claim_list)

/// ------------------------------------------------------------------------ ///
/// ------------------------------------------------------------------------ ///
/// SUPPORT ROUTES
/// ------------------------------------------------------------------------ ///
/// ------------------------------------------------------------------------ ///

/// ------------------------------------------------------------------------ ///
/// SUPPORT - ORGANISATION USER ROUTES
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
/// SUPPORT - ORGANISATION MENTOR ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/organisations/:organisationId/mentors/new', checkIsAuthenticated, supportOrganisationMentorController.new_mentor_get)
router.post('/support/organisations/:organisationId/mentors/new', checkIsAuthenticated, supportOrganisationMentorController.new_mentor_post)

router.get('/support/organisations/:organisationId/mentors/new/check', checkIsAuthenticated, supportOrganisationMentorController.new_mentor_check_get)
router.post('/support/organisations/:organisationId/mentors/new/check', checkIsAuthenticated, supportOrganisationMentorController.new_mentor_check_post)

router.get('/support/organisations/:organisationId/mentors/:mentorId/delete', checkIsAuthenticated, supportOrganisationMentorController.delete_mentor_get)
router.post('/support/organisations/:organisationId/mentors/:mentorId/delete', checkIsAuthenticated, supportOrganisationMentorController.delete_mentor_post)

router.get('/support/organisations/:organisationId/mentors/:mentorId', checkIsAuthenticated, supportOrganisationMentorController.mentor_details)

router.get('/support/organisations/:organisationId/mentors', checkIsAuthenticated, supportOrganisationMentorController.mentor_list)

/// ------------------------------------------------------------------------ ///
/// SUPPORT - ORGANISATION CLAIM ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/organisations/:organisationId/claims/new', checkIsAuthenticated, supportOrganisationClaimController.new_claim_get)
router.post('/support/organisations/:organisationId/claims/new', checkIsAuthenticated, supportOrganisationClaimController.new_claim_post)

router.get('/support/organisations/:organisationId/claims/new/mentors', checkIsAuthenticated, supportOrganisationClaimController.new_claim_mentors_get)
router.post('/support/organisations/:organisationId/claims/new/mentors', checkIsAuthenticated, supportOrganisationClaimController.new_claim_mentors_post)

router.get('/support/organisations/:organisationId/claims/new/hours', checkIsAuthenticated, supportOrganisationClaimController.new_claim_hours_get)
router.post('/support/organisations/:organisationId/claims/new/hours', checkIsAuthenticated, supportOrganisationClaimController.new_claim_hours_post)

router.get('/support/organisations/:organisationId/claims/new/check', checkIsAuthenticated, supportOrganisationClaimController.new_claim_check_get)
router.post('/support/organisations/:organisationId/claims/new/check', checkIsAuthenticated, supportOrganisationClaimController.new_claim_check_post)

router.get('/support/organisations/:organisationId/claims/:claimId/delete', checkIsAuthenticated, supportOrganisationClaimController.delete_claim_get)
router.post('/support/organisations/:organisationId/claims/:claimId/delete', checkIsAuthenticated, supportOrganisationClaimController.delete_claim_post)

router.get('/support/organisations/:organisationId/claims/:claimId', checkIsAuthenticated, supportOrganisationClaimController.show_claim_get)

router.get('/support/organisations/:organisationId/claims', checkIsAuthenticated, supportOrganisationClaimController.claim_list)

/// ------------------------------------------------------------------------ ///
/// SUPPORT - CLAIM ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/claims/payments', checkIsAuthenticated, supportPaymentController.list_claims_get)

router.get('/support/claims/payments/remove-status-filter/:status', checkIsAuthenticated, supportPaymentController.removeStatusFilter)
router.get('/support/claims/payments/remove-school-filter/:school', checkIsAuthenticated, supportPaymentController.removeSchoolFilter)
router.get('/support/claims/payments/remove-provider-filter/:provider', checkIsAuthenticated, supportPaymentController.removeProviderFilter)

router.get('/support/claims/payments/remove-all-filters', checkIsAuthenticated, supportPaymentController.removeAllFilters)

router.get('/support/claims/payments/remove-keyword-search', checkIsAuthenticated, supportPaymentController.removeKeywordSearch)

router.get('/support/claims/payments/send', checkIsAuthenticated, supportPaymentController.send_claims_get)
router.post('/support/claims/payments/send', checkIsAuthenticated, supportPaymentController.send_claims_post)

router.get('/support/claims/payments/response', checkIsAuthenticated, supportPaymentController.response_claims_get)
// the upload.single('payments') middleware uses the form field file name
router.post('/support/claims/payments/response', checkIsAuthenticated, upload.single('payments'), supportPaymentController.response_claims_post)

router.get('/support/claims/payments/review', checkIsAuthenticated, supportPaymentController.review_claims_get)
router.post('/support/claims/payments/review', checkIsAuthenticated, supportPaymentController.review_claims_post)

router.get('/support/claims/payments/download', checkIsAuthenticated, supportPaymentController.download_claims_get)
router.post('/support/claims/payments/download', checkIsAuthenticated, supportPaymentController.download_claims_post)

router.get('/support/claims/payments/:claimId', checkIsAuthenticated, supportPaymentController.show_claim_get)

router.get('/support/claims/payments/:claimId/status/:claimStatus', checkIsAuthenticated, supportPaymentController.update_claim_status_get)
router.post('/support/claims/payments/:claimId/status/:claimStatus', checkIsAuthenticated, supportPaymentController.update_claim_status_post)

/// ------------------------------------------------------------------------ ///

router.get('/support/claims/sampling', checkIsAuthenticated, supportSamplingController.list_claims_get)

router.get('/support/claims/sampling/remove-status-filter/:status', checkIsAuthenticated, supportSamplingController.removeStatusFilter)
router.get('/support/claims/sampling/remove-school-filter/:school', checkIsAuthenticated, supportSamplingController.removeSchoolFilter)
router.get('/support/claims/sampling/remove-provider-filter/:provider', checkIsAuthenticated, supportSamplingController.removeProviderFilter)

router.get('/support/claims/sampling/remove-all-filters', checkIsAuthenticated, supportSamplingController.removeAllFilters)

router.get('/support/claims/sampling/remove-keyword-search', checkIsAuthenticated, supportSamplingController.removeKeywordSearch)

router.get('/support/claims/sampling/upload', checkIsAuthenticated, supportSamplingController.upload_claims_get)
// the upload.single('sample') middleware uses the form field file name
router.post('/support/claims/sampling/upload', checkIsAuthenticated, upload.single('sample'), supportSamplingController.upload_claims_post)

router.get('/support/claims/sampling/upload/review', checkIsAuthenticated, supportSamplingController.review_upload_claims_get)
router.post('/support/claims/sampling/upload/review', checkIsAuthenticated, supportSamplingController.review_upload_claims_post)

router.get('/support/claims/sampling/response', checkIsAuthenticated, supportSamplingController.response_claims_get)
// the upload.single('response') middleware uses the form field file name
router.post('/support/claims/sampling/response', checkIsAuthenticated, upload.single('response'), supportSamplingController.response_claims_post)

router.get('/support/claims/sampling/response/review', checkIsAuthenticated, supportSamplingController.review_response_claims_get)
router.post('/support/claims/sampling/response/review', checkIsAuthenticated, supportSamplingController.review_response_claims_post)

router.get('/support/claims/sampling/download', checkIsAuthenticated, supportSamplingController.download_claims_get)
router.post('/support/claims/sampling/download', checkIsAuthenticated, supportSamplingController.download_claims_post)

router.get('/support/claims/sampling/:claimId', checkIsAuthenticated, supportSamplingController.show_claim_get)

router.get('/support/claims/sampling/:claimId/status/:claimStatus', checkIsAuthenticated, supportSamplingController.update_claim_status_get)
router.post('/support/claims/sampling/:claimId/status/:claimStatus', checkIsAuthenticated, supportSamplingController.update_claim_status_post)

/// ------------------------------------------------------------------------ ///

router.get('/support/claims/clawbacks', checkIsAuthenticated, supportClawbackController.list_claims_get)

router.get('/support/claims/clawbacks/remove-status-filter/:status', checkIsAuthenticated, supportClawbackController.removeStatusFilter)
router.get('/support/claims/clawbacks/remove-school-filter/:school', checkIsAuthenticated, supportClawbackController.removeSchoolFilter)
router.get('/support/claims/clawbacks/remove-provider-filter/:provider', checkIsAuthenticated, supportClawbackController.removeProviderFilter)

router.get('/support/claims/clawbacks/remove-all-filters', checkIsAuthenticated, supportClawbackController.removeAllFilters)

router.get('/support/claims/clawbacks/remove-keyword-search', checkIsAuthenticated, supportClawbackController.removeKeywordSearch)

router.get('/support/claims/clawbacks/send', checkIsAuthenticated, supportClawbackController.send_claims_get)
router.post('/support/claims/clawbacks/send', checkIsAuthenticated, supportClawbackController.send_claims_post)

router.get('/support/claims/clawbacks/response', checkIsAuthenticated, supportClawbackController.response_claims_get)
// the upload.single('response') middleware uses the form field file name
router.post('/support/claims/clawbacks/response', checkIsAuthenticated, upload.single('response'), supportClawbackController.response_claims_post)

router.get('/support/claims/clawbacks/response/review', checkIsAuthenticated, supportClawbackController.review_response_claims_get)
router.post('/support/claims/clawbacks/response/review', checkIsAuthenticated, supportClawbackController.review_response_claims_post)

router.get('/support/claims/clawbacks/download', checkIsAuthenticated, supportClawbackController.download_claims_get)
router.post('/support/claims/clawbacks/download', checkIsAuthenticated, supportClawbackController.download_claims_post)

router.get('/support/claims/clawbacks/:claimId', checkIsAuthenticated, supportClawbackController.show_claim_get)

router.get('/support/claims/clawbacks/:claimId/request', checkIsAuthenticated, supportClawbackController.request_clawback_get)
router.post('/support/claims/clawbacks/:claimId/request', checkIsAuthenticated, supportClawbackController.request_clawback_post)

router.get('/support/claims/clawbacks/:claimId/request/check', checkIsAuthenticated, supportClawbackController.check_clawback_request_get)
router.post('/support/claims/clawbacks/:claimId/request/check', checkIsAuthenticated, supportClawbackController.check_clawback_request_post)

router.get('/support/claims/clawbacks/:claimId/status/:claimStatus', checkIsAuthenticated, supportClawbackController.update_claim_status_get)
router.post('/support/claims/clawbacks/:claimId/status/:claimStatus', checkIsAuthenticated, supportClawbackController.update_claim_status_post)

/// ------------------------------------------------------------------------ ///

router.get('/support/claims/activity', checkIsAuthenticated, supportActivityController.list_activity_get)

/// ------------------------------------------------------------------------ ///

router.get('/support/claims/download', checkIsAuthenticated, supportClaimController.download_claims_get)

router.get('/support/claims/remove-status-filter/:status', checkIsAuthenticated, supportClaimController.removeStatusFilter)
router.get('/support/claims/remove-school-filter/:school', checkIsAuthenticated, supportClaimController.removeSchoolFilter)
router.get('/support/claims/remove-provider-filter/:provider', checkIsAuthenticated, supportClaimController.removeProviderFilter)

router.get('/support/claims/remove-all-filters', checkIsAuthenticated, supportClaimController.removeAllFilters)

router.get('/support/claims/remove-keyword-search', checkIsAuthenticated, supportClaimController.removeKeywordSearch)

router.get('/support/claims/:claimId', checkIsAuthenticated, supportClaimController.show_claim_get)

router.get('/support/claims', checkIsAuthenticated, supportClaimController.list_claims_get)

/// ------------------------------------------------------------------------ ///
/// SUPPORT - USER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/users/new', checkIsAuthenticated, supportUserController.new_user_get)
router.post('/support/users/new', checkIsAuthenticated, supportUserController.new_user_post)

router.get('/support/users/new/check', checkIsAuthenticated, supportUserController.new_user_check_get)
router.post('/support/users/new/check', checkIsAuthenticated, supportUserController.new_user_check_post)

router.get('/support/users/:userId/edit', checkIsAuthenticated, supportUserController.edit_user_get)
router.post('/support/users/:userId/edit', checkIsAuthenticated, supportUserController.edit_user_post)

router.get('/support/users/:userId/edit/check', checkIsAuthenticated, supportUserController.edit_user_check_get)
router.post('/support/users/:userId/edit/check', checkIsAuthenticated, supportUserController.edit_user_check_post)

router.get('/support/users/:userId/delete', checkIsAuthenticated, supportUserController.delete_user_get)
router.post('/support/users/:userId/delete', checkIsAuthenticated, supportUserController.delete_user_post)

router.get('/support/users/:userId', checkIsAuthenticated, supportUserController.user_details)

router.get('/support/users', checkIsAuthenticated, supportUserController.user_list)

/// ------------------------------------------------------------------------ ///
/// SUPPORT - ORGANISATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/support/organisations/new', checkIsAuthenticated, supportOrganisationController.new_get)
router.post('/support/organisations/new', checkIsAuthenticated, supportOrganisationController.new_post)

router.get('/support/organisations/new/provider', checkIsAuthenticated, supportOrganisationController.new_provider_get)
router.post('/support/organisations/new/provider', checkIsAuthenticated, supportOrganisationController.new_provider_post)

router.get('/support/organisations/new/provider/choose', checkIsAuthenticated, supportOrganisationController.new_choose_provider_get)
router.post('/support/organisations/new/provider/choose', checkIsAuthenticated, supportOrganisationController.new_choose_provider_post)

router.get('/support/organisations/new/school', checkIsAuthenticated, supportOrganisationController.new_school_get)
router.post('/support/organisations/new/school', checkIsAuthenticated, supportOrganisationController.new_school_post)

router.get('/support/organisations/new/school/choose', checkIsAuthenticated, supportOrganisationController.new_choose_school_get)
router.post('/support/organisations/new/school/choose', checkIsAuthenticated, supportOrganisationController.new_choose_school_post)

router.get('/support/organisations/new/check', checkIsAuthenticated, supportOrganisationController.new_check_get)
router.post('/support/organisations/new/check', checkIsAuthenticated, supportOrganisationController.new_check_post)

// router.get('/', checkIsAuthenticated, (req, res) => {
//   res.redirect('/organisations')
// })

router.get('/support/organisations/remove-organisationType-filter/:organisationType', checkIsAuthenticated, supportOrganisationController.removeOrganisationTypeFilter)

router.get('/support/organisations/remove-all-filters', checkIsAuthenticated, supportOrganisationController.removeAllFilters)

router.get('/support/organisations/remove-keyword-search', checkIsAuthenticated, supportOrganisationController.removeKeywordSearch)

router.get('/support/organisations/:organisationId/remove-agreement-grant-conditions', checkIsAuthenticated, supportOrganisationController.remove_organisation_agreement_get)
router.post('/support/organisations/:organisationId/remove-agreement-grant-conditions', checkIsAuthenticated, supportOrganisationController.remove_organisation_agreement_post)

router.get('/support/organisations/:organisationId/delete', checkIsAuthenticated, supportOrganisationController.delete_organisation_get)
router.post('/support/organisations/:organisationId/delete', checkIsAuthenticated, supportOrganisationController.delete_organisation_post)

router.get('/support/organisations/:organisationId', checkIsAuthenticated, supportOrganisationController.show_organisation_get)

router.get('/support/organisations', checkIsAuthenticated, supportOrganisationController.list_organisations_get)

/// ------------------------------------------------------------------------ ///
/// GENERAL ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/settings', settingController.settings_form_get)
router.post('/settings', settingController.settings_form_post)

router.get('/settings/reset-data', settingController.reset_data_get)
router.post('/settings/reset-data', settingController.reset_data_post)

router.get('/feedback', feedbackController.feedback_form_get)
router.post('/feedback', feedbackController.feedback_form_post)

router.get('/feedback/confirmation', feedbackController.feedback_confirmation_get)

router.get('/accessibility', contentController.accessibility)

router.get('/cookies', contentController.cookies)

router.get('/privacy', contentController.privacy)

router.get('/terms', contentController.terms)

router.get('/grant-conditions', contentController.grant)

router.get('/404', checkIsAuthenticated, errorController.page_not_found)

router.get('/500', errorController.unexpected_error)

router.get('/503', errorController.service_unavailable)

router.get('/unauthorised', errorController.unauthorised)

router.get('/account-not-recognised', errorController.account_not_recognised)

router.get('/account-no-organisation', errorController.account_no_organisation)

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/provider-suggestions', organisationController.provider_suggestions_json)

router.get('/school-suggestions', organisationController.school_suggestions_json)
