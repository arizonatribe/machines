const createMachine = require('./createMachine')
const createTransitionHandler = require('./transitions')
const getNextState = require('./getNextState')

module.exports = createMachine
module.exports.getNextState = getNextState
module.exports.createTransitionHandler = createTransitionHandler
