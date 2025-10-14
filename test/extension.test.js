'use strict'

const { commands, languages, window, workspace } = require('vscode')
const { EndOfLine, Selection } = require('vscode')
const { CRLF, LF } = EndOfLine
const { testExports } = require('../src/extension')
const assert = require('assert')

const { getBullet, ENTER_KEY } = testExports
const BACKSPACE_KEY = '\u0008'

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
    column = content.length,
    key = ENTER_KEY,
    language = 'markdown',
    lineEnding = LF,
    lineNumber = null,
    row = 0,
    secondLanguage = null
  } = options

  const document = await workspace.openTextDocument({ content, language })
  const editor = await window.showTextDocument(document)

  await editor.edit(edit => { edit.setEndOfLine(lineEnding) })

  setCursorPosition(editor, column, row)

  if (secondLanguage) {
    await languages.setTextDocumentLanguage(document, secondLanguage)
  }

  if (key == BACKSPACE_KEY) {
    await commands.executeCommand('markdown-auto-bullets.deleteLeft')
  } else {
    await commands.executeCommand('type', { text: key })
  }

  const linesOfText = document.getText().split(getLineEnding(lineEnding))
  const result = lineNumber ? linesOfText[lineNumber - 1] : linesOfText.pop()

  if (closeOnExit) {
    await commands.executeCommand('workbench.action.closeAllEditors')
  }

  return result
}

function setCursorPosition(editor, column, line) {
  editor.selection = new Selection(line, column, line, column)
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

  test('Normal backspace event fires in markdown', async () => {
    const newLine = await runTest(testNoBullets, { key: BACKSPACE_KEY })
    const index = testNoBullets.length - 1
    assert.strictEqual(newLine, testNoBullets.slice(0, index), 'Backspace should remove last character')
  })

  test('Normal backspace event fires in plaintext', async () => {
    const newLine = await runTest(testNoBullets, { key: BACKSPACE_KEY, language: 'plaintext' })
    const index = testNoBullets.length - 1
    assert.strictEqual(newLine, testNoBullets.slice(0, index), 'Backspace should remove last character')
  })

  test('Normal backspace event fires when line has bullet character', async () => {
    const newLine = await runTest(testNoBulletsWithDashes, { key: BACKSPACE_KEY })
    const index = testNoBulletsWithDashes.length - 1
    assert.strictEqual(newLine, testNoBulletsWithDashes.slice(0, index), 'Backspace should remove last character')
  })

  test('Normal backspace event fires when going from markdown to text', async () => {
    await runTest(testNoBullets, { closeOnExit: false })
    const newLine = await runTest(testNoBullets, { key: BACKSPACE_KEY, language: 'plaintext' })
    const index = testNoBullets.length - 1
    assert.strictEqual(newLine, testNoBullets.slice(0, index), 'Backspace should remove last character')
  })
})

suite('Insertion Tests - Complex', () => {
  test('Does not insert if bullet already present at cursor', async () => {
    const newLine = await runTest(`${testDepthZero}${testDepthZero}`, { column: testDepthZero.length })
    assert.strictEqual(newLine, testDepthZero, 'New line should not have two bullets')
  })

  test('Does not insert if bullet already present at line start', async () => {
    const newLine = await runTest(testDepthZero, { column: 0 })
    assert.strictEqual(newLine, testDepthZero, 'New line should not have two bullets')
  })

  test('Inserts if bullet present at cursor but wrong type', async () => {
    const newLine = await runTest(`${testDepthZero}${testDepthTwo}`, { column: testDepthZero.length })
    assert.strictEqual(newLine, `- ${testDepthTwo}`, 'New line should start with dash bullet')
  })
})

suite('Insertion Tests - Language', () => {
  test('Does not insert if not markdown', async () => {
    const newLine = await runTest(testDepthZero, { language: 'plaintext' })
    assert.strictEqual(newLine, '', 'New line should be blank')
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

suite('Insertion Tests - Simple', () => {
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
})

suite('Removal Tests', () => {
  test('Does not remove a single bullet character by itself on Enter', async () => {
    const newLine = await runTest('-', { lineNumber: 1 })
    assert.strictEqual(newLine, '-', 'Dash should remain')
  })

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

function getLineEnding(lineEnding) {
  switch (lineEnding) {
    case CRLF:
      return '\r\n'
    case LF:
      return '\n'
    default:
      throw new Error('Invalid line ending')
  }
}

// eslint-disable-next-line no-unused-vars
async function wait(milliseconds) {
  return await new Promise(resolve => { setTimeout(resolve, milliseconds) })
}