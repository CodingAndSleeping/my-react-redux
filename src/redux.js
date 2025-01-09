import { createContext, useState, useEffect } from 'react'

// 创建一个上下文
const appContext = createContext()

let state // 创建一个初始的state
let reducer // 创建一个初始的reducer
const listeners = [] // 订阅者

const middlewareFns = [] // 中间件函数

// 创建一个修改state的函数 并执行订阅的回调函数
const setState = newState => {
  state = newState
  listeners.forEach(fn => fn())
}
// 创建一个store
const store = {
  // 获取state
  getState() {
    return state
  },

  // 发送action
  dispatch(action) {
    setState(reducer(state, action))
    return action
  },

  // 订阅
  subscribe(fn) {
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

// connect 本质就是一个创建 中间wrapper组件的函数 调用该函数 返回一个中间组件
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

// 创建store
export const createStore = (initialreducer, initialState, enhancer) => {
  state = initialState
  reducer = initialreducer
  if (typeof enhancer === 'function') enhancer()
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
        fn(action)
      })
      return action
    }
    middlewares.forEach(middleware => {
      middlewareFns.push(middleware(store)(prevDispatch))
    })
  }
}
