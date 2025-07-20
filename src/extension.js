const { commands, window, workspace } = require('vscode')

const BULLET_REGEX = /^\s*([+*-]\s+)/u
const BLANK_BULLET_REGEX = /^\s*([+*-]\s*)$/u
const ENTER_KEY = '\n'
let _typeEvent = null

const getTypeEvent = () => {
  _typeEvent ||=
    commands.registerCommand('type', async (args) => {
      const editor = window.activeTextEditor

      if (!editor?.document || !args) return
      if (!isMarkdown(editor)) {
        killTypeEvent()
        return
      }

      if (isEnterKey(args)) {
        const lineText = getLineText(editor)

        if (isBulletTextBlank(lineText)) {
          await removeLine(editor)
          return
        }

        appendBullet(lineText, args)
      }

      await commands.executeCommand('default:type', args)
    })

  return _typeEvent
}

function activate(/* Extension API */ context) {

  addOrRemoveEvent(context, window.activeTextEditor)

  context.subscriptions.push(
    /* When user changes documents */
    window.onDidChangeActiveTextEditor(editor => {
      if (!editor?.document) return
      addOrRemoveEvent(context, editor)
    }),
    /* When user changes doc language */
    workspace.onDidOpenTextDocument(() => {
      const editor = window.activeTextEditor
      if (!editor?.document) return
      addOrRemoveEvent(context, editor)
    }),
  )
}

function addOrRemoveEvent(extensionContext, editor) {
  if (!_typeEvent && isMarkdown(editor)) {
    extensionContext.subscriptions.push(getTypeEvent())
  } else if (_typeEvent && !isMarkdown(editor)) {
    killTypeEvent()
  }
}

function appendBullet(text, args) {
  const bullet = getBullet(text)
  if (!bullet) return

  args.text += bullet
}

function deactivate() {
  killTypeEvent()
}

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  if (!match) return null
  return match[1]
}

function getLineNumber(editor) {
  return editor.selection?.active?.line
}

function getLineText(editor) {
  return editor.document.lineAt(getLineNumber(editor))?.text
}

function isBulletTextBlank(text) {
  return text.match(BLANK_BULLET_REGEX)
}

function isEnterKey(args) {
  return args.text == ENTER_KEY
}

function isMarkdown(editor) {
  return editor.document.languageId == 'markdown'
}

function killTypeEvent() {
  if (!_typeEvent) return
  _typeEvent.dispose()
  _typeEvent = null
}

async function removeLine(editor) {
  await setLineText(editor, getLineNumber(editor), '')
}

async function setLineText(editor, lineNumber, text) {
  const lineRange = editor.document.lineAt(lineNumber).range
  if (!lineRange) return

  await editor.edit(doc => { doc.replace(lineRange, text) })
}

module.exports = {
  activate,
  deactivate,
  testExports: {
    ENTER_KEY,
    getBullet
  }
}
