const createMachine = require('./createMachine')
const { validateStateMachine } = require('./_internal')

/**
 * Exends the base JavaScript base `Error`
 * @typedef {Object<string, any>} TransitionError
 * @property {string} name The name of the error (in this case "TransitionError")
 * @property {string} data.currentState The current state of the state machine at the time the error was encountered
 */
class TransitionError extends Error {
  constructor(message, state, additionalData = {}) {
    super(message)
    this.name = this.constructor.name
    this.data = {
      ...(
        typeof additionalData === 'object' && additionalData.constructor.name === 'Object'
          ? additionalData
          : {}
      ),
      currentState: state
    }
  }
}

/**
 * Takes a given state machine and handler and returns a function which is ready to receive the starting "state" value _and_ any starting data, following through the entire sequence of async function until the state stops advancing.
 * Note, a handler will receive the initial data, the starting "state" value and any (optional) dependencies to place into the context for the async functions contained in the handler.
 * A handler doesn't have to be a function but can also be an object whose keys are possible "state" values and whose values are functions that receive the initial data, state machine, and context.
 *
 * @function
 * @name createTransitionHandler
 * @throws {TypeError} If a state machine is not provided
 * @throws {TypeError} If a handler function/object is not provided
 * @throws {TypeError} If the handler is not a function or an object whose keys do not correspond to keys in the state `machine`
 * @throws {TypeError} If the state machine has any values which are not objects
 * @throws {TypeError} If the state machine's "sub-objects" has values that are not keys on the root of the object
 * @param {function|Object<string, function>} handler A handler function or an object of individual handler function (the keys on the object must match possible "states" otherwise they'll never be called)
 * @param {Object<string, Object<string, string>>} machine An object whose keys are possible states and whose values are also objects (but whose keys are transition names and whose values are states they will advance to)
 * @returns {function} A wrapped handler function that is ready to receive the (1) initial data, (2) starting "state" value on the machine, and (3) an object containing any dependencies the handler may have
 */
function createTransitionHandler(handler, machine) {
  if (!machine) {
    throw new TypeError('A state machine is required but was not provided')
  }
  if (!handler) {
    throw new TypeError('A handler is required for the state machine transitions')
  }

  validateStateMachine(machine)

  const getStateHandler = typeof handler === 'function'
    ? () => handler
    : handler && typeof handler === 'object' && handler.constructor.name === 'Object'
      ? currentState => {
        if (typeof handler[currentState] !== 'function') {
          throw new TypeError(`No handler was defined for the current state of '${currentState}'`)
        }
        return handler[currentState]
      } : undefined

  if (!getStateHandler) {
    throw new TypeError(
      'handler must be a function or an object whose keys are state names and whose values are functions'
    )
  }

  /**
   * A handler function that will advance from state to state - executing each piece of logic and/or async function the user defined, until the state can no longer advance and the current value or error is returned at that point.
   *
   * @function
   * @name wrappedTransitionHandler
   * @throws {TransitionError} If the handler encounters an unexpected exception
   * @param {Object<string, any>} initialData Any starting data for the handler
   * @param {string} initialState A starting "state" value which should be one of the possible values on the state machine
   * @param {Object<string, any>} [context] An optional object containing any dependencies of the handler (API clients, caches, etc.)
   * @returns {*} When the handler can no longer advance to another possible state, the value of the last function it executed is returned
   */
  return function wrappedTransitionHandler(initialData, initialState, context) {
    let currentState
    const nextState = createMachine(machine, initialState || 'initial')

    function runNextTransition(r) {
      if (r && /Error$/.test(r.constructor.name)) {
        return Promise.reject(r)
      } else if (currentState !== nextState()) {
        currentState = nextState()
        const response = getStateHandler(currentState)(r, nextState, context)

        if (response != null && typeof response.then === 'function') {
          return response.then(res => runNextTransition(res))
        } else {
          return runNextTransition(response)
        }
      } else {
        return Promise.resolve(r)
      }
    }

    return runNextTransition(initialData).catch(err => {
      throw new TransitionError(
        err.message || err.toString(),
        nextState(), {
          ...((err.data && typeof err.data === 'object' && err.data) || {}),
          ...((err.extensions && typeof err.extensions === 'object' && err.extensions) || {})
        }
      )
    })
  }
}

module.exports = createTransitionHandler
