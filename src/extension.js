'use strict'

const { commands, window, workspace } = require('vscode')

const BLANK_BULLET_REGEX = /^\s*([+*-]\s+)$/u
const BULLET_REGEX = /^\s*([+*-]\s+)/u
const ENTER_KEY = '\n'
let _typeEvent = null

const editor = () => window.activeTextEditor

const getTypeEvent = () => {
  _typeEvent ||=
    commands.registerCommand('type', async (args) => {
      if (!editor()?.document || !args) return

      if (!isMarkdown()) {
        killTypeEvent()
        return
      }

      if (isEnterKey(args)) {
        const lineText = getLineText()

        if (isBulletTextBlank(lineText)) {
          await removeLine()
          return
        }

        appendBullet(lineText, args)
      }

      await commands.executeCommand('default:type', args)
    })

  return _typeEvent
}

function activate(/* Extension API */ context) {
  addOrRemoveEvent(context)

  context.subscriptions.push(
    /* When user changes documents */
    window.onDidChangeActiveTextEditor(() => {
      if (!editor()?.document) return

      addOrRemoveEvent(context)
    }),
    /* When user changes doc language */
    workspace.onDidOpenTextDocument(() => {
      if (!editor()?.document) return

      addOrRemoveEvent(context)
    }),
    commands.registerCommand('markdown-auto-bullets.deleteLeft', async () => {
      if (!editor()?.document) return

      await backspaceEvent()
    })
  )
}

function addOrRemoveEvent(context) {
  const isMarkDownLanguage = isMarkdown()

  if (!_typeEvent && isMarkDownLanguage) {
    registerTypeEvent(context)
  } else if (_typeEvent && !isMarkDownLanguage) {
    killTypeEvent()
  }
}

function appendBullet(text, args) {
  const bullet = getBullet(text)
  if (!bullet) return

  args.text += bullet
}

async function backspaceEvent() {
  if (_typeEvent) {
    try {
      const lineText = getLineText()

      if (isBulletTextBlank(lineText)) {
        await removeLine()
        return
      }
    }
    catch {
      addOrRemoveEvent(context)
    }
  }

  await commands.executeCommand('deleteLeft')
}

function deactivate() {
  killTypeEvent()
}

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  if (!match) return null

  return match[1]
}


function getLineNumber() {
  return editor()?.selection?.active?.line
}

function getLineText() {
  return editor()?.document.lineAt(getLineNumber())?.text
}

function isBulletTextBlank(text) {
  return text.match(BLANK_BULLET_REGEX)
}

function isEnterKey(args) {
  return args.text == ENTER_KEY
}

function isMarkdown() {
  return editor()?.document?.languageId == 'markdown'
}

function killTypeEvent() {
  if (!_typeEvent) return

  try {
    _typeEvent.dispose()
  }
  finally {
    _typeEvent = null
  }
}

function registerTypeEvent(context) {
  context.subscriptions.push(getTypeEvent())
}

async function removeLine() {
  await setLineText(getLineNumber(), '')
}

async function setLineText(lineNumber, text) {
  const lineRange = editor()?.document?.lineAt(lineNumber)?.range
  if (!lineRange) return

  await editor().edit(edit => { edit.replace(lineRange, text) })
}

module.exports = {
  activate,
  deactivate,
  testExports: {
    ENTER_KEY,
    getBullet
  }
}
