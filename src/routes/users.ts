import * as express from 'express'
const router: express.Router = express.Router();

// GET users listing. 
router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a resource');
});

export {router as users};
