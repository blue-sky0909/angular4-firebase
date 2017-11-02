const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const ElasticClient = require('elasticsearch');
admin.initializeApp(functions.config().firebase);
const db = admin.database();
const directTransport = require('nodemailer-direct-transport');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
var sgTransport = require('nodemailer-sendgrid-transport');
//using sendgrid as transport, but can use any transport.
var send_grid = {
  auth: {
    api_key: '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'
  }
};

// -----------------------------------------------------------------------------------------|
//               MANAGE INDIVIDUAL TICKETS & TOTALS AS THEY ARE PUBLISHED AND UPDATED       |
// -----------------------------------------------------------------------------------------|

exports.individualTicket = functions.database.ref('/tickets/stage').onWrite(event => {
    var watchTickets = db.ref('tickets/stage');
    watchTickets.on('child_added', manageTickets);

    function manageTickets(snap){

        var ticket = snap.val();
        var ticketKey = snap.key;
        var currentRef = db.ref('/tickets/live/'+ticket.eventRef+'/'+ticketKey);
        var stageRef = db.ref('/tickets/stage/'+ticketKey);

        currentRef.once("value", function(snap){

            var currentTicket = snap.val();

            if(snap.exists()){

                //PASS THROUGH TICKETS USED
                ticket.ticketsUsed = currentTicket.ticketsUsed;
                var ticketsLeft = parseInt(ticket.ticketQuantity) - parseInt(ticket.ticketsUsed);

                if(ticketsLeft >= 0){
                    ticket.ticketsLeft = ticketsLeft;
                }
                else{
                    ticket.ticketsLeft = 0;
                }

                //SET NEW TICKET
                currentRef.set(ticket).then(function(){
                    // console.log("UPDATED TICKET Totals: "+ticketKey);
                    stageRef.remove();
                });

            }

            else{
                ticket.ticketsLeft = ticket.ticketQuantity;
                currentRef.set(ticket).then(function(){
                    // console.log("UPDATED TICKET Totals: "+ticketKey);
                    stageRef.remove();
                });
            }

        })

    }
});

// ---------------------------------------------------------------------|
//               MANAGE EVENT TICKET TOTALS (ADD ALL TICKETS TOGETHER)  |
// ---------------------------------------------------------------------|

exports.eventTickets = functions.database.ref('/tickets/live').onWrite(event => {
    var watchTickets = db.ref('tickets/live');
    watchTickets.on('child_added', manageEventTickets);
    watchTickets.on('child_changed', manageEventTickets);
    watchTickets.on('child_removed', manageEventTickets);

    function manageEventTickets(snap){
        var eventData = snap.val();
        var eventKey = snap.key;
        var totalQuantity = 0; // totalTickets
        var totalUsed = 0; // ticketsUsed
        var totalLeft = 0; // ticketsLeft

        Object.keys(eventData).forEach(function(key){
            totalQuantity += parseInt(eventData[key].ticketQuantity);
            totalUsed += parseInt(eventData[key].ticketsUsed);
            totalLeft += parseInt(eventData[key].ticketsLeft);
        });

        var eventRef = db.ref('/events/live/'+eventKey+'/data');

        eventRef.once("value", function(snap){
            if(snap.exists()){
                eventRef.update({
                    ticketsLeft: totalLeft,
                    ticketsUsed: totalUsed,
                    totalTickets: totalQuantity
                }).then(function(){
                    // console.log("UPDATED Total for Event: "+eventKey);
                });
            }
        });
    }
});

// ---------------------------------------------------------------------|
//         WATCH AND MANAGE TICKETS WHEN PURCHASED/REGISTERED           |
// ---------------------------------------------------------------------|

exports.purchaseTickets = functions.database.ref('/tickets/purchaseStaged').onWrite(event => {
    var watchTickets = db.ref('/tickets/purchaseStaged');
    watchTickets.on('child_added', manageRegistrations);

    function manageRegistrations(snap){
        var purchasedTicket = snap.val();
        var event = purchasedTicket.eventRef;
        var ticket = purchasedTicket.ticketRef;
        var stageKey = snap.key;

        // console.log('event', event);
        // console.log('ticket', ticket);

        var eventRef = db.ref('events/live/'+event);
        var ticketRef = db.ref('tickets/live/'+event+'/'+ticket);
        var stageTicketRef = db.ref('tickets/purchaseStaged/'+stageKey);
        var purchasedRef = db.ref('tickets/purchased/'+stageKey);
        var regType = db.ref('registrations/type/'+event+'/'+ticket);
        var soldOutRef = db.ref('/pending-notifications/tickets-sold-out');

        eventRef.once("value", function(snap){
            //GET THE CURRENT EVENT TOTALS
            var ticketsUsed = snap.val().data.ticketsUsed;
            var ticketsLeft = snap.val().data.ticketsLeft;

            var eventImage = snap.val().data.imagePath;
            var eventTitle = snap.val().data.title;
            var eventOwner = snap.val().uid;

            //UPDATE THE EVENT TOTALS FIRST
            eventRef.update({
                ticketsUsed: (ticketsUsed + 1),
                ticketsLeft: (ticketsLeft - 1)
            }).then(function(){

                // console.log("event totals updated");

                ticketRef.once("value", function(snap){
                    //GET THE CURRENT TICKET TOTALS
                    var ticketsUsed = snap.val().ticketsUsed;
                    var ticketsLeft = snap.val().ticketsLeft;

                    //UPDATE THE EVENT TOTALS FIRST
                    ticketRef.update({
                        ticketsUsed: (ticketsUsed + 1),
                        ticketsLeft: (ticketsLeft - 1)
                    }).then(function(){
                        // console.log("ticket totals updated");

                        if(ticketsLeft == 1){
                            soldOutRef.push({
                               eventImageUrl: eventImage,
                               eventTitle: eventTitle,
                               ticketRef: ticket,
                               eventId: event,
                               eventOwner: eventOwner
                            });
                        }

                        //COPY TO NEW NODE
                        purchasedRef.set(purchasedTicket).then(function(){

                            //SKIP ADDING CHILD TICKETS FOR MULTI-PURCHASE SINGLE DATA ENTRY
                            if(!purchasedTicket.isChild){
                                regType.push(purchasedTicket).then(function(){
                                    //DELETE THE STAGED TICKET
                                    stageTicketRef.remove().then(function(){
                                        // console.log("staged ticket removed");
                                    });
                                });
                            }
                        })
                    });
                })
            });
        });
    }
});

// ---------------------------------------------------------------------|
//                         INDEX EVENTS                                 |
// ---------------------------------------------------------------------|

exports.eventIndexing = functions.database.ref("/events/live").onWrite(event => {
    var config = admin.database().ref('/admin');
    config.once("value", function(snap){

        // initialize ElasticSearch API
        var client = new ElasticClient.Client({ host: snap.val().elasticURL});
        var indexEvents = db.ref('events/live');
        indexEvents.on('child_added',   createOrUpdateIndex);
        indexEvents.on('child_changed', createOrUpdateIndex);
        indexEvents.on('child_removed', removeIndex);

        function createOrUpdateIndex(snap) {

            try{

                console.log(snap.key);

                client.index({
                    index: "live-events",
                    type: 'event',
                    id: snap.key,
                    body: {
                        "title": snap.val().data.title,
                        "description": snap.val().data.descriptionText,
                        "keywords": snap.val().data.keywords,
                        "creator": "",//TODO add this in when it gets added in
                        "startDate": snap.val().data.startDate,
                        "endDate": snap.val().data.endDate,
                        "category":snap.val().data.category,
                        "location": {
                            "lat": snap.val().data.gps.lat,
                            "lon": snap.val().data.gps.lng
                        }
                    }
                }, function(error, response){
                    console.log("index add error", error, snap.key);
                    console.log("index add success", response, snap.key);
                });
            }
            catch(err){
                var errRef = db.ref('errors/indexing/add');

                var errorReport = {
                    error: err,
                    data: snap
                };

                errRef.push(JSON.stringify(errorReport));
                 console.log("Error in catch", err);
            }

        }

        function removeIndex(snap) {
            try{
                client.delete({
                    index: "live-events",
                    type: "event",
                    id: snap.key
                }, function(error, response){

                    if(error){
                        var errorReport = {
                            error: error,
                            data: snap
                        };

                        var errRef = db.ref('errors/indexing/remove');
                        //errRef.push(errorReport);
                         console.log(error);
                    }

                     console.log("remove error", error);
                     console.log("remove success", response)
                });
            }
            catch(err){

                var errorReport = {
                    error: err,
                    data: snap
                };

                var errRef = db.ref('errors/indexing/remove');
                errRef.push(JSON.stringify(errorReport));
                 console.log(err);
            }

        }
    });
});


exports.generateThumbnail = functions.storage.object().onChange(function(event){
    const object = event.data;
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const fileBucket = object.bucket;
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = `/tmp/${fileName}`;
    console.log(object);

    if (fileName.startsWith('thumb_')){
      console.log("Already a thumbnail");
      return;
    }

    if (!object.contentType.startsWith('image/')){
      console.log("Not an image");
      return;
    }

    if (object.resourceState === 'not_exists'){
      console.log('this is a deletion event.');
      return;
    }

    return bucket.file(filePath).download({
      destination: tempFilePath
    })
      .then(() => {
        console.log("SPAWNED");
        return spawn('convert', [tempFilePath, '-thumbnail', '500x500>', tempFilePath])
      })
      .then(()=>{
        const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/, '$1thumb_$2');
        console.log("PATHED");
        console.log(thumbFilePath);

        return bucket.upload(tempFilePath, {
          destination: thumbFilePath
        })

      })

});

// ---------------------------------------------------------------------|
//                         REMOVING OLD EVENTS                          |
// ---------------------------------------------------------------------|

exports.removeEvents = functions.https.onRequest((req, res) => {
    const id = req.query.id;

    var appKey = db.ref('/admin/appKey');

    appKey.once("value", function(snap){
        if(id === snap.val()){
            var events = db.ref('/events/live');
            events.once("value", function(snap){
                snap.forEach(childSnap => {
                    let item = childSnap.val();
                    item.key = childSnap.key;

                    var endDate;
                    var currentDate = new Date();

                    if(childSnap.val().endDate){
                        endDate = new Date(childSnap.val().endDate);
                        // endDate = new Date('2017-10-12T12:00:00');

                        if(endDate < currentDate){
                            var uid = childSnap.val().uid;

                            // update the event history

                            db.ref('/events/history').child(childSnap.key).set(childSnap.val().data);
                            db.ref('/events/history/' + childSnap.key).update({status: "history"});

                            // Update the draft status

                            db.ref('/drafts/draft/' + uid + '/' + childSnap.key).update({status:'history'});
                            console.log('the draft is updated');

                            // Update the promoters status

                            db.ref('/promoters/users').once("value", function(snap){
                                snap.forEach(eachUser => {
                                    eachUser.forEach(singleEvent => {
                                      if(singleEvent.key === childSnap.key){
                                        db.ref('/promoters/users/' + eachUser.key + '/' + singleEvent.key).update({status: 'history'});
                                      }
                                    });
                                });
                            });

                            // Update the registration status

                            db.ref('/registrations/users').once("value", function(snap){
                                snap.forEach(eachUser => {
                                    eachUser.forEach(singleEvent => {
                                        if(singleEvent.key === childSnap.key){
                                            db.ref('/registrations/users/' + eachUser.key + '/' + singleEvent.key ).update({status: 'history'});
                                        }
                                    });
                                })
                            })

                            // Remove event from live
                            db.ref('/events/live/' + childSnap.key).remove();
                        } else{
                            console.log('no expire event found');
                        }
                    }

                });
            });
        } else{
            console.log('key does not match');
        }
    });
    res.send('function complete');
});

//NOTIFICATIONS
exports.testNotifications = functions.database.ref("/queries/testMessage").onWrite(message => {

  var message = db.ref('/queries/testMessage');

  message.once("value", snap => {

    console.log("Oh snap", snap.val());

    let message = {
      eventTitle: 'The actual event title',
      eventURL: 'https://….com/event/-EksE394820J293&ocode=test1234',
      eventImageURL: 'https://staging…imageEvent.jpg',
      eventDate: 'Jan 30th 2017',
	    eventTime: '12:00PM to 2:00PM (MDT)',
	    eventAddress: '3940 Highland Drive, Highland UT',
      customMessage: 'Custom message from the organizer',
	    eventOrganizerName: 'Brandon Smith',
	    eventOrganizerURL: 'https://…com/organizersocode',
      recipientEmail: 'shaneloveland@gmail.com'
    };

    let options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: 'email-templates/',
        defaultLayout : 'template',
        partialsDir : 'email-templates/partials/'
      },
      viewPath: 'email-templates/',
      extName: '.hbs'
    };

    var mailer = nodemailer.createTransport(sgTransport(send_grid));
    mailer.use('compile', hbs(options));
    mailer.sendMail({
      from: '123argo123@gmail.com',
      to: message.recipientEmail,
      subject: 'Any Subject',
      template: 'email.body',
      context: message
    }, function (error, response) {

      console.log("error In Send", error);
      console.log("Response in Send", response);

      console.log('mail sent to ' + message.recipientEmail);
      mailer.close();
    });


  });

});


