import AnimationBuffer from '../src/animationBuffer'

describe('AnimationBuffer', () => {
  const animationBuffer = new AnimationBuffer(5)

  it('has the expected steps', () => {
    expect(animationBuffer.steps).toEqual(5)
  })

  describe('advance', () => {
    beforeEach(() => {
      animationBuffer.currentIndex = 0
    })

    it('adds one to the currentIndex', () => {
      expect(animationBuffer.currentIndex).toEqual(0)

      animationBuffer.advance()

      expect(animationBuffer.currentIndex).toEqual(1)
    })
  })

  describe('add', () => {
    beforeEach(() => {
      animationBuffer.splice(0, animationBuffer.length)
    })

    it('adds the coordinate pair', () => {
      expect(animationBuffer.length).toEqual(0)

      animationBuffer.add([1, 1])

      expect(animationBuffer.length).toEqual(1)
      expect(animationBuffer[0]).toEqual([1, 1])
    })

    it('calls calculateIntermediatePoints when adding a new coordinate pair', () => {
      let initialCoordinate = [-118.341345, 34.101544]
      let currentCoordinate = [-118.342438, 34.101539]
      expect(animationBuffer.continue()).toBe(false)

      animationBuffer.add(initialCoordinate)
      animationBuffer.add(currentCoordinate)

      expect(animationBuffer.continue()).toBe(true)
      expect(animationBuffer.length).toEqual(6)
      expect(animationBuffer[0]).toEqual(initialCoordinate)
      expect(animationBuffer[animationBuffer.length - 1]).toEqual(currentCoordinate)
    })
  })

  describe('continue', () => {
    beforeEach(() => {
      animationBuffer.splice(0, animationBuffer.length)
      animationBuffer.currentIndex = 0
    })

    it('returns true when the currentIndex is 2 less than the length', () => {
      animationBuffer.push([1, 1])
      animationBuffer.push([2, 2])
      animationBuffer.push([3, 3])

      expect(animationBuffer.continue()).toBe(true)
    })

    it('returns false when the currentIndex is within 2 of the length', () => {
      animationBuffer.push([1, 1])
      animationBuffer.push([2, 2])
      animationBuffer.push([3, 3])
      animationBuffer.currentIndex = 1

      expect(animationBuffer.continue()).toBe(false)
    })

    it('truncates when the currentIndex is equal to the steps', () => {
      animationBuffer.push([1, 1])
      animationBuffer.push([2, 2])
      animationBuffer.push([3, 3])
      animationBuffer.push([4, 4])
      animationBuffer.push([5, 5])
      animationBuffer.push([6, 6])
      animationBuffer.push([7, 7])
      animationBuffer.push([8, 8])
      animationBuffer.currentIndex = 5

      expect(animationBuffer.continue()).toBe(true)
      expect(animationBuffer.currentIndex).toEqual(0)
      expect(animationBuffer.length).toEqual(2)
    })
  })

  describe('truncate', () => {
    beforeEach(() => {
      animationBuffer.splice(0, animationBuffer.length)
      animationBuffer.currentIndex = 0
    })

    it('removes all elements up to the currentIndex', () => {
      animationBuffer.push([1, 1])
      animationBuffer.push([2, 2])
      animationBuffer.push([3, 3])
      animationBuffer.currentIndex = 1

      animationBuffer.truncate(0)

      expect(animationBuffer.length).toEqual(1)
      expect(animationBuffer[0]).toEqual([3, 3])
    })
  })
})
