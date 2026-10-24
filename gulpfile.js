const fs = require('fs');

const gulp = require('gulp');
const header = require('gulp-header');

async function clean() {
    const { deleteAsync } = await import('del');
    return deleteAsync(['dist/**/*']);
}

function build() {
    return gulp.src('src/lib/**/*.js')
        .pipe(header(fs.readFileSync('src/partials/header.js', 'utf8'), false))
        .pipe(gulp.dest('dist'));
}

function buildTypes() {
    return gulp.src('types/**/*.d.ts')
        .pipe(gulp.dest('dist'));
}

module.exports = {
    build: gulp.series(clean, build, buildTypes),
}
