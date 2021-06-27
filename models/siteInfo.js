var mongoose = require('mongoose');


var db = mongoose.connection
var siteInfoSchema = new mongoose.Schema({visitors: Number, type: String}, { strict: false });


// db.once('open', function() {
//     console.log("Connection Successful!");
     
//     // define Schema
//     var siteInfoSchema = new mongoose.Schema({visitors: Number, type: String}, { strict: false });
//     // compile schema to model
//     var siteInfo = mongoose.model('siteInfo', siteInfoSchema, 'siteInfo');
  
//     // a document instance
//     var siteInfo1 = new siteInfo({ visitors: 0, type: 'visitor_count' });
  
//     // save model to database
//     siteInfo1.save(function (err, siteinfo) {
//       if (err) return console.error(err);
//     });
     
//   });
  
module.exports = mongoose.model('SiteInfo', siteInfoSchema);
