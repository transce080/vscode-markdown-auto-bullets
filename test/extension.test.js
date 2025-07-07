const { getBullet, RETURN } = require('../extension')
const assert = require('assert')
const vscode = require('vscode')

const LF = vscode.EndOfLine.LF
const CRLF = vscode.EndOfLine.CRLF

const testDepthOne = '  * Lorem Ipsum'
const testDepthTwo = '    + Lorem Ipsum'
const testDepthZero = '- Lorem Ipsum'
const testLongIndent = '-  Lorem Ipsum'
const testNoBullets = 'Lorem Ipsum'
const testNoBulletsWithDashes = 'Lorem Ipsum - Dolor Sit Amet'
const testNoBulletsWithPlus = 'Lorem + Ipsum Dolor Sit Amet'
const testNoBulletsWithStar = 'Lorem Ipsum Dolor * Sit Amet'

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
  async function runTest(content, language = 'markdown', lineEnding = LF) {
    const file = await vscode.workspace.openTextDocument({ content: content })
    const editor = await vscode.window.showTextDocument(file)

    if (language) {
      await vscode.languages.setTextDocumentLanguage(file, language)
    }

    if (lineEnding) {
      await editor.edit(editBuilder => {
        editBuilder.setEndOfLine(lineEnding)
      })
    }

    // Move cursor to end of line
    editor.selection = new vscode.Selection(0, content.length, 0, content.length)

    // Simulate pressing Enter
    await vscode.commands.executeCommand('type', { text: RETURN })

    // Get new line text
    const lines = file.getText().split(RETURN)
    const newLine = lines[lines.length - 1]

    return newLine
  }

  test('Does not insert if not markdown', async () => {
    const newLine = await runTest(testDepthZero, null)
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

  return true
})
