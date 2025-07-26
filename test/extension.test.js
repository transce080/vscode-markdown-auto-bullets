const { commands, languages, window, workspace } = require('vscode')
const { EndOfLine, Selection } = require('vscode')
const { CRLF, LF } = EndOfLine
const { testExports } = require('../src/extension')
const assert = require('assert')

const { getBullet, ENTER_KEY } = testExports
const BACKSPACE_KEY = '\b'
const WAIT_TIME = 150 // Increase wait time if you experience intermittent failures or for slower machines

const testDepthOne = '  * Lorem Ipsum'
const testDepthOneEmpty = '  * '
const testDepthTwo = '    + Lorem Ipsum'
const testDepthZero = '- Lorem Ipsum'
const testDepthZeroEmpty = '- '
const testDepthZeroPadded = '-    '
const testLongIndent = '-  Lorem Ipsum'
const testNoBullets = 'Lorem Ipsum'
const testNoBulletsWithDashes = 'Lorem Ipsum - Dolor Sit Amet'
const testNoBulletsWithPlus = 'Lorem + Ipsum Dolor Sit Amet'
const testNoBulletsWithStar = 'Lorem Ipsum Dolor * Sit Amet'

async function runTest(content, options = {}) {
  const {
    closeOnExit = true,
    key = ENTER_KEY,
    language = 'markdown',
    lineEnding = LF,
    secondLanguage = null
  } = options

  const document = await workspace.openTextDocument({ content, language })
  const editor = await window.showTextDocument(document)

  await editor.edit(edit => { edit.setEndOfLine(lineEnding) })

  // Move cursor to end of line
  setCursorPosition(editor, content.length, 0)

  if (secondLanguage) {
    await languages.setTextDocumentLanguage(document, secondLanguage)
    await wait(WAIT_TIME)
  }

  if (key == BACKSPACE_KEY) {
    await commands.executeCommand('markdown-auto-bullets.deleteLeft')
    await wait(WAIT_TIME)
  } else {
    await commands.executeCommand('type', { text: key })
  }

  const newText = document.getText().split(ENTER_KEY).pop()

  if (closeOnExit) {
    await commands.executeCommand('workbench.action.closeAllEditors')
  }

  return newText
}

function setCursorPosition(editor, column, line) {
  editor.selection = new Selection(line, column, line, column)
}

async function wait(milliseconds) {
  // eslint-disable-next-line no-promise-executor-return
  return await new Promise(resolve => setTimeout(resolve, milliseconds))
}

suite('Functional Tests', () => {
  test('getBullet returns correct bullet type and indent length', () => {
    assert.strictEqual(getBullet(testDepthOne), '* ')
    assert.strictEqual(getBullet(testDepthTwo), '+ ')
    assert.strictEqual(getBullet(testDepthZero), '- ')
    assert.strictEqual(getBullet(testLongIndent), '-  ')
    assert.strictEqual(getBullet(testNoBullets), null)
    assert.strictEqual(getBullet(testNoBulletsWithDashes), null)
    assert.strictEqual(getBullet(testNoBulletsWithPlus), null)
    assert.strictEqual(getBullet(testNoBulletsWithStar), null)
  })

  test('Normal backspace event fires', async () => {
    const newLine = await runTest(testNoBullets, { key: BACKSPACE_KEY })
    const index = testNoBullets.length - 1
    assert.strictEqual(newLine, testNoBullets.slice(0, index), 'Backspace should remove last character')
  })

  test('Normal backspace event fires when line has bullet character', async () => {
    const newLine = await runTest(testNoBulletsWithDashes, { key: BACKSPACE_KEY })
    const index = testNoBulletsWithDashes.length - 1
    assert.strictEqual(newLine, testNoBulletsWithDashes.slice(0, index), 'Backspace should remove last character')
  })
})

suite('Insertion Tests', () => {
  test('Does not insert if not markdown', async () => {
    const newLine = await runTest(testDepthZero, { language: 'plaintext' })
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Inserts dash bullet point LF', async () => {
    const newLine = await runTest(testDepthZero)
    const index = testDepthZero.indexOf('-') + 2
    assert.strictEqual(newLine, testDepthZero.slice(0, index), 'New line should start with dash bullet')
  })

  test('Inserts dash bullet point CRLF', async () => {
    const newLine = await runTest(testDepthZero, { lineEnding: CRLF })
    const index = testDepthZero.indexOf('-') + 2
    assert.strictEqual(newLine, testDepthZero.slice(0, index), 'New line should start with dash bullet')
  })

  test('Inserts star bullet point', async () => {
    const newLine = await runTest(testDepthOne)
    const index = testDepthOne.indexOf('*') + 2
    assert.strictEqual(newLine, testDepthOne.slice(0, index), 'New line should start with star bullet')
  })

  test('Inserts plus bullet point', async () => {
    const newLine = await runTest(testDepthTwo)
    const index = testDepthTwo.indexOf('+') + 2
    assert.strictEqual(newLine, testDepthTwo.slice(0, index), 'New line should start with plus bullet')
  })

  test('Stops when going from markdown to text', async () => {
    const newLine1 = await runTest(testDepthZero, { closeOnExit: false })
    const newLine2 = await runTest(testDepthZero, { language: 'plaintext' })
    const index = testDepthZero.indexOf('-') + 2

    assert.strictEqual(newLine1, testDepthZero.slice(0, index), 'New line should start with dash bullet')
    assert.strictEqual(newLine2, '', 'New line should be blank')
  })

  test('Starts up after going from text to markdown', async () => {
    const newLine1 = await runTest(testDepthZero, { closeOnExit: false, language: 'plaintext' })
    const newLine2 = await runTest(testDepthZero)
    const index = testDepthZero.indexOf('-') + 2

    assert.strictEqual(newLine1, '', 'New line should be blank')
    assert.strictEqual(newLine2, testDepthZero.slice(0, index), 'New line should start with dash bullet')
  })

  test('Stops when document language is changed from markdown to text', async () => {
    const newLine = await runTest(testDepthZero, { secondLanguage: 'plaintext' })
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Starts when document language is changed from text to markdown', async () => {
    const newLine = await runTest(testDepthZero, { language: 'plaintext', secondLanguage: 'markdown' })
    const index = testDepthZero.indexOf('-') + 2
    assert.strictEqual(newLine, testDepthZero.slice(0, index), 'New line should start with dash bullet')
  })
})

suite('Removal Tests', () => {
  test('Removes the current line on Enter when the bullet has no text', async () => {
    const newLine = await runTest(testDepthZeroEmpty)
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Removes the current line on Enter when the indented bullet has no text', async () => {
    const newLine = await runTest(testDepthOneEmpty)
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Removes the current line on Enter when the bullet has a lot of whitespace', async () => {
    const newLine = await runTest(testDepthZeroPadded)
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Removes the current line on Backspace when the bullet has no text', async () => {
    const newLine = await runTest(testDepthZeroEmpty, { key: BACKSPACE_KEY })
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Removes the current line on Backspace when the indented bullet has no text', async () => {
    const newLine = await runTest(testDepthOneEmpty, { key: BACKSPACE_KEY })
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Removes the current line on Backspace when the bullet has a lot of whitespace', async () => {
    const newLine = await runTest(testDepthZeroPadded, { key: BACKSPACE_KEY })
    assert.strictEqual(newLine, '', 'New line should be blank')
  })
})
