const { commands, languages, window, workspace } = require('vscode')
const { EndOfLine, Selection } = require('vscode')
const { getBullet, RETURN } = require('../src/extension')
const assert = require('assert')

const { LF } = EndOfLine
const { CRLF } = EndOfLine
const WAIT_TIME = 150 // Increase wait time if you experience intermittent failures or for slower machines

const testDepthOne = '  * Lorem Ipsum'
const testDepthTwo = '    + Lorem Ipsum'
const testDepthZero = '- Lorem Ipsum'
const testLongIndent = '-  Lorem Ipsum'
const testNoBullets = 'Lorem Ipsum'
const testNoBulletsWithDashes = 'Lorem Ipsum - Dolor Sit Amet'
const testNoBulletsWithPlus = 'Lorem + Ipsum Dolor Sit Amet'
const testNoBulletsWithStar = 'Lorem Ipsum Dolor * Sit Amet'

async function runTest(content, language = 'markdown', lineEnding = LF, secondLanguage = null) {
  let document = await workspace.openTextDocument({ content, language })
  const editor = await window.showTextDocument(document)

  await editor.edit(eb => { eb.setEndOfLine(lineEnding) })

  // Move cursor to end of line
  setCursorPosition(editor, content.length, 0)

  if (secondLanguage) {
    document = await languages.setTextDocumentLanguage(document, secondLanguage)
    await commands.executeCommand('type', { text: ' ' })
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME))
  }

  await commands.executeCommand('type', { text: RETURN })
  const newText = document.getText().split(RETURN).pop()
  await commands.executeCommand('workbench.action.closeAllEditors')

  return newText
}

function setCursorPosition(editor, column, line) {
  editor.selection = new Selection(line, column, line, column)
}

suite('Function Tests', () => {
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
})

suite('Execution Tests', () => {
  test('Does not insert if not markdown', async () => {
    const newLine = await runTest(testDepthZero, 'plaintext')
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Inserts dash bullet point LF', async () => {
    const newLine = await runTest(testDepthZero)
    const index = testDepthZero.indexOf('-')
    assert.strictEqual(newLine, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
  })

  test('Inserts dash bullet point CRLF', async () => {
    const newLine = await runTest(testDepthZero, 'markdown', CRLF)
    const index = testDepthZero.indexOf('-')
    assert.strictEqual(newLine, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
  })

  test('Inserts star bullet point LF', async () => {
    const newLine = await runTest(testDepthOne)
    const index = testDepthOne.indexOf('*')
    assert.strictEqual(newLine, testDepthOne.slice(0, index + 2), 'New line should start with star bullet')
  })

  test('Inserts star bullet point CRLF', async () => {
    const newLine = await runTest(testDepthOne, 'markdown', CRLF)
    const index = testDepthOne.indexOf('*')
    assert.strictEqual(newLine, testDepthOne.slice(0, index + 2), 'New line should start with star bullet')
  })

  test('Inserts plus bullet point LF', async () => {
    const newLine = await runTest(testDepthTwo)
    const index = testDepthTwo.indexOf('+')
    assert.strictEqual(newLine, testDepthTwo.slice(0, index + 2), 'New line should start with plus bullet')
  })

  test('Inserts plus bullet point CRLF', async () => {
    const newLine = await runTest(testDepthTwo, 'markdown', CRLF)
    const index = testDepthTwo.indexOf('+')
    assert.strictEqual(newLine, testDepthTwo.slice(0, index + 2), 'New line should start with plus bullet')
  })

  test('Stops when going from markdown to text', async () => {
    const newLine1 = await runTest(testDepthZero)
    const newLine2 = await runTest(testDepthZero, 'plaintext')
    const index = testDepthZero.indexOf('-')

    assert.strictEqual(newLine1, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
    assert.strictEqual(newLine2, '', 'New line should be blank')
  })

  test('Starts up after going from text to markdown', async () => {
    const newLine1 = await runTest(testDepthZero, 'plaintext')
    const newLine2 = await runTest(testDepthZero)
    const index = testDepthZero.indexOf('-')

    assert.strictEqual(newLine1, '', 'New line should be blank')
    assert.strictEqual(newLine2, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
  })

  test('Keeps working when going from markdown to markdown', async () => {
    const newLine1 = await runTest(testDepthZero)
    const newLine2 = await runTest(testDepthZero)
    const index = testDepthZero.indexOf('-')

    assert.strictEqual(newLine1, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
    assert.strictEqual(newLine2, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
  })

  test('Stops when document language is changed from markdown to text', async () => {
    const newLine = await runTest(testDepthZero, 'markdown', LF, 'plaintext')
    assert.strictEqual(newLine, '', 'New line should be blank')
  })

  test('Starts when document language is changed from text to markdown', async () => {
    const newLine = await runTest(testDepthZero, 'plaintext', LF, 'markdown')
    const index = testDepthZero.indexOf('-')
    assert.strictEqual(newLine, testDepthZero.slice(0, index + 2), 'New line should start with dash bullet')
  })
})
