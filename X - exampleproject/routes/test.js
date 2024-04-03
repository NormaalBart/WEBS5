export const register = (app, db) => {
  app.get('/test', async (req, res) => {
    res.send('Werkt!')
  })
}
