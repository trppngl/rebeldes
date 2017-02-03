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
var nextUpIndex = 0; // Should this be global? Don't want to declare it every 20ms in checkStop()...

var continuous = false;

var playAll = false;
var userStartSeg;

//

function startSeg(targetIndex) {
  currentIndex = targetIndex;
  // currentFrame = 1;
  // prepMoveHighlight();
  // prepScroll();
  // movingHighlight = true;
  if (userStartSeg || !continuous) {
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
      nextUpIndex = getNextUpIndex();
      console.log('next visible segment = ' + nextUpIndex);
      
      if (nextUpIndex === undefined) {
        
        pauseAudio();
        playAll = false;
        
      } else if (segData[nextUpIndex].id !== segData[currentIndex].id) {
        console.log('SKIPPING to ' + nextUpIndex);
        continuous = false;
        userStartSeg = false;
        startSeg(nextUpIndex);
        
      } else if (audio.currentTime > segData[nextUpIndex].start) {
        console.log('continuing to ' + nextUpIndex);
        continuous = true;
        userStartSeg = false;
        // hardStartSeg = false;
        startSeg(nextUpIndex);
      }
    }
  }
}

/* This function will be called every 20ms, so don't want it to do anything unnecessary. If it gets to the end there (after current segment's stop time, playAll mode, not last visible segment, next visible segment is adjacent in the audio), it has to keep checking every 20ms to see if the audio has reached the next visible segment's start time. But until that point is reached, should it really be doing all these checks every 20ms?

What should happen in that in-between time if user shows a note that wasn't visible before, so that now the next visible segment isn't adjacent in the audio? The way the function is written now, as soon as the user does that, it will start playing that new next visible seg. Is that what should happen? */

function pauseAudio() {
  audio.pause();
  window.clearInterval(audioTimer);
}

function getNextUpIndex() {
  var index = currentIndex + 1;
  while (index < numSegs) {
    if (segs[index].offsetHeight) {
      return index;
    } else {
      index += 1;
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

function next() {
  nextUpIndex = getNextUpIndex();
  if (nextUpIndex !== undefined) { // If there is a next visible seg
    userStartSeg = true;
    startSeg(nextUpIndex);
  }
}

/*
function prev() {
  var threshold = segData[currentIndex].start + 0.2;
  if (audio.currentTime > threshold) {
    userStartSeg = true;
    startSeg(currentIndex);
  } else if (currentIndex > 0) {
    userStartSeg = true;
    startSeg(currentIndex - 1);
  }
}
*/

// Event handlers

function handleClick(e) {
  var targetIndex;
  if (e.target.classList.contains('seg')) {
    targetIndex = Number(e.target.getAttribute('id'));
  } else if (e.target.parentElement.classList.contains('seg')) {
    targetIndex = Number(e.target.parentElement.getAttribute('id'));
  }
  if (targetIndex != undefined) {
    userStartSeg = true;
    hardStartSeg = true;
    startSeg(targetIndex);
  }
}

function handleKeydown(e) {
  switch(e.keyCode) {
    /* case 37:
      // hardStartSeg = true;
      prev();
      break; */
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
