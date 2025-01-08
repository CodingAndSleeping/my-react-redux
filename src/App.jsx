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

function logger({ getState }) {
  return next => action => {
    console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

const thunk =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // The thunk middleware looks for any functions that were passed to `store.dispatch`.
    // If this "action" is really a function, call it and return the result.
    if (typeof action === 'function') {
      // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
      return action(dispatch, getState)
    }

    // Otherwise, pass the action down the middleware chain as usual
    return next(action)
  }
const store = createStore(reducer, { user: { name: 'lzt', age: 26 }, aaa: 'bbb' }, applyMiddleware(logger, thunk))

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
    dispatch((dispatch, getState) => {
      setTimeout(() => {
        dispatch({ type: 'updateUser', payload: { name: 'newLzt' } })
        console.log(getState())
      }, 1000)
    })
  }

  return <button onClick={onClick}>点我修改数据</button>
})

export default App
