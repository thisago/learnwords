
const proxyUrl = `https://cors-anywhere.herokuapp.com/`;

const newAudio = (lang = `Vitoria`) => (value) => {
    console.log(value);

    const body = `msg=${encodeURIComponent(value)}&lang=${encodeURIComponent(lang)}&source=ttsmp3`;

    console.log(body);

    fetch(`${proxyUrl}https://ttsmp3.com/makemp3_new.php`, {
        method: `post`
        , headers: {
            Connection: `keep-alive`
            , "Content-Length": `${body.length}`
            , "User-Agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36`
            , "Content-type": `application/x-www-form-urlencoded`
            , Accept: `*/*`
            , Origin: `https://ttsmp3.com`
            , "Sec-Fetch-Site": `same-origin`
            , "Sec-Fetch-Mode": `cors`
            , "Sec-Fetch-Dest": `empty`
            , Referer: `https://ttsmp3.com/`
            , "Accept-Encoding": `gzip, deflate, br`
            , "Accept-Language": `en-US,en;q=0.9`
            , Cookie: `__gads=ID=562a6c0aa0c09c2f:T=1593115520:S=ALNI_MbDjUFkW4gq5k41KjroOPnqoj_sWA; _ga=GA1.2.496721152.1593115521; _gid=GA1.2.1365538900.1593115521; _fbp=fb.1.1593115521224.1750570304; __stripe_mid=26abf6e7-ef1f-41b8-97cf-b27996194d74; _gat_gtag_UA_28351091_23=1`,
        }
        , body: body,

    }).then(res => {
        console.log(res);

        return res.json();
    }).then(res => {
        console.log(res);
    });
};
