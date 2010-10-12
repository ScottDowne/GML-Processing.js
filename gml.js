var _stroke = 0; // current stroke
var onPt = 0; // current point on stroke
var onStroke = 0; // current point on stroke
var start = +(new Date());
var x, y, rotation = false; //pjs dies on comma seperation
var lastHyp;
var ol; // oldLine - redraws last line to remove border overflow

var playButton = {
  playing: true,
  x: 20,
  y : 500,
  width : 75,
  height : 60,
  mouseOver : false,
  play : function() {
    if(this.playing) {
      noLoop();
      this.playing = false;
    } else {
      loop();
      this.playing = true;
    }
  },
  draw : function() {
      if (mouseX >= this.x && mouseX < this.x + this.width && mouseY >= this.y && mouseY < this.y + this.height) {
          fill(191.25);
          this.mouseOver = true;
      } else {
          fill(63.75);
          this.mouseOver = false;
      }
      strokeWeight(0);
      rect(this.x, this.y, this.width, this.height);
      if(this.playing) {
          fill(127.5);
          rect(this.x + this.width/5, this.y + this.height/5, this.width/5, this.height/5*3);
          rect(this.x + this.width/5 * 3, this.y + this.height/5, this.width/5, this.height/5*3);
      } else {
          fill(127.5);
          triangle(this.x + this.width/3.2, this.y + this.height/5,
                   this.x + this.width/3.2, this.y + this.height/5*4,
                   this.x + this.width/5*4, this.y + this.height/2);
      }
  }
};

var seekBar = {
  x: 115,
  y : 500,
  width : 665,
  height : 60,
  mouseOver : function() {
      if (mouseX >= this.x && mouseX < this.x + this.width && mouseY >= this.y && mouseY < this.y + this.height) {
          return true;
      } else {
          return false;
      }
  },
  update : function() {
      strokeWeight(0);
      fill(191.25);
      rect(this.x + this.height/3, this.y + this.height/3, (onPt/strokes.pt.length*100)/100*625, this.height - this.height/3*2);
  },
  draw : function() {
      strokeWeight(0);
      fill(63.75);
      rect(this.x, this.y, this.width, this.height);
      fill(0);
      rect(this.x + this.height/3, this.y + this.height/3, this.width - this.height/3*2, this.height - this.height/3*2);
  }
  
};

setup = function() {
    size(800,580);
    frameRate(60);
    smooth();
    reset();
    var si = setInterval(function() {
        if (!gml) return;
        clearInterval(si);
        var tag = gml.gml.tag;
        var app_name = tag.header && tag.header.client && tag.header.client.name;
        rotation = app_name == 'Graffiti Analysis 2.0: DustTag' ||
                   app_name == 'DustTag: Graffiti Analysis 2.0' ||
                   app_name == 'Fat Tag - Katsu Edition';
    }, 50);
};

draw = function() {
    var start; var hyp;
    if (!strokes) return;
    _stroke = strokes.length ? strokes[onStroke] : strokes;
    pt = _stroke.pt[onPt];
    if ((+(new Date())-start)/1000>pt.time) {
        var p = onPt;
        if (x !== null) drawLine(x,y,pt.x,pt.y);
        if (onPt) {
            if (++onPt >= _stroke.pt.length) {
                if (!strokes.length || ++onStroke >= strokes.length) return reset();
                onPt = 0;
            }
        }
        x = pt.x;
        y = pt.y;
        if (onPt==p) onPt++; //went back to 0
    }
    seekBar.draw();
    seekBar.update();
    playButton.draw();
};

function drawLine(x,y,x2,y2) {
    _x = rotation ? y*height : x*width;
    _y = rotation ? width-(x*width) : y*height;
    _x2 = rotation ? y2 * height : x2*width;
    _y2 = rotation ? width - (x2 * width) : y2*height;
    stroke(0);
    strokeWeight(8);
    strokeCap(SQUARE);
    line(_x,_y,_x2,_y2);
    stroke(255);
    strokeWeight(4);
    strokeCap(ROUND);
    line(_x,_y,_x2,_y2);
    //ol = { x: _x, y: _y, x2: _x2, y2: _y2 };
}

function reset() {
    background(0);
    playButton.draw();
    seekBar.draw();
    onPt = onStroke = 0;
    x = y = null;
}

function seek(point) {
    reset();
    
    
    var start; var hyp;
    while (onPt <= point) {
        if (!strokes) return;
        _stroke = strokes.length ? strokes[onStroke] : strokes;
        pt = _stroke.pt[onPt];
        //if ((+(new Date())-start)/1000>pt.time) {
        var p = onPt;
        if (x !== null) drawLine(x,y,pt.x,pt.y);
        if (onPt) {
            if (++onPt >= _stroke.pt.length) {
                if (!strokes.length || ++onStroke >= strokes.length) return reset();
                onPt = 0;
            }
        }
        x = pt.x;
        y = pt.y;
        if (onPt==p) onPt++; //went back to 0
    }
    
}

void mouseClicked() {
    if (playButton.mouseOver) {
        playButton.play();
        playButton.draw();
    }
}

//var pressing = false;
var seekInterval;
void mousePressed() {
    //pressing = true;
    if (playButton.playing) {
      noLoop();
    }
    if (seekBar.mouseOver()) {
        seek(((mouseX - (20 + 75 + 20 + 20))/625*100)/100*strokes.pt.length);
        seekBar.draw();
        seekBar.update();
    }
    
    seekInterval = setInterval(function() {
        if (seekBar.mouseOver()) {
            seek(((mouseX - (20 + 75 + 20 + 20))/625*100)/100*strokes.pt.length);
            seekBar.draw();
            seekBar.update();
        }
    }, 10);
}

void mouseReleased() {
    //pressing = false;
    if (playButton.playing) {
      loop();
    }
    clearInterval(seekInterval);
}

void mouseMoved() {

    playButton.draw();
}
