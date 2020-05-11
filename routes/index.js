const express = require('express');
const mongoose = require('mongoose');
const htmlToText = require('html-to-text');

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const crypto = require('crypto');

const Word = require('../models/wordModel');
const User = require('../models/userModel');

const router = express.Router();


// Подключение к базе данных
const dbURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

try {
  mongoose.connect(dbURL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    dbName: dbName
  });
  console.log("MongoDB is connected...");
} catch (error) {
  console.log(error);
}


// HTTP авторизация через Passport.js
passport.use(new BasicStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

const secret = process.env.SECRET;

function verifyPassword(password){
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}


// Форма для ввода текста
router.get('/', async function(req, res) {
  try {
    res.render('index');
  } catch (err) {
    res.status(500).send(err);
  }
});


router.post('/', async function(req, res) {
  let words = await Word.find({ }).sort({ word: 1 });
  // Текст из формы
  let text = await req.body.text;
  // Убираем теги
  text = htmlToText.fromString(text);
  // Массив слов из текста
  let array = text.replace(/\r?\n/g, " ").split(' ');

  array.forEach((item, index) => {
    for(let i = 0; i < words.length; i++){
      // Регулярка
      let re = new RegExp(`^${words[i].word}`,"gi");
      if(item.match(re)){
        array[index] = `<span class="warning hint--top" aria-label="${words[i].description}">${item}</span>`;
      }
    }
  })
  res.status(200);
  res.send(array);
});


// Получаем список всех слов из базы
router.get('/list', passport.authenticate('basic', { session: false }), async function(req, res) {
  try {
    let words = await Word.find({ }).sort({ word: 1 });
    res.render('list', { words: words });
  } catch (err) {
    res.status(500).send(err);
  }
});


// Форма изменения записи
router.get('/list/:id', passport.authenticate('basic', { session: false }), async function(req, res) {
  try {
    let word = await Word.findById(req.params.id);
    res.render('edit', { word: word});
  } catch (err) {
    res.status(500).send(err);
  }
});


// Сохранение измененной записи в базе
router.post('/list/:id', async function(req, res) {
  try {
    await Word.updateOne({_id: req.params.id}, { word: req.body.word, description: req.body.description });
    res.redirect('/list');
  } catch (err) {
    res.status(500).send(err);
  }
});


// Форма добавления новой записи в базу
router.get('/new', passport.authenticate('basic', { session: false }), async function(req, res) {
  try {
    res.render('new');
  } catch (err) {
    res.status(500).send(err);
  }
});


// Добавление новой записи в базу
router.post('/new', async function(req, res) {
  try {
    await Word.create({ word: req.body.word, description: req.body.description });
    res.redirect('/list');
  } catch (err) {
    res.status(500).send(err);
  }
});


// Удаление записи из базы
router.get('/delete/:id', passport.authenticate('basic', { session: false }), async function(req, res) {
  try {
    await Word.deleteOne({ _id: req.params.id });
    res.redirect('/list');
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;