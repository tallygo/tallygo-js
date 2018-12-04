import AnimationBuffer from '../src/animationBuffer'

describe('AnimationBuffer', () => {
  let animationBuffer = new AnimationBuffer(5)
  let point1 = [-118.344754, 34.10005]
  let point2 = [-118.344296, 34.098515]
  let point3 = [-118.342438, 34.101589]
  let expectedBearing1 = 166.12165390393776
  let expectedBearing2 = 26.587416595361592

  function setAnimationBuffer(buffer, index, bearing, coordinates) {
    buffer.splice(0, buffer.length)
    coordinates.forEach((pair) => {
      buffer.push({bearing: 0, coordinates: pair})
    })
    buffer.currentBearing = bearing
    buffer.currentIndex = index
  }

  function animationBufferToArray(buffer) {
    let acc = []
    animationBuffer.forEach(function(obj) {
      acc.push({bearing: obj.bearing, coordinates: obj.coordinates})
    })
    return acc
  }

  describe('add', () => {
    it('calculates intermediate points and the bearing', () => {
      setAnimationBuffer(animationBuffer, 0, 0, [])
      animationBuffer.add(point1)
      animationBuffer.add(point2)

      expect(animationBuffer.currentBearing).toEqual(expectedBearing1)
      expect(animationBufferToArray(animationBuffer)).toEqual([
        {bearing: 0, coordinates: point1},
        {bearing: expectedBearing1, coordinates: [-118.3446623986708, 34.099743000135966]},
        {bearing: expectedBearing1, coordinates: [-118.34457079800622, 34.09943600020395]},
        {bearing: expectedBearing1, coordinates: [-118.34447919800624, 34.09912900020395]},
        {bearing: expectedBearing1, coordinates: point2}
      ])

      animationBuffer.add(point3)

      expect(animationBuffer.currentBearing).toEqual(expectedBearing2)
      expect(animationBufferToArray(animationBuffer)).toEqual([
        {bearing: 0, coordinates: point1},
        {bearing: expectedBearing1, coordinates: [-118.3446623986708, 34.099743000135966]},
        {bearing: expectedBearing1, coordinates: [-118.34457079800622, 34.09943600020395]},
        {bearing: expectedBearing1, coordinates: [-118.34447919800624, 34.09912900020395]},
        {bearing: expectedBearing1, coordinates: point2},
        {bearing: expectedBearing2, coordinates: [-118.34392441079844, 34.09912980223767]},
        {bearing: expectedBearing2, coordinates: [-118.34355281619787, 34.09974460335655]},
        {bearing: expectedBearing2, coordinates: [-118.34318121619809, 34.10035940335659]},
        {bearing: expectedBearing2, coordinates: point3}
      ])
    })

    it('does not calculate intermediate points or the bearing when the vehicle did not move', () => {
      setAnimationBuffer(animationBuffer, 0, 0, [])
      point3 = [-118.344266, 34.098505]

      animationBuffer.add(point1)
      animationBuffer.add(point2)

      expect(animationBuffer.currentBearing).toEqual(expectedBearing1)
      expect(animationBufferToArray(animationBuffer)).toEqual([
        {bearing: 0, coordinates: point1},
        {bearing: expectedBearing1, coordinates: [-118.3446623986708, 34.099743000135966]},
        {bearing: expectedBearing1, coordinates: [-118.34457079800622, 34.09943600020395]},
        {bearing: expectedBearing1, coordinates: [-118.34447919800624, 34.09912900020395]},
        {bearing: expectedBearing1, coordinates: point2}
      ])

      animationBuffer.add(point3)

      expect(animationBuffer.currentBearing).toEqual(expectedBearing1)
      expect(animationBufferToArray(animationBuffer)).toEqual([
        {bearing: 0, coordinates: point1},
        {bearing: expectedBearing1, coordinates: [-118.3446623986708, 34.099743000135966]},
        {bearing: expectedBearing1, coordinates: [-118.34457079800622, 34.09943600020395]},
        {bearing: expectedBearing1, coordinates: [-118.34447919800624, 34.09912900020395]},
        {bearing: expectedBearing1, coordinates: point2},
        {bearing: expectedBearing1, coordinates: point3}
      ])
    })
  })

  describe('continue', () => {
    it('returns false when the currentIndex is within 2 of the length', () => {
      setAnimationBuffer(animationBuffer, 1, 0, [[1, 1], [2, 2], [3, 3]])
      expect(animationBuffer.continue()).toBe(false)
      expect(animationBuffer.length).toEqual(1)
    })

    it('returns true when the currentIndex is 2 less than the length', () => {
      setAnimationBuffer(animationBuffer, 0, 0, [[1, 1], [2, 2], [3, 3]])
      expect(animationBuffer.continue()).toBe(true)
      expect(animationBuffer.length).toEqual(3)
    })

    it('truncates when the currentIndex is equal to the steps', () => {
      setAnimationBuffer(
        animationBuffer, 5, 0,
        [
          [1, 1], [2, 2], [3, 3], [4, 4],
          [5, 5], [6, 6], [7, 7], [8, 8]
        ]
      )

      expect(animationBuffer.continue()).toBe(true)
      expect(animationBuffer.currentIndex).toEqual(1)
      expect(animationBuffer.length).toEqual(2)
    })
  })

  describe('current', () => {
    it('returns the coordinates for the object at the currentIndex', () => {
      setAnimationBuffer(animationBuffer, 0, 0, [[1, 1], [2, 2], [3, 3]])
      expect(animationBuffer.current()).toEqual({bearing: 0, coordinates: [1, 1]})

      animationBuffer.currentIndex = 2
      expect(animationBuffer.current()).toEqual({bearing: 0, coordinates: [3, 3]})
    })
  })

  describe('truncate', () => {
    it('removes all elements from the given index to the currentIndex', () => {
      setAnimationBuffer(animationBuffer, 1, 0, [[1, 1], [2, 2], [3, 3], [4, 4]])

      animationBuffer.truncate(0)

      expect(animationBuffer.length).toEqual(2)
      expect(animationBuffer.currentIndex).toEqual(0)
      expect(animationBuffer[0].coordinates).toEqual([3, 3])
    })
  })

  describe('calculateDistanceAndBearing', () => {
    it('updates the currentBearing and returns the distance between the given points', () => {
      setAnimationBuffer(animationBuffer, 0, 0, [])

      expect(animationBuffer.currentBearing).toEqual(0)
      expect(
        animationBuffer.calculateDistanceAndBearing(point1, point2)
      ).toEqual(175.81694212313897)
      expect(animationBuffer.currentBearing).toEqual(expectedBearing1)
    })

    it('does not update the currentBearing if the distance is less than 10 meters', () => {
      setAnimationBuffer(animationBuffer, 0, -90, [])
      let from = [-118.342438, 34.101589]
      let to = [-118.342441, 34.101539]

      expect(animationBuffer.currentBearing).toEqual(-90)
      expect(
        animationBuffer.calculateDistanceAndBearing(from, to)
      ).toEqual(5.566611549308557)
      expect(animationBuffer.currentBearing).toEqual(-90)
    })
  })
})
