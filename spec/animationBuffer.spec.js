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
      expect(animationBuffer[0]).toEqual({bearing: null, coordinates: [1, 1]})
    })

    it('calls calculateIntermediatePoints when adding a new coordinate pair', () => {
      let initialCoordinate = [-118.341345, 34.101544]
      let currentCoordinate = [-118.342438, 34.101539]
      expect(animationBuffer.continue()).toBe(false)

      animationBuffer.add(initialCoordinate)
      animationBuffer.add(currentCoordinate)

      expect(animationBuffer.continue()).toBe(true)
      expect(animationBuffer.length).toEqual(6)
      expect(
        animationBuffer[0]
      ).toEqual({bearing: null, coordinates: initialCoordinate})
      expect(
        animationBuffer[animationBuffer.length - 1]
      ).toEqual({bearing: null, coordinates: currentCoordinate})
    })
  })

  describe('continue', () => {
    beforeEach(() => {
      animationBuffer.splice(0, animationBuffer.length)
      animationBuffer.currentIndex = 0
    })

    it('returns true when the currentIndex is 2 less than the length', () => {
      animationBuffer.push({bearing: null, coordinates: [1, 1]})
      animationBuffer.push({bearing: null, coordinates: [2, 2]})
      animationBuffer.push({bearing: null, coordinates: [3, 3]})

      expect(animationBuffer.continue()).toBe(true)
    })

    it('returns false when the currentIndex is within 2 of the length', () => {
      animationBuffer.push({bearing: null, coordinates: [1, 1]})
      animationBuffer.push({bearing: null, coordinates: [2, 2]})
      animationBuffer.push({bearing: null, coordinates: [3, 3]})
      animationBuffer.currentIndex = 1

      expect(animationBuffer.continue()).toBe(false)
    })

    it('truncates when the currentIndex is equal to the steps', () => {
      animationBuffer.push({bearing: null, coordinates: [1, 1]})
      animationBuffer.push({bearing: null, coordinates: [2, 2]})
      animationBuffer.push({bearing: null, coordinates: [3, 3]})
      animationBuffer.push({bearing: null, coordinates: [4, 4]})
      animationBuffer.push({bearing: null, coordinates: [5, 5]})
      animationBuffer.push({bearing: null, coordinates: [6, 6]})
      animationBuffer.push({bearing: null, coordinates: [7, 7]})
      animationBuffer.push({bearing: null, coordinates: [8, 8]})
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
      animationBuffer.push({bearing: null, coordinates: [1, 1]})
      animationBuffer.push({bearing: null, coordinates: [2, 2]})
      animationBuffer.push({bearing: null, coordinates: [3, 3]})
      animationBuffer.currentIndex = 1

      animationBuffer.truncate(0)

      expect(animationBuffer.length).toEqual(1)
      expect(animationBuffer[0].coordinates).toEqual([3, 3])
    })
  })

  describe('currentBearing', () => {
    beforeEach(() => {
      animationBuffer.splice(0, animationBuffer.length)
      animationBuffer.currentIndex = 0
    })

    it('works', () => {
      animationBuffer.push({bearing: null, coordinates: [-118.34221940001036, 34.10154000077439]})
      animationBuffer.push({bearing: null, coordinates: [-118.34232870000582, 34.10153950043559]})
      animationBuffer.push({bearing: null, coordinates: [-118.342438, 34.101539]})
      animationBuffer.push({bearing: null, coordinates: [-118.34243800000002, 34.101544000000004]})
      animationBuffer.push({bearing: null, coordinates: [-118.34243800000002, 34.101549000000006]})

      expect(animationBuffer.currentBearing()).toEqual(-90.31671318974844)

      animationBuffer.currentIndex = 1
      expect(animationBuffer.currentBearing()).toEqual(-90.31677446648426)

      animationBuffer.currentIndex = 2
      expect(animationBuffer.currentBearing()).toEqual(0)
    })
  })

  describe('calculateIntermediatePoints', () => {
    it('calls calculateIntermediatePoints when adding a new coordinate pair', () => {
      let testBuffer = new AnimationBuffer(10)
      let initialCoordinate = [-118.344754, 34.10005]
      // [-118.34470819925232, 34.0998965000765]
      // [-118.3446623986708, 34.099743000135966]
      // [-118.34461659825544, 34.09958950017845]
      // [-118.34457079800622, 34.09943600020395]
      // [-118.34452499792317, 34.09928250021245]
      // [-118.34447919800624, 34.09912900020395]
      // [-118.34443339825549, 34.098975500178454]
      // [-118.34438759867086, 34.09882200013597]
      // [-118.34434179925235, 34.09866850007648]
      // [-118.34429600000001, 34.098515]
      let nextCoordinate = [-118.344296, 34.098515]

      testBuffer.add(initialCoordinate)
      testBuffer.add(nextCoordinate)

      expect(testBuffer.length).toEqual(12)
      expect(testBuffer[0].coordinates).toEqual(initialCoordinate)
      expect(testBuffer[testBuffer.length - 1].coordinates).toEqual(nextCoordinate)
    })

    it('2 calls calculateIntermediatePoints when adding a new coordinate pair', () => {
      let testBuffer = new AnimationBuffer(10)
      let initialCoordinate = [-118.342438, 34.101539]
      // [-118.34243800000002, 34.101544000000004]
      // [-118.34243800000002, 34.101549000000006]
      // [-118.34243800000002, 34.101554]
      // [-118.34243800000002, 34.101559]
      // [-118.34243800000002, 34.101564]
      // [-118.34243800000002, 34.101569]
      // [-118.34243800000002, 34.101574]
      // [-118.34243800000002, 34.101579]
      // [-118.34243800000002, 34.101584]
      let nextCoordinate = [-118.342438, 34.101589]

      testBuffer.add(initialCoordinate)
      testBuffer.add(nextCoordinate)

      expect(testBuffer.length).toEqual(11)
      expect(testBuffer[0].coordinates).toEqual(initialCoordinate)
      expect(testBuffer[testBuffer.length - 1].coordinates).toEqual(nextCoordinate)
    })
  })
})
