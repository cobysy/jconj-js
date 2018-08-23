// Gulp.js configuration
const gulp = require('gulp');
const exec = require('child_process').exec;

// folders
const folder = {
    src: './',
    build: './build/'
};

gulp.task('build-conjtables', function (cb) {
    exec('mkdir -p ./build && cd ./src && node index.js --conjtables > ./../build/conj-tables.json', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});