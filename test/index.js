import test from 'tape'
import createMachine, {getNextState} from '../src'
import machines from './__mocks__'

test('Simple state machine with an initial state and two unrecoverable states they can transition into', t => {
  let currentState = 'initial'
  t.equal(
    getNextState(currentState, 'AGREE_TO_TERMS', machines.termsOfService),
    'agreed',
    'can transition from "initial" via "AGREE_TO_TERMS" transition'
  )

  t.equal(
    getNextState(currentState, 'REJECTED_TERMS', machines.termsOfService),
    'rejected',
    'can transition from "initial" via "REJECT_TERMS" transition'
  )

  currentState = 'agreed'
  t.equal(
    getNextState(currentState, 'REJECTED_TERMS', machines.termsOfService),
    'agreed',
    'cannot transition from "agreed" via "REJECT_TERMS" transition'
  )
  t.end()
})

test('Creating a machine and re-using the getNextState() function it returns', t => {
  const getNextAuthState = createMachine(machines.auth)
  t.equal(getNextAuthState(), 'initial', 'initialized to first key of "initial"')

  t.equal(
    getNextAuthState('LOGOUT_SUCCESSFUL'),
    'initial',
    'cannot leave "initial" via an unregistered transition'
  )
  t.equal(
    getNextAuthState('LOGIN_SUCCESSFUL'),
    'initial',
    'cannot leave "initial" via an unregistered transition "LOGIN_SUCCESSFUL"'
  )
  t.equal(
    getNextAuthState('CLEAR_ERROR'),
    'initial',
    'cannot leave "initial" via an unregistered transition "CLEAR_ERROR"'
  )
  t.equal(
    getNextAuthState('ATTEMPT_LOGIN'),
    'inProgress',
    'able to transition from "initial" to "inProgress" via a registered transition of "ATTEMPT_LOGIN"'
  )
  t.equal(
    getNextAuthState('ATTEMPT_LOGOUT'),
    'inProgress',
    'cannot leave "inProgress" via an unregistered transition "ATTEMPT_LOGOUT"'
  )
  t.equal(
    getNextAuthState('LOGIN_ERROR'),
    'error',
    'transitions to an "error" state via a registered transition "LOGIN_ERROR"'
  )
  t.equal(
    getNextAuthState('ATTEMPT_LOGIN'),
    'inProgress',
    'can re-attempt login to return to a state of "inProgress" via the transition of "ATTEMPT_LOGIN"'
  )
  t.equal(
    getNextAuthState('LOGIN_SUCCESSFUL'),
    'loggedIn',
    'advanced to a state of "loggedIn" via the registered "LOGIN_SUCCESSFUL" transition'
  )
  t.equal(
    getNextAuthState('LOGOUT_SUCCESSFUL'),
    'loggedIn',
    'a transition of "LOGOUT_SUCCESSFUL" makes no sense because no "ATTEMPT_LOGOUT" precursor ever occurred'
  )
  t.equal(
    getNextAuthState('ATTEMPT_LOGOUT'),
    'inProgress',
    'attempting to logout via the "ATTEMPT_LOGOUT" transition, which returns us to the state of "inProgress"'
  )
  t.equal(
    getNextAuthState('LOGOUT_SUCCESSFUL'),
    'loggedOut',
    'now the "LOGOUT_SUCCESSFUL" transition would occur, moving us to a state of "loggedOut"'
  )
  t.equal(
    getNextAuthState('LOGIN_SUCCESSFUL'),
    'loggedOut',
    'cannot leave "loggedOut" without the necessary pre-cursor transition of "ATTEMPT_LOGIN"'
  )
  t.end()
})
