export const register = (app, db) => {
  app.post('/test', async (req, res) => {
    res.send('Werkt!')
  })
}
