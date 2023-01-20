const sliderRed = document.getElementById("cR");
const sliderGreen = document.getElementById("cG");
const sliderBlue = document.getElementById("cB");
const sliderOpacity = document.getElementById("cA");
const spanRed = document.getElementById("cRval");
const spanGreen = document.getElementById("cGval");
const spanBlue = document.getElementById("cBval");
const spanOpacity = document.getElementById("cAval");
const body = document.querySelector("body");
const randomzeBtn = document.querySelector("#randomizeMe");
const copyRGBBtn = document.querySelector("#copyMe");
const copyHexBtn = document.querySelector("#copyHex");
const saveBtn = document.querySelector("#saveMe");
const hexValue = document.querySelector("#hexVal");
const savedColors = document.querySelectorAll('.savedColors > div');
const savedColorsDelete = document.querySelectorAll('.savedColors > div > i');
const imgContainer = document.querySelector(".imgContainer");
const imageSrc = document.querySelector("#imagen");
const imgCanvas = document.querySelector("#imgCanvas");
const inputFile = document.querySelector('#imgfile');
const palette = document.querySelectorAll('.paletteImg > div');
const lightnessBox = document.querySelector('.tints');
const saturationBox = document.querySelector('.shades');
const hueBox = document.querySelector('.tones');
const magnifier = document.querySelector('.magnifier');
const ml5Prediction = document.querySelector('.ml5Prediction');


const MAX_IMG_W = 300;
const MAX_IMG_H = 300;
//localStorage.removeItem('myColors');

// If there is no variable called myColors in local storage the create it
if (!localStorage.getItem('myColors')){
  localStorage.setItem('myColors', JSON.stringify([]))
}


function setColorHex(hexColor){
  let RGBColor = convertHexToRGBA(hexColor);
  updateSliders(RGBColor['r'],RGBColor['g'],RGBColor['b'],RGBColor['a']);
  updateBodyColor(RGBColor['r'],RGBColor['g'],RGBColor['b'],RGBColor['a']/100);
  hexValue.value = hexColor;
}


function resetAllSavedColors(){

  // Get array from local storage
  let savedColorsList = JSON.parse(localStorage.getItem('myColors'));

  // Default Background
  savedColors.forEach((sc)=>{
    sc.style.background = "rgba(0,0,0,0.04)";
  })

  // Set Saved Colors
  let c = 0;
  savedColorsList.forEach((sc)=>{
    savedColors[c].style.background = sc.toString();
    savedColors[c].title = sc.toString();
    c++;
  })
}

resetAllSavedColors();


// Set the event to change the color to all the saved colors
savedColors.forEach((sc)=>{
  sc.addEventListener('click', function(e){
    e.stopPropagation();
    if (sc.title != ""){
      setColorHex(sc.title);
    }
  })
})

// Set the event to remove the saved color
savedColorsDelete.forEach((sc)=>{
  sc.addEventListener('click', function(e){
    let divParent = this.parentElement;
    if (divParent.title != ""){  
      let idToRemove = divParent.id;  
      // Remove from list of colors
      let savedColorsList = JSON.parse(localStorage.getItem('myColors'));   
      let newColsList = [];
      //savedColorsList = savedColorsList.filter((e)=>e!=divParent.title.toString());
      for (let i=0; i<savedColorsList.length; i++){
        if (i!=idToRemove){
          newColsList.push(savedColorsList[i]);
        }
      }
      localStorage.setItem('myColors', JSON.stringify(newColsList));
    }

    resetAllSavedColors();
    e.stopPropagation();
  })
})

saveBtn.addEventListener('click', function(){
  let maxColors = savedColors.length;
  let hex = hexValue.value;
  let savedColorsList = JSON.parse(localStorage.getItem('myColors'));
  if (savedColorsList.length >= maxColors){
    let newArray = savedColorsList.slice(0,savedColorsList.length-1);
    newArray.unshift(hex.toString());
    savedColorsList = newArray; 
    //savedColorsList[savedColorsList.length-1] = hex.toString();
  } else {
    savedColorsList.push(hex.toString());
  }
  localStorage.setItem('myColors', JSON.stringify(savedColorsList));
  resetAllSavedColors();
})

copyRGBBtn.addEventListener('click', function(){
  const rgbColor = `rgba(${sliderRed.value},${sliderGreen.value},${sliderBlue.value},${sliderOpacity.value/100})`;
  const el = document.createElement('textarea');
  el.value = rgbColor;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert("Copied! " + rgbColor);
})

copyHexBtn.addEventListener('click', function(){
  var copyText = hexValue;
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("Copied! " + copyText.value);
})

function getBrightness(r,g,b) {
  return Math.round(0.2126*r + 0.7152*g + 0.0722*b)/255
}

function hueToRGB(t1, t2, hue) {
  if (hue < 0) hue += 6;
  if (hue >= 6) hue -= 6;
  if (hue < 1) return (t2 - t1) * hue + t1;
  else if(hue < 3) return t2;
  else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
  else return t1;
}

function HSLToRGB(hue, sat, light) {
  var t1, t2, r, g, b;
  hue = hue / 60;
  if ( light <= 0.5 ) {
    t2 = light * (sat + 1);
  } else {
    t2 = light + sat - (light * sat);
  }
  t1 = light * 2 - t2;
  r = Math.round(hueToRGB(t1, t2, hue + 2) * 255);
  g = Math.round(hueToRGB(t1, t2, hue) * 255);
  b = Math.round(hueToRGB(t1, t2, hue - 2) * 255);
  return {r : r, g : g, b : b};
}

function HSLToRGB_2(h, s, l) {
  var c, x, m, hb, r, g, b;
  c = (1 - Math.abs(2*l-1))*s;
  x = c * (1 - Math.abs((h / 60) % 2 - 1));
  m = l - c/2;
  hb = ~~(h / 60) + 1
  switch (hb) {
    case 1:
        r = c; g = x; b = 0;
        break;
    case 2:
        r = x; g = c; b = 0;
        break;
    case 3:
        r = 0; g = c; b = x;
        break;
    case 4:
        r = 0; g = x; b = c;
        break;
    case 5:
        r = x; g = 0; b = c;
        break;
    case 6:
        r = c; g = 0; b = x;
        break;
    default:
      break;
  }
  
  r = ~~((r + m) * 255);
  g = ~~((g + m) * 255);
  b = ~~((b + m) * 255);

  return {r : r, g : g, b : b};
}

function RGBtoHSL (r,g,b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  let cMax = Math.max(r,g,b);
  let cMin = Math.min(r,g,b);
  let delta = cMax - cMin;
  let h, s, l;

  if (delta == 0) {
    h = 0
  } else if (cMax == r) {
    h = 60 * ((g - b) / delta)
  } else if (cMax == g) {
    h = 60 * (((b - r) / delta) + 2)
  } else if (cMax == b) {
    h = 60 * (((r - g) / delta) + 4)
  }

  h = (h < 0) ? Math.round(h + 360) : Math.round(h);

  l = (cMax + cMin) / 2;

  s = (cMax == 0) ? 0 : delta / (1-Math.abs(2*l-1));

  return {'h' : h, 's' : s, 'l' : l}

}

function RGBtoHSV (r,g,b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  let cMax = Math.max(r,g,b);
  let cMin = Math.min(r,g,b);
  let delta = cMax - cMin;
  let h, s, v;

  if (delta == 0) {
    h = 0
  } else if (cMax == r) {
    h = 60 * ((g - b) / delta)
  } else if (cMax == g) {
    h = 60 * (((b - r) / delta) + 2)
  } else if (cMax == b) {
    h = 60 * (((r - g) / delta) + 4)
  }

  h = (h < 0) ? Math.round(h + 360) : Math.round(h);
  s = (cMax == 0) ? 0 : delta / cMax;
  v = cMax;

  return {'h' : h, 's' : s, 'v' : v}

}

function convertHexToRGBA (hexCode) {
  let hex = hexCode.replace('#', '');
  
  if (hex.length === 3) {
      hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  let a = 100;

  if (hex.length === 8) {
    a = Math.round((parseInt(hex.substring(6, 8), 16)/255)*100);
  }

  return {
    'text' : `rgba(${r},${g},${b},${a})`,
    'r' : r, 'g' : g, 'b' : b, 'a' : a,
  };
}


function rgba2hex(r,g,b,alpha=-1) {
  let hex =  (r | 1 << 8).toString(16).slice(1) +
    (g | 1 << 8).toString(16).slice(1) +
    (b | 1 << 8).toString(16).slice(1) ;
  
  // if (alpha){
  //   let a = (alpha) ? alpha :  01;  
  //   a = ((a * 255) | 1 << 8).toString(16).slice(1)
  //   hex = hex + a;
  // }

  return hex;
}

function updateSliders(r,g,b,a){
  sliderRed.value = r;
  sliderGreen.value = g;
  sliderBlue.value = b;
  sliderOpacity.value = a;

  spanRed.value = sliderRed.value;
  spanGreen.value = sliderGreen.value;
  spanBlue.value = sliderBlue.value;
  spanOpacity.value = sliderOpacity.value;
}

function updateBodyColor(r,g,b,a){
  body.style.background = `rgba(${r},${g},${b},${a})`;
  let hexColor = rgba2hex(r,g,b,a);
  hexValue.value = this.value = "#" + hexColor.replace('#', '');
  updateLSH(r,g,b);
}

function randomize(){
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  let a = Math.floor(Math.random() * 100);

  updateSliders(r,g,b,a);
  updateBodyColor(r,g,b,a/100);
}

randomize();

// Randomize Button
randomzeBtn.addEventListener('click', () => randomize());

// Update when the hexis entered
hexValue.addEventListener('focusout', function(){
  let hexCol = convertHexToRGBA(this.value.toString());
  updateSliders(hexCol['r'],hexCol['g'],hexCol['b'],hexCol['a']);
  updateBodyColor(hexCol['r'],hexCol['g'],hexCol['b'],hexCol['a']/100);
  this.value = "#" + this.value.replace('#', '');
})

hexValue.addEventListener('keydown', function(e){
  if (e.keyCode === 13){
    let hexCol = convertHexToRGBA(this.value.toString());
    updateSliders(hexCol['r'],hexCol['g'],hexCol['b'],hexCol['a']);
    updateBodyColor(hexCol['r'],hexCol['g'],hexCol['b'],hexCol['a']/100);
  }
})

// Update the current slider value (each time you drag the slider handle)
sliderRed.oninput = function() {
  updateBodyColor(sliderRed.value, sliderGreen.value, sliderBlue.value, sliderOpacity.value/100);
  spanRed.value = sliderRed.value;
}

sliderGreen.oninput = function() {
  updateBodyColor(sliderRed.value, sliderGreen.value, sliderBlue.value, sliderOpacity.value/100);
  spanGreen.value = sliderGreen.value;
}

sliderBlue.oninput = function() {
  updateBodyColor(sliderRed.value, sliderGreen.value, sliderBlue.value, sliderOpacity.value/100);
  spanBlue.value = sliderBlue.value;
}

sliderOpacity.oninput = function() {
  updateBodyColor(sliderRed.value, sliderGreen.value, sliderBlue.value, sliderOpacity.value/100);
  spanOpacity.value = sliderOpacity.value;
}



function updateRGBInput(){
  let r = spanRed.value.toString().replace(/[^0-9]/g,"");
  let g = spanGreen.value.toString().replace(/[^0-9]/g,"");
  let b = spanBlue.value.toString().replace(/[^0-9]/g,"");
  let a = spanOpacity.value.toString().replace(/[^0-9]/g,"");

  updateSliders(r,g,b,a);
  updateBodyColor(r,g,b,a/100);
}

// Change manually the rgb
spanRed.addEventListener('focusout', () => updateRGBInput());
spanRed.addEventListener('keydown', (e) => {if (e.keyCode==13) updateRGBInput()});

spanGreen.addEventListener('focusout', () => updateRGBInput());
spanGreen.addEventListener('keydown', (e) => {if (e.keyCode==13) updateRGBInput()});

spanBlue.addEventListener('focusout', () => updateRGBInput());
spanBlue.addEventListener('keydown', (e) => {if (e.keyCode==13) updateRGBInput()});

spanOpacity.addEventListener('focusout', () => updateRGBInput());
spanOpacity.addEventListener('keydown', (e) => {if (e.keyCode==13) updateRGBInput()});



//-----------------------------------------------

function colorStats(colors){

  let n = colors[0].length;
  let stats = { 'max' : [], 'min' : [], 'avg' : [] };

  for (var i=0; i<n; i++){
    stats['max'].push(Math.max(...colors.map((p)=>{return p[i]})));
    stats['min'].push(Math.min(...colors.map((p)=>{return p[i]})));
    stats['avg'].push(~~(colors.map((p)=>{return p[i]}).reduce((a,b) => a+b)/colors.length));
  }

  return stats;

}

function countHueBuckets(hueBuckets, RGBcolors){
  let result = [];
  var arr = [];
  // Count the number of pixels that are inside each hue bucket
  let occHues = hueBuckets.reduce((a, b) => (a[b] = (a[b] || 0) + 1, a), {});
  for (h in occHues) {
    arr.push([h, occHues[h]])
  }
  let countHues = arr.sort((a,b)=>b[1]-a[1]);

  // Find the average rgb color for each bucket 
  countHues.forEach((hue) => {
    let hueBucketId = parseInt(hue[0]);
    let listOfIndexes = hueBuckets.reduce((a,e,i) => { if (e === hueBucketId) a.push(i); return a; }, []);
    let rgbCols = RGBcolors.filter((a,i)=>{return listOfIndexes.indexOf(i)>-1});
    let statOfGroup = colorStats(rgbCols);
    result.push({
      'hue' : hueBucketId, 
      'occurances' : hue[1],
      'listOfRGB' : rgbCols,
      'stats' : statOfGroup
    });
  });

  return result;

}

let RGBcolors2, HSLcolors2, hueBucket2;
function getAverageRGB(imgEl) {
  
  var blockSize = 5, // only visit every 5 pixels
      defaultRGB = null, // for non-supporting envs
      canvas = imgCanvas, //document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height,
      i = -4,
      length
      
  if (!context) {
      return defaultRGB;
  }
  
  width  = Math.min(imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width, MAX_IMG_W);
  height = Math.min(imageSrc.naturalHeight || imageSrc.offsetHeight || imageSrc.height, MAX_IMG_H);
  
  canvas.width = width;
  canvas.height = height;
  
  context.drawImage(imgEl, 0, 0, width, height);
  
  try {
      data = context.getImageData(0, 0, width, height);
  } catch(e) {
      /* security error, img on diff domain */alert('x');
      return defaultRGB;
  }
  
  length = data.data.length;
  let RGBcolors = []
  let HSLcolors = []
  let hueBucket = []
  let num_buckets = 24;
  
  let splitBucket = ~~360/num_buckets;

  while ( (i += blockSize * 4) < length ) {
    RGBcolors.push([data.data[i], data.data[i+1], data.data[i+2]]);
    hsl = RGBtoHSL(data.data[i], data.data[i+1], data.data[i+2]);    
    HSLcolors.push([hsl.h, hsl.s, hsl.l]);
    hueBucket.push(~~(hsl.h/splitBucket)+1);
  }

  let rgbStats = colorStats(RGBcolors);
  let hslStats = colorStats(HSLcolors);

  RGBcolors2 = RGBcolors;
  HSLcolors2 = HSLcolors;
  hueBucket2 = hueBucket;
  
  let topHues = countHueBuckets(hueBucket, RGBcolors);

  let stats = { 'rgb' : rgbStats, 'hsl' : hslStats, 'topHues' : topHues }
  console.log(stats);
  return stats;
  
}

if (imageSrc.getAttribute("src") != ""){
  imgContainer.classList.idToRemove("hidden");
} else {
  imgContainer.classList.add("hidden");
}

function findPos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
      do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
  }
  return undefined;
}

//onmousedown mousemove
imgCanvas.addEventListener('mousedown', function(e){ 
  if (imageSrc.getAttribute("src") != ""){
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var c = this.getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data;
    var r=p[0], g=p[1], b=p[2], a=p[3];
    var hex = rgba2hex(r,g,b,a/255);
    updateSliders(r,g,b,a);
    updateBodyColor(r,g,b,a/100);
    //var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  }
})




// Load Image 
function loadImage() {
  let file, fr;

  if (typeof window.FileReader !== 'function') {
      write("The FileReader API isn't supported on this browser yet.");
      return;
  }

  if (!inputFile) {
      write("Um, couldn't find the image element.");
  }
  else if (!inputFile.files) {
      write("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!inputFile.files[0]) {
      //write("Please select a file before clicking 'Load'");
  }
  else {      
      file = inputFile.files[0];
      fr = new FileReader();
      fr.onload = createImage;
      fr.readAsDataURL(file);
  }

  function createImage() {
      imageSrc.onload = imageLoaded;
      imageSrc.src = fr.result;      
  }

  function imageLoaded() {
      let stats = getAverageRGB(imageSrc);
      // Reset Boxes
      let c = 0;
      palette.forEach((sc)=>{
        sc.style.background = "rgba(0,0,0,0)";
        sc.title = "";
        sc.style.display = "none";
      })
      if(stats){
        // Get the average RGB and use it to set the body background color
        let rAvg=stats['rgb']['avg'][0], gAvg=stats['rgb']['avg'][1], bAvg=stats['rgb']['avg'][2], aAvg=100;
        updateSliders(rAvg,gAvg,bAvg,aAvg);
        updateBodyColor(rAvg,gAvg,bAvg,aAvg/100);        
        palette[0].style.background = `rgb(${rAvg},${gAvg},${bAvg})`;
        palette[0].title = rgba2hex(rAvg, gAvg, bAvg);

        // Get the hue pallete of colors
        c = 1;
        stats['topHues'].forEach((color) => {
          if (c < palette.length){
            let rAvgTop = color['stats']['avg'][0], gAvgTop=color['stats']['avg'][1], bAvgTop=color['stats']['avg'][2];
            palette[c].style.display = "block";
            palette[c].style.background = `rgb(${rAvgTop},${gAvgTop},${bAvgTop})`;
            palette[c].title = "#" + rgba2hex(rAvgTop, gAvgTop, bAvgTop);
            c++;
          }
        })
        setColorEvents();
      }

      // Predict the label with ML 5
      predictImageML5();
  }

  function write(msg) {
      alert(msg);
  }

  function setColorEvents() {
    // Set the event to change the color to all the saved colors
    palette.forEach((sc)=>{
      sc.addEventListener('click', function(e){
        e.stopPropagation();
        if (sc.title != ""){
          setColorHex(sc.title);
        }
      })
    })
  }
}

function updateLSH(r,g,b){
  let h,s,l;
  let hsl = RGBtoHSL(r,g,b);
  h = hsl.h;
  s = hsl.s;
  l = hsl.l;
  lightnessBox.innerHTML = "";
  saturationBox.innerHTML = "";
  hueBox.innerHTML = "";
  for (var i=5; i<=95; i+=4){
    var newRGBLightness = HSLToRGB(h,s,i/100);
    var newRGBSaturation = HSLToRGB(h,i/100,l);
    var newRGBHue = HSLToRGB(360*(i/100),s,l);

    var divLightness = document.createElement("div");
    divLightness.style.background = `rgb(${newRGBLightness.r},${newRGBLightness.g},${newRGBLightness.b})`;
    divLightness.title = "#" + rgba2hex(newRGBLightness.r,newRGBLightness.g,newRGBLightness.b);
    lightnessBox.appendChild(divLightness);

    var divSaturation = document.createElement("div");
    divSaturation.style.background = `rgb(${newRGBSaturation.r},${newRGBSaturation.g},${newRGBSaturation.b})`;
    divSaturation.title = "#" + rgba2hex(newRGBSaturation.r,newRGBSaturation.g,newRGBSaturation.b);
    saturationBox.appendChild(divSaturation);

    var divHue = document.createElement("div");
    divHue.style.background = `rgb(${newRGBHue.r},${newRGBHue.g},${newRGBHue.b})`;
    divHue.title = "#" + rgba2hex(newRGBHue.r,newRGBHue.g,newRGBHue.b);
    hueBox.appendChild(divHue);
  }

  // Set the events for each object
  let boxesLightness = lightnessBox.querySelectorAll("div");
  boxesLightness.forEach((sc)=>{ sc.addEventListener('click', (e) => { if (sc.title != "") setColorHex(sc.title);})})
  
  let boxesSaturation = saturationBox.querySelectorAll("div");
  boxesSaturation.forEach((sc)=>{ sc.addEventListener('click', (e) => { if (sc.title != "") setColorHex(sc.title);})})
  
  let boxesHue = hueBox.querySelectorAll("div");
  boxesHue.forEach((sc)=>{ sc.addEventListener('click', (e) => { if (sc.title != "") setColorHex(sc.title);})})
}



// imgContainer.classList.remove("hidden");
inputFile.onchange = function(){
  loadImage();
  imgContainer.classList.remove("hidden");
}



imgCanvas.addEventListener('mousemove', function(e){ 
  let wMag = magnifier.clientWidth;
  let hMag = magnifier.clientHeight;
  let pixelsMag = 5;
  let pixelSize = ~~wMag/pixelsMag;

  if (imageSrc.getAttribute("src") != ""){
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var c = this.getContext('2d');
    magnifier.innerHTML = "";
    for (var i=0; i<pixelsMag; i++){
      for (var j=0; j<pixelsMag; j++){
        var p = c.getImageData(x + j - ~~(pixelsMag/2) , y + i - ~~(pixelsMag/2), 1, 1).data;
        var r=p[0], g=p[1], b=p[2], a=p[3];
        var pMag = document.createElement("div");
        pMag.style.width = pixelSize - 2 + "px";
        pMag.style.height = pixelSize - 2 + "px";
        pMag.style.background = `rgb(${r},${g},${b})`;
        if ((j == ~~(pixelsMag/2)) && (i == ~~(pixelsMag/2))) {
          pMag.style.border = "1px solid #992233";
        }
        magnifier.appendChild(pMag);
      }
    }

    magnifier.style.top = y - (~~hMag/2) + "px";
    magnifier.style.left = x + 20 + "px";
    magnifier.classList.add("open");
    
    // var hex = rgba2hex(r,g,b,a/255);
  }
})

imgCanvas.addEventListener('mouseleave', function(e){ 
  magnifier.classList.remove("open");
})


function openInNewTab(url) {
  var win = window.open(url, '_blank');
  //win.focus();
}

function capitalizeFLetter(text) { 
  return text[0].toUpperCase() +  text.slice(1); 
} 

function predictImageML5(){
  ml5Prediction.innerHTML = "";
  ml5Prediction.classList.remove("show");
  ml5Prediction.removeEventListener('click',()=>{})
  const classifier = ml5.imageClassifier("MobileNet", modelLoaded);
  let prediction = classifier.predict(imageSrc, gotResult);
  function gotResult(error, results) {
    // all the amazing things you'll add
    console.log(results);
    if (results) {
      if (results[0]["confidence"] > 0.3){
        let predLabel = results[0]["label"].split(",")[0];
        ml5Prediction.innerHTML = capitalizeFLetter(predLabel) + " " + Math.round(results[0]["confidence"]*100) + "%";
        ml5Prediction.classList.add("show");
        // ml5Prediction.addEventListener('click',()=>{          
        //   openInNewTab(`https://www.google.com/search?q=${predLabel}`)
        // })
      }
    }
  }

  function modelLoaded() {
    //console.log('Model Loaded!');
  }

}