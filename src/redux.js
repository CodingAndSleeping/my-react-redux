import { createContext, useState, useEffect } from 'react'

const appContext = createContext()

let state
let reducer
const listeners = []

const middlewareFns = []

let currentAction = {
  type: '',
  payload: null,
}

const setState = newState => {
  state = newState
  listeners.forEach(fn => fn())
}
// 创建一个store
const store = {
  getState() {
    return state
  },

  dispatch(action) {
    setState(reducer(state, action))
    currentAction = action

    return action
  },

  subscribe(fn) {
    // 订阅
    listeners.push(fn)
    return () => {
      // 取消订阅
      const index = listeners.indexOf(fn)
      listeners.splice(index, 1)
    }
  },
}

// 判断两个对象是否有变化
const changed = (newObj, oldObj) => {
  for (let key in newObj) {
    if (newObj[key] !== oldObj[key]) {
      return true
    }
  }
  return false
}

// connect 本质就是一个创建 中间wrapper组件的函数 调用该函数 返回一个中间组件 中间组件里面可以使用useContext
export const connect = (mapStateToProps, mapDispatchToProps) => Component => {
  const Wrapper = props => {
    const data = typeof mapStateToProps === 'function' ? mapStateToProps(state) : { state }
    const dispatchs = typeof mapDispatchToProps === 'function' ? mapDispatchToProps(store.dispatch) : { dispatch: store.dispatch }

    const [, update] = useState({})

    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        const newData = typeof mapStateToProps === 'function' ? mapStateToProps(state) : { state }
        if (changed(newData, data)) {
          update({})
        }
      })

      return () => {
        unsubscribe()
      }
    }, [])

    return <Component {...props} {...data} {...dispatchs} />
  }

  return Wrapper
}

export const createStore = (initialreducer, initialState, applyMiddleware) => {
  state = initialState
  reducer = initialreducer
  applyMiddleware()
  return store
}

// 封装Provider组件
export const Provider = ({ store, children }) => {
  return <appContext.Provider value={store}> {children} </appContext.Provider>
}

// 注册中间件函数
export const applyMiddleware = (...middlewares) => {
  return () => {
    const prevDispatch = store.dispatch

    store.dispatch = action => {
      prevDispatch(action)
      middlewareFns.forEach(fn => {
        fn(currentAction)
      })
      return action
    }
    middlewares.forEach(middleware => {
      middlewareFns.push(middleware(store)(prevDispatch))
    })
  }
}
