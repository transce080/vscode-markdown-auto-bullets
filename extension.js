const vscode = require('vscode')

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

module.exports = {
  activate,
  deactivate
}
