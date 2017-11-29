/**
    string-similarity
    by: aceakash
    url: https://github.com/aceakash/string-similarity
**/
/*jslint nomen: true*/
/*jslint browser: true*/
/*global jQuery, Smith, Leaderboard, _*/

(function (_) {
    'use strict';
    if (_) {
        window.StringSimilarity = {
            compareTwoStrings: function (str1, str2) {

                // private functions ---------------------------
                function letterPairs(str) {
                    var numPairs = str.length - 1,
                        pairs = [],
                        i;
                    for (i = 0; i < numPairs; i += 1) {
                        pairs[i] = str.substring(i, i + 2);
                    }
                    return pairs;
                }

                function wordLetterPairs(str) {
                    return _.flattenDeep(_.map(str.split(' '), letterPairs));
                }

                function calculateResultIfIdentical(str1, str2) {
                    if (str1.toUpperCase() === str2.toUpperCase()) {
                        return 1;
                    }
                    return null;
                }

                function calculateResultIfBothAreSingleCharacter(str1, str2) {
                    if (str1.length === 1 && str2.length === 1) {
                        return 0;
                    }
                }

                function calculateResultIfEitherIsEmpty(str1, str2) {
                    // if both are empty strings
                    if (str1.length === 0 && str2.length === 0) {
                        return 1;
                    }

                    // if only one is empty string
                    if ((str1.length + str2.length) > 0 && (str1.length * str2.length) === 0) {
                        return 0;
                    }
                    return null;
                }

                var result = null,
                    pairs1,
                    pairs2,
                    intersection,
                    union,
                    i,
                    pair2;
                result = calculateResultIfIdentical(str1, str2);
                if (result) {
                    return result;
                }
                result = calculateResultIfEitherIsEmpty(str1, str2);
                if (result) {
                    return result;
                }
                result = calculateResultIfBothAreSingleCharacter(str1, str2);
                if (result) {
                    return result;
                }

                pairs1 = wordLetterPairs(str1.toUpperCase());
                pairs2 = wordLetterPairs(str2.toUpperCase());
                intersection = 0;
                union = pairs1.length + pairs2.length;

                _.forEach(pairs1, function (pair1) {
                    for (i = 0; i < pairs2.length; i += 1) {
                        pair2 = pairs2[i];
                        if (pair1 === pair2) {
                            intersection += 1;
                            pairs2.splice(i, 1);
                            break;
                        }
                    }
                });

                return (2.0 * intersection) / union;
            },
            findBestMatch: function (mainString, targetStrings) {

                // private functions ---------------------------
                function areArgsValid(mainString, targetStrings) {
                    var mainStringIsAString = (typeof mainString === 'string'),
                        targetStringsIsAnArrayOfStrings = Array.isArray(targetStrings) &&
                            targetStrings.length > 0 &&
                            _.every(targetStrings, function (targetString) {
                                return (typeof targetString === 'string');
                            });
                    return mainStringIsAString && targetStringsIsAnArrayOfStrings;
                }

                if (!areArgsValid(mainString, targetStrings)) {
                    throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
                }
                var vm = this,
                    ratings = _.map(targetStrings, function (targetString) {
                        return {
                            target: targetString,
                            rating: vm.compareTwoStrings(mainString, targetString)
                        };
                    });

                return {
                    ratings: ratings,
                    bestMatch: _.maxBy(ratings, 'rating')
                };
            }
        };
    }
}(_));
