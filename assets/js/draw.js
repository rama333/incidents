'use strict';

function Draw(canvas_id)
{
   if(canvas_id!==undefined){
      let canvas; 
      if(typeof(canvas_id)==="string")
         canvas = document.getElementById(canvas_id); 
      else
         canvas = canvas_id;

      this.w   = canvas.width;                    // ширина канваса
      this.h   = canvas.height;                   // высота канваса
      this.ctx = canvas.getContext('2d');         // контекст рисования      
      this.ctx.textBaseline = "middle";  
      this.ctx.textAlign    = "center";
      this.ctx.font         = "16px monospace";
   }
   else  
      this.svg = "";                              // строка с svg-файлом
   
   this.cStroke = "black";                        // текущий цвет линии
   this.wStroke =  1;                             // ширина лини
   this.cFill   = "black";                        // текущий цвет заливки 
   this.cText   = "black";                        // текущий цвет текста
   this.sText   = 16;                             // размер шрифта 
}


Draw.prototype.clear = function()
{
   if(this.ctx)
      this.ctx.clearRect (0,0, this.w, this.h); 
   
   if(this.svg !== undefined)
      this.svg = "";
}

Draw.prototype.setCanvas = function(canvas_id)
{
   let canvas = document.getElementById(canvas_id);
   this.w   = canvas.width;
   this.h   = canvas.height;
   return this.ctx = canvas.getContext('2d');
}

Draw.prototype.colorFill   = function(color) 
{ 
   this.cFill = color; 
   if(this.ctx)
      this.ctx.fillStyle = color;
}

Draw.prototype.colorLine = function(color) 
{ 
   this.cStroke = color; 
   if(this.ctx)
      this.ctx.strokeStyle = color;   
}

Draw.prototype.colorText   = function(color) 
{ 
   this.cText = color; 
}

Draw.prototype.widthLine = function(width) 
{ 
   this.wStroke = width; 
   if(this.ctx)
      this.ctx.lineWidth = width;   
}

Draw.prototype.sizeText   = function(size) 
{ 
   this.sText = size; 
   if(this.ctx)
      this.ctx.font  = size+"px monospace";          
}

Draw.prototype.line = function(x1, y1, x2, y2)
{
   let p1 = (x2!==undefined? {x:x1, y:y1}: x1 );
   let p2 = (x2!==undefined? {x:x2, y:y2}: y1 );
  
   if(this.ctx){
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
   }
   if(this.svg !== undefined){
      this.svg += '<line '
      +'x1="'+this.round(p1.x)+'" y1="'+this.round(p1.y) + '" '
      +'x2="'+this.round(p2.x)+'" y2="'+this.round(p2.y) + '" '
      +'stroke="'+this.cStroke+'" stroke-width="'+this.wStroke+'"/>\n';       
   }
}

Draw.prototype.roundRect = function(x, y, w, h, r)
{
   this.ctx.beginPath();
   this.ctx.moveTo(x+r, y);
   this.ctx.lineTo(x+w-r, y);
   this.ctx.quadraticCurveTo(x+w, y, x+w, y+r);
   this.ctx.lineTo(x+w, y+h-r);
   this.ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
   this.ctx.lineTo(x+r, y+h);
   this.ctx.quadraticCurveTo(x, y+h, x, y+h-r);
   this.ctx.lineTo(x, y+r);
   this.ctx.quadraticCurveTo(x, y, x+r, y);
}

Draw.prototype.rect = function(x,y,w,h,r)
{
   let rct;
   if     ( r !== undefined ) rct = {x:x, y:y, w:w, h:h, r:r};         // x, y, w, h, r
   else if( h !== undefined ) rct = {x:x, y:y, w:w, h:h};              // x, y, w, h
   else if( y !== undefined ) rct = {x:x.x, y:x.y, w:x.w, h:x.h, r:y}; // rect, r
   else                       rct = x;                                 // rect

   if(this.ctx){
      if(!rct.r)
         this.ctx.strokeRect(rct.x-rct.w/2,rct.y-rct.h/2, rct.w, rct.h);
      else{
         this.roundRect(rct.x-rct.w/2,rct.y-rct.h/2,rct.w,rct.h,rct.r);
         this.ctx.stroke();
      }
   }
   if(this.svg !== undefined){
      this.svg += '<rect '
      +'x="'    +this.round(rct.x-rct.w/2)+'" y="'     +this.round(rct.y-rct.h/2) +'" '
      +'width="'+this.round(rct.w)+'" height="'+this.round(rct.h) +'" '
      +(rct.r? 'rx="'+this.round(rct.r)+'" ry="'+this.round(rct.r)+'" ': '')
      +'stroke="'+this.cStroke+'" stroke-width="'+this.wStroke+'" fill="none" />\n'
   }
}

Draw.prototype.box = function(x,y,w,h,r)
{
   let rct;
   if     ( r !== undefined ) rct = {x:x, y:y, w:w, h:h, r:r};         // x, y, w, h, r
   else if( h !== undefined ) rct = {x:x, y:y, w:w, h:h};              // x, y, w, h
   else if( y !== undefined ) rct = {x:x.x, y:x.y, w:x.w, h:x.h, r:y}; // rect, r
   else                       rct = x;                                 // rect
      
   if(this.ctx){
      if(!rct.r)
         this.ctx.fillRect (rct.x-rct.w/2,rct.y-rct.h/2, rct.w, rct.h); 
      else{
         this.roundRect(rct.x-rct.w/2,rct.y-rct.h/2,rct.w,rct.h,rct.r)
         this.ctx.fill();          
      }
      this.rect(x,y,w,h,r);
   }
   if(this.svg !== undefined){
      this.svg += '<rect '
      +'x="'    +this.round(rct.x-rct.w/2)+'" y="'     +this.round(rct.y-rct.h/2) +'" '
      +'width="'+this.round(rct.w)+'" height="'+this.round(rct.h) +'" '
      +(r? 'rx="'+this.round(r)+'" ry="'+this.round(r)+'" ': '')
      +'stroke="'+this.cStroke+'" stroke-width="'+this.wStroke+'" fill="'+this.cFill+'" />\n'
   }      
}

Draw.prototype.circle = function(x,y, r)
{
   let p;
   if     (r !== undefined) p = {x:x,   y:y,   r:r};    //  x, y, r
   else if(y !== undefined) p = {x:x.x, y:x.y, r:y};    //  {x, y} , r
   else                     p = x;                      //  {x, y, r}

   if(this.ctx){
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
      this.ctx.stroke();
   }
   if(this.svg !== undefined){
      this.svg +=
      '<circle cx="'+this.round(p.x)+'" cy="'+this.round(p.y) +'" r="'+this.round(p.r)
      +'" stroke="'+this.cStroke+'" fill="none"/>\n';
   }
}

Draw.prototype.circleFill = function(x,y, r)
{
   let p;
   if     (r !== undefined) p = {x:x,   y:y,   r:r};    //  x, y, r
   else if(y !== undefined) p = {x:x.x, y:x.y, r:y};    //  {x, y} , r
   else                     p = x;                      //  {x, y, r}

   if(this.ctx){
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
      this.ctx.stroke();
   }
   if(this.svg !== undefined){
      this.svg +=
      '<circle cx="'+this.round(p.x)+'" cy="'+this.round(p.y) +'" r="'+this.round(p.r)
      +'" stroke="'+this.cStroke+'" fill="'+this.cFill+'"/>\n';
   }
}

Draw.prototype.point = function(x,y, r)
{
   let p;
   if     (r !== undefined) p = {x:x,   y:y,   r:r};    //  x, y, r
   else if(y !== undefined) p = {x:x.x, y:x.y, r:y};    //  {x, y} , r
   else                     p = x;                      //  {x, y, r}

   if(this.ctx){
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
      this.ctx.fill();
   }
   if(this.svg !== undefined){
      this.svg +=
      '<circle cx="'+this.round(p.x)+'" cy="'+this.round(p.y)
      +'" r="'+this.round(p.r)
      +'" stroke="'+this.cFill+'" fill="'+this.cFill+'"/>\n';
   }
}

Draw.prototype.arc = function(p, r, a1, a2)
{
   if(this.ctx){
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, a1, a2, true);
      this.ctx.stroke();
   }
}

Draw.prototype.text = function(txt, x,y)
{
   let p = (y!==undefined? {x:x,y:y}: x);

   if(this.ctx){
      let f = this.ctx.fillStyle,  s = this.ctx.strokeStyle
      this.ctx.fillStyle = this.ctx.strokeStyle = this.cText;
      this.ctx.fillText(txt, p.x, p.y);
      this.ctx.fillStyle = f;  this.ctx.strokeStyle = s;
   }
   if(this.svg !== undefined){
      this.svg += '<text x="'+ this.round(p.x) +'" y="'+this.round(p.y)
      +'" alignment-baseline="middle" fill="' + this.cText + '" '
      + 'font-size="'+this.sText+'px"'
      +'>'
      + txt + '</text>\n';
   }
}


Draw.prototype.text1 = function(txt, x,y, x1, y1)
{
   let p = (y!==undefined? {x:x,y:y}: x);


   let klen = Math.abs(y - y1);
   let llen = Math.abs(x-x1);
   let r = Math.sin(Math.abs(klen/llen));

   if(this.ctx){
      this.ctx.save();
      let f = this.ctx.fillStyle,  s = this.ctx.strokeStyle
      this.ctx.fillStyle = this.ctx.strokeStyle = this.cText;
      this.ctx.textAlign = 'center'
      this.ctx.translate((x+x1)/2, (y+y1)/2);
      this.ctx.rotate(Math.abs(r));

      this.ctx.fillText(txt, 0, 0);

      this.ctx.fillStyle = f;  this.ctx.strokeStyle = s;
      this.ctx.restore();
   }
   if(this.svg !== undefined){
      this.svg += '<text x="'+ this.round(p.x) +'" y="'+this.round(p.y)
          +'" alignment-baseline="middle" fill="' + this.cText + '" '
          + 'font-size="'+this.sText+'px"'
          +'>'
          + txt + '</text>\n';
   }
}

Draw.prototype.circles = function(crcls)
{
   if(this.ctx){
      for(let i=0; i<crcls.length; i++){
         let c = crcls[i];
         this.ctx.beginPath();
         this.ctx.arc(c.x, c.y, c.r, 0, Math.PI*2, true);
         this.ctx.stroke();
      }
      for(let i=0; i<crcls.length; i++){
         let c = crcls[i];
         this.ctx.beginPath();
         this.ctx.arc(c.x, c.y, c.r, 0, Math.PI*2, true);
         this.ctx.fill();
      }
   }
   if(this.svg !== undefined){
      for(let i=0; i<crcls.length; i++){
         let c = crcls[i];
         this.svg +=
         '<circle cx="'+this.round(c.x)+'" cy="'+this.round(c.y) +'" r="'+this.round(c.r)
         +'" stroke="'+this.cStroke+'"/>\n';
      }
      for(let i=0; i<crcls.length; i++){
         let c = crcls[i];
         this.svg +=
         '<circle cx="'+this.round(c.x)+'" cy="'+this.round(c.y) +'" r="'+this.round(c.r)
         +'" stroke="'+this.cFill+'" fill="'+this.cFill+'"/>\n';
      }
   }
}

Draw.prototype.polygon = function(pnts,  fill, way)
{
   if(this.ctx){
      this.ctx.beginPath();
      if(way){
         this.ctx.moveTo(pnts[way[0]].x, pnts[way[0]].y);
         for(let i=1; i<way.length; i++)
            this.ctx.lineTo(pnts[way[i]].x, pnts[way[i]].y);
      }
      else{
         this.ctx.moveTo(pnts[0].x, pnts[0].y);
         for(let i=1; i<pnts.length; i++)
            this.ctx.lineTo(pnts[i].x, pnts[i].y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      if(fill) this.ctx.fill();
   }
   if(this.svg !== undefined){
      let st;
      if(way){
         st = this.round(pnts[way[0]].x)+","+this.round(pnts[way[0]].y);
         for(let i=1; i<way.length; i++)
            st += " "+this.round(pnts[way[i]].x)+","+this.round(pnts[way[i]].y);
         st += " "+this.round(pnts[way[0]].x)+","+this.round(pnts[way[0]].y);
       }
       else{
         st = this.round(pnts[0].x)+","+this.round(pnts[0].y);
         for(let i=1; i<pnts.length; i++)
            st += " "+this.round(pnts[i].x)+","+this.round(pnts[i].y);
         st += " "+this.round(pnts[0].x)+","+this.round(pnts[0].y);
      }
      this.svg += '<polyline points="'+st+'"'+
      (fill?' fill="'+this.cFill+'"': ' fill="transparent"')
      +' stroke="'+this.cStroke+'" stroke-width="'+this.wStroke+'" />\n';
   }
}

Draw.prototype.transformBeg = function(dx, dy, alpha, sx, sy)
{
   if(this.ctx !== undefined){
       this.ctx.save();
       this.ctx.translate(dx, dy);
       if(alpha !== undefined)
          this.ctx.rotate(alpha);
       if(sy !== undefined)
          this.ctx.scale(sx, sy);
   }
   if(this.svg !== undefined)
      this.svg += '<g transform="translate('+this.round(dx)+' '+this.round(dy)+')'
               + (alpha!==undefined? ' rotate('+this.round(alpha*180/Math.PI)+')' :"")
               + (sy!==undefined? ' scale('+this.round(sx)+' '+this.round(sy)+')' :"")
               + '">\n'
}

Draw.prototype.transformEnd = function(dx, dy, alpha, sx, sy)
{
   if(this.ctx !== undefined)
       this.ctx.restore();
   if(this.svg !== undefined)
      this.svg += '</g>\n';
}

Draw.prototype.transformAll = function(dx, dy, alpha, sx, sy)
{
   this.svg = '<g transform="translate('+this.round(dx)+' '+this.round(dy)+')'
            + (alpha!==undefined && alpha? ' rotate('+this.round(alpha*180/Math.PI)+')' :"")
            + (sy!==undefined? ' scale('+this.round(sx)+' '+this.round(sy)+')' :"")
            + '">\n'
            + this.svg
            + '</g>\n';
}

Draw.prototype.round = function(val)
{
   return Math.round(val*100)/100;
}

Draw.prototype.getSVG = function(w,h)
{
   let rct = (h!==undefined? {w:w, h:h}: w);
   return  '<svg xmlns="http://www.w3.org/2000/svg" width="'
   +this.round(rct.w)+'px" height="'+this.round(rct.h)+'px" '
   +'style="vertical-align:top;text-anchor:middle;font-family:monospace;font-size:16px;">\n'
   + this.svg
   + '</svg>';
  }