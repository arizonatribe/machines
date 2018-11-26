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

module.exports = {
  _isObject,
  _allValuesAreObjects,
  _allValuesFromTransitionsAreStates
}
