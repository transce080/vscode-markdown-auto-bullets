const { commands, window, workspace } = require('vscode')
const activeEditor = () => window.activeTextEditor

const BULLET_REGEX = /^\s*([+*-]\s+)/u
const RETURN = '\n'
let typeEvent = null

const getTypeEvent = () => {
  typeEvent =
    commands.registerCommand('type', async (args) => {
      if (activeEditor() && activeEditor().document && args) {
        appendBullet(activeEditor(), args)
      }

      await commands.executeCommand('default:type', args)
    })

  return typeEvent
}

function activate(context) {
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(editor => {
      if (!editor || !editor.document) return
      addOrRemoveEvent(context, editor)
    }),
    workspace.onDidChangeTextDocument(editor => {
      if (!editor || !editor.document) return
      addOrRemoveEvent(context, editor)
    }),
    // TODO: try implementing onDidOpenTextDocument or onDidCloseTextDocument instead
    getTypeEvent()
  )
}

function addOrRemoveEvent(context, editor) {
  if (!typeEvent && isMarkdown(editor)) {
    context.subscriptions.push(getTypeEvent())
  } else if (typeEvent && !isMarkdown(editor)) {
    killTypeEvent()
  }
}

function deactivate() {
  killTypeEvent()
}

function appendBullet(editor, args) {
  if (!isMarkdown(editor)) {
    killTypeEvent()
    return
  }

  if (!isEnterKey(args)) return

  const lineText = getText(editor, getCursor(editor).line)
  if (!lineText) return

  const bullet = getBullet(lineText)
  if (!bullet) return

  args.text += bullet
}

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  return match && (match.length > 1) ? match[1] : null
}

function getCursor(editor) {
  return editor.selection.active
}

function getText(editor, line) {
  return editor.document.lineAt(line)?.text
}

function isEnterKey(args) {
  return args.text == RETURN
}

function isMarkdown(editor) {
  return editor.document.languageId == 'markdown'
}

function killTypeEvent() {
  if (!typeEvent) return
  typeEvent.dispose()
  typeEvent = null
}

module.exports = {
  RETURN,
  activate,
  deactivate,
  getBullet,
}
