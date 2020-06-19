const getNextState = require('./getNextState')
const createMachine = require('./createMachine')
const createTransitionHandler = require('./createTransitionHandler')

module.exports = createMachine
module.exports.getNextState = getNextState
module.exports.createTransitionHandler = createTransitionHandler
