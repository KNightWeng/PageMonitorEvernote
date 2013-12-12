var Evernote = require('evernote').Evernote;
var config = require('../config.json');
var request = require('request');
var cheerio = require('cheerio');
var events = require('events');
var isProduction = (process.env.NODE_ENV === 'production');
var port = process.env.PORT || 1314;
var callbackUrl = isProduction ? config.PRODUCTION_URL +'oauth_callback' : 'http://localhost:'+ port +'/oauth_callback';
var emitter = new events.EventEmitter();
var last_description = "";

exports.main = function(req, res) {
    /*var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();

    var notes = [];
    var filter = new Evernote.NoteFilter();
    filter.notebookGuid = req.session.slideNotebook.guid;
    filter.order = 2; //sort by UPDATED time
    var offset = 0;
    var spec = new Evernote.NotesMetadataResultSpec();
    spec.includeTitle = true;

    noteStore.findNotesMetadata(filter, offset, 20, spec, function(err, response){
        var notesList = response.notes;
        console.log(notesList);

        for(var i in notesList){
            notes.push({
                guid: notesList[i].guid,
                title: notesList[i].title
            });
        }*/
        res.render('main', {
            layout: 'layouts/layout',
            title: 'PageMonitorEvernote: Main'
        });

    //});
};

exports.createNote = function(req, res) {
    var data = req.body;

    var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();

    var note = new Evernote.Note();
    note.title = data.title;
    note.content = data.content;
    note.notebookGuid = req.session.slideNotebook.guid;

    noteStore.createNote(note, function(err, note){
	res.redirect('/main');
    });
};

exports.refresh = function(req, res) {
	var functRef = update(req, res);
	functRef();
        setInterval(functRef, 300000);
};

function update(req, res){
return (function() {
	var url = 'http://joejoeyourmoney.pixnet.net/blog';
	var notes = [];
	process.stdout.write('setInterval 5 mins alive...\n');

	request(url, function(err, resp, body){
  		$ = cheerio.load(body);
  		links = $('#banner h2'); //use your CSS selector here
  		$(links).each(function(i, link){
			emitter.emit('page_load_complete', $(link).text(), req, res);
  		});
	});
});
}

emitter.on('page_load_complete', function(description, req, res){
	var notes = [];

	if(last_description != description){
		last_description = description;
		newEverNote(description, req, res);
	}
		
	notes.push({
                content: description,
  	});

	res.render('show', {
            layout: 'layouts/layout',
            title: 'PageMonitorEvernote: Comment',
            note: notes
        });

	
});

function newEverNote(description, req, res){
    	var client = new Evernote.Client({
        	token: req.session.oauthAccessToken,
        	sandbox: config.SANDBOX
    	});
    	var noteStore = client.getNoteStore();

	var enmlContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">',
        '<en-note>',
        description,
        '</en-note>'
    	].join('\n');

    	var note = new Evernote.Note();
    	note.title = "Joe's Comment";
    	note.content = enmlContent;
    	note.notebookGuid = req.session.slideNotebook.guid;

    	noteStore.createNote(note, function(err, note){
		if(err)
			process.stdout.write('Error@newEverNote\n');	
	});
}

/*exports.newNote = function(req, res) {
    var defaultContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">',
        '<en-note>',
        '',
        '</en-note>'
    ].join('\n');

    res.render('new', {
        layout: 'layouts/layout',
        title: 'ENML Editor: Create a Note',
        content: defaultContent
    });
};

exports.showNote = function(req, res) {
    //get note content
    var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();
    var guid = req.params.id;

    noteStore.getNote(guid, true, false, false, false, function(err, note){
        res.render('show', {
            layout: 'layouts/layout',
            title: note.title,
            note: note
        });
    });
};

exports.editNote = function(req, res) {
    //get note content
    var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();
    var guid = req.params.id;

    noteStore.getNote(guid, true, false, false, false, function(err, note){
        res.render('edit', {
            layout: 'layouts/layout',
            title: note.title,
            note: note
        });
    });
};

exports.updateNote = function(req, res) {
    console.log(req.params.id);
    console.log(req.body);

    var data = req.body;

    var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();
    var guid = req.params.id;

    noteStore.getNote(guid, true, false, false, false, function(err, note){
        note.title = data.title;
        note.content = data.content
        noteStore.updateNote(note, function(err, note){
            res.redirect('/notes');
        });
    });
};

exports.deleteNote = function(req, res) {
    console.log(req.params.id);

    var client = new Evernote.Client({
        token: req.session.oauthAccessToken,
        sandbox: config.SANDBOX
    });
    var noteStore = client.getNoteStore();
    var guid = req.params.id;

    noteStore.getNote(guid, true, false, false, false, function(err, note){
        note.active = false;
        noteStore.updateNote(note, function(err, note){
            res.redirect('/notes');
        });
    });
};*/