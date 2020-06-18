const createMachine = require('./createMachine')

class TransitionError extends Error {
  constructor(message, state, additionalData = {}) {
    super(message)
    this.message = message
    this.state = state
    this.data = {
      ...(additionalData || {})
    }
  }
}

function createTransitionHandler(handler, machine) {
  if (typeof handler === 'function') {
    return async function wrappedTransitionHandler(initialData, initialState, context) {
      const nextState = createMachine(machine, initialState || 'initial')
      let currentState
      let result = initialData

      try {
        while (currentState !== nextState()) {
          currentState = nextState()
          result = await handler(result, nextState, context)
        }

        if (result && /Error$/.test(result.constructor.name)) {
          throw result
        }

        return result
      } catch (err) {
        throw new TransitionError(
          err.message || err.toString(),
          nextState(), {
            ...((err.data && typeof err.data === 'object') || {}),
            ...((err.extensions && typeof err.extensions === 'object') || {})
          }
        )
      }
    }
  } else if (handler && typeof handler === 'object' && handler.constructor.name === 'Object') {
    return async function wrappedTransitionHandler(initialData, initialState, context) {
      const nextState = createMachine(machine, initialState || 'initial')
      let currentState
      let result = initialData
      let singleStateHandler

      try {
        while (currentState !== nextState()) {
          currentState = nextState()
          singleStateHandler = handler[currentState]
          result = await singleStateHandler(result, nextState, context)
        }

        if (result && /Error$/.test(result.constructor.name)) {
          throw result
        }

        return result
      } catch (err) {
        throw new TransitionError(
          err.message || err.toString(),
          nextState(), {
            ...((err.data && typeof err.data === 'object') || {}),
            ...((err.extensions && typeof err.extensions === 'object') || {})
          }
        )
      }
    }
  }

  throw new TypeError(
    'handler must be a function or an object whose keys are state names and whose values are functions'
  )
}

module.exports = createTransitionHandler
