import { tryToAutoDisable } from '../autoDisable'
import * as enableUtils from '../enable'
import { LAST_TIME_ENABLED } from '../constants'

describe('tryToAutoDisable', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should not call disable if last time enabled is not present', () => {
    const spy = jest.spyOn(enableUtils, 'disable')
    tryToAutoDisable()

    expect(spy).not.toHaveBeenCalled()
  })

  it('should not call disable if last time i date.now is less than 2 days', () => {
    localStorage.setItem(LAST_TIME_ENABLED, '0')
    Date.now = () => 100
    const spy = jest.spyOn(enableUtils, 'disable')
    tryToAutoDisable()

    expect(spy).not.toHaveBeenCalled()
  })

  it('should call disable if last time i date.now is less than 2 days', () => {
    localStorage.setItem(LAST_TIME_ENABLED, '0')
    Date.now = () => 2 * 1000 * 60 * 60 * 24 + 1
    const spy = jest.spyOn(enableUtils, 'disable')
    tryToAutoDisable()

    expect(spy).toHaveBeenCalled()
  })

  it('should set actual last time if last time is not a number in local storage', () => {
    localStorage.setItem(LAST_TIME_ENABLED, 'something')
    Date.now = () => 1000
    const spy = jest.spyOn(enableUtils, 'disable')
    tryToAutoDisable()

    const lastTime = localStorage.getItem(LAST_TIME_ENABLED)

    expect(lastTime).toBe('1000')
    expect(spy).not.toHaveBeenCalled()
  })
})
