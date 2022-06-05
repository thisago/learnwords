/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

interface Path {
    en: string,
    pt: string
}

interface Word {
    id: number,
    type: string,
    pt?: string,
    en?: string,
    val?: string,
    path: Path
}
const extraWords = [];
function getCookie (cname: string) {
    var name = cname + `=`;
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(`;`);
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ` `) {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return `[]`;
}
declare const words: Word[] 
const possibilities = words.map((w:Word, i: number) => {
    w.id = i + 1;
    return w;
});

var random = true;
var word: Word;

document.getElementsByTagName(`script`)[0].remove();

var hits: number[][] = JSON.parse(getCookie(`hits`));

const randomWord = (dict: Word[]) =>
    (rand: number) =>
        dict[Math.floor(rand * (dict.length))];

const playAudio = (path: string) => () =>
    new Promise((resolve, reject) => {
        const audio = new Audio(`/audio/${path}`);
        audio.onplay = resolve;
        audio.onerror = reject;
        audio.play();
    });

const setupButtons = (btns: any) => (word: Word) => {
    btns.listen.pt.onclick = playAudio((<Path>word.path).pt);
    btns.listen.en.onclick = playAudio((<Path>word.path).en);
};

const setupWord = (btns:any) => (select:HTMLSelectElement) => (element: HTMLElement) =>
    (word: Word) => {
        if (!word) {
            return;
        }

        if (element.querySelector(`div.wordContainer`) === null) {
            const elmt = document.createElement(`div`);
            const wordElmt = document.createElement(`div`);
            const elmtContent = document.createElement(`div`);

            elmtContent.classList.add(`content`);
            elmtContent.appendChild(document.createTextNode(word.type));
            elmt.classList.add(`wordContainer`);
            wordElmt.classList.add(`words`);
            wordElmt.classList.add(word.type);

            if (typeof word.pt !== `undefined`) {
                wordElmt.innerHTML = `<div>${word.pt}</div><div>${word.en}</div>`;
            } else {
                wordElmt.innerHTML = `<div>${word.val}</div>`;
            }

            elmt.appendChild(wordElmt);
            element.appendChild(elmt);
            elmt.appendChild(elmtContent);
            setupButtons(btns)(word);
            select.value = `${word.id}`;
            return;
        }
        const elmt = <HTMLDivElement>element.getElementsByClassName(`wordContainer`)[0];
        const wordElmt = <HTMLDivElement>elmt.getElementsByClassName(`words`)[0];
        const elmtContent = <HTMLDivElement>elmt.getElementsByClassName(`content`)[0];
        wordElmt.className = `words ${word.type}`;
        elmtContent.innerHTML = `${word.type}`;
        if (typeof word.pt !== `undefined`) {
            wordElmt.innerHTML = `<div>${word.pt}</div><div>${word.en}</div>`;
        } else {
            wordElmt.innerHTML = `<div>${word.val}</div>`;
        }
        setupButtons(btns)(word);
        select.value = `${word.id}`;
        setTimeout(() =>
            playAudio((<Path>word.path).en)().finally(() =>
                setTimeout(() =>
                    playAudio((<Path>word.path).pt)()
                , 1000),
            )
        , 500);
    };

const getWordId = (value: string) => {
    try {
        possibilities.forEach((x, i) => {
            if (value === x.pt ||
                value === x.en ||
                value === x.val) {
                throw i;
            }
        });
    } catch (result) {
        return <number>result;
    }

    return -1;
};

// const response = (word: string) => (correct: boolean) => {
//     if (correct) {
//         const id = getWordId(word);
//         if (id === -1) {
//             return;
//         }
//         hits[id - 1]++;
//     }
// };

const findWord = (wordId: string): Word => {
    try {
        possibilities.forEach(x => {
            if (x.id === parseInt(wordId)) {
                throw x;
            }
        });
    } catch (val) {
        return val;
    }
    return word;
};

const container = <HTMLDivElement>document.getElementById(`append`);

const select = <HTMLSelectElement>document.getElementById(`select`);

const isRandom = <HTMLInputElement>document.getElementById(`random`);

const refresh = <HTMLButtonElement>document.getElementById(`new`);

const hit = <HTMLButtonElement>document.getElementById(`hit`);

const loss = <HTMLButtonElement>document.getElementById(`loss`);

const newWordFunc = () => {
    if (random === true) {
        word = randomWord(possibilities)(Math.random());
    } else {
        if (possibilities.length === word.id) {
            word = findWord(`${1}`);
        } else {
            word = findWord(`${word.id + 1}`);
        }
    }
    setupWord(buttons)(select)(container)(word);
};

refresh.onclick = newWordFunc;

const hitChange = () => {
    document.cookie = `hits=${JSON.stringify(hits)}`;
    console.log(hits);
};

isRandom.addEventListener(`click`, (e) => {
    random = (<HTMLInputElement>e.target).checked === false;
});

hit.onclick = () => {
    if (hits[word.id]) {
        hits[word.id].push(1);
    } else {
        hits[word.id] = [1];
    }
    newWordFunc();
    hitChange();
};

loss.onclick = () => {
    if (hits[word.id]) {
        hits[word.id].push(0);
    } else {
        hits[word.id] = [0];
    }
    newWordFunc();
    hitChange();
};

const buttons = {
    listen: {
        en: document.getElementById(`listenen`)
        , pt: document.getElementById(`listenpt`),
    },
};

possibilities.forEach(x => {
    const val = x.pt || x.val || `null`;
    const option = <HTMLOptionElement>document.createElement(`option`);
    option.innerHTML = val.substr(0, 1).toUpperCase() + val.substr(1);
    option.value = `${x.id}`;
    select.appendChild(option);
});

select.addEventListener(`change`, (e) => {
    const target = <HTMLSelectElement>e.target;
    word = findWord(target.value);
    setupWord(buttons)(target)(container)(word);
});

const init = () => {
    word = randomWord(possibilities)(Math.random());
    setupWord(buttons)(select)(container)(word);
};

document.addEventListener(`DOMContentLoaded`, () => {
    init();
});
