const choo = require('choo')
const html = require('choo/html')
const app = choo()

// model

app.use( (state, emitter) => {
  state.items = [
    {
      title: 'Beetroot',
      amount: 3,
      measure: 'pieces',
      open_since: '2017-03-28',
    },
    {
      title: 'Roman salad',
      amount: 2,
      measure: 'pieces',
      open_since: '2017-03-28',
    },
  ]
  emitter.on('consume_food', (i)=> {
    console.log(i)
    state.items.splice(i, 1)
    emitter.emit('render')
  })
})

//view 
const button = (x, emit) => html`
  <button 
    class="delete"
    onclick=${ (event) => 
      emit('consume_food', x)
    }>Delete me
   </button>`

const view = (state, emit) => {
  let i = 0
  return html`
   <body>
    <div>
      <h1>Dinner Topics</h1>
      <ul>
        ${state.items.map((food) => { 
          return(
          html`<li>
            ${food.title} (${food.amount} ${food.measure})
            ${button(i++, emit)}
          </li>`
          )
        }
        )}
      </ul>
    </div>
   </body>`
}

app.route('/', view)

// start the app
app.mount('body')
