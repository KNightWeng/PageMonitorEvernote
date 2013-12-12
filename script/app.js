
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var note = require('./routes/notes');
var http = require('http');
var path = require('path');
//var compass = require('node-compass');

var app = express();
app.engine('html', require('hogan-express'));
// all environments
app.set('port', process.env.PORT || 1314);
//app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(express.json());
//app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('PageMonitorSecret'));
app.use(express.session());
app.use(app.router);
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(process.cwd(), 'public')));
//app.use(compass({mode: 'compact', comments: true}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/oauth', routes.oauth);
app.get('/oauth_callback', routes.oauth_callback);
app.get('/logout', routes.logout);

app.get('/main', note.main);
app.get('/main/refresh', note.refresh);
//app.get('/main/createNote', note.createNote);
//app.get('/notes/new', note.newNote);
//app.post('/notes', note.createNote);
//app.get('/notes/:id', note.showNote);
//app.get('/notes/:id/edit', note.editNote);
//app.put('/notes/:id', note.updateNote);
//app.post('/notes/:id', note.updateNote);
//app.delete('/notes/:id', note.deleteNote);
//app.get('/notes/:id/delete', note.deleteNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Load native UI library
var gui = require('nw.gui'); 
//or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

// Get the current window
var win = gui.Window.get();

// Listen to the minimize event
/*win.on('minimize', function() {
  console.log('Window is minimized');
});

// Minimize the window
win.minimize();

// Unlisten the minimize event
win.removeAllListeners('minimize');*/

// Close the current window (index.html)
win.close();

// Create a new window and get it
var new_win = gui.Window.get(
  window.open('http://localhost:1314')
);

// And listen to new window's focus event
new_win.on('focus', function() {
  console.log('New window is focused');
});
