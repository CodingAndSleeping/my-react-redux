import './App.css'

import { createStore, connect, Provider, applyMiddleware } from './redux'

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'updateUser':
      return {
        ...state,
        user: {
          ...state.user,
          ...payload,
        },
      }
    default:
      return state
  }
}

const thunk =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (typeof action === 'function') {
      return action(dispatch, getState)
    }

    return next(action)
  }
const store = createStore(reducer, { user: { name: 'lzt', age: 26 }, aaa: 'bbb' }, applyMiddleware(thunk))

const App = () => {
  // const [appState, setAppState] = useState({
  //   user: { name: 'lzt', age: 26 },
  // })
  // const contextValue = { appState, setAppState }

  return (
    <Provider store={store}>
      <FirstChild />
      <SecondChild />
      <ThirdChild />
    </Provider>
  )
}

const FirstChild = () => {
  console.log('大儿子执行了')
  return (
    <section>
      大儿子
      <User />
    </section>
  )
}

const SecondChild = () => {
  console.log('二儿子执行了')
  return (
    <section>
      二儿子
      <UserModifier />
      异步修改： <UserModifierAsync />
    </section>
  )
}

const ThirdChild = connect(state => {
  return {
    aaa: state.aaa,
  }
})(({ aaa }) => {
  console.log('小儿子执行了')
  return (
    <section>
      小儿子
      {aaa}
    </section>
  )
})

const User = connect(state => {
  return {
    user: state.user,
  }
})(({ user }) => {
  return <div>名字：{user.name}</div>
})

const UserModifier = connect(null, dispatch => {
  return {
    updateUser: payload => dispatch({ type: 'updateUser', payload }),
  }
})(({ updateUser, state }) => {
  const onChange = e => {
    updateUser({ name: e.target.value })
  }

  return <input value={state.user.name} onChange={onChange} />
})

const UserModifierAsync = connect()(({ dispatch }) => {
  const onClick = () => {
    dispatch(dispatch => {
      setTimeout(() => {
        dispatch({ type: 'updateUser', payload: { name: 'newLzt' } })
      }, 1000)
    })
  }

  return <button onClick={onClick}>点我修改数据</button>
})

export default App
