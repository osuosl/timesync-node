
'use strict';

let log;

module.exports = function(Log, Ain, fs) {
  let access = null;
  let error = null;
  let debug = null;

  const LogMode = Object.freeze({console: 1, file: 2, syslog: 3});
  let mode;

  function setup() {
    if (process.env.LOG_DIR) {
      mode = LogMode.file;
      access = new Log('info', fs.createWriteStream(process.env.LOG_DIR +
        '/access.log', {flags: 'a'}));
      error = new Log('error', fs.createWriteStream(process.env.LOG_DIR +
        '/error.log', {flags: 'a'}));
    } else if (process.env.CONSOLE) {
      mode = LogMode.console;
      access = new Log('info');
      error = new Log('error');
    } else {
      mode = LogMode.file;
      try {
        const stat = fs.statSync('log');
        if (!stat.isDirectory()) {
          fs.unlinkSync('log');
          fs.mkdirSync('log');
        }
      } catch (e) {
        fs.mkdirSync('log');
      }

      access = new Log('info', fs.createWriteStream('log/access.log',
        {flags: 'a'}));
      error = new Log('error', fs.createWriteStream('log/error.log',
        {flags: 'a'}));
    }

    if (process.env.DEBUG) {
      debug = new Log('debug');
    }
  }

  setup();

  // Remove tokens from the URL
  const urlRegex = new RegExp('[?&]token=[a-zA-Z0-9\.=+/]+', 'i');
  function stripUrl(url) {
    return url.replace(urlRegex, '');
  }

  log = {
    access: function(req, res) {
      if (!process.env.TEST) {
        access.info('%s "%s" %s %s "%s" "%s"',
                    req.ip,
                    stripUrl(req.originalUrl),
                    res.statusCode,
                    res._contentLength,
                    req.get('Referer') ? req.get('Referer') : '-',
                    req.get('User-Agent') ? req.get('User-Agent') : '-');
      }
    },

    error: function(req, err) {
      if (req && typeof req === 'object') {
        error.error('%s "%s": %s', req.ip, stripUrl(req.originalUrl), err);
      } else if (req && typeof req === 'string') {
        error.error('- "%s": %s', req, err);
      } else {
        error.error('- "-": %s', err);
      }
    },

    debug: function(req, line, message) {
      if (process.env.DEBUG) {
        debug.debug('%s (L%s): %s', stripUrl(req.originalUrl), line, message);
      }
    },
  };

  return log;
};
