# Machines

Simplified state machines. You can use them in Redux middleware and/or reducers or baked into your components themselves.

## Docs

View the [full docs](https://arizonatribe.github.io/machines/). These are always in-sync with the JsDoc code annotations.

## Installation

```
npm install machines
```

## Usage

This kind of state machine has no requirements for a particular JavaScript framework or a state management tool. Here are some examples on how you might use it.

### Vanilla JS

You create a function that you can invoke repeatedly whenever you have a transition to feed into it.

```javascript
import createMachine from 'machines'

const authMachine = {
  initial: {
    ATTEMPT_LOGIN: 'inProgress'
  },
  inProgress: {
    CANCEL: 'error',
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
}

// Sets the initial state to 'initial' (otherwise will default to the first key on the 'authMachine'
const getNextAuthState = createMachine(authMachine, 'initial')

getNextAuthState('LOGIN_SUCCESSFUL')
// initial - Can't transition there yet
getNextAuthState('CLEAR_ERROR')
// initial - Also doesn't affect state
getNextAuthState('ATTEMPT_LOGIN')
// inProgress - Now we have a login attempt, which changes state
getNextAuthState('LOGIN_SUCCESSFUL')
// loggedIn - Advances from that pending state to logged-in
getNextAuthState('ATTEMPT_LOGOUT')
// inProgress - Attempting to log out
getNextAuthState('LOGOUT_ERROR')
// error - Now we're in an error state
getNextAuthState('CLEAR_ERROR')
// loggedOut - Finishes logout process
```

### React Component Context API

Create a state machine that is placed into a React Context-Provider component, and then your Context-Consumer component can have access to the next state.

```javascript
// authProvider.js

import React, {createContext, PureComponent} from 'react'

// This function would get created the way you see in the earlier example
import getNextState from './some-local-file'

export const AuthContext = createContext('auth')
const initialState = getNextState()

class AuthProvider extends PureComponent {
  state = {
    getNextState,
    currentState: initialState
  }

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export default AuthProvider
```

After placing that `AuthProvider` somewhere at the root of your app (or at the very least, above this next component), then your component will just use the Context Consumer:

```javascript
import React from 'react'
import {withRouter} from 'react-router-dom'
import {AuthContext} from './authProvider'

const LoginComponent = ({ history }) =>
  <AuthContext.Consumer>
    {(currentState, getNextState) => {
      if (currentState === 'loggedIn') {
        this.props.history.push('/home')
      }
      return (
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button
          type="button"
          disabled={currentState === 'inProgress'}
          onClick={() => getNextState('ATTEMPT_LOGIN')}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => getNextState(currentState === 'inProgress' ? 'CANCEL' : '')}
        >
          {currentState === 'inProgress' ? 'Cancel' : 'Clear'}
        </button>
      )
    }}
  </AuthContext.Consumer>

export default withRouter(LoginComponent)
```

### Redux Reducer

If you want to keep a prop in a section of the Redux store to represent the current state of the "auth" state machine, then you can map that prop to your component's props (using the `connect()` higher-order component from `react-redux`)

```javascript
// This function would get created the way you see in the earlier example
import getNextAuthState from './some-local-file'

export const initialState = {
  user: {},
  currentState: getNextAuthState()
}

export default (state = initialState, action = {}) {
  const { type, payload } = action
  const currentState = getNextAuthState(type)
  switch (type) {
    case 'LOGIN_SUCCESSFUL':
      return {
        ...state,
        currentState,
        user: payload
      }
    case 'LOGOUT_SUCCESSFUL':
    case 'LOGIN_ERROR':
      return {
        ...state,
        currentState,
        user: {}
      }
    default:
      return { ...state, currentState }
  }
}
```

### Redux Middleware

This would be a specific use-case (one I've used before) that doesn't always make sense. But let's say you want to cancel the middleware chain if the current action type doesn't make any change to the current state. Perhaps you're worried about duplicate actions being dispatched in too short of a time window but you want to employ some logic to your debouncing strategy.

```javascript
// auth-state-machine.js

import createMachine from 'machines'

// Create this middleware with an extra thunk
export default (myStateMachine = {}) => {
  const getNextState = createMachine(myStateMachine)
  return dispatch => next => action => {
    const currentState = getNextState()
    const nextState = getNextState(action.type)
    // Only if the current state will change, do you allow the middleware chain to proceed
    if (currentState !== nextState) {
      next(action)
    }
  }
}
```

```javascript
// src/configureStore.js

import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import createHistory from 'history/createBrowserHistory';
import authStateMiddleware from './auth-state-machine'

import rootReducer from './rootReducer';
import initialState from './initialState';

export const history = createHistory();

// You don't have to keep this separate from the middleware file
// (might be cleaner to make this part of the auth-state-machine.js)
// I only do this because the middleware function I've used for this
// kind of solution involved several statemachines all in one JSON object
const authMachine = {
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
}

export default createStore(
  rootReducer,
  initialState,
  applyMiddleware(
    authStateMiddleware(authMachine),
    thunk
  )
);
```
