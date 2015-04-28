exports.config = {
    allScriptsTimeout: 11000,
    suites: {
        homepage: 'homepage/objectives-spec.js',
        //myGraph: ['my-graph/*-spec.js']
    },
    multiCapabilities: [{
        browserName:'chrome'
    }/*,{
        browserName:'firefox'
    }*/],
    // Browserstack's selenium server address

    params: {
        login: {
            //user: Math.floor(Math.random()*1000000) + '@example.com', // generate a random user for the tests
            password: '123xyz$$QWE'
        }
    },
    baseUrl: 'http://local.ginsberg.io:5000/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        isVerbose: true,
        includeStackTrace: true
    },
    onPrepare: function() {
        /*var folderName = (new Date()).toString().split(' ').splice(1, 4).join(' ');
        var mkdirp = require('mkdirp');
        var newFolder = "./reports/" + folderName;
        require('jasmine-reporters');

        mkdirp(newFolder, function(err) {
            if (err) {
                console.error(err);
            } else {
                jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(newFolder, true, true));
            }
        });*/
    }
};
