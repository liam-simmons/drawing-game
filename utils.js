function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function maskWord(word) {
  let publicWord = "";
  for (let i = 0; i < word.length; i++) {
    if (word[i] === " ") publicWord += " ";
    else if (word[i] === "-") publicWord += "-";
    else publicWord += "_";
  }
  return publicWord;
}

function isCloseGuess(guess, answer) {
  const g = guess.toLowerCase().trim();
  const a = answer.toLowerCase().trim();

  if (!g || !a || g === a) return false;
  if (Math.abs(g.length - a.length) > 1) return false;

  // Same length: allow exactly one differing character.
  if (g.length === a.length) {
    let diffCount = 0;
    for (let i = 0; i < g.length; i++) {
      if (g[i] !== a[i]) diffCount++;
      if (diffCount > 1) return false;
    }
    return diffCount === 1;
  }

  // Length differs by one: allow exactly one insertion/deletion.
  const shorter = g.length < a.length ? g : a;
  const longer = g.length < a.length ? a : g;

  let i = 0;
  let j = 0;
  let mismatchUsed = false;

  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
      continue;
    }
    if (mismatchUsed) return false;
    mismatchUsed = true;
    j++;
  }

  return true;
}

function revealRandomHiddenChar(answer, currentPublicWord) {
  const hiddenIndices = [];
  for (let i = 0; i < answer.length; i++) {
    if (currentPublicWord[i] === "_" && answer[i] !== " " && answer[i] !== "-") {
      hiddenIndices.push(i);
    }
  }

  if (hiddenIndices.length === 0) return currentPublicWord;

  const revealIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
  return replaceAt(currentPublicWord, revealIndex, answer[revealIndex]);
}

module.exports = { replaceAt, maskWord, isCloseGuess, revealRandomHiddenChar };
