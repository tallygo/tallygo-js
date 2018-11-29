import AnimationBuffer from '../src/animationBuffer'

describe('AnimationBuffer', () => {
  const animationBuffer = new AnimationBuffer(5)

  it('has the expected steps', () => {
    expect(animationBuffer.steps).toEqual(5)
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
})
