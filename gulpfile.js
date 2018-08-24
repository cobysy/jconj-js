// Gulp.js configuration
const gulp = require('gulp');
const exec = require('child_process').exec;

// npm install --save-dev gulp-typescript
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const folders = {
    dist: './dist'
};

gulp.task("default", () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(folders.dist));
});

gulp.task('build-conjtables', () => {
    exec(`node ${folders.dist}/console/jconj.js --conjtables > ./${dist}/console/conj-tables.json`)
        .stdout.pipe(process.stdout);
});

gulp.task("demo", () => {
    exec(`node ${folders.dist}//console/jconj.js vk 来る くる`)
        .stdout.pipe(process.stdout);
});