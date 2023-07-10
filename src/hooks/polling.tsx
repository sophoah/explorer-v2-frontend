import { useState, useEffect, useRef, Dispatch } from 'react'
import { getTabHidden, useWindowFocused } from './useWindowFocusHook';

export type APIPollingOptions<DataType> = {
  fetchFunc: () => Promise<DataType>
  initialState: DataType
  delay: number
  onError?: (e: Error, setData?: Dispatch<any>) => void
  updateTrigger?: any,
  disableTabListener?: boolean
}

function useAPIPolling<DataType>(opts: APIPollingOptions<DataType>): DataType {
  const { initialState, fetchFunc, delay, onError, updateTrigger, disableTabListener } = opts
  const focus = useWindowFocused();

  const timerId = useRef<any>()
  const fetchCallId = useRef(0)
  const [data, setData] = useState(initialState)

  const fetchData = (id: Number) => {
    return new Promise(resolve => {
      fetchFunc()
        .then(newData => {
          if (id === fetchCallId.current) {
            setData(newData)
          }
          resolve(null)
        })
        .catch(e => {
          if (!onError) {
            setData(initialState)
            resolve(null)
          } else {
            onError(e, setData)
            resolve(null)
          }
        })
    })
  }

  const pollingRoutine = () => {
    if (getTabHidden() && !disableTabListener) {
      return; // don't poll if the tab is hidden
    }
    fetchCallId.current += 1
    /* tslint:disable no-floating-promises */
    fetchData(fetchCallId.current).then(() => {
      doPolling()
    })
    /* tslint:enable no-floating-promises */
  }

  const doPolling = () => {
    timerId.current = setTimeout(() => {
      pollingRoutine()
    }, delay)
  }

  const stopPolling = () => {
    if (timerId.current) {
      clearTimeout(timerId.current)
      timerId.current = null
    }
  }

  useEffect(
    () => {
      /* tslint:disable no-floating-promises */
      pollingRoutine()
      /* tslint:enable */

      return stopPolling
    },
    updateTrigger ? [updateTrigger] : []
  )

  return data
}

export default useAPIPolling