export const register = (app, db) => {
  app.get('/:targetId/:imageId', async (req, res) => {
    res.send('Werkt!')
  })
}
