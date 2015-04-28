var login = function() {
    this.loginUsername = element(by.model('email'));
    this.password = element(by.model('password'));

    this.get = function() {
        browser.get('/');
    };
    this.setUsername = function(username) {
        this.loginUsername.sendKeys(username);
    };
    this.getUsername = function() {
        return this.loginUsername.getAttribute('value');
    }
    this.setPassword = function(password) {
        this.password.sendKeys(password);
    };
    this.attemptLogin = function() {
        // sort of hacky way to force the form to submit
        element(by.css('.btn')).click();
    };
    this.attemptSignout = function() {
        console.log('signing out');
        browser.get('https://platform.ginsberg.io/account/signout');
    };
    this.isLoginErrorMessageVisible = function() {
        return element(by.css('.loginError')).isDisplayed();
    };
}
module.exports = login;
