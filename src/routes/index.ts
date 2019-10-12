import * as express from 'express'
const indexRouter: express.Router = express.Router();

// GET home pagexpress.
indexRouter.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.render('index', { title: 'express' });
});

export { indexRouter as index };
