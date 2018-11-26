# Machines

Simplified state machines. You can use them in Redux middleware and/or reducers or baked into your components themselves.

## Docs

View the [full docs](https://arizonatribe.github.io/machines/). These are always in-sync with the JsDoc code annotations.

## Installation

```
npm install machines
```

## Usage

```javascript
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
