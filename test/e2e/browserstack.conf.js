exports.config = {
    allScriptsTimeout: 11000,
    specs: [
    '**/*.js'
    ],
    multiCapabilities: [{
        'browserstack.user': 'johncross1',
        'browserstack.key': 'GbC35Ve5cKSWGcZWf5ck',

        // Needed for testing localhost
        'browserstack.local': 'false',

        // Settings for the browser you want to test
        'browserName': 'Chrome',
        'browser_version': '38.0',
        'os': 'OS X',
        'os_version': 'Mavericks',
        'resolution': '1024x768'
    },{
        'browserstack.user': 'johncross1',
        'browserstack.key': 'GbC35Ve5cKSWGcZWf5ck',

        // Needed for testing localhost
        'browserstack.local': 'false',

        // Settings for the browser you want to test
        'browserName': 'Firefox',
        'browser_version': '33',
        'os': 'OS X',
        'os_version': 'Mavericks',
        'resolution': '1024x768'
    },
        /*{'browserstack.user': 'johncross1',
        'browserstack.key': 'GbC35Ve5cKSWGcZWf5ck',
        // Needed for testing localhost
        'browserstack.local': 'false',
        'os':'ios',
        'os_version':'iPhone 5S',
        'platform' : 'MAC',
        'browserName' : 'iPhone',
        'device' : 'iPhone 5'
    }*/,{'browserstack.user': 'johncross1',
        'browserstack.key': 'GbC35Ve5cKSWGcZWf5ck',
        // Needed for testing localhost
        'browserstack.local': 'false',
        'browserName' : 'IE',
        'browser_version' : '11.0',
        'os' : 'Windows',
        'os_version' : '8.1',
        'resolution' : '1024x768'
    }/*,{'browserstack.user': 'johncross1',
    'browserstack.key': 'GbC35Ve5cKSWGcZWf5ck',
    // Needed for testing localhost
    'browserstack.local': 'false',
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy S5',
    'os':'android',
    'os_version':'4.4'
}*/],
    // Browserstack's selenium server address
    seleniumAddress: 'http://hub.browserstack.com/wd/hub',

    params: {
        login: {
            user: Math.floor(Math.random()*1000000) + '@example.com', // generate a random user for the tests
            password: '123xyz$$QWE'
        }
    },
    baseUrl: 'http://sdashboard.ginsberg.io/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    },
    onPrepare: function() {
        var folderName = (new Date()).toString().split(' ').splice(1, 4).join(' ');
        var mkdirp = require('mkdirp');
        var newFolder = "./reports/" + folderName;
        require('jasmine-reporters');

        mkdirp(newFolder, function(err) {
            if (err) {
                console.error(err);
            } else {
                jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(newFolder, true, true));
            }
        });
    }
};
