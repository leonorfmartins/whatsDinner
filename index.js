const choo = require('choo')
const html = require('choo/html')
const app = choo()
const request = require('hyperquest')
const bl = require('bl')
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

const inputItem = () => html`
  <form>
    <input type="text" placeholder="Item" name="item">  
    <input type="text" placeholder="Quantidade" name="quantity">  
    <input type="text" placeholder="Medida" name="measure">  
    <input type="text" placeholder="Aberto desde" name="open_since">  
    <input type="submit" onclick=${submit}>
  </form>
`
const submit = (e) => {
  e.preventDefault();
  let fields = Array.from(document.querySelectorAll('form>input:not([type=submit])'))
  let payload = fields.reduce( (acc, field) => {
    acc[field.getAttribute('name')] = field.value
    return acc
  }, {})
  payload = JSON.stringify(payload)
  // TODO: validation
  bl(payload).pipe(request.post(`${document.location}newItem`, {}, function (err, res) {
    console.log(arguments)
    if(err) {
      console.log('ooooohhh, this is sad! Try again', err.message)
      return
    }
  }))
}

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
      ${inputItem()}
    </div>
   </body>`
}

app.route('/', view)

// start the app
app.mount('body')
