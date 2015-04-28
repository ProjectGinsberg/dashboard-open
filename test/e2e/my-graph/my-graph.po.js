var myGraph = function() {
    //browser.get('https://sdashboard.ginsberg.io');
    browser.get('/#/my-graph');

    var Login = require('../shared/login.po.js');
    var login = new Login();

    this.get = function() {
        browser.get('/#/my-graph');
    };
    this.setUsername = function(username) {
        login.setUsername(username);
    };
    this.getUsername = function() {
        return login.getUsername();
    };
    this.setPassword = function(password) {
        login.setPassword(password);
    };
    this.attemptLogin = function() {
        // sort of hacky way to force the form to submit
        login.attemptLogin();
    };
    this.attemptSignout = function() {
        login.attemptSignout();
    };
    this.selectObjectiveSeries = function(seriesName) {
        element(by.css('#datatoggle-objective')).click();
        element.all(by.repeater('objective in objectiveSelectionRange()').column('objective.name'))
        .filter(function(elem, index) {
            return elem.getText().then(function(text) {
                return text.toLowerCase() === seriesName.toLowerCase();
            });
        }).then(function(filteredElements) {
            filteredElements[0].click();
        });
    };
    this.selectedObjectiveSeries = function() {
        return element(by.css('.objectiveLabel tspan')).getText().then(function(t) {
            return t.toLowerCase();
        });
    };
    this.clickAddNewObjectiveMeasureForToday = function() {
        browser.sleep(2000);
        return element.all(by.css('.add-objective-data')).first().click();
    };
    this.clickObjectiveMeasureForToday = function() {
        browser.sleep(3000);
        return element.all(by.css('.blobGroup circle')).first().click();
    };
    this.countObjectiveMeasures = function() {
        return element.all(by.css('.blobGroup circle')).count();
    }
    this.getSleepTimes = function() {
        return {
            'bedTime': element(by.model('bedTime')),
            'wakeTime': element(by.model('wakeTime'))
        }
    };
    this.setSleepTimes = function(bedTime,wakeTime) {
        element(by.model('bedTime')).sendKeys(bedTime);
        element(by.model('wakeTime')).sendKeys(wakeTime);
    };
    this.submitAlcohol = function() {
        element( by.css('.add-alcohol [ng-click="submit()"]') ).click();
    }
    this.submitSleep = function() {
        element( by.css('.add-sleep [ng-click="submit()"]') ).click();
    }
    this.submitExercise = function() {
        element( by.css('.add-exercise [ng-click="submit()"]') ).click();
    }
    this.submitNutrition = function() {
        element( by.css('.add-nutrition [ng-click="submit()"]') ).click();
    }
    this.submitSteps = function() {
        element( by.css('.add-step [ng-click="submit()"]') ).click();
    }
    this.submitWeight = function() {
        element( by.css('.add-weight [ng-click="submit()"]') ).click();
    }

};
module.exports = myGraph;
