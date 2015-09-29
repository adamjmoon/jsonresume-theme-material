var semver = require('semver');
var exec = require('child_process').exec;
var fs = require('fs');
(function () {
  var opts = {
    bumpVersion: true,
    commit: true,
    commitFiles: ['package.json'], // '-a' for all files
    commitMessage: 'Release v%VERSION%',
    createTag: true,
    dryRun: false,
    files: ['package.json'],
    gitCommitOptions: '',
    gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
    globalReplace: false,
    prereleaseName: false,
    push: true,
    pushTo: 'origin',
    regExp: false,
    setVersion: false,
    tagMessage: 'Version %VERSION%',
    tagName: 'v%VERSION%',
    updateConfigs: [], // array of config properties to update (with files)
    versionType: false
  };

  var versionType = versionType || opts.versionType;

  var setVersion = opts.setVersion;
  if (setVersion && !semver.valid(setVersion)) {
    setVersion = false;
  }

  var globalVersion; // when bumping multiple files
  var gitVersion; // when bumping using `git describe`

  var VERSION_REGEXP = opts.regExp || new RegExp(
    '([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)(\\d+\\.\\d+\\.\\d+(-' +
    opts.prereleaseName +
    '\\.\\d+)?(-\\d+)?)[\\d||A-a|.|-]*([\'|\"]?)', 'i'
  );
  if (opts.globalReplace) {
    VERSION_REGEXP = new RegExp(VERSION_REGEXP.source, 'gi');
  }

  var done = function () {
    console.log("done");
  };
  var queue = [];
  var next = function () {
    if (!queue.length) {
      return done();
    }
    queue.shift()();
  };
  var runIf = function (condition, behavior) {
    if (condition) {
      queue.push(behavior);
    }
  };

  // BUMP ALL FILES
  runIf(opts.bumpVersion, function () {


    var package = require("./package.json");

    var version = null;
    var updatedPackage = JSON.stringify(package).replace(
      VERSION_REGEXP,
      function (match, prefix, parsedVersion, namedPre, noNamePre, suffix) {
        var type = versionType === 'git' ? 'prerelease' : versionType;
        version = setVersion || semver.inc(
          parsedVersion, type || 'patch', gitVersion || opts.prereleaseName
        );
        return prefix + version + (suffix || '');
      }
    );

    console.log(version);
    var wstream = fs.createWriteStream('package.json');
    wstream.write(updatedPackage);
    wstream.end();


    if (!globalVersion) {
      globalVersion = version;
    } else if (globalVersion !== version) {
      console.log('Bumping multiple files with different versions!');
    }


    next();
  });


  // when only committing, read the version from package.json / pkg config
  runIf(!opts.bumpVersion, function () {
    var configVersion = grunt.config.get('bump.version');

    if (configVersion) {
      globalVersion = configVersion;
    } else if (opts.updateConfigs.length) {
      globalVersion = require(opts.updateConfigs[0]).version;
    } else {
      globalVersion = require(opts.files[0]).version;
    }

    next();
  });

  // COMMIT
  runIf(opts.commit, function () {
    var commitMessage = opts.commitMessage.replace(
      '%VERSION%', globalVersion
    );
    var cmd = 'git commit' + opts.gitCommitOptions + ' ' + opts.commitFiles.join(' ');
    cmd += ' -m "' + commitMessage + '"';
    exec("git fetch --unshallow || true", function (err, stdout, stderr) {
      exec("git fetch origin " + "+refs/heads/*:refs/remotes/origin/*", function (err, stdout, stderr) {
        exec(cmd, function (err, stdout, stderr) {
          if (err) {
            throw err;
          }
        });

      });

      console.log('Committed as "' + commitMessage + '"');
      next();
    });
  });


  // CREATE TAG
  runIf(opts.createTag, function () {
    var tagName = opts.tagName.replace('%VERSION%', globalVersion);
    var tagMessage = opts.tagMessage.replace('%VERSION%', globalVersion);

    var cmd = 'git tag -a ' + tagName + ' -m "' + tagMessage + '"';

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      console.log('Tagged as "' + tagName + '"');
      next();
    });
  });


  // PUSH CHANGES
  runIf(opts.push, function () {
    var cmd;

    if (opts.push === 'git' && !opts.pushTo) {
      cmd = 'git push';

      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          throw err;
        }
        next();
      });

      return;
    }

    exec('git rev-parse --abbrev-ref HEAD', function (err, ref, stderr) {


      cmd = [];

      if (opts.push === true || opts.push === 'branch') {
        cmd.push('git push ' + opts.pushTo + ' ' + ref.trim());
      }

      if (opts.createTag && (opts.push === true || opts.push === 'tag')) {
        var tagName = opts.tagName.replace('%VERSION%', globalVersion);
        cmd.push('git push ' + opts.pushTo + ' ' + tagName);
      }

      cmd = cmd.join(' && ');

      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          console.log('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
        }
        next();
      });
    });

    next();
  });

  next();
})();