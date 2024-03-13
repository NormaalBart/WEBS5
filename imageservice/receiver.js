import express from 'express'

const app = express()
const port = process.env.PORT || 3000

// Middleware om JSON body te parseren
app.use(express.json())

app.get('/', (req, res) => {
  res.send('receivedfdsafdsajfdsjklfdskjlfdsjklad')
})


app.post('/upload', (req, res) => {
  res.send('POST-verzoek ontvangen!')
})

app.listen(port, () => {
  console.log(`Server luistert op poort ${port}`)
})
