/* jshint ignore:start */

/* jshint ignore:end */

define('hoodie-admin-dashboard/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'hoodie-admin-dashboard/config/environment', 'npm:hoodie.admin'], function (exports, Ember, Resolver, loadInitializers, config, HoodieAdmin) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  window.hoodieAdmin = new HoodieAdmin['default']();

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('hoodie-admin-dashboard/components/add-user', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    init: function init() {
      this.setProperties({
        'submitMessage': '',
        'newUserName': '',
        'newUserPassword': '',
        disableAdd: false
      });
      this._super.apply(this, arguments);
    },
    actions: {
      addUser: function addUser() {
        var route = this;
        this.set('disableAdd', true);

        var hoodieId = Math.random().toString().substr(2);
        var newUser = {
          id: this.get('newUserName'),
          name: 'user/' + this.get('newUserName'),
          hoodieId: hoodieId,
          database: 'user/' + hoodieId,
          signedUpAt: new Date(),
          roles: [],
          password: this.get('newUserPassword')
        };

        window.hoodieAdmin.user.add('user', newUser).done(function (response) {
          route.setProperties({
            'submitMessage': 'Success: added <strong>' + response.id + '</strong> as a new user.',
            'newUserName': '',
            'newUserPassword': '',
            'disableAdd': false
          });
          route.sendAction();
        }).fail(function (error) {
          console.log('error: ', error);
          route.set('disableAdd', false);
          if (error.name === "HoodieConflictError") {
            route.setProperties({
              'submitMessage': 'Sorry, the user "' + error.id + '" already exists.',
              'newUserName': '',
              'newUserPassword': '',
              'disableAdd': false
            });
          } else {
            route.setProperties({
              'submitMessage': 'Error: ' + error.status + ' - ' + error.responseText,
              'newUserName': '',
              'newUserPassword': '',
              'disableAdd': false
            });
          }
        });
      }
    }
  });

});
define('hoodie-admin-dashboard/components/confirmation-modal', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    model: 'test',
    actions: {
      confirm: function confirm() {
        this.$('.modal').modal('hide');
        this.sendAction('confirm', this.get('model'));
      }
    },
    show: (function () {
      this.$('.modal').modal().on('hidden.bs.modal', (function () {
        this.sendAction('cancel');
      }).bind(this));
    }).on('didInsertElement')
  });

});
define('hoodie-admin-dashboard/components/select-2', ['exports', 'ember-select-2/components/select-2'], function (exports, Select2Component) {

	'use strict';

	/*
		This is just a proxy file requiring the component from the /addon folder and
		making it available to the dummy application!
	 */
	exports['default'] = Select2Component['default'];

});
define('hoodie-admin-dashboard/components/user-table-pagination', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    disableNext: (function () {
      return this.get('isLastPage');
    }).property('isLastPage'),

    disablePrevious: (function () {
      if (this.get('pageNumber') === 1) {
        return true;
      } else {
        return false;
      }
    }).property('pageNumber'),

    actions: {
      previous: function previous() {
        this.sendAction('action', 'previous');
        return false;
      },
      next: function next() {
        this.sendAction('action', 'next');
        return false;
      }
    }
  });

});
define('hoodie-admin-dashboard/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('hoodie-admin-dashboard/controllers/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('hoodie-admin-dashboard/controllers/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    reset: function reset() {
      this.setProperties({
        // Username is always 'admin'
        username: 'admin',
        password: 'admin',
        errorMessage: ''
      });
    },

    // Adds the bearer token to all ajax requests, if it's present, otherwise redirect to login
    setBearerToken: function setBearerToken() {
      if (window.hoodieAdmin.account.bearerToken) {
        Ember['default'].$.ajaxSetup({
          headers: {
            'Authorization': 'Bearer ' + window.hoodieAdmin.account.bearerToken
          }
        });
      } else {
        this.transitionToRoute('login');
      }
    },

    // Either continue with the route set before the user had to auth,
    // or go to a default route.
    gotoRoute: function gotoRoute(self) {
      self.setBearerToken();
      var attemptedTransition = self.get('attemptedTransition');
      if (attemptedTransition) {
        attemptedTransition.retry();
        self.set('attemptedTransition', null);
      } else {
        // Redirect to 'plugins' by default.
        self.transitionToRoute('plugins');
      }
    },

    login: function login() {
      var self = this;
      var data = this.getProperties('username', 'password');

      // Clear out any error messages.
      this.set('errorMessage', null);

      // If signed in, go somewhere else
      if (window.hoodieAdmin.account.isSignedIn) {
        self.gotoRoute(self);
      }

      window.hoodieAdmin.account.signIn(data.password).done(function () {
        self.gotoRoute(self);
      }).fail(function (err) {
        self.set('errorMessage', 'Error: ' + err.message);
      });
    }
  });

});
define('hoodie-admin-dashboard/controllers/logout', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    logout: function logout() {
      window.hoodieAdmin.account.signOut();
      this.transitionToRoute('login');
    }
  });

});
define('hoodie-admin-dashboard/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('hoodie-admin-dashboard/controllers/plugins/users/user', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    submitMessage: '',
    newPassword: '',
    actions: {
      updatePassword: function updatePassword(password) {
        var controller = this;
        window.hoodieAdmin.user.update('user', this.model.proper_name, {
          password: password
        }).done(function () {
          controller.setProperties({
            'submitMessage': 'Successfully updated password.',
            'newPassword': ''
          });
        }).fail(function (error) {
          controller.setProperties({
            'submitMessage': 'Error: ' + error.status + ' - ' + error.responseText,
            'newPassword': ''
          });
        });
      }
    }
  });

});
define('hoodie-admin-dashboard/controllers/users', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    searchTerm: '',
    activeSearch: '',
    pageLength: 20,
    skipFactor: 0,
    sortBy: 'created-at',
    sortDesc: true,
    deletingUser: false,
    selectedUser: undefined,
    newUsers: 0,
    additionalDatabases: '',
    addDatabasesSubmitMessage: '',

    pageNumber: (function () {
      return this.get('skipFactor') + 1;
    }).property('skipFactor', 'pageLength'),

    isLastPage: (function () {
      if (this.model.users.length < this.get('pageLength')) {
        return true;
      } else {
        return false;
      }
    }).property('skipFactor', 'pageLength', 'model'),

    previous: function previous() {
      var newSkipFactor = this.get('skipFactor') - 1;
      if (newSkipFactor < 0) {
        newSkipFactor = 0;
      }
      this.set('skipFactor', newSkipFactor);
      this.send("updateUserList");
    },
    next: function next() {
      this.set('skipFactor', this.get('skipFactor') + 1);
      this.send("updateUserList");
    },

    // We let some actions bubble up to the route by returning 'true',
    // so that the route can refresh the model.
    actions: {
      updateUserList: function updateUserList() {
        this.set('newUsers', 0);
        return true;
      },
      search: function search() {
        this.set('skipFactor', 0);
        this.set('activeSearch', this.get('searchTerm'));
        this.send("updateUserList");
        return false;
      },
      clearSearch: function clearSearch() {
        this.set('skipFactor', 0);
        this.set('activeSearch', '');
        this.set('searchTerm', '');
        this.send("updateUserList");
        return false;
      },
      changePage: function changePage(direction) {
        if (direction === 'previous') {
          this.previous();
        } else {
          this.next();
        }
        this.send("updateUserList");
        return false;
      },
      sortBy: function sortBy(_sortBy) {
        // If it's a double click we're probably flipping the sort order
        if (_sortBy === this.get('sortBy')) {
          this.toggleProperty('sortDesc');
        } else {
          this.set('sortBy', _sortBy);
        }
        this.send("updateUserList");
        return false;
      },
      promptToDeleteUser: function promptToDeleteUser(user) {
        this.setProperties({
          'deletingUser': true,
          'selectedUser': user
        });
      },
      deleteUser: function deleteUser(model) {
        var self = this;
        window.hoodieAdmin.user.remove('user', model.value.name).then(function () {
          self.send("updateUserList");
        });
        return false;
      },
      // Also handles cleanup after deleting
      cancelDelete: function cancelDelete() {
        this.setProperties({
          'deletingUser': false,
          'selectedUser': undefined
        });
      }
    }
  });

});
define('hoodie-admin-dashboard/helpers/convert-iso-to-timestamp', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.convertISOToTimestamp = convertISOToTimestamp;

  function convertISOToTimestamp(ISODate) {
    if (ISODate) {
      return new Date(ISODate).getTime();
    } else {
      return '';
    }
  }

  exports['default'] = Ember['default'].Helper.helper(convertISOToTimestamp);

});
define('hoodie-admin-dashboard/helpers/is-active-table-header', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.isActiveTableHeader = isActiveTableHeader;

  function isActiveTableHeader(params) {
    if (params[0] === params[1]) {
      return 'active';
    } else {
      return null;
    }
  }

  exports['default'] = Ember['default'].Helper.helper(isActiveTableHeader);

});
define('hoodie-admin-dashboard/helpers/link-to-futon-user', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.linkToFutonUser = linkToFutonUser;

  function linkToFutonUser(userName) {
    // FIX: linking to Futon doesn't work when using `ember serve --proxy http://localHoodieEndpoint`

    // FIX: linking to Futon also doesn't work inside the deployed app, since
    // http://appEndpoint/_api/_utils !== http://CouchDBEndpoint/_utils

    return window.location.origin + '/_utils/document.html?_users/org.couchdb.user%3Auser%2F' + userName;
  }

  exports['default'] = Ember['default'].Helper.helper(linkToFutonUser);

});
define('hoodie-admin-dashboard/helpers/pluralize-word', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.pluralizeWord = pluralizeWord;

  var pluralize = Ember['default'].String.pluralize;

  /*

    Pluralizes a given singular word depending on count. You can pass in
    the plural if it's so irregular that ember can't deal with it.

    Parameters:

    count (number):    Amount of the thing
    singular (string): Singular noun of the thing
    plural (string):   OPTIONAL Plural noun of the thing

  */

  function pluralizeWord(params) {
    var count = params[0];
    var singular = params[1];
    var plural = params[2];
    if (count === 1) {
      return singular;
    } else {
      if (plural) {
        return plural;
      } else {
        return pluralize(singular);
      }
    }
  }

  exports['default'] = Ember['default'].Helper.helper(pluralizeWord);

});
define('hoodie-admin-dashboard/helpers/user-state-color', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.userStateColor = userStateColor;

  function userStateColor(params) {
    switch (params[0]) {
      case 'confirmed':
        return 'success';
      case 'unconfirmed':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return '';
    }
  }

  exports['default'] = Ember['default'].Helper.helper(userStateColor);

});
define('hoodie-admin-dashboard/initializers/ember-cli-dates', ['exports', 'ember', 'ember-cli-dates/helpers/time-format', 'ember-cli-dates/helpers/time-ago-in-words', 'ember-cli-dates/helpers/day-of-the-week', 'ember-cli-dates/helpers/time-ahead-in-words', 'ember-cli-dates/helpers/time-delta-in-words', 'ember-cli-dates/helpers/month-and-year', 'ember-cli-dates/helpers/month-and-day', 'ember-cli-dates/helpers/date-and-time'], function (exports, Ember, time_format, time_ago_in_words, day_of_the_week, time_ahead_in_words, time_delta_in_words, month_and_year, month_and_day, date_and_time) {

  'use strict';

  var initialize = function initialize() /* container, app */{
    Ember['default'].Handlebars.helper('time-format', time_format.timeFormat);
    Ember['default'].Handlebars.helper('time-ago-in-words', time_ago_in_words.timeAgoInWords);
    Ember['default'].Handlebars.helper('day-of-the-week', day_of_the_week.dayOfTheWeek);
    Ember['default'].Handlebars.helper('time-ahead-in-words', time_ahead_in_words.timeAheadInWords);
    Ember['default'].Handlebars.helper('time-delta-in-words', time_delta_in_words.timeDeltaInWords);
    Ember['default'].Handlebars.helper('month-and-year', month_and_year.monthAndYear);
    Ember['default'].Handlebars.helper('month-and-day', month_and_day.monthAndDay);
    Ember['default'].Handlebars.helper('date-and-time', date_and_time.dateAndTime);
  };

  exports['default'] = {
    name: 'ember-cli-dates',
    initialize: initialize
  };

  exports.initialize = initialize;

});
define('hoodie-admin-dashboard/initializers/export-application-global', ['exports', 'ember', 'hoodie-admin-dashboard/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('hoodie-admin-dashboard/instance-initializers/app-version', ['exports', 'hoodie-admin-dashboard/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('hoodie-admin-dashboard/router', ['exports', 'ember', 'hoodie-admin-dashboard/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('login');
    this.route('logout');
    this.route('plugins', { path: '/plugins' }, function () {
      this.route('plugin', { path: ':plugin_id' });
      this.route('users', { path: 'users' }, function () {
        this.route('user', { path: ':user_id' });
      });
      this.route('email', { path: 'email' });
    });
  });

  exports['default'] = Router;

});
define('hoodie-admin-dashboard/routes/authenticated', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    // Before the model is loaded, check if the admin is signed in, and redirect to login if not
    beforeModel: function beforeModel(transition) {
      if (!window.hoodieAdmin.account.isSignedIn()) {
        this.redirectToLogin(transition);
      }
    },

    redirectToLogin: function redirectToLogin(transition) {
      var loginController = this.controllerFor('login');
      loginController.set('attemptedTransition', transition);
      this.transitionTo('login');
    },

    actions: {
      error: function error(reason, transition) {
        if (reason.status === 401) {
          this.redirectToLogin(transition);
        } else {
          console.log('Something went wrong: ', reason);
        }
      }
    }
  });

});
define('hoodie-admin-dashboard/routes/index', ['exports', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({
    afterModel: function afterModel() {
      this.transitionTo('plugins');
    }
  });

});
define('hoodie-admin-dashboard/routes/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    setupController: function setupController(controller) {
      controller.reset();
    }
  });

});
define('hoodie-admin-dashboard/routes/logout', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    setupController: function setupController(controller) {
      controller.logout();
    }
  });

});
define('hoodie-admin-dashboard/routes/plugins', ['exports', 'ember', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({

    model: function model() {

      // The old appconfig that contains stuff like additional_user_dbs
      var appConfig = Ember['default'].$.getJSON('/_api/app/config').then(function (data) {
        data.id = data._id;
        return data;
      });

      // The new, currently mocked config API (See /server/mocks/config.js)
      var config = Ember['default'].$.getJSON('/_api/_config').then(function (data) {
        data.id = data._id;
        return data.config;
      });

      var plugins = Ember['default'].$.getJSON('/_api/_plugins').then(function (data) {
        var activePlugins = [];
        var ignoreablePlugins = ['users', 'email'];
        Ember['default'].$.each(data, function (index, plugin) {
          // We don't want the users-plugin to show up twice, so we ignore
          // it when the server returns the plugin list, because we're
          // doing the UI for that in this app
          if (Ember['default'].$.inArray(plugin.name, ignoreablePlugins) === -1) {
            plugin.id = plugin.name;
            activePlugins.push(plugin);
          }
        });
        var plugins = {
          plugins: activePlugins
        };
        return plugins;
      });

      var promises = {
        appConfig: appConfig,
        config: config,
        plugins: plugins
      };

      return Ember['default'].RSVP.hash(promises).then(function (data) {
        return data;
      });
    }
  });

});
define('hoodie-admin-dashboard/routes/plugins/email', ['exports', 'ember', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({
    // necessary, because ember doesn't pick up
    // controllers/plugins/email correctly
    controllerName: 'email',
    model: function model() {
      var appModel = this.modelFor('plugins');
      return appModel.config;
    }
  });

});
define('hoodie-admin-dashboard/routes/plugins/plugin', ['exports', 'ember', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({
    model: function model(params) {
      return Ember['default'].$.getJSON('/_api/_plugins').then(function (plugins) {
        Ember['default'].$.each(plugins, function (index, plugin) {
          plugin.id = plugin.name;
        });
        var matchingPlugins = Ember['default'].$.grep(plugins, function (plugin) {
          return plugin.name === params.plugin_id;
        });
        return matchingPlugins[0];
      });
    }
  });

});
define('hoodie-admin-dashboard/routes/plugins/users/index', ['exports', 'ember', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({
    // necessary, because ember doesn't pick up
    // controllers/plugins/users correctly
    controllerName: 'users',
    update_seq: '',
    pollster: undefined,
    model: function model() {
      var route = this;
      var controller = this.controllerFor('users');
      var skip = controller.get('skipFactor') * controller.get('pageLength');
      var url = '/_api/_users/_design/views/_view/by-' + controller.get('sortBy') + '?descending=' + controller.get('sortDesc') + '&limit=' + controller.get('pageLength') + '&skip=' + skip + '&update_seq=true';

      if (controller.get('activeSearch')) {
        url = '/_api/_users/_design/views/_view/by-name?descending=false&limit=' + controller.get('pageLength') + '&startkey="' + controller.get('activeSearch') + '"' + '&endkey="' + controller.get('activeSearch') + '￰"&skip=' + skip;
      }

      // Fetch config data to populate 'additional databases'-input
      var baseModel = this.modelFor('plugins');
      if (baseModel.appConfig.config.additional_user_dbs) {
        controller.set('additionalDatabases', baseModel.appConfig.config.additional_user_dbs.join(', '));
      }

      return Ember['default'].$.getJSON(url).then(function (users) {
        route.set('update_seq', users.update_seq);
        var result = {
          'users': users.rows,
          'totalUsers': users.total_rows
        };

        return result;
      });
    },

    afterModel: function afterModel() {
      this.pollUserChangesFeed();
    },

    pollUserChangesFeed: function pollUserChangesFeed() {
      var controller = this.controllerFor('users');
      // If we have an update_seq, poll the changes feed every 30 seconds
      if (this.get('update_seq')) {
        var interval = 1000 * 30;
        var url = '_api/_users/_changes?since=' + this.get('update_seq');

        this.pollster = Ember['default'].run.later(this, function () {
          this.pollUserChangesFeed();
          return Ember['default'].$.getJSON(url).then(function (users) {
            // save the current number of new users if their revisions are <=2
            // This includes new users and those that have been auto-confirmed
            // (hence the second revision). This isn't future proof, plugins might
            // do more stuff to users immediately upon signup.
            // This feature will then simply stop working, but nothing will break.
            var newUsers = Ember['default'].$.map(users.results, function (user) {
              var revIndex = parseInt(user.changes[0].rev.split('-')[0]);
              if (revIndex <= 2) {
                return user;
              } else {
                return null;
              }
            });
            controller.set('newUsers', newUsers.length);
          });
        }, interval);
      }
    },

    cleanupPolling: function cleanupPolling() {
      Ember['default'].run.cancel(this.pollster);
      this.setProperties({
        'update_seq': ''
      });
    },

    // We let some actions bubble up from the controller by returning 'true' there,
    // so that this route can refresh the model.
    actions: {
      updateUserList: function updateUserList() {
        this.cleanupPolling();
        this.refresh();
        return false;
      },
      updateAdditionalDatabases: function updateAdditionalDatabases() {
        var controller = this.controllerFor('users');
        var dbArray = controller.get('additionalDatabases').replace(/ /g, "").split(",");

        window.hoodieAdmin.request('GET', '/app/config').done(function (appConfig) {
          appConfig.config.additional_user_dbs = dbArray;
          window.hoodieAdmin.request('PUT', '/app/config', { data: JSON.stringify(config) }).done(function () {
            controller.set('addDatabasesSubmitMessage', 'Saved <strong>' + dbArray.join(', ') + '</strong> successfully!');
          }).fail(function (error) {
            console.log('error: ', error);
            controller.set('addDatabasesSubmitMessage', 'Error: ' + error.status + ' - ' + error.responseText);
          });
        }).fail(function (error) {
          console.log('error: ', error);
        });
        return false;
      }
    },
    deactivate: function deactivate() {
      this.cleanupPolling();
    }
  });

});
define('hoodie-admin-dashboard/routes/plugins/users/user', ['exports', 'ember', 'hoodie-admin-dashboard/routes/authenticated'], function (exports, Ember, AuthenticatedRoute) {

  'use strict';

  exports['default'] = AuthenticatedRoute['default'].extend({
    model: function model(params) {
      var url = '/_api/_users/org.couchdb.user%3Auser%2F' + params.user_id;
      return Ember['default'].$.getJSON(url).then(function (user) {
        user.proper_name = user.name.replace('user/', '');
        return user;
      });
    }
  });

});
define('hoodie-admin-dashboard/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/components/add-user', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 7
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/components/add-user.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Add new user");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"class","addUser");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("fieldset");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        dom.setAttribute(el4,"for","");
        var el5 = dom.createTextNode("New user's name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("label");
        dom.setAttribute(el4,"for","");
        var el5 = dom.createTextNode("New user's password");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","submit btn ok");
        dom.setAttribute(el4,"type","submit");
        var el5 = dom.createTextNode("Add user");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","submitMessage");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [9]);
        var morphs = new Array(5);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(element1,3,3);
        morphs[2] = dom.createMorphAt(element1,7,7);
        morphs[3] = dom.createAttrMorph(element2, 'disabled');
        morphs[4] = dom.createUnsafeMorphAt(dom.childAt(element1, [11]),0,0);
        return morphs;
      },
      statements: [
        ["element","action",["addUser"],["on","submit"],["loc",[null,[2,22],[2,54]]]],
        ["inline","input",[],["type","text","class","form-control username","placeholder","User name","required","","value",["subexpr","@mut",[["get","newUserName",["loc",[null,[6,98],[6,109]]]]],[],[]],"disabled",["subexpr","@mut",[["get","disableAdd",["loc",[null,[6,119],[6,129]]]]],[],[]]],["loc",[null,[6,6],[6,131]]]],
        ["inline","input",[],["type","text","class","form-control password","placeholder","Password","required","","value",["subexpr","@mut",[["get","newUserPassword",["loc",[null,[8,97],[8,112]]]]],[],[]],"disabled",["subexpr","@mut",[["get","disableAdd",["loc",[null,[8,122],[8,132]]]]],[],[]]],["loc",[null,[8,6],[8,134]]]],
        ["attribute","disabled",["get","disableAdd",["loc",[null,[9,61],[9,71]]]]],
        ["content","submitMessage",["loc",[null,[10,34],[10,53]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/components/confirmation-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 6
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/components/confirmation-modal.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal fade");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-dialog");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","close");
        dom.setAttribute(el5,"data-dismiss","modal");
        dom.setAttribute(el5,"aria-hidden","true");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5,"class","modal-title");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn unobtrusive");
        dom.setAttribute(el5,"data-dismiss","modal");
        var el6 = dom.createTextNode("No, cancel.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn danger");
        var el6 = dom.createTextNode("Yes, go ahead.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 1]);
        var element1 = dom.childAt(element0, [5, 3]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 3]),0,0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        morphs[2] = dom.createElementMorph(element1);
        return morphs;
      },
      statements: [
        ["content","title",["loc",[null,[6,32],[6,41]]]],
        ["content","yield",["loc",[null,[9,8],[9,17]]]],
        ["element","action",["confirm"],[],["loc",[null,[13,49],[13,69]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/components/user-table-pagination', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 6
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/components/user-table-pagination.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","user-table-pagination");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn previous");
        var el3 = dom.createTextNode("Previous");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","pageNumber");
        var el3 = dom.createTextNode("Page ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn next");
        var el3 = dom.createTextNode("Next");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [5]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element1, 'disabled');
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        morphs[3] = dom.createAttrMorph(element2, 'disabled');
        morphs[4] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [
        ["attribute","disabled",["get","disablePrevious",["loc",[null,[2,64],[2,79]]]]],
        ["element","action",["previous"],[],["loc",[null,[2,31],[2,52]]]],
        ["content","pageNumber",["loc",[null,[3,31],[3,45]]]],
        ["attribute","disabled",["get","disableNext",["loc",[null,[4,56],[4,67]]]]],
        ["element","action",["next"],[],["loc",[null,[4,27],[4,44]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 0
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/index.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/login.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("You are already logged in!");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 4
              },
              "end": {
                "line": 11,
                "column": 4
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/login.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            dom.setAttribute(el1,"class","warning");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","errorMessage",["loc",[null,[10,25],[10,41]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 13,
              "column": 0
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/login.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          dom.setAttribute(el1,"class","form-inline login");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2,"src","assets/images/hoodie_logo.svg");
          dom.setAttribute(el2,"alt","");
          dom.setAttribute(el2,"class","fitWidth");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("label");
          dom.setAttribute(el2,"for","password");
          var el3 = dom.createTextNode("Please enter your admin password:");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0,5,5);
          morphs[2] = dom.createMorphAt(element0,7,7);
          morphs[3] = dom.createMorphAt(element0,9,9);
          return morphs;
        },
        statements: [
          ["element","action",[["get","login",["loc",[null,[4,43],[4,48]]]]],["on","submit"],["loc",[null,[4,34],[4,62]]]],
          ["inline","input",[],["id","password","value",["subexpr","@mut",[["get","password",["loc",[null,[7,32],[7,40]]]]],[],[]],"type","password","placeholder","Admin password","autofocus","autofocus"],["loc",[null,[7,4],[7,109]]]],
          ["inline","input",[],["class","btn","type","submit","value","Log In"],["loc",[null,[8,4],[8,54]]]],
          ["block","if",[["get","errorMessage",["loc",[null,[9,10],[9,22]]]]],[],0,null,["loc",[null,[9,4],[11,11]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 7
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/login.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","loggedIn",["loc",[null,[1,6],[1,14]]]]],[],0,1,["loc",[null,[1,0],[13,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('hoodie-admin-dashboard/templates/logout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/logout.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/plugins', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 8
            },
            "end": {
              "line": 3,
              "column": 37
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Dashboard");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 8,
                "column": 6
              },
              "end": {
                "line": 8,
                "column": 58
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["content","plugin.title",["loc",[null,[8,42],[8,58]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 4
            },
            "end": {
              "line": 10,
              "column": 4
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["plugins.plugin",["get","plugin",["loc",[null,[8,34],[8,40]]]]],[],0,null,["loc",[null,[8,6],[8,70]]]]
        ],
        locals: ["plugin"],
        templates: [child0]
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 8
            },
            "end": {
              "line": 11,
              "column": 41
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Users");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 8
            },
            "end": {
              "line": 12,
              "column": 41
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Email");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 8
            },
            "end": {
              "line": 15,
              "column": 35
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("logout");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 23,
            "column": 0
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/plugins.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","sidebar");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","plugin-list");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","helpers");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","main-content");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","pluginView");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,0);
        morphs[1] = dom.createMorphAt(element1,1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [5]),0,0);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [5, 1]),0,0);
        morphs[5] = dom.createMorphAt(dom.childAt(fragment, [2, 1]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["index"],[],0,null,["loc",[null,[3,8],[3,49]]]],
        ["block","each",[["get","model.plugins.plugins",["loc",[null,[6,12],[6,33]]]]],[],1,null,["loc",[null,[6,4],[10,13]]]],
        ["block","link-to",["plugins.users"],[],2,null,["loc",[null,[11,8],[11,53]]]],
        ["block","link-to",["plugins.email"],[],3,null,["loc",[null,[12,8],[12,53]]]],
        ["block","link-to",["logout"],[],4,null,["loc",[null,[15,8],[15,47]]]],
        ["content","outlet",["loc",[null,[20,4],[20,14]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('hoodie-admin-dashboard/templates/plugins/email', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 25,
              "column": 4
            },
            "end": {
              "line": 35,
              "column": 4
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/email.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          dom.setAttribute(el1,"action","");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("fieldset");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("textarea");
          dom.setAttribute(el3,"class","form-control");
          dom.setAttribute(el3,"required","");
          dom.setAttribute(el3,"rows","5");
          dom.setAttribute(el3,"disabled","disabled");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          dom.setAttribute(el3,"class","help-block");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element1, [1]);
          var morphs = new Array(5);
          morphs[0] = dom.createAttrMorph(element0, 'id');
          morphs[1] = dom.createAttrMorph(element2, 'for');
          morphs[2] = dom.createMorphAt(element2,0,0);
          morphs[3] = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
          morphs[4] = dom.createMorphAt(dom.childAt(element1, [5]),0,0);
          return morphs;
        },
        statements: [
          ["attribute","id",["concat",["template-",["get","mailtemplate.type",["loc",[null,[26,26],[26,43]]]]]]],
          ["attribute","for",["concat",["template-",["get","mailtemplate.type",["loc",[null,[28,32],[28,49]]]]]]],
          ["content","mailtemplate.name",["loc",[null,[28,54],[28,77]]]],
          ["content","mailtemplate.text",["loc",[null,[30,10],[30,35]]]],
          ["content","mailtemplate.description",["loc",[null,[32,30],[32,60]]]]
        ],
        locals: ["mailtemplate"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 37,
            "column": 6
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/plugins/email.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","internalPlugin usersPlugin");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Email Settings");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Set up all outgoing email from this Hoodie app");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","alert alert-warning");
        var el4 = dom.createTextNode("To change any of these values, please edit the corresponding config files.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"id","emailForm");
        dom.setAttribute(el3,"action","");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("fieldset");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","fromEmail");
        var el6 = dom.createTextNode("Default From E-Mail Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5,"name","fromEmail");
        dom.setAttribute(el5,"class","form-control");
        dom.setAttribute(el5,"type","email");
        dom.setAttribute(el5,"placeholder","Default from address");
        dom.setAttribute(el5,"disabled","disabled");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","help-block");
        var el6 = dom.createTextNode("For password reset emails etc.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Email Service");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","username");
        var el6 = dom.createTextNode("Username");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5,"name","emailUsername");
        dom.setAttribute(el5,"type","email");
        dom.setAttribute(el5,"class","form-control");
        dom.setAttribute(el5,"id","username");
        dom.setAttribute(el5,"placeholder","Username");
        dom.setAttribute(el5,"disabled","disabled");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","help-block");
        var el6 = dom.createTextNode("Account name for the email service");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","password");
        var el6 = dom.createTextNode("Password");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5,"name","emailPassword");
        dom.setAttribute(el5,"type","password");
        dom.setAttribute(el5,"class","form-control");
        dom.setAttribute(el5,"id","password");
        dom.setAttribute(el5,"placeholder","Password");
        dom.setAttribute(el5,"disabled","disabled");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","help-block");
        var el6 = dom.createTextNode("Email service password");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("\n        <button class=\"submit btn\" type=\"submit\">Save email config</button>\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Email Templates");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0, 1]);
        var element4 = dom.childAt(element3, [7, 1]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element4, [13]);
        var element7 = dom.childAt(element4, [19]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element5, 'value');
        morphs[1] = dom.createMorphAt(element4,9,9);
        morphs[2] = dom.createAttrMorph(element6, 'value');
        morphs[3] = dom.createAttrMorph(element7, 'value');
        morphs[4] = dom.createMorphAt(element3,11,11);
        return morphs;
      },
      statements: [
        ["attribute","value",["concat",[["get","model.email.outgoing.defaultfromaddress",["loc",[null,[9,111],[9,150]]]]]]],
        ["inline","select-2",[],["content",["subexpr","@mut",[["get","model.email.outgoing.availableservices",["loc",[null,[12,27],[12,65]]]]],[],[]],"value",["subexpr","@mut",[["get","model.email.outgoing.service",["loc",[null,[12,72],[12,100]]]]],[],[]],"name","emailService","enabled",false],["loc",[null,[12,8],[12,136]]]],
        ["attribute","value",["concat",[["get","model.email.outgoing.auth.username",["loc",[null,[14,117],[14,151]]]]]]],
        ["attribute","value",["concat",[["get","model.email.outgoing.auth.password",["loc",[null,[17,120],[17,154]]]]]]],
        ["block","each",[["get","model.email.templates",["loc",[null,[25,12],[25,33]]]]],[],0,null,["loc",[null,[25,4],[35,13]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('hoodie-admin-dashboard/templates/plugins/plugin', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 108
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/plugins/plugin.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("iframe");
        dom.setAttribute(el1,"name","plugin");
        dom.setAttribute(el1,"frameborder","0");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'src');
        return morphs;
      },
      statements: [
        ["attribute","src",["concat",["/_api/_plugins/",["get","model.id",["loc",[null,[1,44],[1,52]]]],"/admin-dashboard/index.html"]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('hoodie-admin-dashboard/templates/plugins/users/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 30,
              "column": 10
            },
            "end": {
              "line": 32,
              "column": 10
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"class","btn clearSearch");
          var el2 = dom.createTextNode("Clear search");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element14 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element14);
          return morphs;
        },
        statements: [
          ["element","action",["clearSearch"],[],["loc",[null,[31,42],[31,66]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 39,
              "column": 4
            },
            "end": {
              "line": 41,
              "column": 4
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-info");
          var el2 = dom.createTextNode("Hey! ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("strong");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" new ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" signed up or confirmed");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" since you opened this page. ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","");
          var el3 = dom.createTextNode("Refresh the user list");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" to see them.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element11 = dom.childAt(fragment, [1]);
          var element12 = dom.childAt(element11, [1]);
          var element13 = dom.childAt(element11, [3]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(element12,0,0);
          morphs[1] = dom.createMorphAt(element12,2,2);
          morphs[2] = dom.createElementMorph(element13);
          return morphs;
        },
        statements: [
          ["content","newUsers",["loc",[null,[40,47],[40,59]]]],
          ["inline","pluralize-word",[["get","newUsers",["loc",[null,[40,81],[40,89]]]],"user"],[],["loc",[null,[40,64],[40,98]]]],
          ["element","action",["updateUserList"],[],["loc",[null,[40,170],[40,197]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 45,
              "column": 139
            },
            "end": {
              "line": 45,
              "column": 203
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode(" matching ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("strong");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          return morphs;
        },
        statements: [
          ["content","activeSearch",["loc",[null,[45,177],[45,193]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 69,
                  "column": 14
                },
                "end": {
                  "line": 69,
                  "column": 67
                }
              },
              "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("edit");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes() { return []; },
            statements: [

            ],
            locals: [],
            templates: []
          };
        }());
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 61,
                "column": 10
              },
              "end": {
                "line": 74,
                "column": 10
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            dom.setAttribute(el1,"class","user");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"class","timeago");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("span");
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"class","no-sort");
            var el3 = dom.createTextNode("\n              ");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" /\n              ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("a");
            dom.setAttribute(el3,"href","#");
            dom.setAttribute(el3,"class","removeUserPrompt");
            var el4 = dom.createTextNode("delete");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createComment(" /\n              <a href=\"{{link-to-futon-user user.value.name}}\">futon</a>");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var element2 = dom.childAt(element0, [5, 1]);
            var element3 = dom.childAt(element0, [7]);
            var element4 = dom.childAt(element3, [3]);
            var morphs = new Array(9);
            morphs[0] = dom.createAttrMorph(element0, 'data-id');
            morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
            morphs[2] = dom.createAttrMorph(element1, 'data-sort');
            morphs[3] = dom.createAttrMorph(element1, 'title');
            morphs[4] = dom.createMorphAt(element1,0,0);
            morphs[5] = dom.createAttrMorph(element2, 'class');
            morphs[6] = dom.createMorphAt(element2,0,0);
            morphs[7] = dom.createMorphAt(element3,1,1);
            morphs[8] = dom.createElementMorph(element4);
            return morphs;
          },
          statements: [
            ["attribute","data-id",["concat",[["get","user.value.id",["loc",[null,[62,25],[62,38]]]]]]],
            ["content","user.value.name",["loc",[null,[63,16],[63,35]]]],
            ["attribute","data-sort",["concat",[["subexpr","convert-ISO-to-timestamp",[["get","user.value.createdAt",["loc",[null,[64,54],[64,74]]]]],[],["loc",[null,[64,27],[64,76]]]]]]],
            ["attribute","title",["concat",[["get","user.value.createdAt",["loc",[null,[64,103],[64,123]]]]]]],
            ["inline","time-ago-in-words",[["get","user.value.createdAt",["loc",[null,[64,147],[64,167]]]]],[],["loc",[null,[64,127],[64,169]]]],
            ["attribute","class",["concat",["pill ",["subexpr","user-state-color",[["get","user.value.state",["loc",[null,[66,49],[66,65]]]]],[],["loc",[null,[66,30],[66,67]]]]]]],
            ["content","user.value.state",["loc",[null,[66,69],[66,89]]]],
            ["block","link-to",["plugins.users.user",["get","user.value.name",["loc",[null,[69,46],[69,61]]]]],[],0,null,["loc",[null,[69,14],[69,79]]]],
            ["element","action",["promptToDeleteUser",["get","user",["loc",[null,[70,81],[70,85]]]]],[],["loc",[null,[70,51],[70,87]]]]
          ],
          locals: ["user"],
          templates: [child0]
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 47,
              "column": 6
            },
            "end": {
              "line": 80,
              "column": 6
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("table");
          dom.setAttribute(el1,"id","userList");
          dom.setAttribute(el1,"class","table users table-striped");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("thead");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("tr");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("th");
          var el5 = dom.createTextNode("Username");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("th");
          var el5 = dom.createTextNode("Signup date");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("th");
          dom.setAttribute(el4,"data-sort-by","state");
          var el5 = dom.createTextNode("State");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("th");
          dom.setAttribute(el4,"class","no-sort");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("tbody");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [3]);
          var element6 = dom.childAt(element5, [1]);
          var element7 = dom.childAt(element6, [1]);
          var element8 = dom.childAt(element7, [1]);
          var element9 = dom.childAt(element7, [3]);
          var element10 = dom.childAt(element7, [5]);
          var morphs = new Array(9);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          morphs[1] = dom.createAttrMorph(element6, 'class');
          morphs[2] = dom.createAttrMorph(element8, 'class');
          morphs[3] = dom.createElementMorph(element8);
          morphs[4] = dom.createAttrMorph(element9, 'class');
          morphs[5] = dom.createElementMorph(element9);
          morphs[6] = dom.createElementMorph(element10);
          morphs[7] = dom.createMorphAt(dom.childAt(element5, [3]),1,1);
          morphs[8] = dom.createMorphAt(fragment,5,5,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","user-table-pagination",[],["pageNumber",["subexpr","@mut",[["get","pageNumber",["loc",[null,[49,41],[49,51]]]]],[],[]],"isLastPage",["subexpr","@mut",[["get","isLastPage",["loc",[null,[49,63],[49,73]]]]],[],[]],"action","changePage"],["loc",[null,[49,6],[49,95]]]],
          ["attribute","class",["concat",[["subexpr","if",[["get","sortDesc",["loc",[null,[52,27],[52,35]]]],"desc","asc"],[],["loc",[null,[52,22],[52,50]]]]]]],
          ["attribute","class",["concat",[["subexpr","is-active-table-header",["name",["get","sortBy",["loc",[null,[54,82],[54,88]]]]],[],["loc",[null,[54,50],[54,90]]]]]]],
          ["element","action",["sortBy","name"],[],["loc",[null,[54,16],[54,42]]]],
          ["attribute","class",["concat",[["subexpr","is-active-table-header",["created-at",["get","sortBy",["loc",[null,[55,94],[55,100]]]]],[],["loc",[null,[55,56],[55,102]]]]]]],
          ["element","action",["sortBy","created-at"],[],["loc",[null,[55,16],[55,48]]]],
          ["element","action",["sortBy","state"],[],["loc",[null,[56,37],[56,64]]]],
          ["block","each",[["get","model.users",["loc",[null,[61,18],[61,29]]]]],[],0,null,["loc",[null,[61,10],[74,19]]]],
          ["inline","user-table-pagination",[],["pageNumber",["subexpr","@mut",[["get","pageNumber",["loc",[null,[78,41],[78,51]]]]],[],[]],"isLastPage",["subexpr","@mut",[["get","isLastPage",["loc",[null,[78,63],[78,73]]]]],[],[]],"action","changePage"],["loc",[null,[78,6],[78,95]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 81,
                "column": 8
              },
              "end": {
                "line": 83,
                "column": 8
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","alert alert-warning");
            var el2 = dom.createTextNode("No results for ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(". Please note that the search only matches exact strings from the first character onwards at the moment.");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]),0,0);
            return morphs;
          },
          statements: [
            ["content","activeSearch",["loc",[null,[82,67],[82,83]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 83,
                "column": 8
              },
              "end": {
                "line": 85,
                "column": 8
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("You don't have any users yet.");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 80,
              "column": 6
            },
            "end": {
              "line": 86,
              "column": 6
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","activeSearch",["loc",[null,[81,14],[81,26]]]]],[],0,1,["loc",[null,[81,8],[85,15]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    var child5 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.3",
            "loc": {
              "source": null,
              "start": {
                "line": 92,
                "column": 2
              },
              "end": {
                "line": 95,
                "column": 2
              }
            },
            "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("Are you sure you want to delete the user ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("strong");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" and all their data?");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createElement("strong");
            var el3 = dom.createTextNode("There is no way to undo this.");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]),0,0);
            return morphs;
          },
          statements: [
            ["content","selectedUser.value.name",["loc",[null,[93,54],[93,81]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 91,
              "column": 0
            },
            "end": {
              "line": 96,
              "column": 0
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","confirmation-modal",[],["model",["subexpr","@mut",[["get","selectedUser",["loc",[null,[92,30],[92,42]]]]],[],[]],"title","Really delete the user?","confirm","deleteUser","cancel","cancelDelete"],0,null,["loc",[null,[92,2],[95,25]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 96,
            "column": 7
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/plugins/users/index.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","internalPlugin usersPlugin");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Users Plugin");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Additional databases for each user");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("fieldset");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","group");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","");
        var el7 = dom.createTextNode("Extra user databases");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","help-block");
        var el7 = dom.createTextNode("Enter a comma-separated list. Will generate a database called \"userHash–databaseName\" for each database entered, per user, i.e. ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("strong");
        var el8 = dom.createTextNode("\"7nzj7rl-photos\"");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" for ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("strong");
        var el8 = dom.createTextNode("\"photos\"");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(".");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","help-block");
        var el7 = dom.createTextNode("Please only use lower case letters and dashes, separated by commas. Spaces will be stripped.");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","help-block");
        var el7 = dom.createElement("strong");
        var el8 = dom.createTextNode("Important: This will not apply to existing users!");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"class","storeDatabases btn ok");
        dom.setAttribute(el6,"type","submit");
        var el7 = dom.createTextNode("Set extra databases");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","submitMessage");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Search for users");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"class","userSearch");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("fieldset");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","group");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","");
        var el7 = dom.createTextNode("Search term");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        dom.setAttribute(el6,"class","help-block");
        var el7 = dom.createTextNode("Search only applies to usernames.");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"class","submit btn ok");
        dom.setAttribute(el6,"type","submit");
        var el7 = dom.createTextNode("Search");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Your ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content centered");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","tableStatus");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","currentSearchMetrics muted");
        var el6 = dom.createTextNode("Showing ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("out of a total of ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("strong");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(".");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element15 = dom.childAt(fragment, [0, 1]);
        var element16 = dom.childAt(element15, [7]);
        var element17 = dom.childAt(element16, [1, 1]);
        var element18 = dom.childAt(element15, [11]);
        var element19 = dom.childAt(element18, [1, 1]);
        var element20 = dom.childAt(element15, [13]);
        var element21 = dom.childAt(element15, [17]);
        var element22 = dom.childAt(element21, [1, 1]);
        var morphs = new Array(16);
        morphs[0] = dom.createMorphAt(element15,3,3);
        morphs[1] = dom.createElementMorph(element16);
        morphs[2] = dom.createMorphAt(element17,3,3);
        morphs[3] = dom.createUnsafeMorphAt(dom.childAt(element17, [13]),0,0);
        morphs[4] = dom.createElementMorph(element18);
        morphs[5] = dom.createMorphAt(element19,3,3);
        morphs[6] = dom.createMorphAt(element19,9,9);
        morphs[7] = dom.createMorphAt(element20,1,1);
        morphs[8] = dom.createMorphAt(element20,3,3);
        morphs[9] = dom.createMorphAt(element15,15,15);
        morphs[10] = dom.createMorphAt(dom.childAt(element22, [1]),0,0);
        morphs[11] = dom.createMorphAt(element22,3,3);
        morphs[12] = dom.createMorphAt(element22,5,5);
        morphs[13] = dom.createMorphAt(dom.childAt(element22, [7]),0,0);
        morphs[14] = dom.createMorphAt(element21,3,3);
        morphs[15] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["inline","add-user",[],["action","updateUserList"],["loc",[null,[5,4],[5,40]]]],
        ["element","action",["updateAdditionalDatabases"],["on","submit"],["loc",[null,[8,10],[8,60]]]],
        ["inline","input",[],["type","text","name","userDatabases","pattern","([a-z, -])+","class","form-control search-query","placeholder","Databases","value",["subexpr","@mut",[["get","additionalDatabases",["loc",[null,[12,137],[12,156]]]]],[],[]]],["loc",[null,[12,10],[12,158]]]],
        ["content","addDatabasesSubmitMessage",["loc",[null,[17,38],[17,69]]]],
        ["element","action",["search"],["on","submit"],["loc",[null,[23,29],[23,60]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","searchTerm",["loc",[null,[27,24],[27,34]]]]],[],[]],"type","text","class","form-control search-query","placeholder","Username"],["loc",[null,[27,10],[27,105]]]],
        ["block","if",[["get","searchTerm",["loc",[null,[30,16],[30,26]]]]],[],0,null,["loc",[null,[30,10],[32,17]]]],
        ["content","model.totalUsers",["loc",[null,[37,13],[37,33]]]],
        ["inline","pluralize-word",[["get","model.totalUsers",["loc",[null,[37,51],[37,67]]]],"user"],[],["loc",[null,[37,34],[37,76]]]],
        ["block","if",[["get","newUsers",["loc",[null,[39,10],[39,18]]]]],[],1,null,["loc",[null,[39,4],[41,11]]]],
        ["content","model.users.length",["loc",[null,[45,62],[45,84]]]],
        ["inline","pluralize-word",[["get","model.users.length",["loc",[null,[45,111],[45,129]]]],"user"],[],["loc",[null,[45,94],[45,138]]]],
        ["block","if",[["get","activeSearch",["loc",[null,[45,145],[45,157]]]]],[],2,null,["loc",[null,[45,139],[45,210]]]],
        ["content","model.totalUsers",["loc",[null,[45,236],[45,256]]]],
        ["block","if",[["get","model.users",["loc",[null,[47,12],[47,23]]]]],[],3,4,["loc",[null,[47,6],[86,13]]]],
        ["block","if",[["get","deletingUser",["loc",[null,[91,6],[91,18]]]]],[],5,null,["loc",[null,[91,0],[96,7]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  }()));

});
define('hoodie-admin-dashboard/templates/plugins/users/user', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 4
            },
            "end": {
              "line": 12,
              "column": 36
            }
          },
          "moduleName": "hoodie-admin-dashboard/templates/plugins/users/user.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Back");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "hoodie-admin-dashboard/templates/plugins/users/user.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","internalPlugin");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Edit user: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"class","updatePassword");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("fieldset");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","input-1");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("'s password");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn");
        dom.setAttribute(el5,"type","submit");
        var el6 = dom.createTextNode("Update password");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","submitMessage");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createAttrMorph(element1, 'data-id');
        morphs[2] = dom.createElementMorph(element1);
        morphs[3] = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        morphs[4] = dom.createMorphAt(element2,3,3);
        morphs[5] = dom.createMorphAt(dom.childAt(element2, [7]),0,0);
        morphs[6] = dom.createMorphAt(element0,5,5);
        return morphs;
      },
      statements: [
        ["content","model.proper_name",["loc",[null,[3,17],[3,38]]]],
        ["attribute","data-id",["concat",[["get","model.id",["loc",[null,[4,44],[4,52]]]]]]],
        ["element","action",["updatePassword",["get","newPassword",["loc",[null,[4,82],[4,93]]]]],["on","submit"],["loc",[null,[4,56],[4,107]]]],
        ["content","model.proper_name",["loc",[null,[6,29],[6,50]]]],
        ["inline","input",[],["type","text","class","form-control","name","password","placeholder","password can not be empty","value",["subexpr","@mut",[["get","newPassword",["loc",[null,[7,111],[7,122]]]]],[],[]]],["loc",[null,[7,8],[7,124]]]],
        ["content","submitMessage",["loc",[null,[9,36],[9,53]]]],
        ["block","link-to",["plugins.users"],[],0,null,["loc",[null,[12,4],[12,48]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('hoodie-admin-dashboard/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/components/add-user.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/add-user.js should pass jshint', function() { 
    ok(true, 'components/add-user.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/components/confirmation-modal.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/confirmation-modal.js should pass jshint', function() { 
    ok(true, 'components/confirmation-modal.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/components/user-table-pagination.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/user-table-pagination.js should pass jshint', function() { 
    ok(true, 'components/user-table-pagination.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/controllers/index.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/index.js should pass jshint', function() { 
    ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/controllers/login.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/login.js should pass jshint', function() { 
    ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/controllers/logout.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/logout.js should pass jshint', function() { 
    ok(true, 'controllers/logout.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/controllers/plugins/users/user.jshint', function () {

  'use strict';

  module('JSHint - controllers/plugins/users');
  test('controllers/plugins/users/user.js should pass jshint', function() { 
    ok(true, 'controllers/plugins/users/user.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/controllers/users.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/users.js should pass jshint', function() { 
    ok(true, 'controllers/users.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/convert-iso-to-timestamp.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/convert-iso-to-timestamp.js should pass jshint', function() { 
    ok(true, 'helpers/convert-iso-to-timestamp.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/is-active-table-header.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/is-active-table-header.js should pass jshint', function() { 
    ok(true, 'helpers/is-active-table-header.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/link-to-futon-user.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/link-to-futon-user.js should pass jshint', function() { 
    ok(true, 'helpers/link-to-futon-user.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/pluralize-word.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/pluralize-word.js should pass jshint', function() { 
    ok(true, 'helpers/pluralize-word.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/resolver', ['exports', 'ember/resolver', 'hoodie-admin-dashboard/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('hoodie-admin-dashboard/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/start-app', ['exports', 'ember', 'hoodie-admin-dashboard/app', 'hoodie-admin-dashboard/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('hoodie-admin-dashboard/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/helpers/user-state-color.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/user-state-color.js should pass jshint', function() { 
    ok(true, 'helpers/user-state-color.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/integration/components/add-user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('add-user', 'Integration | Component | add user', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 12
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'add-user', ['loc', [null, [1, 0], [1, 12]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.3',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'add-user', [], [], 0, null, ['loc', [null, [2, 4], [4, 17]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('hoodie-admin-dashboard/tests/integration/components/add-user-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/add-user-test.js should pass jshint', function() { 
    ok(true, 'integration/components/add-user-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/integration/components/user-table-pagination-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('user-table-pagination', 'Integration | Component | user table pagination', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 25
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'user-table-pagination', ['loc', [null, [1, 0], [1, 25]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.3',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.3',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'user-table-pagination', [], [], 0, null, ['loc', [null, [2, 4], [4, 30]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('hoodie-admin-dashboard/tests/integration/components/user-table-pagination-test.jshint', function () {

  'use strict';

  module('JSHint - integration/components');
  test('integration/components/user-table-pagination-test.js should pass jshint', function() { 
    ok(true, 'integration/components/user-table-pagination-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/authenticated.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/authenticated.js should pass jshint', function() { 
    ok(true, 'routes/authenticated.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/logout.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/logout.js should pass jshint', function() { 
    ok(true, 'routes/logout.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/plugins.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/plugins.js should pass jshint', function() { 
    ok(true, 'routes/plugins.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/plugins/email.jshint', function () {

  'use strict';

  module('JSHint - routes/plugins');
  test('routes/plugins/email.js should pass jshint', function() { 
    ok(false, 'routes/plugins/email.js should pass jshint.\nroutes/plugins/email.js: line 1, col 8, \'Ember\' is defined but never used.\n\n1 error'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/plugins/plugin.jshint', function () {

  'use strict';

  module('JSHint - routes/plugins');
  test('routes/plugins/plugin.js should pass jshint', function() { 
    ok(true, 'routes/plugins/plugin.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/plugins/users/index.jshint', function () {

  'use strict';

  module('JSHint - routes/plugins/users');
  test('routes/plugins/users/index.js should pass jshint', function() { 
    ok(false, 'routes/plugins/users/index.js should pass jshint.\nroutes/plugins/users/index.js: line 92, col 80, \'config\' is not defined.\n\n1 error'); 
  });

});
define('hoodie-admin-dashboard/tests/routes/plugins/users/user.jshint', function () {

  'use strict';

  module('JSHint - routes/plugins/users');
  test('routes/plugins/users/user.js should pass jshint', function() { 
    ok(true, 'routes/plugins/users/user.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/test-helper', ['hoodie-admin-dashboard/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('hoodie-admin-dashboard/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:login', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/login-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/logout-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:logout', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/logout-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/logout-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/logout-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/plugins/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:plugins/users', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/plugins/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/plugins');
  test('unit/controllers/plugins/users-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/plugins/users-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/plugins/users/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:plugins/users/user', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/plugins/users/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/plugins/users');
  test('unit/controllers/plugins/users/user-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/plugins/users/user-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:users', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('hoodie-admin-dashboard/tests/unit/controllers/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/users-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/users-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/convert-iso-to-timestamp-test', ['hoodie-admin-dashboard/helpers/convert-iso-to-timestamp', 'qunit'], function (convert_iso_to_timestamp, qunit) {

  'use strict';

  qunit.module('Unit | Helper | convert iso to timestamp');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = convert_iso_to_timestamp.convertISOToTimestamp(42);
    assert.ok(result);
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/convert-iso-to-timestamp-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/convert-iso-to-timestamp-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/convert-iso-to-timestamp-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/is-active-table-header-test', ['hoodie-admin-dashboard/helpers/is-active-table-header', 'qunit'], function (is_active_table_header, qunit) {

  'use strict';

  qunit.module('Unit | Helper | is active table header');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = is_active_table_header.isActiveTableHeader(42);
    assert.ok(result);
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/is-active-table-header-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/is-active-table-header-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/is-active-table-header-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/link-to-futon-user-test', ['hoodie-admin-dashboard/helpers/link-to-futon-user', 'qunit'], function (link_to_futon_user, qunit) {

  'use strict';

  qunit.module('Unit | Helper | link to futon user');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = link_to_futon_user.linkToFutonUser(42);
    assert.ok(result);
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/link-to-futon-user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/link-to-futon-user-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/link-to-futon-user-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/pluralize-word-test', ['hoodie-admin-dashboard/helpers/pluralize-word', 'qunit'], function (pluralize_word, qunit) {

  'use strict';

  qunit.module('Unit | Helper | pluralize word');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = pluralize_word.pluralizeWord(42);
    assert.ok(result);
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/pluralize-word-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/pluralize-word-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/pluralize-word-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/user-state-color-test', ['hoodie-admin-dashboard/helpers/user-state-color', 'qunit'], function (user_state_color, qunit) {

  'use strict';

  qunit.module('Unit | Helper | user state color');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = user_state_color.userStateColor(42);
    assert.ok(result);
  });

});
define('hoodie-admin-dashboard/tests/unit/helpers/user-state-color-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/user-state-color-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/user-state-color-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:login', 'Unit | Route | login', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/login-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/login-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/logout-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:logout', 'Unit | Route | logout', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/logout-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/logout-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/logout-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:plugins/users', 'Unit | Route | plugins/users', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/plugins');
  test('unit/routes/plugins/users-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/plugins/users-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:plugins/users/index', 'Unit | Route | plugins/users/index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/plugins/users');
  test('unit/routes/plugins/users/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/plugins/users/index-test.js should pass jshint.'); 
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:plugins/users/users', 'Unit | Route | plugins/users/users', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('hoodie-admin-dashboard/tests/unit/routes/plugins/users/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/plugins/users');
  test('unit/routes/plugins/users/users-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/plugins/users/users-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('hoodie-admin-dashboard/config/environment', ['ember'], function(Ember) {
  var prefix = 'hoodie-admin-dashboard';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("hoodie-admin-dashboard/tests/test-helper");
} else {
  require("hoodie-admin-dashboard/app")["default"].create({"name":"hoodie-admin-dashboard","version":"v3.0.0"});
}

/* jshint ignore:end */
//# sourceMappingURL=hoodie-admin-dashboard.map