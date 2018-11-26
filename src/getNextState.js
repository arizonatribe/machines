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
function getNextState(currentState, transitionName, stateMachine = {}) {
  const registeredTransitions = stateMachine[currentState]
  if (!registeredTransitions) return currentState
  const possibleNewState = registeredTransitions[transitionName]
  return possibleNewState || currentState
}

module.exports = getNextState
