const size = 300
//var synth = new Tone.Synth().toMaster();
let sp=[];
var dmak = new Dmak('酒', {
    'element' : "draw",
    uri:'https://rawgit.com/KanjiVG/kanjivg/master/kanji/',
    loaded:function(o){console.log('loaded'/*,o*/)
                       let strokes = dmak.strokes.map(({path})=>(pointAtLength(path)))
                       console.log(strokes)
                       let strokePoints = strokes.map(
                         c=>{
                           var len = c.length();
                           var a = [];
                           for (var i = 0; i <= 10; i++) {
                             let p = c.at(i / 10 * len)
                             a.push(p);
                           }
                           return a
                         }
                       )
                       sp=strokePoints
                      },
    drew:function(o){
      console.log('drawn',o);
      var pts = pointAtLength(dmak.strokes[o].path)
      
      var len = pts.length();
      
      //console.log('len',len)
      
      //setFreq(pts.at(0)[0],109)
      
      if(/*o>=dmak.strokes.length-1*/o==0){
        console.log(sp)
        let nsp = sp.reduce((a,b)=>([...a,...b]),[])
          nsp.forEach(function(c,i){
          setTimeout(function(){
            setFreq(c[0],109)
          }, i * 100);    
          });
        setTimeout(function(){
            setFreq(0)
          }, nsp.length * 100)
      }
    },
    height:size,width:size
  });
console.log(dmak)
//let strokes = dmak.strokes//.map(({path})=>(pointAtLength(path)))
//console.log(strokes)


//const t = new Theremin()
//console.log(t)

//play a middle 'C' for the duration of an 8th note
//synth.triggerAttackRelease("C4", "8n");
let lo=261.33,hi=523.25;
var audio_context = window.AudioContext || window.webkitAudioContext; // Makes the synthsizer cross browser compatible
var con = new audio_context(); // Create an audio engine
var osc = con.createOscillator(); //Creating an Oscilattor
var filter = con.createBiquadFilter(); //Creating a filter
var gainNode = con.createGain()
gainNode.gain.value = 0.1 // 10 %
gainNode.connect(con.destination)
filter.frequency.value = 200;
osc.frequency.value = 0; 
osc.start(); //starts the oscillator
osc.type = "square"; //Sets the wave type
osc.connect(filter); //Connects the oscillator to the computer sound system
filter.connect(gainNode);
gainNode.connect(con.destination)
function setFreq(x,outOf){
  osc.frequency.value = outOf ? ((x/outOf)*(hi-lo))+lo : x
}
function setFilter(x,outOf){
  //filter.frequency.value = ((x/outOf)*(300-100))+100
}
function setNote(key){
	if(key == 'z'){
		//Play a C
		osc.frequency.value = 261.33;
	}
	if(key == 'x'){
		//Play a D
		osc.frequency.value = 293.66;
	}
	
	if(key == 'c'){
		//Play a E
		osc.frequency.value = 329.63;
	}
	if(key == 'v'){
		//Play a F
		osc.frequency.value = 349.23;
	}
  if(key == 'q'){
		osc.frequency.value = 0;
	}
}
function changeFilter(mx, my){
	filter.frequency.value = mx*10;
	filter.Q.value = my / 10; 
}

//SVGGeometryElement.pathLength
//SVGGeometryElement.getPointAtLength()