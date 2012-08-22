/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

navigator.mozL10n.DateTimeFormat = function(locales, options) {
  var _ = navigator.mozL10n.get;

  function zeroPad(number) {
    return (number < 10) ? ('0' + number) : number;
  }

  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleFormat
  function localeFormat(d, format) {
    var tokens = format.match(/%./g);

    for (var i = 0; i < tokens.length; i++) {
      var value = '';

      switch (tokens[i]) {
        // localized day/month names
        case '%a':
          value = _('weekday-' + d.getDay() + '-short');
          break;
        case '%A':
          value = _('weekday-' + d.getDay() + '-long');
          break;
        case '%b':
        case '%h':
          value = _('month-' + d.getMonth() + '-short');
          break;
        case '%B':
          value = _('month-' + d.getMonth() + '-long');
          break;

        // localized date/time strings
        case '%c':
        case '%x':
        case '%X':
          value = _('dateTimeFormat_' + tokens[i], {
            yyyy: d.getFullYear(),
            day: _('weekday-' + d.getDay() + '-short'),
            month: _('month-' + d.getMonth() + '-short'),
            mm: zeroPad(d.getMonth() + 1),
            dd: zeroPad(d.getDate()),
            h: zeroPad(d.getHours()),
            m: zeroPad(d.getMinutes()),
            s: zeroPad(d.getSeconds())
          }) || d.toLocaleFormat(tokens[i]);
          break;

        // other tokens don't require any localization
        // (note: %E* and %O* are ignored at the moment)
        default:
          value = d.toLocaleFormat(tokens[i]);
          break;
      }

      format = format.replace(tokens[i], value);
    }

    return format;
  }

  // variant of John Resig's PrettyDate.js
  function prettyDate(time) {
    switch (time.constructor) {
      case String: // timestamp
        time = parseInt(time);
        break;
      case Date:
        time = time.getTime();
        break;
    }

    var secDiff = (Date.now() - time) / 1000;
    var dayDiff = Math.floor(secDiff / 86400);

    if (isNaN(dayDiff)) {
      return _('incorrectDate');
    } else if (secDiff < 0) { // TODO: support future time
      return localeFormat(new Date(time), '%x %R');
    } else if (secDiff < 3600) {
      return _('minutesAgo', { m : Math.floor(secDiff / 60) });
    } else if (dayDiff === 0) {
      return _('hoursAgo', { h : Math.floor(secDiff / 3600) });
    } else if (dayDiff < 10) {
      return _('daysAgo', { d : dayDiff });
    } else {
      return localeFormat(new Date(time), '%x');
    }
  }

  // API
  return {
    localeDateString: function localeDateString(d) {
      return localeFormat(d, '%x');
    },
    localeTimeString: function localeTimeString(d) {
      return localeFormat(d, '%X');
    },
    localeString:  function localeString(d) {
      return localeFormat(d, '%c');
    },
    localeFormat: localeFormat,
    fromNow: prettyDate
  };
};

