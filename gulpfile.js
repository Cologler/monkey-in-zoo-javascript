const fs = require('fs');

const gulp = require('gulp');
const header = require('gulp-header');

const del = require('del');

function build() {
    del.sync(['dist/**/*']);

    return gulp.src('src/lib/**/*.js')
        .pipe(header(fs.readFileSync('src/partials/header.js', 'utf8'), false))
        .pipe(gulp.dest('dist'));
}

module.exports = {
    build,
}
