var column = document.getElementById('column');
var highlight = document.getElementById('highlight');
var audio = document.getElementById('audio');

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

var numSegs = segs.length;

var segData = [];
for (var i = 0; i < numSegs; i += 1) {
  var seg = segs[i];
  var times = seg.getAttribute('data-times').split(' ');
  segData.push({
    'id': times[0],
    'start': Number(times[1]),
    'stop': Number(times[2])
  });
}

var currentIndex = -1;
var nextVisibleIndex = 0;
var prevVisibleIndex;
// Should these be global? Don't want to declare every 20ms in checkStop(). Or would that be OK?

var skipHiddenSeg;

var playAll = false;
var userStartSeg;

// Audio

function startSeg(targetIndex) {
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
  audioTimer = window.setInterval(checkStop, 20);
}

function checkStop() {
  
  if (audio.currentTime > segData[currentIndex].stop) {

    if (!playAll) {
      pauseAudio();
      
    } else {
      nextVisibleIndex = getNextVisibleIndex();
      
      if (nextVisibleIndex === undefined) {
        
        pauseAudio();
        playAll = false;
        
      } else if (segData[nextVisibleIndex].id !== segData[currentIndex].id) {
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
  var index = currentIndex + 1;
  while (index < numSegs) { //
    if (segs[index].offsetHeight) {
      return index;
    } else {
      index += 1;
    }
  }
}

function getPrevVisibleIndex() {
  var index = currentIndex - 1;
  while (index >= 0) { 
    if (segs[index].offsetHeight) {
      return index;
    } else {
      index -= 1;
    }
  }
}

function next() {
  nextVisibleIndex = getNextVisibleIndex();
  if (nextVisibleIndex !== undefined) {
    userStartSeg = true;
    startSeg(nextVisibleIndex);
  }
}

function prev() {
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
window.addEventListener('keydown', handleKeydown, false);
