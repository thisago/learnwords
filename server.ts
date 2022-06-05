import express from "express"
// import flash from "express-flash"
const { engine } = require("express-handlebars")
import fs from "fs"
import { newAudio, cookie, addWordToList } from "./audio"
import bodyParser from "body-parser"

interface pathI {
  en: string
  pt: string
}

interface wordI {
  id: number
  type: string
  pt?: string
  en?: string
  val?: string
  path: pathI | string
}
const wordlistPath = `wordlist.json`
if (!fs.existsSync(wordlistPath)) {
  fs.writeFileSync(wordlistPath, `[]`)
}
var words: wordI[] = JSON.parse(
  fs.readFileSync(wordlistPath, {
    encoding: `utf-8`,
  })
).map((x: any) => JSON.stringify(x))

const PORT = 8090

const app = express()

app.set(`views`, `${__dirname}/views`)


// var hbs = engine.create({
//   // Specify helpers which are only registered on this instance.
//   extname: `handlebars`,
//   defaultLayout: `main`,
//   layoutsDir: `${__dirname}/views/layouts/`,
// });

// app.engine('handlebars', hbs.engine);
// app.set('view engine', 'handlebars');
app.engine(
  `handlebars`,
  engine({
    extname: `handlebars`,
    defaultLayout: `main`,
    layoutsDir: `${__dirname}/views/layouts/`,
  })
)
app.set(`view engine`, `handlebars`)


app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.locals.words = words
  
  next()
})

app.get(`/`, (req, res) => {
  res.locals.title = "Home - Learn Words"
  res.render(`pages/index`)
})

app.get(`/new`, (req, res) => {
  res.locals.title = "New - Learn Words"
  res.render(`pages/new`)
})

const generateWords = (body: any) => (id: number) => {
  var equals = false
  if (body.pt === body.en && !body.val) {
    body.val = body.en
    delete body.pt
    delete body.en
    equals = true
  }
  const addWordToWordlist = addWordToList(wordlistPath)
  if (
    equals === true ||
    (body.type && (body.type === `letter` || body.type === `number`))
    ) {
      const ptPath =
      newAudio(cookie)(`Brazilian Portuguese`)(body.val.toLowerCase()) || ``
    const enPath = newAudio(cookie)(`US English`)(body.val.toLowerCase()) || ``
    const setPtInfo = addWordToWordlist(words.length + id)(`en-pt`)(body.type)(
      enPath,
      body.val.toLowerCase()
    )
    if (setPtInfo) setPtInfo(ptPath, body.val.toLowerCase())
    return { enPath, ptPath }
  }
  const ptPath =
    newAudio(cookie)(`Brazilian Portuguese`)(body.pt.toLowerCase()) || ``
  const enPath = newAudio(cookie)(`US English`)(body.en.toLowerCase()) || ``

  const addWordToWordlistWithId = addWordToWordlist(id)
  if (ptPath.length = 0 && enPath.length > 0) {
    addWordToWordlistWithId(`en`)(body.type)(enPath, body.en.toLowerCase())
  } else if (enPath === `` && ptPath.length > 0) {
    addWordToWordlistWithId(`pt`)(body.type)(ptPath, body.pt.toLowerCase())
  } else if (enPath.length > 0 && ptPath.length > 0) {
    const setPtInfo = addWordToWordlistWithId(`en-pt`)(body.type)(
      enPath,
      body.en.toLowerCase()
    )
    if (setPtInfo) setPtInfo(ptPath, body.pt.toLowerCase())
  }
  return { enPath, ptPath }
}

app.post(`/new`, (req, res) => {
  const a = generateWords(req.body)(words.length)
  if (a.enPath.length > 0 || a.ptPath.length > 0) {
    words = JSON.parse(
      fs.readFileSync(wordlistPath, {
        encoding: `utf-8`,
      })
    ).map((x: any) => JSON.stringify(x))
  }

  res.redirect(`/new`)
})

app.get(`/generateWordlist`, (req, res) => {
  if (!req.query.wordlist) {
    res.json(`[{"text": "Err, please insert the wordlist get param}]`)
  }

  const wordlistWords: wordI[] = JSON.parse(
    fs.readFileSync(`${req.query.wordlist}`, {
      encoding: `utf-8`,
    })
  )

  var time = 2000
  var id = 0

  wordlistWords.forEach((word) => {
    setTimeout(() => {
      generateWords(word)(words.length + id)
      id++
    }, time)
    time += 2000
  })
  words = JSON.parse(
    fs.readFileSync(wordlistPath, {
      encoding: `utf-8`,
    })
  ).map((x: any) => JSON.stringify(x))
  res.json(`[{"text": "Processing..."}]`)
})

app.use(express.static(`${__dirname}/public`))
app.listen(PORT, () => console.log(`Server listen in http://localhost:${PORT}`))
