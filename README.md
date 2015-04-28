# Dashboard

The Ginsberg dashboard

## Coding standards

Tabs, not spaces please, plus Google guidelines at https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml

We are *not* on campsite rules! Please actively fix up code that does not adhere to the above!

## Filesystem layout

Working towards the "modularised" approach described at https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub

## Running Locally

In the top-level project directory

0. Install NodeJS (and crucially npm) from http://nodejs.org
1. Install the grunt command line tool `sudo npm install -g grunt-cli`
2. Install local dependencies `npm install`
3. Run grunt to build and serve `grunt`
4. Create an /etc/hosts file entry for `127.0.0.1 local.ginsberg.io`
5. Go to http://local.ginsberg.io:5000 (you may need to log in to dashboard.ginsberg.io first)

## Deployment

### Azure

```
git push origin master:staging # Careful now!
```

When you're happy with (and have tested!) the staging deployment, you can "swap" the staging slot into production.

## Testing

### E2E tests with Protractor

```grunt test```

This has some additional dependencies: Chrome and Java (I think)

Q What's this about a chromium driver being missing?
A You need to install a driver
```
node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update
```
