const { commands, window, workspace } = require('vscode')
const activeEditor = () => window.activeTextEditor

const BULLET_REGEX = /^\s*([+*-]\s+)/u
const RETURN = '\n'
let typeEvent = null

const getTypeEvent = () => {
  typeEvent ||=
    commands.registerCommand('type', async (args) => {
      console.log('getEvent: type callback:', JSON.stringify(args))
      const editor = activeEditor()

      if (!editor?.document || !args) return

      appendBullet(editor, args)

      await commands.executeCommand('default:type', args)
    })

  return typeEvent
}

function activate(context) {
  console.log('## Extension activated')

  addOrRemoveEvent(context, activeEditor())

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(editor => {
      if (!editor?.document) return
      console.log(`!! onDidChangeActiveTextEditor: ${editor?.document?.languageId}`)
      addOrRemoveEvent(context, editor)
    }),
    workspace.onDidOpenTextDocument(() => {
      const editor = activeEditor()
      if (!editor?.document) return
      console.log(`!! onDidOpenTextDocument: ${editor?.document?.languageId} : ${editor?.contentChanges?.length}}`)
      addOrRemoveEvent(context, editor)
    }),
  )
}

function addOrRemoveEvent(context, editor) {
  console.log(`  >> addOrRemoveEvent: [typeEvent: ${!!typeEvent}] [isMarkdown: ${isMarkdown(editor)}]`)

  if (!typeEvent && isMarkdown(editor)) {
    console.log('  >> Adding typeEvent for markdown editor')
    context.subscriptions.push(getTypeEvent())
  } else if (typeEvent && !isMarkdown(editor)) {
    console.log('  >> Removing typeEvent for non-markdown editor')
    killTypeEvent()
  }
}

function deactivate() {
  killTypeEvent()
}

function appendBullet(editor, args) {
  if (!isMarkdown(editor)) {
    console.log(`  << Aborting: Not a markdown file`)
    killTypeEvent()
    return
  }
  console.log('  >> Passed isMarkdown check')

  if (!isEnterKey(args)) return
  console.log('  >> Passed isEnterKey check')

  const lineText = getText(editor, getCursor(editor).line)
  if (!lineText) return
  console.log('  >> Passed getText check')

  const bullet = getBullet(lineText)
  if (!bullet) return
  console.log('  >> Passed getBullet check')

  args.text += bullet
  console.log('  >> Added bullet to args.text:', args.text)
}

function getBullet(text) {
  const match = text.match(BULLET_REGEX)
  if (!match) return null
  return match[1]
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
  activate,
  deactivate,
  testExports: {
    RETURN,
    getBullet
  }
}
