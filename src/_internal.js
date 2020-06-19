/**
 * Checks if a given value is an Object {}
 *
 * @function
 * @name _isObject
 * @private
 * @sig * -> Boolean
 * @param {*} val A value which may possibly be an object
 * @returns {boolean} Whether or not the given values is an object
 */
function _isObject(val) {
  return typeof val === 'object' && val && typeof val.length === 'undefined'
}

/**
 * Checks a given object to make sure that all its values are also objects
 *
 * @function
 * @name _allValuesAreObjects
 * @private
 * @sig {k: v} -> Boolean
 * @param {Object<string, Object<string, string>>} obj An Object of (only) Objects. Inside each of those Objects all values are Strings which correspond to keys on the outer Object.
 * @returns {boolean} Whether or not the object contains values which are all also objects
 */
function _allValuesAreObjects(obj) {
  return Object.keys(obj || {}).every(k => _isObject(obj[k]))
}

/**
 * Checks that each value the transitions lead to on a state machine are also states on the state machine
 *
 * @function
 * @name _allValuesFromTransitionsAreStates
 * @private
 * @sig {k: v} -> Boolean
 * @param {Object<string, Object<string, string>>} obj An Object of (only) Objects. Inside each of those Objects all values are Strings which correspond to keys on the outer Object.
 * @returns {boolean} Whether or not all values that the transitions lead to are also states on the state machine
 */
function _allValuesFromTransitionsAreStates(obj = {}) {
  const isInMachine = transitionState => Object.prototype.hasOwnProperty.call(obj, transitionState)
  return Object
    .keys(obj)
    .map(state => obj[state])
    .every(transitions => Object.keys(transitions).every(tstate => isInMachine(tstate)))
}

/**
 * Checks a given state machine to make sure it is valid, and throws an error if not
 *
 * @function
 * @name validateStateMachine
 * @sig {k: v} -> undefined
 * @throws {TypeError} If the state machine is missing or not an object
 * @throws {TypeError} If the state machine has any values which are not objects
 * @throws {TypeError} If the state machine's "sub-objects" has values that are not keys on the root of the object
 *
 * @param {Object<string, Object<string, string>>} stateMachine An Object of (only) Objects. Inside each of those Objects all values are Strings which correspond to keys on the outer Object.
 */
function validateStateMachine(stateMachine) {
  if (!_isObject(stateMachine)) {
    throw new TypeError('A state machines must be an Object')
  }
  if (!_allValuesAreObjects(stateMachine)) {
    throw new TypeError('A state machine must be an Object of (only) Objects')
  }
  if (_allValuesFromTransitionsAreStates(stateMachine)) {
    throw new TypeError(
      'All the registered transitions (for each possible state) in a machine must lead to another state in the machine'
    )
  }
}

/**
 * Gets the first state in a given state machine
 *
 * @function
 * @name getFirstState
 * @sig {k: v} -> String -> String
 * @param {Object<string, Object<string, string>>} stateMachine An Object of (only) Objects. Inside each of those Objects all values are Strings which correspond to keys on the outer Object.
 * @param {string} initialState The state at which the machine should be initialized (will default to the first key name in the state machine)
 * @returns {string} The state value at which the machine should start
 */
function getFirstState(stateMachine, initialState) {
  const currentState = initialState == null
    ? Object.keys(stateMachine)[0]
    : initialState

  if (typeof currentState !== 'string' || !Object.prototype.hasOwnProperty.call(stateMachine, currentState)) {
    throw new Error(`The "initialState" must be one of the keys on the "stateMachine" itself ${currentState}`)
  }

  return currentState
}

module.exports = {
  getFirstState,
  validateStateMachine,
  _isObject,
  _allValuesAreObjects,
  _allValuesFromTransitionsAreStates
}
