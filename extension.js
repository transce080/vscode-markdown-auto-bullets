const vscode = require('vscode')

const BULLET_REGEX = /^\s*([+*-]\s+)/
const RETURN = '\n'

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('type', async (args) => {
      console.log('Markdown Auto Bullets: type command triggered', args)
      await vscode.commands.executeCommand('default:type', args)
    })
  )
}

function deactivate() { }

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  return match && (match.length > 1) ? match[1] : null
}

module.exports = {
  activate,
  deactivate,
  getBullet,
  RETURN
}
