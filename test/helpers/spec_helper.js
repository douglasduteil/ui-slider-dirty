//
// SPEC HELPERS
//

function strictClassMatcher(defaultPresentClasses, defaultAbsentClasses) {
  return function () {
    return {
      compare: function (actual, presentClasses, absentClasses) {

        presentClasses = presentClasses || defaultPresentClasses;
        absentClasses = absentClasses || defaultAbsentClasses;

        var result = {};

        result.pass = actual.hasClass(presentClasses) && !actual.hasClass(absentClasses);

        result.message =
          'Expected "' + actual.attr('class') + '" to ' +
          (result.pass ? 'not ' : '') + 'contain "' + presentClasses + '"' +
          (absentClasses ? (' and ' + (result.pass ? '' : 'not ') + 'have ' + absentClasses + '' ) : '');

        return result;
      }
    };
  };
}
var matchers = {
  toHaveClass: strictClassMatcher(),

  toBeInvalid: strictClassMatcher('ng-invalid', 'ng-valid'),
  toBeValid: strictClassMatcher('ng-valid', 'ng-invalid'),
  toBeDirty: strictClassMatcher('ng-dirty', 'ng-pristine'),
  toBePristine: strictClassMatcher('ng-pristine', 'ng-dirty'),

  toBeBetween: function () {
    return {
      compare: function (actual, rangeFloor, rangeCeiling) {

        var result = {};

        if (rangeFloor > rangeCeiling) {
          var temp = rangeFloor;
          rangeFloor = rangeCeiling;
          rangeCeiling = temp;
        }

        result.pass = actual > rangeFloor && actual < rangeCeiling;

        result.message =
          'Expected ' + actual + ' to ' +
          (result.pass ? 'not ' : '') +
          'be between "' + rangeCeiling + ' and ' + rangeFloor;

        return result;
      }
    };
  }
};



//
// Add it !
//
beforeEach(function () {
  jasmine.addMatchers(matchers);
});
