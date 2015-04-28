'use strict';
/**
 * Bad things happen if the module is "defined" more than once. The code here is
 * pretty mixed in quality.
 *
 * Status:
 *  event-chart: new code, good
 *  wellbeing-chart: half way ported
 *  objective-chart: not started yet
 */
angular.module('gb.myGraph', ['gb.popover', 'gb.utils']);

