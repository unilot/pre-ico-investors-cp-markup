var gulp = require('gulp');
var pug = require('gulp-pug');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var hash = require('gulp-hash-filename');
var minifyCSS = require('gulp-csso');
var clean = require('gulp-clean');
var sass = require('gulp-sass');


//Config
var srcDir = __dirname + '/src';
var distDir = __dirname + '/dist';
var nodeModules = __dirname + '/node_modules';

var htmlSrc = [
    srcDir + '/templates/*.pug'
];

var jsSrc = [
    nodeModules + '/jquery/dist/jquery.js',
    nodeModules + '/moment/min/moment.min.js',
    nodeModules + '/moment-timezone/builds/moment-timezone-with-data.min.js',
    nodeModules + '/jquery-countdown/dist/jquery.countdown.js',
    nodeModules + '/jsrender/jsrender.js',
    nodeModules + '/bootstrap/dist/js/bootstrap.min.js',
    nodeModules + '/web3/dist/web3.js',
    nodeModules + '/bootstrap-validator/dist/validator.min.js',
    nodeModules + '/js-cookie/src/js.cookie.js',
    nodeModules + '/twitter-bootstrap-wizard/jquery.bootstrap.wizard.js',
    nodeModules + '/twitter-bootstrap-wizard/prettify.js',
    nodeModules + '/google-libphonenumber/dist/libphonenumber.js',
    srcDir + '/js/*.js'
];

var cssSrc = [
    nodeModules + '/normalize.css/normalize.css',
    nodeModules + '/bootstrap/dist/css/bootstrap.css',
    nodeModules + '/twitter-bootstrap-wizard/prettify.css',
    srcDir + '/css/sass/sass.css',
    srcDir + '/css/*.css'
];

var sassSrc = [
    srcDir + '/sass/*.sass',
    srcDir + '/sass/**/*.sass',
]

var fontsSrc = [
    nodeModules + '/bootstrap/dist/fonts/*',
    srcDir + '/fonts/*'
];
//END Config


gulp.task('html', function(){
   return gulp.src(htmlSrc)
       .pipe(pug())
       .pipe(gulp.dest(distDir))
});

gulp.task('webserver', function(){
    gulp.src(distDir)
        .pipe(webserver({
            open: true,
            host: '127.0.0.1',
            port: 8030,
            fallback: 'index.html'
        }))
});

gulp.task('js:dev', function(){
    return gulp.src(jsSrc)
        .pipe(concat('main.js'))
        .pipe(gulp.dest(distDir + '/assets/js/'))
});

gulp.task('js:prod', function(){
    return gulp.src(jsSrc)
        .pipe(concat('main.min.js'))
        .pipe(hash())
        .pipe(uglify())
        .pipe(gulp.dest(distDir + '/assets/js/'))
});

gulp.task('sass', function(){
    return gulp.src(sassSrc)
        .pipe(sass({}).on('error', sass.logError))
        .pipe(concat('sass.css'))
        .pipe(gulp.dest(srcDir + '/css/sass'));
});

gulp.task('css:dev', ['sass'], function () {
    return gulp.src(cssSrc)
        .pipe(concat('main.css'))
        .pipe(gulp.dest(distDir + '/assets/css/'))
});

gulp.task('css:prod', ['sass'], function () {
    return gulp.src(cssSrc)
        .pipe(concat('main.min.css'))
        .pipe(hash())
        .pipe(minifyCSS())
        .pipe(gulp.dest(distDir + '/assets/css/'))
});

gulp.task('fonts', function () {
    return gulp.src(fontsSrc)
        .pipe(gulp.dest(distDir + '/assets/fonts/'))
});

gulp.task('watch', function(){
    var htmlWatch = htmlSrc;
    htmlWatch.push(srcDir + '/templates/**/*.pug');

    gulp.watch(htmlWatch, ['html']);
    gulp.watch(jsSrc, ['js:dev']);
    gulp.watch(cssSrc, ['css:dev']);
    gulp.watch(sassSrc, ['css:dev']);
});

gulp.task('clean', function () {
    return gulp.src(distDir + '/*')
        .pipe(clean())
});

gulp.task('dev', ['html', 'js:dev', 'css:dev', 'fonts', 'webserver', 'watch']);
gulp.task('build:dev', ['html', 'js:dev', 'css:dev', 'fonts']);
gulp.task('build:prod', ['html', '  js:prod', 'css:prod', 'fonts']);
