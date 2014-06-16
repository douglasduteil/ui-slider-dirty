/* jshint node:true */

'use strict';

module.exports = function () {

  return {
    humaName: 'UI.Slider--DIRTY',
    repoName: 'ui-slider-dirty',

    bowerComponents: [
      'raf/index.js',
      'angular-touch/angular-touch.js'
    ],

    topMenuLinks: [
      { name: 'Dressing', ref: 'dressing.html'}
    ],

    css: ['dist/ui-slider.css'],
    js: ['dist/ui-slider.js']
  };

};
