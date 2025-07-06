const vscode = require('vscode')

const BULLET_REGEX = /^\s*([+*-]\s+)/
const RETURN = '\n'

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('type', async (args) => {
      addBullet(args)
      await vscode.commands.executeCommand('default:type', args)
    })
  )
}

function addBullet(args) {
  try {
    if (!isEnterKey(args)) return

    const editor = vscode.window.activeTextEditor
    if (!isMarkdown(editor)) return

    const cursor = getCursor(editor)
    const lineText = getText(editor, cursor.line)
    if (!lineText) return

    const bullet = getBullet(lineText)
    if (!bullet) return

    args.text += bullet
  } catch (error) {
    console.log(error)
  }
}

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  return match && (match.length > 1) ? match[1] : null
}

function getCursor(editor) {
  return editor.selection.active
}

function getText(editor, line) {
  return editor.document.lineAt(line).text
}

function isEnterKey(args) {
  return args.text == RETURN
}

function isMarkdown(editor) {
  return editor.document.languageId == 'markdown'
}

function deactivate() { }

module.exports = {
  activate,
  deactivate,
  getBullet,
  RETURN
}
