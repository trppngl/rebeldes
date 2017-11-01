var column = document.getElementById('column');
var highlight = document.getElementById('highlight');

var audio = document.getElementById('audio');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

var numSegs = segs.length;

var segData = [];

(function () {
  
  var seg;
  var audioData;
  
  for (var i = 0; i < numSegs; i += 1) {
    seg = segs[i];
    audioData = seg.getAttribute('data-audio').split(' ');
    segData.push({
      'sprite': audioData[0],
      'start': Number(audioData[1]),
      'stop': Number(audioData[2])
    });
  }
})();

var currentIndex = -1;

var playAll = false;
var userStartSeg;
var skipHiddenSeg;

// Highlight

function moveHighlight(targetIndex) {
  if (segs[currentIndex]) {
    segs[currentIndex].classList.remove('highlight');
  }
  segs[targetIndex].classList.add('highlight');
}

// Audio

function startSeg(targetIndex) {
  
  moveHighlight(targetIndex);
  currentIndex = targetIndex;
  
  // currentFrame = 1;
  // prepMoveHighlight();
  // prepScroll();
  // movingHighlight = true;
  
  if (userStartSeg || skipHiddenSeg) {
    audio.currentTime = segData[currentIndex].start;
    if (audio.paused) {
      playAudio();
    }
  }
}

function playAudio() {
  audio.play();
  audioTimer = window.setInterval(checkStop, 20); // Declare var audioTimer at top?
}

function checkStop() {
  var nextVisibleIndex;
  
  if (audio.currentTime > segData[currentIndex].stop) {

    if (!playAll) {
      pauseAudio();
      
    } else {
      nextVisibleIndex = getNextVisibleIndex();
      
      if (nextVisibleIndex === undefined) {
        pauseAudio();
        playAll = false;
        
      } else if (segData[nextVisibleIndex].sprite !== segData[currentIndex].sprite) {
        skipHiddenSeg = true;
        userStartSeg = false;
        startSeg(nextVisibleIndex);
        
      } else if (audio.currentTime > segData[nextVisibleIndex].start) {
        skipHiddenSeg = false;
        userStartSeg = false;
        // hardStartSeg = false;
        startSeg(nextVisibleIndex);
      }
    }
  }
}

function pauseAudio() {
  audio.pause();
  window.clearInterval(audioTimer);
}

function getNextVisibleIndex() {
  var ndx = currentIndex + 1;
  while (ndx < numSegs) { //
    if (segs[ndx].offsetHeight) {
      return ndx;
    } else {
      ndx += 1;
    }
  }
}

function getPrevVisibleIndex() {
  var ndx = currentIndex - 1;
  while (ndx >= 0) { 
    if (segs[ndx].offsetHeight) {
      return ndx;
    } else {
      ndx -= 1;
    }
  }
}

function next() {
  var nextVisibleIndex = getNextVisibleIndex();
  if (nextVisibleIndex !== undefined) {
    userStartSeg = true;
    startSeg(nextVisibleIndex);
  }
}

function prev() {
  var prevVisibleIndex;
  var threshold = segData[currentIndex].start + 0.2;
  if (audio.currentTime > threshold) {
    userStartSeg = true;
    startSeg(currentIndex);
  } else {
    prevVisibleIndex = getPrevVisibleIndex();
    if (prevVisibleIndex !== undefined) {
      userStartSeg = true;
      startSeg(prevVisibleIndex);
    }
  }
}

function togglePlayAll() {
  if (audio.paused) {
    playAll = true;
    next();
  } else {
    playAll = !playAll;
  }
}

// Event handlers

function handleClick(e) {
  var targetIndex;
  if (e.target.classList.contains('seg')) {
    targetIndex = Number(e.target.getAttribute('id'));
  } else if (e.target.parentElement.classList.contains('seg')) {
    targetIndex = Number(e.target.parentElement.getAttribute('id'));
  }
  if (targetIndex !== undefined) {
    userStartSeg = true;
    hardStartSeg = true;
    startSeg(targetIndex);
  }
}

function handleKeydown(e) {
  switch(e.keyCode) {
    case 37:
      // hardStartSeg = true;
      prev();
      break;
    case 39:
      // hardStartSeg = true;
      next();
      break;
    case 32:
      e.preventDefault(); // So browser doesn't jump to bottom
      // hardStartSeg = false;
      togglePlayAll();
      break;
    /* case 86:
      toggleLinkMode('v');
      break;
    case 80:
      toggleLinkMode('p');
      break;
    case 71:
      toggleLinkMode('g');
      break; */
  }
}

// Event listeners

document.addEventListener('click', handleClick, false);
document.addEventListener('keydown', handleKeydown, false);
