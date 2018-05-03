const gulp = require("gulp");
const gulp_ts = require("gulp-typescript");
const tsProject = gulp_ts.createProject('tsconfig.json');

// Writing up the build task
gulp.task('build', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('/dist'));
});