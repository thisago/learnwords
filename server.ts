import express from "express";
import session from "cookie-session";
import flash from "express-flash";
import exphbs from "express-handlebars";
import fs from "fs";
import { newAudio, cookie, addWordToList } from "./audio";
import bodyParser from "body-parser";

interface pathI {
    en: string,
    pt: string
}

interface wordI {
    id: number,
    type: string,
    pt?: string,
    en?: string,
    val?: string,
    path: pathI | string
}
const wordlistPath = `wordlist.json`;
if (!fs.existsSync(wordlistPath)) {
    fs.writeFileSync(wordlistPath, `[]`);
}
var words: wordI[] = JSON.parse(fs.readFileSync(wordlistPath, {
    encoding: `utf-8`,
})).map((x: any) => JSON.stringify(x));

const PORT = 8090;

const app = express();

app.set(`views`, `${__dirname}/views`);

app.engine(`handlebars`, exphbs({
    extname: `handlebars`
    , defaultLayout: `main`
    , partialsDir: `${__dirname}/views/partials/`
    , layoutsDir: `${__dirname}/views/layouts/`,

}));
app.set(`view engine`, `handlebars`);

app.use(session({
    name: `session`
    , secret: `d86sd87vds5vs67d5sdbf7gse432crCWR23665IN76rb`
    , maxAge: 24 * 60 * 60 * 1000,
}));

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.locals.flash = {
        err: req.flash(`err`)
        , suc: req.flash(`suc`)
        , inf: req.flash(`inf`),
    };
    res.locals.words = words;

    next();
});

app.get(`/`, (req, res) => {
    res.render(`pages/index`);
});

app.get(`/new`, (req, res) => {
    res.render(`pages/new`);
});

const generateWords = (body: any) => (id: number) => {
    var equals = false;
    if (body.pt === body.en && !body.val) {
        body.val = body.en;
        delete body.pt;
        delete body.en;
        equals = true;
    }

    if (equals === true || (body.type && (body.type === `letter` || body.type === `number`))) {
        const ptPath = newAudio(cookie)(`Brazilian Portuguese`)(body.val.toLowerCase()) || ``;
        const enPath = newAudio(cookie)(`US English`)(body.val.toLowerCase()) || ``;
        addWordToList(wordlistPath)(words.length + id)(`en-pt`)(body.type)(enPath, body.val.toLowerCase())(ptPath, body.val.toLowerCase());
        return { enPath, ptPath };
    }
    const ptPath = newAudio(cookie)(`Brazilian Portuguese`)(body.pt.toLowerCase()) || ``;
    const enPath = newAudio(cookie)(`US English`)(body.en.toLowerCase()) || ``;

    if (ptPath === `` && enPath !== ``) {
        addWordToList(wordlistPath)(id)(`en`)(body.type)(enPath, body.en.toLowerCase());
    } else if (enPath === `` && ptPath !== ``) {
        addWordToList(wordlistPath)(id)(`pt`)(body.type)(ptPath, body.pt.toLowerCase());
    } else if (enPath !== `` && ptPath !== ``) {
        addWordToList(wordlistPath)(id)(`en-pt`)(body.type)(enPath, body.en.toLowerCase())(ptPath, body.pt.toLowerCase());
    }
    return { enPath, ptPath };
};

app.post(`/new`, (req, res) => {
    const a = generateWords(req.body)(words.length);
    if (a.enPath !== `` || a.ptPath !== ``) {
        words = JSON.parse(fs.readFileSync(wordlistPath, {
            encoding: `utf-8`,
        })).map((x: any) => JSON.stringify(x));
    }

    res.redirect(`/new`);
});

app.get(`/generateWordlist`, (req, res) => {
    if (!req.query.wordlist) {
        res.json(`[{"text": "Err, please insert the wordlist get param}]`);
    }

    const wordlistwords: wordI[] = JSON.parse(fs.readFileSync(`${req.query.wordlist}`, {
        encoding: `utf-8`,
    }));

    var time = 2000;
    var id = 0;

    wordlistwords.forEach(word => {
        setTimeout(() => {
            generateWords(word)(words.length + id);
            id++;
        }, time);
        time += 2000;
    });
    words = JSON.parse(fs.readFileSync(wordlistPath, {
        encoding: `utf-8`,
    })).map((x: any) => JSON.stringify(x));
    res.json(`[{"text": "Processing..."}]`);
});

app.use(express.static(`${__dirname}/public`));
app.listen(PORT, () => console.log(`Server listen in http://localhost:${PORT}`));
