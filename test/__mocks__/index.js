/**
 * This is an example state machines At any given time a current state exists,
 * which corresponds to one of the keys in the machine (ie, 'initial', 'inProgress', 'loggedIn', etc.).
 *
 * That state can be transitioned _only_ by transitions specifically registered to each possible state.
 * When you list the registered transition you also simultaneously set the name of
 * the new state that transition will invoke.
 *
 * __Note__: You don't have to choose upper snake-case for the transition names, it's just
 * done so here because these state machines are specifically linked to a Redux store and middleware flow.
 * The transition names here match Redux action types, and the `currentState` is
 * a single prop that appears in the sections of the Redux store for `auth` and `termsOfService`.
 */
export default {
  auth: {
    initial: {
      ATTEMPT_LOGIN: 'inProgress'
    },
    inProgress: {
      LOGIN_ERROR: 'error',
      LOGOUT_ERROR: 'error',
      LOGIN_SUCCESSFUL: 'loggedIn',
      LOGOUT_SUCCESSFUL: 'loggedOut'
    },
    loggedIn: {
      ATTEMPT_LOGOUT: 'inProgress'
    },
    loggedOut: {
      ATTEMPT_LOGIN: 'inProgress'
    },
    error: {
      ATTEMPT_LOGIN: 'inProgress',
      CLEAR_ERROR: 'loggedOut'
    }
  },
  termsOfService: {
    initial: {
      AGREE_TO_TERMS: 'agreed',
      REJECTED_TERMS: 'rejected'
    },
    agreed: {},
    rejected: {}
  }
}
