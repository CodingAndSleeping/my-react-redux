import { createContext, useState, useContext, useEffect } from 'react'

const appContext = createContext()

// 创建一个store
const store = {
  // state: {
  //   user: { name: 'lzt', age: 26 },
  // },

  state: undefined,
  reducer: undefined,
  setState(newState) {
    store.state = newState
    store.listeners.forEach(fn => fn())
  },

  listeners: [], // 订阅者

  subscribe(fn) {
    // 订阅
    store.listeners.push(fn)
    return () => {
      // 取消订阅
      const index = store.listeners.indexOf(fn)
      store.listeners.splice(index, 1)
    }
  },
}

// 规范化的创建新的state 需要一个reducer函数
// const reducer = (state, { type, payload }) => {
//   switch (type) {
//     case 'updateUser':
//       return {
//         ...state,
//         user: {
//           ...state.user,
//           ...payload,
//         },
//       }
//     default:
//       return state
//   }
// }

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
    const dispatch = action => {
      setState(store.reducer(state, action))
      update({})
    }

    const { state, setState } = useContext(appContext)

    const data = typeof mapStateToProps === 'function' ? mapStateToProps(state) : { state }
    const dispatchs = typeof mapDispatchToProps === 'function' ? mapDispatchToProps(dispatch) : { dispatch }

    const [, update] = useState({})

    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        const newData = typeof mapStateToProps === 'function' ? mapStateToProps(store.state) : { state: store.state }
        if (changed(newData, data)) {
          update({})
        }
      })

      return () => {
        unsubscribe()
      }
    }, [])

    return <Component {...data} {...props} {...dispatchs} />
  }

  return Wrapper
}

export const createStore = (reducer, initialState) => {
  store.state = initialState
  store.reducer = reducer

  return store
}

export const Provider = ({ store, children }) => {
  return <appContext.Provider value={store}> {children} </appContext.Provider>
}
