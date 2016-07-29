// this file copyright (c) 2013 Vesa Poikajärvi
// Under the MIT License.

// original:
// https://github.com/vesse/passport-ldapauth/blob/a8de8c5436712691cd11f994dd9f4e792a5681cd/test/strategy-test.js

var ldap = require('ldapjs');

authorize = function(req, res, next) {
  return next();
};

var SUFFIX = 'ou=passport-ldapauth';
var server = null;

db = {
  'valid': {
    dn: 'cn=valid, ou=passport-ldapauth',
    attributes:  {
      uid:  'valid',
      name: 'Valid User'
    }
  },
  'admin1': {
    dn: 'cn=valid, ou=passport-ldapauth',
    attributes:  {
      uid:  'admin1',
      name: 'Admin User'
    }
  },
  'james': {
    dn: 'cn=valid, ou=passport-ldapauth',
    attributes:  {
      uid:  'james',
      name: 'James'
    }
  }
};

exports.start = function(port, cb) {
  if (server) {
    if (typeof cb === 'function') return cb();
    return;
  }

  server = ldap.createServer();

  server.bind('cn=root', function(req, res, next) {
    res.end();
    return next();
  });

  server.bind(SUFFIX, authorize, function(req, res, next) {
    var dn = req.dn.toString();
    if (dn !== 'cn=valid, ou=passport-ldapauth' || req.credentials !== 'valid') {
      return next(new ldap.InvalidCredentialsError());
    }
    res.end();
    return next();
  });

  server.search(SUFFIX, authorize, function(req, res, next) {
    if (req.filter.attribute === 'uid' && db[req.filter.value]) {
      res.send(db[req.filter.value]);
    } else if (req.filter.attribute === 'member' && req.filter.value === db.valid.dn) {
      res.send({
        dn: 'cn=Group 1, ou=passport-ldapauth',
        attributes: {
          name: 'Group 1'
        }
      });
      res.send({
        dn: 'cn=Group 2, ou=passport-ldapauth',
        attributes: {
          name: 'Group 2'
        }
      });
    }
    res.end();
    return next();
  });

  server.listen(port, function() {
    if (typeof cb === 'function') return cb();
  });
};

exports.close = function(cb) {
  if (server) server.close();
  server = null;
  if (typeof cb === 'function') return cb();
  return;
};

if (!module.parent) {
  exports.start(1389);
}
