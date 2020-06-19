const getNextState = require('./getNextState')
const { getFirstState, validateStateMachine } = require('./_internal')

/**
 * Creates a state machine - which is managed inside a closure - that will only transition if name of the transition you pass into it is among those registered for the current state.
 * You pass in a state machine Object and you'll have a function returned to you that can repeatedly receive a transition name and always return to you the next state (if it even changes at all).
 *
 * The current state will always match one of the keys in the state machine object.
 * Associated with those keys are each Objects that hold the possible transitions that can move that state to another one.
 *
 * So each sub-object in the state machine holds transition names as keys and _states-to-transition-to_ as values.
 * The curent state can only change if a given transition's name is among those registered for the current state.
 * Only registered transition names can produce changes to the current state.
 *
 * If you use this with Redux then you'll probably want to make the transition names match the names of Redux Action Types.
 * That way your state machine can be used in a reducer (or a piece of Redux middleware) to alter a single prop on your Redux store (representing that machine's current state).
 *
 * @function
 * @name createMachine
 * @sig {k: v} -> String -> (String -> String)
 * @throws {TypeError} If the state machine is missing or not an object
 * @throws {TypeError} If the state machine has any values which are not objects
 * @throws {TypeError} If the state machine's "sub-objects" has values that are not keys on the root of the object
 * @throws {Error} If the initialState is not one of the state values on the state machine
 * @param {Object<string, Object<string, string>>} stateMachine An Object of (only) Objects. Inside each of those Objects all values are Strings which correspond to keys on the outer Object.
 * @param {string} initialState The state at which the machine should be initialized (will default to the first key name in the state machine)
 * @returns {function} A getNextState() function that is ready to receive your transition name and return the next state (which may or not be different).
 * @example
 * const authMachine = {
 *   initial: {
 *     ATTEMPT_LOGIN: 'inProgress'
 *   },
 *   inProgress: {
 *     LOGIN_ERROR: 'error',
 *     LOGOUT_ERROR: 'error',
 *     LOGIN_SUCCESSFUL: 'loggedIn',
 *     LOGOUT_SUCCESSFUL: 'loggedOut'
 *   },
 *   loggedIn: {
 *     ATTEMPT_LOGOUT: 'inProgress'
 *   },
 *   loggedOut: {
 *     ATTEMPT_LOGIN: 'inProgress'
 *   },
 *   error: {
 *     ATTEMPT_LOGIN: 'inProgress',
 *     CLEAR_ERROR: 'loggedOut'
 *   }
 * }
 *
 * const getNextAuthState = createMachine(authMachine, 'initial')
 *
 * getNextAuthState('LOGIN_SUCCESSFUL')
 * // initial - Can't transition there yet
 * getNextAuthState('CLEAR_ERROR')
 * // initial - Also doesn't affect state
 * getNextAuthState('ATTEMPT_LOGIN')
 * // inProgress - Now we have a login attempt, which changes state
 * getNextAuthState('LOGIN_SUCCESSFUL')
 * // loggedIn - Advances from that pending state to logged-in
 * getNextAuthState('ATTEMPT_LOGOUT')
 * // inProgress - Attempting to log out
 * getNextAuthState('LOGOUT_ERROR')
 * // error - Now we're in an error state
 * getNextAuthState('CLEAR_ERROR')
 * // loggedOut - Finishes logout process
 */
function createMachine(stateMachine, initialState) {
  validateStateMachine(stateMachine)

  let currentState = getFirstState(stateMachine, initialState)

  /**
   * A simple function that retrieves the current state or optionally advances to the next state determined by a given transition value
   *
   * @function
   * @name nextState
   * @sig String -> String
   * @param {string} [transition] One of the transition names registered for the current state
   * @returns {string} The current state (one of the root-level keys from the state machine
   */
  return function nextState(transition) {
    currentState = getNextState(currentState, transition, stateMachine)
    return currentState
  }
}

module.exports = createMachine
