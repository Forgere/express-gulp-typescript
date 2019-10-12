const gulp = require('gulp');
const ts = require('gulp-typescript');
const browserSync = require('browser-sync');

const tsProject = ts.createProject('./tsconfig.json');
const {
  series, lastRun, src, dest, watch,
} = gulp;
const nodemon = require('nodemon');
const less = require('gulp-less');
const LessAutoprefix = require('less-plugin-autoprefix');

const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });

const staticPath = [
  'src/public/images/**',
  'src/public/javascripts/**',
  'src/public/javascripts/**/.css',
  'src/views/**',
  'src/routes/**/*.js',
];

// 复制非ts
function copyStatic() {
  return src(
    staticPath,
    {
      base: './src',
      since: lastRun(copyStatic),
    },
  )
    .pipe(dest('dist/'));
}

// less
function tranfromless() {
  return gulp.src('./src/**/*.less', {
    since: lastRun(tranfromless),
    base: './src',
  })
    .pipe(less({
      plugins: [autoprefix],
    }))
    .pipe(gulp.dest('dist/'));
}

// TS 转 js
function tranformts() {
  return src(
    [
      'src/**/*.ts',
    ],
    {
      base: './src',
      since: lastRun(tranformts),
    },
  )
    .pipe(tsProject())
    .js
    .pipe(dest('dist/'));
}

// 浏览器同步
gulp.task('browerSync', (cb) => {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    browser: 'google chrome',
    port: 7000,
  });
  cb();
});

// reload
gulp.task('reload', (cb) => {
  browserSync.reload();
  cb();
});

// 起服务
gulp.task('serve', (cb) => {
  let start = false;
  nodemon({
    script: 'dist/bin/www.js',
  }).on('start', () => {
    if (!start) {
      cb();
      start = true;
    }
  });
});

gulp.task('default', series(copyStatic, tranfromless, tranformts, 'browerSync', 'serve', () => {
  watch(staticPath, { ignoreInitial: true }, series(copyStatic, 'reload'));
  // watch .ts file
  watch('src/**/*.ts', series(tranformts, 'reload'));

  watch('src/**/*.less', series(tranfromless, 'reload'));
}));
