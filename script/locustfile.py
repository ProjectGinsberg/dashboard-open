# This locust test script example will simulate a user
# browsing the Locust documentation on http://docs.locust.io

import random
from datetime import datetime, timedelta
from locust import HttpLocust, TaskSet, task
from pyquery import PyQuery

start = (datetime.now() - timedelta(100)).isoformat()

def platform(path):
    return 'https://platform.ginsberg.io' + path

def api(path):
    return 'https://api.ginsberg.io' + path

def dashboard(path = '/index.html'):
    return 'https://dashboard.ginsberg.io' + path

class BrowseDashboard(TaskSet):
    def on_start(self):
        # Login!
        resp = self.client.get(platform('/account/signin'))
        pq = PyQuery(resp.content)
        code = pq('input[name=__RequestVerificationToken]')[0].attrib['value']
        #print 'Request token: ' + code
        resp = self.client.post(platform('/account/signin'), {
            'EmailAddress': 'joe.halliwell@gmail.com',
            'Password': 'test',
            '__RequestVerificationToken': code
        })

    @task
    def dashboard_index(self):
        self.client.get(dashboard())
        self.client.get(dashboard('/js/dashboard.min.js'))
        self.client.get(dashboard('/js/vendor.min.js'))
        self.client.get(dashboard('/stylesheets/project_ginsberg.css'))

    @task
    def platform_connections(self):
        self.client.get(platform('/account/myconnections'))

    @task
    def platform_account(self):
        self.client.get(platform('/account/myaccount'))

    @task
    def profile_api(self):
        self.client.get(api('/v1/me'))

    @task
    def wellbeing_api(self):
        self.client.get(api('/v1/wellbeing'))

    @task
    def sleep_api(self):
        self.client.get(api('/v1/o/sleep'))

    @task
    def alcohol_api(self):
        self.client.get(api('/v1/o/alcohol'))

    @task
    def sleep_data_api(self):
        self.client.get(api('/v1/data/sleep'), params = {
            'interpolated': 'linear',
            'window': 'day',
            'start': start
        })

    @task
    def sleep_stats_api(self):
        self.client.get(api('/v1/stats/sleep'))

    @task
    def events_data_api(self):
        self.client.get(api('/v1/o/events'))



class DashboardUser(HttpLocust):
    task_set = BrowseDashboard
    host = 'http://dashboard.ginsberg.io'

    # we assume someone who is browsing the Locust docs,
    # generally has a quite long waiting time (between
    # 20 and 600 seconds), since there's a bunch of text
    # on each page
    min_wait = 1
    max_wait = 0.1 * 1000
