const { getBullet, RETURN } = require('../extension')
const assert = require('assert')

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
