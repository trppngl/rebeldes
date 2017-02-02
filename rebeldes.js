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

var nextVisibleIndex = 0; // Should this be global? Don't want to declare it every 20ms in checkStop()...

var continuous = false;

playAll = false;

//

function startSeg(targetIndex) {
  currentIndex = targetIndex;
  // currentFrame = 1;
  // prepMoveHighlight();
  // prepScroll();
  // movingHighlight = true;
  if (!continuous) {
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
      console.log('nextVisibleSeg = ' + nextVisibleIndex);
      if (!nextVisibleIndex) {
        pauseAudio();
        playAll = false;
      } else if (segData[nextVisibleIndex].id !== segData[currentIndex].id) {
        console.log('skipping to ' + nextVisibleIndex);
        continuous = false;
        startSeg(nextVisibleIndex);
      } else if (audio.currentTime > segData[nextVisibleIndex].start) {
        console.log('continuing to ' + nextVisibleIndex);
        continuous = true;
        // hardStartSeg = false;
        startSeg(nextVisibleIndex);
      }
    }
  }
}

/* This function will be called every 20ms, so don't want it to do anything unnecessary. If it gets to the end there (after current segment's stop time, playAll mode, not last visible segment, next visible segment is adjacent in the audio), it has to keep checking every 20ms to see if the audio has reached the next visible segment's start time. But until that point is reached, should it really be doing all these checks every 20ms?

What should happen in that in-between time if user shows a note that wasn't visible before, so that now the next visible segment isn't adjacent in the audio? The way the function is written now, as soon as the user does that, it will start playing that new next visible seg. Is that what should happen? */

/*

function checkStop() {
  if (audio.currentTime > segData[currentIndex].stop && (!playAll || currentIndex === numSegs - 1)) {
    pauseAudio();
    playAll = false;
  } else if (audio.currentTime > segData[currentIndex + 1].start) {
    userStartSeg = false;
    hardStartSeg = false;
    startSeg(currentIndex + 1);
  }
}

*/

function pauseAudio() {
  audio.pause();
  window.clearInterval(audioTimer);
}

function getNextVisibleIndex() {
  var index = currentIndex + 1;
  while (index < numSegs) {
    if (segs[index].offsetHeight) {
      return index;
    } else {
      index += 1;
    }
  }
}
