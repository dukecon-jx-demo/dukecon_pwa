import axios from 'axios'
import Vue from 'vue'

/* the following objects (events, conference) are the global data model for this application.
   They are read only for the users, but they will be updated asynchronously when the data is loaded, they might be
   updated with new data periodically as well. Use the references returned to bind them to your model. */

const events = {}

/* pre-initialize properties with an empty value to ease use in other components.
Values will be updated once init.js has been loaded. */
const conference = {
  imprint: {},
  privacy: {},
  termsOfUse: {}
}

let base = ''

// test if we are running in local served mode to test offline mode
if (window.location.href.indexOf('http://localhost:5000') !== -1) {
  base = 'https://latest.dukecon.org/javaland/2017/'
}

let initialized = false

/**
 * Support lazy initialization of content to facilitate testing.
 */
const init = function () {
  if (initialized) {
    return
  }
  initialized = true
  axios.get(base + 'rest/init.json')
    .then(function (response) {
      for (const key in response.data) {
        if (response.data.hasOwnProperty(key)) {
          Vue.set(conference, key, response.data[key])
        }
      }
      axios.get(base + 'rest/conferences/' + conference.id)
        .then(function (response) {
          response.data.events.forEach(v => {
            Vue.set(events, v.id, v)
          })
        })
        .catch(function (error) {
          console.log(error)
        })
    })
    .catch(function (error) {
      // it seems that we are working in development mode but are offline
      // (and we haven't tried the static path yet as it would otherwise lead to a loop)
      if (window.location.href.indexOf('http://localhost:8080') !== -1 && base.indexOf('static') === -1) {
        base = '/static/'
        initialized = false
        init()
      }
      console.log(error)
    })
}

export default class Conference {
  static getAllEvents () {
    init()
    return events
  }

  static getConference () {
    init()
    return conference
  }
}
