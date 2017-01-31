var text = document.getElementById('text');
var highlight = document.getElementById('highlight');

var tracks = {};
var currentTrack;
(function () {
  var trx = document.getElementsByTagName('audio');
  var len = trx.length;
  currentTrack = trx[0];
  for (var i = 0; i < len; i += 1) {
    tracks[trx[i].id] = trx[i];
  }
}());

/* Using a self-invoking function here so that the initial list of audio elements isn't saved.
Also, if there was a way to get the name of the audio file and lop off .mp3 or .ogg, wouldn't need to gives those elements ids in the html. */

var segs = [];
segs.push.apply(segs, document.getElementsByClassName('seg'));

// Could I do the above with querySelectorAll? The goal of pushing to an array is to make sure it isn't live, but apparently with querySelectorAll, it wouldn't be.

var numSegs = segs.length;

var segData = [];
for (var i = 0; i < numSegs; i += 1) {
  var seg = segs[i];
  // Or have track name in seg's id?
  var audioData = seg.getAttribute('data-audio').split(' ');
  segData.push({
    'xyz': seg.getAttribute('id'),
    'track': audioData[0],
    'start': Number(audioData[1]),
    'stop': Number(audioData[2])//,
    // 'plain': seg.innerHTML,
    // 'v': seg.getAttribute('data-v'),
    // 'p': seg.getAttribute('data-p'),
    // 'g': seg.getAttribute('data-g')
  });
}

var segIndexes = {};
for (var i = 0; i < numSegs; i += 1) {
    segIndexes[segData[i].xyz] = i;
}

var easingMultipliers = {
  // (.25,.1,.25,1)
  defaultEase: [0.00000, 0.03833, 0.11263, 0.22067, 0.34604, 0.46823, 0.57586, 0.66640, 0.74116, 0.80240, 0.85228, 0.89260, 0.92482, 0.95011, 0.96941, 0.98347, 0.99293, 0.99830, 1.00000],
  // (.42,0,.58,1)
  easeInOut: [0.00000, 0.00598, 0.02445, 0.05613, 0.10142, 0.16023, 0.23177, 0.31429, 0.40496, 0.50000, 0.59504, 0.68571, 0.76823, 0.83977, 0.89858, 0.94387, 0.97555, 0.99402, 1.00000]
};

var totalFrames = 18;
var currentFrame = 0;

var startTop = 0;
var startHt = 0;
var startScroll = 0;
var endTop = 0;
var endHt = 0;
var endScroll = 0;

var highlightWidth = text.clientWidth;

var currentIndex = -1;

var currentLink = null;
var currentNote = null;

var playAll = false;
var userStartSeg = false;
var hardStartSeg = false;

var movingHighlight = false;
var scrolling = false;
var resizing = false;

var linkMode = 'plain';

// Not used yet
var supportsMixBlendMode = window.getComputedStyle(document.body).mixBlendMode;

//

// 300ms gap on phones, so could change 0.2 to 0.5 or find some way to eliminate that gap

function prev() {
  var threshold = segData[currentIndex].start + 0.2;
  if (currentTrack.currentTime > threshold) {
    userStartSeg = true;
    startSeg(currentIndex);
  } else if (currentIndex > 0) {
    userStartSeg = true;
    pauseAudio();
    startSeg(currentIndex - 1);
  }
}

function next() {
  if (currentIndex < numSegs - 1) {
    userStartSeg = true;
    pauseAudio();
    startSeg(currentIndex + 1);
  }
}

//

function startSeg(targetIndex) {
  currentFrame = 1;
  currentIndex = targetIndex;
  // prepMoveHighlight();
  // prepScroll();
  // movingHighlight = true;
  currentTrack = tracks[segData[currentIndex].track];
  if (userStartSeg) {
    console.log('changing current time to start time of seg ' + currentIndex);
    currentTrack.currentTime = segData[currentIndex].start;
    if (currentTrack.paused) {
      playAudio();
    }
  }
}

function prepMoveHighlight() {
  var seg = segs[currentIndex];
  endTop = seg.offsetTop;
  endHt = seg.clientHeight;
  startTop = highlight.offsetTop;
  startHt = highlight.clientHeight;
  highlightWidth = text.clientWidth;
}

function prepScroll() {
  var prevSegOffset = 0;
  var nextSegOffset = 0;
  var windowHt = window.innerHeight;
  startScroll = window.pageYOffset;

  // Only consider scrolling if segment change initiated by user or if some part of highlight will be in view at some point during change. Allows user to scroll away from autoscrolling highlight without being yanked back.

  if (userStartSeg || (endTop + endHt > startScroll && startTop < startScroll + windowHt)) {

    if (segs[currentIndex - 1]) {
      prevSegOffset = segs[currentIndex - 1].offsetTop - startScroll;
    } else { // currentIndex must be 0, so scroll to top
      endScroll = 0;
      scrolling = true;
    }

    if (segs[currentIndex + 1]) {
      nextSegOffset = segs[currentIndex + 1].offsetTop + segs[currentIndex + 1].clientHeight - windowHt - startScroll;
    } else { // currentIndex must be last, so scroll to bottom
      endScroll = segs[currentIndex].offsetTop + segs[currentIndex].clientHeight - windowHt;
      scrolling = true;
    }

    if (nextSegOffset > 0) {
      endScroll = startScroll + nextSegOffset;
      scrolling = true;
    } else if (prevSegOffset < 0) {
      endScroll = startScroll + prevSegOffset;
      scrolling = true;
    }
  }
}

function animate() {
  if (movingHighlight) {
    currentTop = Math.round(ease(startTop, endTop));
    currentHt = Math.round(ease(startHt, endHt));
    var cssText = 'top: ' + currentTop + 'px; height: ' + currentHt + 'px; width: ' + highlightWidth + 'px;';
    highlight.style = cssText;
  }

  if (scrolling) {
    currentScroll = Math.round(ease(startScroll, endScroll));
    window.scrollTo(0, currentScroll);
  }

  if (movingHighlight || scrolling) {
    if (currentFrame < totalFrames) {
      currentFrame += 1;
    } else {
      movingHighlight = false;
      scrolling = false;
    }
  }

  requestAnimationFrame(animate);
}

function ease(startValue, endValue) { // Break into two functions?
  var easingFunction;
  if (hardStartSeg) {
    easingFunction = 'defaultEase';
  } else {
    easingFunction = 'easeInOut';
  }
  console.log(easingFunction);
  return (endValue - startValue) * easingMultipliers[easingFunction][currentFrame] + startValue;
}

//

function playAudio() {
  currentTrack.play();
  audioTimer = window.setInterval(checkStop, 20);
}

/*
function checkStop() {
  if (currentTrack.currentTime > segData[currentIndex].stop && (!playAll || currentIndex === numSegs - 1)) {
    console.log(currentTrack.currentTime);
    console.log(segData[currentIndex].stop);
    console.log('checkStop if');
    pauseAudio();
    playAll = false;
  } else if (currentTrack.currentTime > segData[currentIndex + 1].start) {
    console.log('checkStop else if');
    userStartSeg = false;
    hardStartSeg = false;
    startSeg(currentIndex + 1);
  }
}
*/

function checkStop() {
  if (currentTrack.currentTime > segData[currentIndex].stop) {
    pauseAudio();
  }
}

function pauseAudio() {
  currentTrack.pause();
  window.clearInterval(audioTimer);
}

function togglePlayAll() {
  if (currentTrack.paused) {
    playAll = true;
    next();
  } else {
    playAll = !playAll;
  }
}

// Links

function toggleLinkMode(input) {
  if (linkMode === input) {
    linkMode = 'plain';
  } else {
    linkMode = input;
  }
  writeSegs();

  hideCurrentNote();
  currentNote = null;
}

function writeSegs() {
  for (var i = 0; i < numSegs; i += 1) {
    if (segData[i][linkMode]) {
      segs[i].innerHTML = segData[i][linkMode];
    } else {
      segs[i].innerHTML = segData[i].plain;
    }
  }
}

// Notes

function toggleNote(targetNote) {
  hideCurrentNote();
  if (currentNote === targetNote) {
    currentNote = null;
  } else {
    currentNote = targetNote;
    showCurrentNote();
  }
}

function hideCurrentNote() {
  if (currentNote) {
    currentNote.style = 'display: none';
  }
}

function showCurrentNote() {
  currentNote.style = 'display: block';
}

// Event handlers

function handleTextClick(e) {
  // DRY, come back and fix this.
  if (e.target.parentElement.classList.contains('seg')) {
    var xyz = e.target.parentElement;
    userStartSeg = true;
    hardStartSeg = true;
    startSeg(segIndexes[xyz.getAttribute('id')]);
  }
  if (e.target.classList.contains('seg')) {
    var xyz = e.target;
    userStartSeg = true;
    hardStartSeg = true;
    startSeg(segIndexes[xyz.getAttribute('id')]);
  } /* else if (e.target.tagName.toLowerCase() === 'span') { // Other text spans?
    currentLink = e.target;
    toggleNote(document.getElementById(currentLink.getAttribute('data-note')));
    // Too much in above line?
  } */
}

function handleKeydown(e) {
  switch(e.keyCode) {
    case 37:
      hardStartSeg = true;
      prev();
      break;
    case 39:
      hardStartSeg = true;
      next();
      break;
    case 32:
      e.preventDefault(); // So browser doesn't jump to bottom
      hardStartSeg = false;
      togglePlayAll();
      break;
    case 86:
      toggleLinkMode('v');
      break;
    case 80:
      toggleLinkMode('p');
      break;
    case 71:
      toggleLinkMode('g');
      break;
  }
}

// Quick and dirty
function handleResize() {
  var seg = segs[currentIndex];
  var segTop = seg.offsetTop;
  var segHt = seg.clientHeight;
  highlightWidth = seg.clientWidth;
  var tempScrollOffset = segTop - currentTop;
  window.scrollBy(0, tempScrollOffset);
  currentTop += tempScrollOffset;
  var cssText = 'top: ' + currentTop + 'px; height: ' + segHt + 'px; width: ' + highlightWidth + 'px;';
  highlight.style = cssText;
}

// Event listeners

window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('resize', handleResize, false);
// window.addEventListener('hashchange', hashNote, false);

text.addEventListener('click', handleTextClick, false);

//

requestAnimationFrame(animate);
