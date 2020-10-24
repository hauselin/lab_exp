const express = require("express");
const router = express.Router();
const DataLibrary = require("../models/datalibrary");
const page_elements = require("../public/page_elements");
const d3 = require("d3-array");

router.get('/', function (req, res) {
    if (false) {
        // EXAMPLES database querying
        console.log('\n\n\nBEGIN QUERIES')

        // .findOne() takes 4 arguments: filter, select, options, callback
        // this example uses promises instead of callback function: https://mongoosejs.com/docs/promises.html
        // no filtering; select subject field, drop _id field; sort by time (-1 is descending order)
        DataLibrary.findOne({}, { subject: 1, _id: 0 }, { sort: { time: -1 } })
            .then(doc => {
                console.log('EXAMPLE 1:');
                console.log(doc);
            })
            .catch(err => { console.log(err) });

        // select one more field utc_datatime
        DataLibrary.findOne({}, { subject: 1, uniquestudyid: 1, utc_datetime: 1, _id: 0 }, { sort: { time: -1 } })
            .then(doc => {
                console.log('EXAMPLE 2:');
                console.log(doc);
            })
            .catch(err => console.log(err));

        DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { utc_datetime: 1, _id: 0 }, { sort: { time: 1 } })
            .then(doc => {
                console.log('EXAMPLE 3:');
                console.log(doc);
            })
            .catch(err => console.log(err));

        DataLibrary.find({ uniquestudyid: 'gritshort' }, { data: 1, _id: 0, info_: 1 }, { sort: { time: -1 }, limit: 2, lean: true })
            .then(doc => {
                console.log('EXAMPLE 4:');

                var data_flat = doc.map(i => i.data).flat(1) // flatten doc.data
                // console.log(data_flat);

                var subject_info = doc.map(function (d, i) { // retrieve relevant data from inside doc.info_
                    return {
                        subject: d.info_.subject,
                        index: i + 1, // just for demo (we can remove this line)
                        country: d.info_.country_name,
                        rt_trial1: d.data[0].rt, // get trial 1 reaction time for each subject
                        time_elapsed_trial1: d.data[3].time_elapsed // get trial 4 time_elapsed for each subject
                    }
                });
                console.log(subject_info)

                // console.log(doc[0].utc_datetime); // undefined because it's a cursor/reference (see lean example below)
            })
            .catch(err => console.log(err));

        // lean option converts cursor/reference to javascript object
        // https://mongoosejs.com/docs/tutorials/lean.html
        DataLibrary.find({}, { subject: 1, _id: 0, utc_datetime: 1 }, { sort: { time: -1 }, lean: true, limit: 3 })
            .then(doc => {
                console.log('EXAMPLE 5:')
                console.log(doc);
                console.log(doc[0].subject) // will be defined only if lean: true
            })
            .catch(err => console.log(err));

        // https://mongoosejs.com/docs/tutorials/lean.html#when-to-use-lean
        DataLibrary.findOne({ uniquestudyid: 'delaydiscount', 'utc_date.month': 7 }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }, { sort: { time: -1 } }).lean()
            .then(doc => {
                console.log("EXAMPLE 6: ")
                console.log(doc)
                console.log(typeof doc)
            })
            .catch(err => { console.log(err) });

        // multiple queries
        Promise.all([
            DataLibrary.findOne({ uniquestudyid: 'delaydiscount' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean(),
            DataLibrary.findOne({ uniquestudyid: 'gritshort' }, { subject: 1, utc_datetime: 1, uniquestudyid: 1 }).lean()
        ])
            .then(([doc1, doc2]) => {
                console.log("EXAMPLE 7: ")
                console.log(doc1);
                console.log(doc2.subject);
            })
            .catch(err => { console.log(err) });

        console.log('END OF QUERIES (note the asynchronous output!)\n\n')
    }

    res.render("index.ejs", {
        task_to_try: d3.shuffle(page_elements.tasks_to_try)[0],
        surveys: d3.shuffle(page_elements.surveys),
        tasks: d3.shuffle(page_elements.tasks),
        studies: d3.shuffle(page_elements.studies),
        faq: page_elements.faq
    });
});

router.get('/tasks', function (req, res) {
    Promise.all([
        DataLibrary.find({ uniquestudyid: 'delaydiscount' }),
        DataLibrary.find({ uniquestudyid: 'stroop' }),
        DataLibrary.find({ uniquestudyid: 'symbolcount' }),
        DataLibrary.find({ uniquestudyid: 'updatemath' })
    ]).then(([delaydiscount, stroop, symbolcount, updatemath]) => {
        res.render("tasks.ejs",
            {
                entries:
                {
                    delaydiscount: delaydiscount.length,
                    stroop: stroop.length,
                    symbolcount: symbolcount.length,
                    updatemath: updatemath.length
                },
                tasks: page_elements.tasks
            });
    })
});

router.get('/surveys', function (req, res) {
    Promise.all([
        DataLibrary.find({ uniquestudyid: 'bigfiveaspect' }),
        DataLibrary.find({ uniquestudyid: 'gritshort' }),
    ]).then(([bigfiveaspect, gritshort]) => {
        res.render("surveys.ejs",
            {
                entries: {
                    gritshort: gritshort.length,
                    bigfiveaspect: bigfiveaspect.length
                },
                surveys: page_elements.surveys
            });
    })
});

router.get('/studies', function (req, res) {
    res.render("studies.ejs", { studies: page_elements.studies });
});

router.get('/terms', function (req, res) {
    res.render("terms.ejs");
});

router.get('/privacy', function (req, res) {
    res.render("privacy.ejs");
});

router.get('/comingsoon', function (req, res) {
    res.render("comingSoon.ejs");
});


module.exports = router;