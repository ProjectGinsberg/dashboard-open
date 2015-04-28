var signup = function() {
    // connects to the platform signup page to create a user based on the
    // randomly generated username in the conf file
    var username = Math.floor(Math.random()*1000000) + '@example.com';
    var password = browser.params.login.password;

    var request = require('request');


    var jar = request.jar();
    var req = request.defaults({
        jar: jar
    });

    function post(params) {
        var defer = protractor.promise.defer();
        var options = {
            uri: 'https://platform.ginsberg.io/account/externalsignup',
            method: 'POST',
            json: params
        };
        req(options,function(error, message) {
            console.log("signup call done");
            if (error || message.body.status >= 400) {
                defer.reject({
                    error: error,
                    message: message
                });
            } else {
                defer.fulfill(message);
            }
        });
        return defer.promise;
    }
    function get(params) {
        var defer = protractor.promise.defer();
        var options = {
            uri: 'https://platform.ginsberg.io/diagnostics/deleteaccount?email='+params.username+'&password='+params.password+'',
            method: 'GET',
        };
        console.log(options.uri);
        req(options,function(error, message) {
            console.log('delete call done');
            if (error || message.body.status >= 400) {
                console.log(message.body);
                defer.reject({
                    error: error,
                    message: message
                });
            } else {
                console.log(message.body);
                defer.fulfill(message);
            }
        });
        return defer.promise;
    }
    var attemptSignup = function() {
        return post({
            "first_name": "John",
            "last_name":"Smith",
            "password":password,
            "confirm_password":password,
            "email":username,
            "country_id": 1,
            "wellbeing_measure_ids":[1,2,3]
        });
    }
    var attemptDeletion = function() {
        return get({
            'username': username,
            'password': password
        })
    }
    this.signup = function() {
        var flow = protractor.promise.controlFlow();
        flow.execute(attemptSignup);
        console.log('user created ' + username);
        console.log('password ' + password);
        return {
            'username':username,
            'password':password
        }
    };
    this.deleteAccount = function() {
        var flow = protractor.promise.controlFlow();
        return flow.execute(attemptDeletion);
    };
};
module.exports = signup;
