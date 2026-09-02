const chalk = require('chalk');
module.exports = {
  logInfo: (m) => console.log(chalk.blue('[INFO]'), m),
  logSuccess: (m) => console.log(chalk.green('[SUCCESS]'), m),
  logWarn: (m) => console.log(chalk.yellow('[WARN]'), m),
  logError: (m) => console.log(chalk.red('[ERROR]'), m),
  logSession: (m) => console.log(chalk.magenta('[SESSION]'), m),
};
