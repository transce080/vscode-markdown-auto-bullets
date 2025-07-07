const vscode = require('vscode')

const BULLET_REGEX = /^\s*([+*-]\s+)/
const RETURN = '\n'

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const eventRegistration = vscode.commands.registerCommand('type', async (args) => {
    addBullet(args)
    await vscode.commands.executeCommand('default:type', args)
  })
  context.subscriptions.push(eventRegistration)
}

function addBullet(args) {
  try {
    console.log(`args: ${JSON.stringify(args)}`)

    const editor = vscode.window.activeTextEditor
    if (!isMarkdown(editor)) {
      return
    }
    console.log('>> Passed isMarkdown check')

    if (!isEnterKey(args)) return
    console.log('>> Passed isEnterKey check')

    const cursor = getCursor(editor)
    const lineText = getText(editor, cursor.line)
    if (!lineText) return
    console.log('>> Passed getText check')

    const bullet = getBullet(lineText)
    if (!bullet) return
    console.log('>> Passed getBullet check')

    args.text += bullet
    console.log('>> Added bullet to args.text:', args.text)
  } catch (error) {
    console.log(error)
  }
}

function deactivate() { }

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

module.exports = {
  activate,
  deactivate,
  getBullet,
  RETURN
}
