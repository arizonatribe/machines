function _isObject(val) {
  return !!val && typeof val === 'object' && typeof val.length === 'undefined'
}

function _allValuesAreObjects(obj = {}) {
  return Object.keys(obj).every(k => _isObject(obj[k]))
}

function _allValuesFromTransitionsAreStates(obj = {}) {
  const isInMachine = transitionState => Object.prototype.hasOwnProperty.call(obj, transitionState)
  return Object
    .keys(obj)
    .map(state => obj[state])
    .every(transitions => Object.keys(transitions).every(tstate => isInMachine(tstate)))
}


/**
 * Compares a current state value to a transition name, using a state machine
 * (Object) where all the possible states also have transition names registered
 * to each one (which link to new states).
 * Invoking this function will make that calculation and always return to you
 * what the next state should be (which may be un-changed).
 * This function is used by `createMachine()`.
 *
 * @func
 * @sig String -> String -> {k: v} -> String
 * @param {String} currentState The current state - which matches one of the keys in the 'stateMachine'
 * @param {String} transitionName A string value that will cause a state change
 * _if_ it matches the key name of one (or more) of the sub-objects in the 'stateMachine'
 * @param {Object} stateMachine An Object of (only) Objects. Inside each of
 * those Objects all values are Strings which correspond to keys on the outer Object.
 * @returns {String} The next state (which might not have changed from the current state)
 */
export function getNextState(currentState, transitionName, stateMachine = {}) {
  const registeredTransitions = stateMachine[currentState]
  if (!registeredTransitions) return currentState
  const possibleNewState = registeredTransitions[transitionName]
  return possibleNewState || currentState
}

/**
 * Creates a state machine - which is managed inside a closure - that will only transition
 * if name of the transition you pass into it is among those registered for the current state.
 * You pass in a state machine Object and you'll have a function returned to you
 * that can repeatedly receive a transition name and always return to you the next state
 * (if it even changes at all).
 *
 * The current state will always match one of the keys in the state machine object.
 * Associated with those keys are each Objects that hold the possible transitions
 * that can move that state to another one.
 *
 * So each sub-object in the state machine holds transition names as keys and _states-to-transition-to_ as values.
 * The curent state can only change if a given transition's name is among those registered for the current state.
 * Only registered transition names can produce changes to the current state.
 *
 * If you use this with Redux then you'll probably want to make the transition names match
 * the names of Redux Action Types.
 * That way your state machine can be used in a reducer (or a piece of Redux middleware)
 * to alter a single prop on your Redux store (representing that machine's current state).
 *
 * @func
 * @sig {k: v} -> String -> (String -> String)
 * @param {Object} stateMachine An Object of (only) Objects. Inside each of
 * those Objects all values are Strings which correspond to keys on the outer Object.
 * @param {String} initialState The state at which the machine should be initialized
 * (will default to the first key name in the state machine)
 * @returns {Function} A getNextState() function that is ready to receive your
 * transition name and return the next state (which may or not be different).
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
  if (!_isObject(stateMachine)) {
    throw new Error('A state machines must be an Object')
  }
  if (!_allValuesAreObjects(stateMachine)) {
    throw new Error('A state machine must be an Object of (only) Objects')
  }
  if (_allValuesFromTransitionsAreStates(stateMachine)) {
    throw new Error(
      'All the registered transitions (for each possible state) in a machine must lead to another state in the machine'
    )
  }

  let currentState
  if (initialState == null) {
    [currentState] = Object.keys(stateMachine)
  } else {
    currentState = initialState
  }

  if (typeof currentState !== 'string' || !Object.prototype.hasOwnProperty.call(stateMachine, currentState)) {
    throw new Error(`The "initialState" must be one of the keys on the "stateMachine" itself ${currentState}`)
  }

  return function nextState(transition) {
    currentState = getNextState(currentState, transition, stateMachine)
    return currentState
  }
}

export default createMachine
