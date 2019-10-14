import * as express from 'express'
import fs from 'fs'
import path from 'path'
const router: express.Router = express.Router();

// GET users listing. 
router.get('/:name', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const name: string = req.params.name;
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.sendFile(path.join(__dirname, `../public/images/${name}`));
});

export {router as users};
