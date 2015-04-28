var homepage = function() {
    //browser.get('https://sdashboard.ginsberg.io');
    browser.get('/');

    var Login = require('../shared/login.po.js');
    var login = new Login();

    this.get = function() {
        browser.get('http://sdashboard.ginsberg.io/');
    }
    this.setUsername = function(username) {
        login.setUsername(username);
    };
    this.getUsername = function() {
        return login.getUsername();
    }
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
    this.isLoginErrorMessageVisible = function() {
        return login.isLoginErrorMessageVisible();
    };
    this.getWellbeingQuestions = function() {
        return element.all( by.repeater('question in wellbeing_measures'));
    };
    this.setWellbeingQuestionAnswer = function(questionId,answerScore) {
        var questions = this.getWellbeingQuestions();
        var question = questions.get(questionId);

        var answer = question.all(by.repeater('answer in wellbeingAnswers')).get(answerScore);
        answer.click();
        //console.log(answer);
    };
    this.submitWellbeing = function() {
        var button = element.all(by.css('button'));
        if (button.count() > 0) {
            if (button.get(0).isDisplayed()) {
                console.log('submit button visible');
                button.get(0).click();
            } else {
                console.log('update button visible');
            }
        }
    };
    var objectives = ['Sleep','Steps','Nutrition','Alcohol','Exercise'];
    objectives.forEach(function(obj) {
        // add objective button function
        this['clickAdd'+obj] = function() {
            element(by.css('.add'+obj)).click();
        };
        this['clickStore'+obj] = function() {
            element(by.css('.store'+obj)).click();
        };
    });
    this.addSleep = function(startDate,endDate) {
        element(by.css('#addSleep')).click();

        element(by.model('sleepTime')).sendKeys(startDate);
        element(by.model('wakeTime')).sendKeys(endDate);

        element(by.css('#storeSleep')).click();
    };
    this.addSteps = function(stepCount) {

    };
    this.addNutrition = function(calories) {

    };
    this.addExercise = function(exercise) {

    };
    this.addAlcohol = function(alcohol) {

    };
};
module.exports = homepage;
