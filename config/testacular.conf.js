/**
 * Created with JetBrains WebStorm.
 * User: admin
 * Date: 16/11/12
 * Time: 11:53
 * To change this template use File | Settings | File Templates.
 */
basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'public/js/lib/angular/angular.js',
    'public/js/lib/angular/angular-*.js',
    'test/lib/angular/angular-mocks.js',
    'public/js/**/*.js',
    'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
