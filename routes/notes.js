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
var show_description = "";
var evernote_description = "";

exports.main = function(req, res) {
        res.render('main', {
            layout: 'layouts/layout',
            title: 'PageMonitorEvernote: Main'
        });

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
	process.stdout.write(getDateTimeComment() + "setInterval 5 mins alive...\n");

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
	process.stdout.write('Get page_load_complete()\n');
	var notes = [];

	if(last_description != description){
		process.stdout.write('last_description != description\n');
		last_description = description;
		show_description = show_description.concat(getDateTimeComment().concat(description.concat("\n")));
		
		evernote_description = evernote_description.concat(getDateTimeComment().concat(description.concat("<br />")));
		CreateEverNote(evernote_description, req, res);

		notes.push({
                	content: show_description,
  		});

		res.render('show', {
            		layout: 'layouts/layout',
            		title: 'PageMonitorEvernote: Comment',
            		note: notes
        	});
	}	
});

function CreateEverNote(evernote_description, req, res){
	if(req.session.oauthAccessToken)
		process.stdout.write('Login@EverNote\n');
	else{
		process.stdout.write('Not Login@EverNote\n');
		return;
	}

    	var client = new Evernote.Client({
        	token: req.session.oauthAccessToken,
        	sandbox: config.SANDBOX
    	});
    	var noteStore = client.getNoteStore();

	var hit = 'nhit';
	var filter = new Evernote.NoteFilter();
	filter.notebookGuid = req.session.slideNotebook.guid;
	filter.words = "intitle:Joe's comment";
	var offset = 0;
	var spec = new Evernote.NotesMetadataResultSpec();
    	spec.includeTitle = true;

	noteStore.findNotesMetadata(filter, offset, 1, spec, function(err, response){
		var notesList = response.notes;

		for(var i in notesList){
			hit = 'hit';
			process.stdout.write('Joe\'s comment already exists...\n');
			process.stdout.write(notesList[i].title);
			process.stdout.write('\n');	
			process.stdout.write(notesList[i].guid);
			process.stdout.write('\n');
			EditNote(noteStore, evernote_description, notesList[i].guid);
		}
	});

	if(hit !== 'hit'){
		process.stdout.write('Joe\'s comment not exists. Create New...\n');
		CreateNewNote(noteStore, evernote_description, req, res);
	}
	

	/*var enmlContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">',
        '<en-note>',
        evernote_description,
        '</en-note>'
    	].join('\n');

	var note = new Evernote.Note();

    	note.title = getDateTimeTitle() + " Joe's comment";
    	note.content = enmlContent;
    	note.notebookGuid = req.session.slideNotebook.guid;

    	noteStore.createNote(note, function(err, note){
		if(err)
			process.stdout.write('Error@newEverNote\n');	
	});*/

    	/*var filter = new Evernote.NoteFilter();
    	filter.notebookGuid = req.session.slideNotebook.guid;
	filter.words = keyword;
    	var offset = 0;

    	noteStore.findNotesMetadata(filter, offset, 1, spec, function(err, response){
        	var note = response.notes;

		for(var i in note){
    			note[i].title = getDateTimeTitle() + " Joe's comment";
    			note[i].content = enmlContent;
    			note[i].notebookGuid = req.session.slideNotebook.guid;

    			noteStore.createNote(note[i], function(err, note){
			if(err)
				process.stdout.write('Error@newEverNote\n');
			});
		}	
	});*/
}

function EditNote(noteStore, content, guid){
	var enmlContent = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">',
 	'<en-note>',
	content,
	'</en-note>'
	].join('\n');

	noteStore.getNote(guid, true, false, false, false, function(err, note){
		process.stdout.write('noteStore.getNote()\n');
		//process.stdout.write(note.content);
		note.content = enmlContent;
		noteStore.updateNote(note, function(err, note){
			if(err)
				process.stdout.write('Error@updateNote\n');	
		});	
	});
}

function CreateNewNote(noteStore, content, req, res){

	var enmlContent = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">',
 	'<en-note>',
	content,
	'</en-note>'
	].join('\n');

	var note = new Evernote.Note();

	note.title = getDateTimeTitle() + " Joe's comment";
	note.content = enmlContent;
	note.notebookGuid = req.session.slideNotebook.guid;

	noteStore.createNote(note, function(err, note){
		if(err)
			process.stdout.write('Error@CreateNewNote\n');	
	});
}

function getDateTimeTitle() {
    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return "[" + year + month + day + "] ";
}

function getDateTimeComment() {

    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return "[" + year + "-" + month + "-" + day + " " + hour + ":" +  min + ":" + sec + "] ";

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
