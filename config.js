var OneSignal = require('onesignal-node');
// first we need to create a client      
   var myClient = new OneSignal.Client({
    userAuthKey: 'NzZkNGM1YTUtYjliZi00YzE4LThiMjQtYjBkMzc2OGVhZGU5',
    app: { appAuthKey: 'ZTkwNWE3YzUtNWQ5NS00MGExLTg2NTktNzI2NmEzNTIxNGZi', appId: '97d1c30b-7d65-4789-8fdd-108be348748a' }
});

module.exports = myClient;