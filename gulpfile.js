// Gulp.js configuration
const gulp = require('gulp');
const exec = require('child_process').exec;

gulp.task('build-conjtables', function (cb) {
    exec('node ./dist/console/jconj.js --conjtables > ./dist/console/conj-tables.json',
        (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            cb(err);
        });
});