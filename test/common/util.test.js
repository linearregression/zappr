import { expect } from 'chai'
import {
  getIn,
  setIn,
  encode,
  decode,
  setDifference,
  promiseReduce,
  promiseFirst,
  symbolToString
} from '../../common/util'

describe('common/util', () => {
  describe('symbolToString', () => {
    it('should convert a symbol to a string', () => {
      expect(symbolToString(Symbol('foobar'))).to.equal('foobar')
    })
    it('should return input if it is no symbol', () => {
      expect(symbolToString('foobar')).to.equal('foobar')
      expect(symbolToString(1)).to.equal(1)
      const noSymbol = {}
      expect(symbolToString(noSymbol)).to.equal(noSymbol)
    })
  })

  describe('setDifference', () => {
    it('should calculate the difference of two sets', () => {
      const set1 = new Set([1, 2, 3, 4, 5])
      const set2 = new Set([3, 4, 5, 6, 7])
      const diff = setDifference(set1, set2)
      expect(diff.size).to.equal(2)
      expect([...diff]).to.deep.equal([1, 2])
    })
    it('should return the first set if there is no second', () => {
      const set1 = new Set(["foo", "bar"])
      const diff = setDifference(set1)
      expect(diff).to.equal(set1)
    })
    it('should return an empty set if nothing is provided', () => {
      const diff = setDifference()
      expect(diff instanceof Set).to.be.true
      expect(diff.size).to.equal(0)
    })
  })

  describe('promiseReduce', () => {
    it('should async build a sum over an array', done => {
      const numbers = [1, 2, 3, 4, 5]
      const reducer = (sum, item) => new Promise(resolve => setTimeout(() => resolve(sum + item), 50))
      promiseReduce(numbers, reducer, 5)
      .then(sum => {
        expect(sum).to.equal(20)
        done()
      })
      .catch(done)
    })

    it('should reject when a reduce iteration throws', done => {
      function reducer() {
        throw new Error("boo")
      }

      const numbers = [1, 2, 3, 4, 5]
      promiseReduce(numbers, reducer, 0).then(done).catch(() => done())
    })
  })

  describe('promiseFirst', () => {
    it('should reject if all reject', done => {
      const promises = [Promise.reject(1), Promise.reject(2)]
      promiseFirst(promises)
      .then(() => {
        done(1)
      })
      .catch(e => {
        done()
      })
    })
    it('should return the first resolving promise', done => {
      const promises = [Promise.reject(1), Promise.resolve(2)]
      promiseFirst(promises)
      .then(x => {
        expect(x).to.equal(2)
        done()
      })
      .catch(done)
    })
  })

  describe('decode', () => {
    it('should decode a base64 string', () => {
      expect(decode('WkFQUFIgUk9DS1Mh')).to.equal('ZAPPR ROCKS!')
    })
    it('should throw if other algo than base64 is provided', () => {
      expect(() => decode('foo', 'sha256')).to.throw()
    })
  })

  describe('encode', () => {
    it('should encode a string to base64', () => {
      expect(encode('ZAPPR ROCKS!')).to.equal('WkFQUFIgUk9DS1Mh')
    })
    it('should throw if other algo than base64 is provided', () => {
      expect(() => encode('foo', 'sha256')).to.throw()
    })
  })

  describe('setIn', () => {
    let obj
    beforeEach(() => {
      obj = {
        commit: {
          committer: 'hans',
          repository: {
            id: 1
          }
        }
      }
    })
    it('should mutate the object', () => {
      const result = setIn(obj, ['commit', 'repository', 'id'], 15)
      expect(result === obj).to.be.true
    })
    it('should set existing nested property', () => {
      setIn(obj, ['commit', 'repository', 'id'], 15)
      expect(obj.commit.repository.id).to.equal(15)
      expect(obj.commit.committer).to.equal('hans')
    })
    it('should set not existing nested property', () => {
      setIn(obj, ['commit', 'repository', 'url'], 'https://github.com/zalando/zappr')
      expect(obj.commit.repository.url).to.equal('https://github.com/zalando/zappr')
      expect(obj.commit.committer).to.equal('hans')
    })
  })

  describe('getIn', () => {
    const obj = {
      commit: {
        message: {
          patterns: ['foo']
        }
      }
    }

    it('should return deep property', () => {
      expect(getIn(obj, ['commit', 'message', 'patterns'])).to.deep.equal(obj.commit.message.patterns)
    })

    it('should return default value if path does not exist', () => {
      expect(getIn(obj, ['commit', 'bar', 'patterns'], false)).to.be.false
    })

    it('should work when path is not an array', () => {
      const thing = getIn(obj, 'commit', false)
      expect(thing).to.not.be.false
      expect(thing).to.deep.equal({
        message: {
          patterns: ['foo']
        }
      })
    })

    it('should work on arrays', () => {
      expect(getIn([1], 0, false)).to.not.be.false
      expect(getIn([1], 0, false)).to.equal(1)
    })
  })
})
