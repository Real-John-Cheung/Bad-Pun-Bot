let RiTwit = require('ritwit');
let RiTa = require('rita');
let natural = require('natural');
let config = require('./Bots_botsConfig.js');
let express = require('express');

let app = express();
app.set('Port',5000);
let rt = new RiTwit(config);
let tokenizer = new natural.WordPunctTokenizer();
let metaphone = natural.Metaphone;
let nounInflector = new natural.NounInflector();
let verbInflector = new natural.PresentVerbInflector();
console.log('initialized');
let busy = false;
let donaldTrump = {
  id: '25073877'
};
let badPunBot = {
  id: '1243074773984227329'
};
let borisJohnson = {
  id: '3131144855'
};
let barackObama = {
  id: '813286'
}
let modi = {
  id: '18839785'
}
let papaFrancisco = {
  id: '500704345'
}
let hillaryClinton = {
  id: '1339835893'
}
let mikePence = {
  id: '22203756'
}
let joeBiden = {
  id: '939091'
}
let tsaiIngWen = {
  id: '155814794'
}
let zhaoLiJian = {
  id: '141627220'
}
let justinTrudeau = {
  id: '14260960'
}
let ruthDavidson = {
  id: '211994193'
}
let toFollow = [donaldTrump.id, borisJohnson.id, barackObama.id, modi.id, papaFrancisco.id, hillaryClinton.id, mikePence.id, joeBiden.id, tsaiIngWen.id, zhaoLiJian.id, justinTrudeau.id, ruthDavidson.id];

rt.onTweetMatching({
  follow: toFollow
}, function(tweet) {
  if (busy) {
    console.log('a tweet is being tweeted')
    return;
  }
  if (tweet.lang == 'en' && toFollow.indexOf(tweet.user.id_str) >= 0) {
    busy = true;
    console.log('orinal tweet:')
    console.log(tweet.text);
    //get the text of the tweet
    let user = tweet.user.name;
    //get user name
    let text = cleanOriginalText(tweet.text);
    let arrayOfText = tokenizer.tokenize(text);
    //tokenize text
    let arrayOfPos = RiTa.getPosTags(arrayOfText);
    //get the position-of-speech of all world
    let posTagsNouns = ['nn', 'nns', 'nnp', 'nnps'];
    let posTagsVerbs = ['vb', 'vbd', 'vbg', 'vbn', 'vbp', 'vbz'];
    let arrayOfNounsAndVerbsIndex = [];
    for (let i = 0; i < arrayOfPos.length; i++) {
      if (posTagsNouns.indexOf(arrayOfPos[i]) >= 0 || posTagsVerbs.indexOf(arrayOfPos[i]) >= 0) {
        arrayOfNounsAndVerbsIndex.push(i);
      }
    }
    //get an array of words that are nouns or verbs
    let changedIndex = [];
    let numToChange = creatNumberToChange(arrayOfText);
    //decide how many words to change
    let tryNewWordTimes = 0;
    let successWords = 0;
    for (let i = 0; i < numToChange; i++) {
      let indexToChange = arrayOfNounsAndVerbsIndex[Math.floor(Math.random() * Math.floor(arrayOfNounsAndVerbsIndex.length))];
      while (changedIndex.indexOf(indexToChange) >= 0) {
        indexToChange = arrayOfNounsAndVerbsIndex[Math.floor(Math.random() * Math.floor(arrayOfNounsAndVerbsIndex.length))];
      }
      let wordToChange = arrayOfText[indexToChange];
      //randomly pick a noun or a verb to change
      console.log('word to change:')
      console.log(wordToChange);
      let pos = RiTa.getPosTags(wordToChange);
      let generalPos = getGeneralPos(pos);

      //get the position-of-speech of the chosen word
      let newWord = RiTa.randomWord(generalPos);
      let counter = 0;
      let shouldStore = true;
      let triedWorldIndex = [];
      while (!metaphone.compare(wordToChange, newWord) || wordToChange.toUpperCase() == newWord.toUpperCase()) {
        //the condition in while() is to check whether the new word pronounces similarly to the original world or not
        //also to check if they are the same
        shouldStore = true;
        if (counter > 20) {
          triedWorldIndex = [];
          console.log('');
          console.log('trying new word ' + tryNewWordTimes + ' :');
          let oldIndex = indexToChange;
          indexToChange = arrayOfNounsAndVerbsIndex[Math.floor(Math.random() * Math.floor(arrayOfNounsAndVerbsIndex.length))];
          while (indexToChange == oldIndex || changedIndex.indexOf(indexToChange) >= 0) {
            indexToChange = arrayOfNounsAndVerbsIndex[Math.floor(Math.random() * Math.floor(arrayOfNounsAndVerbsIndex.length))];
          }
          wordToChange = arrayOfText[indexToChange];
          console.log(wordToChange);
          pos = RiTa.getPosTags(wordToChange);
          generalPos = getGeneralPos(pos);
          counter = 0;
          tryNewWordTimes++;
          if (tryNewWordTimes > 100) {
            console.log('failed over 100 times at the' + (i + 1) + 'word');
            tryNewWordTimes = 0;
            shouldStore = false;
            break;
            //if try more than 100 times, break the loop
          }
        }
        if (RiTa.similarBySound(wordToChange).length > 0) {
          for (let i = 0; i < RiTa.similarBySound(wordToChange).length; i++) {
            let tem = RiTa.similarBySound(wordToChange)[i];
            let temPos = RiTa.getPosTags(tem);
            let temGeneralPos = getGeneralPos(temPos);
            if (temGeneralPos == generalPos && triedWorldIndex.indexOf(i) < 0) {
              newWord = tem;
              triedWorldIndex.push(i);
              break;
            }
            if (i == RiTa.similarBySound(wordToChange).length - 1) {
              newWord = RiTa.randomWord();
            }
          }
        } else {
          newWord = RiTa.randomWord();
        }
        console.log(triedWorldIndex + ' ' + metaphone.compare(wordToChange, newWord));
        //randomly pick a word with same pos to check the pronounciation
        counter++;
        console.log(counter);
        //change to other word in the text if 10000 words have been try and no similar pronounced word found
      }
      if (shouldStore) {
        if (pos == 'nns') {
          newWord = nounInflector.pluralize(newWord);
        } else if (pos == 'vbz') {
          newWord = verbInflector.singularize(newWord);
        }
        //inflect the new word
        console.log('get the ' + (i + 1) + ' word :');
        console.log(newWord);
        console.log('');
        arrayOfText[indexToChange] = newWord;
        changedIndex.push(indexToChange);
        successWords++;
        tryNewWordTimes = 0;
        //store the index of the word that have been change
      }
    }
    if (successWords < numToChange - 2) {
      console.log('not enough words are changed');
      console.log('');
      busy = false;
      return;
    } else {
      let newText = RiTa.untokenize(arrayOfText);
      newText = cleanNewText(newText);
      newText = newText + ' \n' + 'Original tweet from ' + '@' + tweet.user.screen_name;
      //get the new text
      rt.tweet(newText, function(e) {
        if (e) throw e;
        console.log(newText);
        console.log('tweeted');
        busy = false;
        process.exit(1);
      });
    }
  } else {
    return;
  }
});

function getGeneralPos(pos) {
  let posTagsNouns = ['nn', 'nns', 'nnp', 'nnps'];
  let posTagsVerbs = ['vb', 'vbd', 'vbg', 'vbn', 'vbp', 'vbz'];
  if (posTagsNouns.indexOf(pos) >= 0) {
    return 'nn';
  } else {
    return 'vb';
  }
}

function cleanOriginalText(text) {
  if (text[0] == 'R' && text[1] == "T") {
    text = text.substring(3);
  }
  //delete retweet sign
  text = text.replace(/https:\/\/t.co\/[a-zA-Z0-9]+/gi, '');
  text = text.replace('\n', '');
  //delete url
  return text;
}

function creatNumberToChange(arrayOfText) {
  if (arrayOfText.length < 40) {
    return 3;
  } else if (arrayOfText.length < 120) {
    return 4;
  } else {
    return 5;
  }
}

function cleanNewText(newText) {
  newText = newText.replace(/@\ /g, '@');
  newText = newText.replace(/\ ,/g, ',');
  newText = newText.replace(/\ \./g, '.');
  newText = newText.replace(/\ \?/g, '?');
  newText = newText.replace(/\ !/g, '!');
  newText = newText.replace(/\ \'/g, "'");
  newText = newText.replace(/\#\ /g, '#');
  return newText;
}

app.listen(app.get('Port'),function(){
  console.log('app is listening to port '+app.get('Port'));
});
