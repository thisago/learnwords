/* eslint-disable no-unused-vars */
import fetch from "node-fetch";
import fs from "fs";
import { promisify } from "util";
const writeFilePromise = promisify(fs.writeFile);

const langs: {[key: string]: string | string[]} = {
    Arabic: `Zeina`
    , "Australian English": [`Russell`, `Nicole`]
    , "Brazilian Portuguese": [`Vitoria`, `Ricardo`, `Camila`]
    , "British English": [`Amy`, `Brian`, `Emma`]
    , "Canadian French": `Chantal`
    , "Castilian Spanish": [`Enrique`, `Lucia`, `Conchita`]
    , "Chinese Mandarin": `Zhiyu`
    , "Indian English": [`Raveena`, `Aditi`]
    , "Mexican Spanish": `Mia`
    , "US English": [`Joey`, `Kimberly`, `Salli`, `Justin`, `Ivy`, `Joanna`, `Matthew`, `Kendra`]
    , "US Spanish": [`Penelope`, `Lupe`, `Miguel`]
    , "Welsh English": `Geraint`
    , Danish: [`Mads`, `Naja`]
    , Dutch: [`Ruben`, `Lotte`]
    , French: [`Celine`, `Lea`, `Mathieu`]
    , German: [`Hans`, `Vicki`, `Marlene`]
    , Icelandic: [`Dora`, `Karl`]
    , Italian: [`Carla`, `Giorgio`, `Bianca`]
    , Japanese: [`Takumi`, `Mizuki`]
    , Korean: `Seoyeon`
    , Norwegian: `Liv`
    , Polish: [`Ewa`, `Maja`, `Jacek`, `Jan`]
    , Portuguese: [`Ines`, `Cristiano`]
    , Romanian: `Carmen`
    , Russian: [`Maxim`, `Tatyana`]
    , Swedish: `Astrid`
    , Turkish: `Filiz`
    , Welsh: `Gwyneth`,
};

// const proxyUrl = `https://cors-anywhere.herokuapp.com/`;

const downloadFile = (outputPath: string) => (url: string) => (name: string) => {
    try {
        return fetch(url, {
            headers: {
                "User-Agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36`
                , Origin: `https://ttsmp3.com`
                , Referer: `https://ttsmp3.com/`,
            },
        })
            .then(x => x.arrayBuffer())
            .then(x => writeFilePromise(outputPath + name, Buffer.from(x)));
    } catch {
        console.error(`Cannot download ${url}`);
    }
};

const mp3Path = `${__dirname}/public/audio/`;

const downloadMp3 = downloadFile(mp3Path);

// const cookie = `__gads=ID=562a6c0aa0c09c2f:T=1593115520:S=ALNI_MbDjUFkW4gq5k41KjroOPnqoj_sWA; _ga=GA1.2.496721152.1593115521; _gid=GA1.2.1365538900.1593115521; _fbp=fb.1.1593115521224.1750570304`;

const cookie = `__gads=ID=562a6c0aa0c09c2f:T=1593115520:S=ALNI_MbDjUFkW4gq5k41KjroOPnqoj_sWA; _ga=GA1.2.496721152.1593115521; _gid=GA1.2.1365538900.1593115521; _fbp=fb.1.1593115521224.1750570304; __stripe_mid=26abf6e7-ef1f-41b8-97cf-b27996194d74; _gat_gtag_UA_28351091_23=1`;

const randomString = (size: number) => {
    const letters = [
        `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`];

    var str = ``;

    for (let index = 0; index < size; index++) {
        str += letters[Math.floor(Math.random() * letters.length)];
    }
    return str;
};

const newAudio = (cookie: string) => (lang: string) => (value: string) => {
    const getLang = (lang: string): string => {
        const lang2 = <string[]>lang.split(`:`);

        const ret = <string | string[]>langs[lang2[0]];
        if (typeof ret === `string`) {
            return ret;
        }
        return langs[lang2[0]][Math.floor(Math.random() * (langs[lang2[0]].length - 1))];
    };
    const language = getLang(lang);

    const body = `msg=${encodeURIComponent(value)}&lang=${encodeURIComponent(language)}&source=ttsmp3`;

    const filename = `${value.replace(/ /g, `_`)}-${language}-${randomString(10)}.mp3`;

    if (fs.existsSync(mp3Path + filename) || value === ``) {
        return null;
    }

    try {
        fetch(`https://ttsmp3.com/makemp3_new.php`, {
            method: `post`
            , headers: {
                "User-Agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36`
                , "Content-type": `application/x-www-form-urlencoded`
                , Accept: `*/*`
                , Origin: `https://ttsmp3.com`
                , "Sec-Fetch-Site": `same-origin`
                , "Sec-Fetch-Mode": `cors`
                , "Sec-Fetch-Dest": `empty`
                , Referer: `https://ttsmp3.com/`
                , "Accept-Encoding": `gzip, deflate, br`
                , "Accept-Language": `en-US,en;q=0.9`
                , Cookie: cookie,
            }
            , body: body,

        }).then(res =>
            res.json()).then(res =>
            downloadMp3(res.URL)(filename),
        ).catch(e =>
            console.error(e));
    } catch {
        console.error(`Cannot generate audio.`);
    }

    return filename;
};

const addLineToWordlist = (file:string) => (newLine: wordI) => {
    var oldFileValue: wordI[] = JSON.parse(fs.readFileSync(file, {
        encoding: `utf-8`,
    }));

    oldFileValue.push(newLine);

    fs.writeFileSync(file, JSON.stringify(oldFileValue));
};

const addWordToList = (wordlist: string) => (id: number) => (mode: string) => (type:string) => (path1: string, value1: string) => {
    var newVal: wordI = {};
    newVal.path = {};
    newVal.type = type;
    newVal.id = id + 1;
    if (type === `number` || type === `letter`) {
        newVal.val = value1;
    }
    switch (mode) {
    case `en`:
        if (type !== `number` && type !== `letter`) { newVal.en = value1; }
        newVal.path.en = path1;
        break;

    case `pt`:
        if (type !== `number` && type !== `letter`) { newVal.pt = value1; }
        newVal.path.pt = path1;
        break;
    case `en-pt`:
        return (path2: string, value2:string) => {
            if (type !== `number` && type !== `letter` && value1 !== value2) {
                newVal.en = value1;
                newVal.pt = value2;
            } else if (value1 === value2) {
                newVal.val = value1;
            }

            newVal.path.en = path1;
            newVal.path.pt = path2;

            addLineToWordlist(wordlist)(newVal);
        };
    }

    addLineToWordlist(wordlist)(newVal);
};

module.exports = {
    langs
    , cookie
    , newAudio
    , addWordToList,
};
