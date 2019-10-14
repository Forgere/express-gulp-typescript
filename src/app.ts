import cookieParser from 'cookie-parser';
import e from "express";
import createHttpError from 'http-errors';
import morgan from 'morgan';
import path from 'path';
import { downloadServalPage } from './models/mzi';

const createError: createHttpError.CreateHttpError = createHttpError;

import { index as indexRouter} from './routes/index';
import { users as usersRouter} from './routes/users';
const app: e.Express = e();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(e.json());
app.use(e.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(e.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((
  req: e.Request,
  res: e.Response,
  next: e.NextFunction
) => {
  next(createError(404));
});

interface IMyResponse extends e.Response{
  locals: {
    message: string;
    error: object;
  };
}

// error handler
app.use((
  err: {
    status: number | undefined;
    message: string;
  },
  req: e.Request,
  res: IMyResponse,
  next: e.NextFunction
) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status !== undefined ? err.status : 500);
  res.render('error');
});

// downloadSingleImage('https://i5.meizitu.net/2019/08/23b03.jpg', '13', ()=>{
//   let a: number = 1;
//   a += 1
// })

// downloadGroup([
//   'https://i5.meizitu.net/2019/08/23b01.jpg',
//   'https://i5.meizitu.net/2019/08/23b02.jpg',
//   'https://i5.meizitu.net/2019/08/23b03.jpg',
//   'https://i5.meizitu.net/2019/08/23b04.jpg',
// ],'m',(err: Error, res: string)=>{
//   console.log(res)
// })

// downloadSinglePage('https://www.mzitu.com/195146', (err, res)=>{
//   console.log(res)
// })

downloadServalPage('1', (err, res) => {
  console.log(res, err)
})


export {app};
