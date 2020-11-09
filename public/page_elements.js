var tasks_to_try = [
    {
        route: '/tasks/delaydiscount',
        uniquestudyid: 'delaydiscount',
        time: '3-5 min'
    },
    {
        route: '/surveys/gritshort',
        uniquestudyid: 'gritshort',
        time: '3-5 min'
    },
    {
        route: '/tasks/stroop',
        uniquestudyid: 'stroop',
        time: '5-8 min'
    },
    {
        route: '/surveys/brs1',
        uniquestudyid: 'brs1',
        time: '3-5 min'
    },
    {
        route: '/surveys/brs2',
        uniquestudyid: 'brs2',
        time: '4-7 min'
    },
    {
        route: '/surveys/bigfiveaspect',
        uniquestudyid: 'bigfiveaspect',
        time: '7-10 min'
    },
];

var surveys = [    
    {
        uniquestudyid: 'bigfiveaspect',
        name: 'Big-five personality traits',
        description: 'Are you open, conscientious, extraverted, agreeable, or neurotic?',
        time: '7-10 min'
    },
    {
        uniquestudyid: 'gritshort',
        name: 'How gritty are you?',
        description: "Are you good at pursuing long-term goals?",
        time: '3-5 min'
    },
    {
        uniquestudyid: 'brs1',
        name: 'Are you receptive to profoundness?',
        description: "Do you find the mundane 'profound'?",
        time: '3-5 min'
    },
    {
        uniquestudyid: 'brs2',
        name: 'Do you like profoundness?',
        description: "Are you sensitive to the 'profound'?",
        time: '4-7 min'
    }
    
];

var tasks = [
    {
        uniquestudyid: 'delaydiscount',
        name: 'Money now or money later?',
        description: 'Do you prefer immediate or future, delayed rewards? Learn about how you delay instant gratification.',
        time: '4-7 min'
    },
    {
        uniquestudyid: 'stroop',
        name: 'Attention and cognitive control',
        description: 'How good are you at controlling your attention? Try this simple Stroop color-word naming task to find out.',
        time: '3-5 min'
    },
    {
        uniquestudyid: 'symbolcount',
        name: 'Brain power and working memory',
        description: 'How good is your working memory? Challenge yourself with this symbol counting task.',
        time: '3-5 min'
    },
    {
        uniquestudyid: 'updatemath',
        name: 'Working memory and mathematics abilities',
        description: 'Coming soon',
        time: '3-5 min'
    },
    {
        uniquestudyid: 'flanker',
        name: 'Distractibility and attention',
        description: 'How good are you at ignoring distractions? try this simple flanker task to find out.',
        time: '5-8 min'
    },
];

var studies = [
    {
        uniquestudyid: 'studyA',
        name: 'Cognitive effort',
        description: 'Coming soon',
        time: '3-5 min'
    },
    {
        uniquestudyid: 'effortdiscountkid',
        name: 'Effort & reward',
        description: 'Beta testing',
        time: '5-8 min'
    }
];

var faq = [
    {
        q: "Why Anthrope?",
        resp: "Because we're interested in you and us—<a href='https://www.urbandictionary.com/define.php?term=Anthrope' target='_blank'>humans</a>."
    },
    {
        q: "Who are we?",
        resp: "A team of behavioral and psychological researchers."
    },
    {
        q: "Can I pause a task/survey so I can resume later?",
        resp: "Unfortunately, no. But the estimated time required should help your planning."
    },
    {
        q: "Can I suggest tasks/surveys to be added?",
        resp: "Definitely! <a href='mailto:anthrope.me@gmail.com'>Email us</a>."
    },
    {
        q: "Can I create an account to keep track of my results?",
        resp: "No. We want to keep the data anonymous and de-identified as much as possible."
    },
    {
        q: "What frameworks and technologies power this cool site?",
        resp: 'MongoDB, Express, Node.js, Bootstrap, Heroku, jsPsych, vegalite etc.'
    }
];

module.exports = { surveys, tasks, studies, tasks_to_try, faq};