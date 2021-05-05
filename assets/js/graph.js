'use strict';

function Graph(g)
{
   this.nodes  = [];            // список узлов
   
   this.ribs  = [];             // список рёбер:[ [0 , 1], [0, 2] ] (для задания x,y)
   this.nodeR = 16;             // радиус узла (для алгоритмов упорядочивания координат)
   
   if(g)                        // задаём граф по массиву или другому графу
      this.clone(g);
}

Graph.prototype.clone = function (graph)
{
   let g = Array.isArray(graph)? graph: graph.nodes; // на массив узлов
    
   this.nodes = new Array(g.length);
   for(let i=g.length; i--; )
      this.nodes[i] = Object.assign( {}, g[i] );
   
   if(!Array.isArray(graph)){                     // graph - это объект Graph
      this.nodeR = graph.nodeR;
      if(graph.ribs.length){
         this.ribs  = new Array(graph.ribs.length);
         for(let k = graph.ribs.length; k--; )
            this.ribs[k] = [graph.ribs[k][0], graph.ribs[k][1]];
      }
   }
}

Graph.prototype.create = function(nNodes, r)
{
   this.nodes = new Array(nNodes);
   this.ribs  = [];
   let da = 2*Math.PI/nNodes;                     // приращение угла
   for(let i = nNodes; i--; )
      this.nodes[i] = { nm:i, go:[],  
                        x:r+r*Math.cos(da*i + Math.PI/2),  
                        y:r-r*Math.sin(da*i + Math.PI/2)
                      };
}

Graph.prototype.addNode = function(go, nm)
{
   this.nodes.push( {nm:nm, go:go} );
   return this.nodes.length-1;
}

Graph.prototype.addRib = function(i, j)
{
   if(!this.isRib(i,j)){
      let n = this.nodes[i];
      if(!n.go) n.go = [j];
      else      n.go.push(j);
      return true;
   }
   return false;
}

Graph.prototype.bind = function(i, j)
{
   this.addRib(i,j);
   this.addRib(j,i);
}

Graph.prototype.insertNode = function(i, j, pos)
{
   if(!pos) pos = 0.5;

   if(this.isRib(i,j)){
       this.delRib(i,j);
       this.delRib(j,i);
   }
   let k = this.addNode([i,j], this.nodes.length);
   this.addRib(i,k);  this.addRib(j,k);
   let n = this.nodes[k], ni=this.nodes[i], nj=this.nodes[j];
   n.x = nj.x * pos + ni.x * (1-pos); 
   n.y = nj.y * pos + ni.y * (1-pos);    
   return k;
}

Graph.prototype.delNode = function(id, chngNm)
{
   let k = 0;
   for(let i = 0; i < this.nodes.length; i++)
      if( i === id )
         this.nodes[i].k = -1;
      else
         this.nodes[i].k = k++;
  
   let nodes = [];
   for(let i = 0; i < this.nodes.length; i++){
      let n = this.nodes[i];
      if(n.k < 0)
         continue;

      let go = [];
      if(n.go)
      for(let k=0; k < n.go.length; k++)
         if(this.nodes[n.go[k]].k >= 0)
            go.push(this.nodes[n.go[k]].k);
      nodes.push({nm:chngNm? nodes.length:n.nm, x:n.x, y:n.y, go: go});      
   }
   this.nodes = nodes;
}

Graph.prototype.numNodes = function()
{
   return this.nodes.length;
}

Graph.prototype.numRibs = function()
{
   let num=0;   
   for(let i=this.nodes.length; i-- ; )
      num += (this.nodes[i].go? this.nodes[i].go.length: 0);
   return num;
}

Graph.prototype.isRib = function(i, j)
{
   let go = this.nodes[i].go;
   if(go)   
      for(let k=go.length; k--; )
         if(go[k]===j)
            return true;
   return false;
}

Graph.prototype.delRib = function(i, j)
{
   let go = this.nodes[i].go;
   if(go)   
      for(let k=go.length; k-- ; )
         if(go[k]===j){
            go.splice(k, 1);
            return true;
         }
   return false;
}

Graph.prototype.fullConnect = function()
{
   for(let k = 0; k < this.nodes.length; k++){
      this.nodes[k].go = new Array(this.nodes.length-1);
      let n = 0;
      for(let i = 0; i < this.nodes.length; i++)
         if(i !== k )
            this.nodes[k].go[n++] = i;
   }
}

Graph.prototype.createHole = function(x, y, r, R)
{
   let k = 0;
   for(let i = 0; i < this.nodes.length; i++){
      let n = this.nodes[i];
      if( (r>0 && (n.x-x)*(n.x-x)+(n.y-y)*(n.y-y) < r*r) 
        ||(R!==undefined && R>0 && (n.x-x)*(n.x-x)+(n.y-y)*(n.y-y) > R*R) )
         n.k = -1;
      else
         n.k = k++;
   }
   this.deleteNegativeK();   
}

Graph.prototype.createHoleGo = function(s, r, R)
{
   let k = 0;
   for(let i = 0; i < this.nodes.length; i++){
      let n = this.nodes[i];
      if( (r>0 && n.dist < r) 
        ||(R!==undefined && R>0 && n.dist > R) )
         n.k = -1;
      else
         n.k = k++;
   }
   this.deleteNegativeK();
}

Graph.prototype.deleteNegativeK = function()
{
   let nodes = [];
   for(let i = 0; i < this.nodes.length; i++){
      let n = this.nodes[i];
      if(n.k < 0)
         continue;

      let go = [];
      if(n.go)
      for(let k=0; k < n.go.length; k++)
         if(this.nodes[n.go[k]].k >= 0)
            go.push(this.nodes[n.go[k]].k);
      nodes.push( {nm:nodes.length, x:n.x, y:n.y, go: go});      
   }
   this.nodes = nodes;
}

Graph.prototype.setDistGo = function(s)
{
   for(let k = this.nodes.length; k--; )
      this.nodes[k].dist = -1;
   this.nodes[s].dist = 0;
   let lst = new List();
   lst.push(s);
   while(lst.length){  
      let c = lst.shift();
      let nc = this.nodes[c];
      
      for(let k = nc.go.length; k--; ){
         let n = this.nodes[nc.go[k]];
         if(n.dist >=0)
            continue;
         n.dist = nc.dist + (nc.d && nc.d.length===nc.go.length? nc.d[k]: 1);
         lst.push(nc.go[k]);
      }   
   }
}

Graph.prototype.set = function(par, val)
{
   for(let i=this.nodes.length; i--; )
       this.nodes[i][par] = val;
}

Graph.prototype.createGrid = function(w,h, len, oneway)
{
   this.nodes = new Array(w*h);
   this.ribs  = [];
   let k = 0;
   for(let j = 0; j < h; j++){
      for(let i = 0; i < w; i++){
         let n = this.nodes[k] = { nm:k, go:[], x:i*len, y:j*len };
         if(i   > 0 && !oneway) n.go.push( (i-1) + w*j );
         if(i+1 < w)            n.go.push( (i+1) + w*j );
         if(j   > 0 && !oneway) n.go.push(  i    + w*(j-1) );
         if(j+1 < h)            n.go.push(  i    + w*(j+1) );         
         k++;
      }
   }
}

Graph.prototype.createHex = function(w,h, len)
{
   this.nodes = new Array(w*h);
   this.ribs  = [];
   let k = 0, sh=0, dy = len*Math.sqrt(3)/2;
   for(let j = 0; j < h; j++){
      let dx = sh? len/2 : 0;
      
      for(let i = 0; i < w; i++){
         let n = this.nodes[k] = { nm:k, go:[], x:i*len+dx, y:j*dy };
         if(i   > 0 ) n.go.push( (i-1) + w*j );
         if(i+1 < w)  n.go.push( (i+1) + w*j );
         if(j   > 0 ){ 
            n.go.push(  i + w*(j-1) );
            if(i   > 0 ) n.go.push( (i-1+sh) + w*(j-1) );
            if(i+1 < w)  n.go.push( (i+sh) + w*(j-1) );
         }
         if(j+1 < h) {
            n.go.push(  i    + w*(j+1) );   
            if(i   > 0 ) n.go.push( (i-1+sh) + w*(j+1) );
            if(i+1 < w)  n.go.push( (i+sh) + w*(j+1) );            
         }           
         k++;
      }
      sh = (sh+1)%2;
   }
}

Graph.prototype.createTriangle = function(num, len)
{
   this.nodes = [                                 // начальный равносторонний треугольник
      { nm:0, go:[1,2], x:len*0.5, y:0 },
      { nm:1, go:[0,2], x:0,       y:len*0.866 },
      { nm:2, go:[0,1], x:len,     y:len*0.866 }
   ];
   this.ribs  = [];                               // очищаем массив рёбр
   this.createTri(num, 0,1,2);                    // вызываем рекурсивную функцию
}

Graph.prototype.createTri = function(num, k0, k1, k2)
{
   if(num <= 0)                                   // рекурсия закончилась 
      return;
   
   let k3 = this.insertNode(k0,k1);   this.nodes[k3].nm = k3;
   let k4 = this.insertNode(k1,k2);   this.nodes[k4].nm = k4;
   let k5 = this.insertNode(k0,k2);   this.nodes[k5].nm = k5;

   this.bind(k3,k5);                              // связываем двухсторонним ребром
   this.bind(k3,k4);   
   this.bind(k4,k5); 
   this.createTri(num-1, k0, k3, k5);             // для каждого из 3-х треугольников
   this.createTri(num-1, k3, k1, k4);
   this.createTri(num-1, k5, k4, k2);
}

Graph.prototype.createTriangle2 = function(num, len)
{
   this.nodes = [
      { nm:0, go:[1,2], x:len*0.5, y:0 },
      { nm:1, go:[0,2], x:0,       y:len*0.866 },
      { nm:2, go:[0,1], x:len,     y:len*0.866 }
   ];
   this.ribs  = [];
   this.createTri2(num, 0,1,2);  
}
Graph.prototype.createTri2 = function(num, k0, k1, k2)
{
   if(num <= 0)
      return;
   
   let rate = (2*num-1)/(4*num-1);
   let k3 = this.insertNode(k0,k1,rate);           this.nodes[k3].nm = k3;
   let k4 = this.insertNode(k1,k3,rate/(1-rate));  this.nodes[k4].nm = k4;   
   let k5 = this.insertNode(k1,k2,rate);           this.nodes[k5].nm = k5;
   let k6 = this.insertNode(k2,k5,rate/(1-rate));  this.nodes[k6].nm = k6;
   let k7 = this.insertNode(k2,k0,rate);           this.nodes[k7].nm = k7;
   let k8 = this.insertNode(k0,k7,rate/(1-rate));  this.nodes[k8].nm = k8;

   this.bind(k3,k8);   
   this.bind(k4,k5);   
   this.bind(k6,k7); 
   
   this.createTri2(num-1, k0, k3, k8);
   this.createTri2(num-1, k4, k1, k5);
   this.createTri2(num-1, k7, k6, k2);
}

Graph.prototype.delRibs = function(prob, ribs)
{
   for(let i=this.nodes.length; i--; ){
      if(Math.random() > prob)
         continue;
      let n = this.nodes[i];
      if(!n.go || !n.go.length)
         continue;
      let num = 1+Math.floor(Math.random()*Math.min(ribs, n.go.length));
      for(let k=0; k < num; k++){
         let j = n.go[Math.floor(Math.random()*n.go.length)]; // случайное ребро
         this.delRib(j, i);                                // удаляем в обе строны
         this.delRib(i, j);
      }
   }
}

Graph.prototype.swapRibs = function(prob, ribs)
{
   for(let i=this.nodes.length; i-- ; ){
      if(Math.random() > prob)
         continue;
      let n = this.nodes[i];
      if(!n.go || !n.go.length)
         continue;
      let num = 1+Math.floor(Math.random()*Math.min(ribs, n.go.length));
      for(let k=0; k < num; k++){
         let j = n.go[Math.floor(Math.random()*n.go.length)]; // случайное ребро
         this.delRib(i, j);                                // удаляем в ту строну
         this.addRib(j, i);                                   // вставляем в обратную
      }
   }
}

Graph.prototype.createOn = function()
{
   for(let i=this.nodes.length; i--; )
      this.nodes[i].on = [];
   
   for(let i=this.nodes.length; i--; )
      if(this.nodes[i].go)
         for(let k=this.nodes[i].go.length; k--; )
            this.nodes[this.nodes[i].go[k]].on.push(i);
}

Graph.prototype.createDist = function()
{
   for(let i=this.nodes.length; i--; ){
      let n = this.nodes[i];
      if(n.go && n.go.length){
         this.nodes[i].d = new Array(n.go.length);
         for(let j=n.go.length; j--; ){
            let dx = n.x - this.nodes[n.go[j]].x, dy = n.y - this.nodes[n.go[j]].y;
            this.nodes[i].d[j] = Math.floor(Math.sqrt(dx*dx+dy*dy));
         }
      }
   }
}

Graph.prototype.translate = function(dx, dy)
{
   for(let k = this.nodes.length; k--; ){
      this.nodes[k].x += dx;
      this.nodes[k].y += dy;
   }   
}

Graph.prototype.scale = function(sx, sy)
{
   for(let k = this.nodes.length; k--; ){
      this.nodes[k].x *= sx;
      this.nodes[k].y *= sy;
   }   
}

Graph.prototype.searchPathBeg = function(i, j)
{
   if(i===j)                  // начало и конец совпадают
      return  1;              // путь "найден"
      
   if( !this.nodes[i].go || this.nodes[i].go.length===0 )
      return -1;              // узел изолированный
   
   this.lstWas = {};          // таблица просмотренных узлов  (стоит заменить на BST)
   this.lstNxt = new List();  // список узлов границы поиска 
   this.nodeSrc = i;          // начальный узел
   this.nodeDes = j;          // целевой узел
   
   this.set("chk", 0);        // для визуализации всем узлам делаем пометку chk:0
   this.nodes[i].chk = 1;     // стартовый и конечный узлы нарисуем красным
   this.nodes[j].chk = 1;
   
   this.lstNxt.push(i);       // помещаем стартовый узел в список
   this.lstWas[i] = i;        // и запоминаем, что мы в нём были
   
   return 0;                  // путь пока не найден
}

Graph.prototype.searchPathRun = function()
{
   if(!this.lstNxt.length)
      return -1;                                  // поиск закончился неудачей
   
   let k = this.lstNxt.shift();                   // берём узел из начала списка
   let n = this.nodes[k];
   if( k!== this.nodeSrc) n.chk = 3;              // красим его (для визуализации)
   
   if(!n.go || !n.go.length)                      // если нет рёбер,
      return 0;                                   // из него не выйти
   
   for(let i=n.go.length; i--; ){                 // для каждого соседа nxt
      let nxt = n.go[i];
     
      if(this.lstWas[nxt] !== undefined )                 
         continue;                                // этот узел уже был
      
      this.lstNxt.push(nxt);                      // помещаем в конец списка
      this.lstWas[nxt] = k;                       // помним, что в n.go[i] попали из узла k
      
      if(nxt === this.nodeDes)                    // дошли до целевого угла
         return 1;                                // поиск окончен
      
      this.nodes[nxt].chk = 2;                    // помечаем узел (для визуализации)
   }
   
   return 0;                                      // продолжаем поиск
}

Graph.prototype.searchPathEnd = function()
{
   let path = []; 
   if(this.lstWas[this.nodeDes] === undefined )   // не достигли целевого угла,
      return path;                                // путь не был найден
   
   let k = this.nodeDes;                          
   path.push(k);                                  // начиная от целевого узла,
   while( (k = this.lstWas[k]) !== this.nodeSrc ) // составляем путь
      path.push(k);                                
   path.push(k);                                  // стартовый узел
         
   this.lstWas = null; this.lstNxt = null;        // очищаем списки
   path.reverse();                                // переворачиваем (от src к des)
   return path;
}

Graph.prototype.searchPathDirBeg = function(i, j)
{
   let res = this.searchPathBeg(i,j);
   if(res)
      return res;
   
   this.lstNxt = new List();                      // очередь узлов к рассмотрению
   this.lstNxt.lt = function (a, b) {             // сортировка по расстоянию
      return a.d < b.d; 
   }                 
   this.lstNxt.unshift( {n:i, d:this.searchDist(i, j) } ); // стартовый узел с расстоянием
      
   return 0;                  // путь пока не найден   
}

Graph.prototype.searchDist = function(i, j)
{
   let a  = this.nodes[i];
   let b  = this.nodes[j];
   return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}


Graph.prototype.getJSON = function(del)
{
   let res = "[\n";
   for(let i=0; i < this.nodes.length; i++){
      let n =  this.nodes[i];
      let st = JSON.stringify(n);
      if(del) st= st.replace(/\"(\w+)\":/g, '$1:');      
      res +=  st + (i+1<this.nodes.length?',\n':'\n');
   }
   return res+"]";
}


Graph.prototype.getSVG = function()
{
   let draw = new Draw();
   this.plot(draw);
   let r = this.getRect();  
   draw.transformAll(-r.x1+2, -r.y1+2);
   return draw.getSVG(r.x2-r.x1+4, r.y2-r.y1+4 );   
}

Graph.prototype.plotCanvas = function(id, orX, orY, clear)
{
   let draw = new Draw(id);
   if(clear)
     draw.clear();
   this.plot(draw, orX, orY);
}

Graph.prototype.getNodeRect = function(i)
{
   let n = this.nodes[i];
   let svg = Graph.svg;
   let  w = n.nm? Math.max(svg.w, svg.chW*(""+n.nm).length): svg.h;  // ширина ящика
   let  h = svg.h;
   if(n.svg){
      w = parseFloat(n.svg.substr(n.svg.search(/width=\"\d+/)+7, 10)) + +svg.h/2;
      h = parseFloat(n.svg.substr(n.svg.search(/height=\"\d+/)+8, 10));      
      h = Math.max(h, svg.h);
   }      
   return {x1: n.x-w/2, y1:n.y-h/2, x2: n.x+w/2, y2: n.y+h/2 };
}

Graph.prototype.getRect = function()
{
   let r = { x1:Infinity, y1:Infinity, x2:-Infinity, y2:-Infinity };
   
   for(let i=0; i < this.nodes.length; i++){
      let nr = this.getNodeRect(i);      
      if(nr.x1 < r.x1) r.x1 = nr.x1;
      if(nr.x2 > r.x2) r.x2 = nr.x2;
      if(nr.y1 < r.y1) r.y1 = nr.y1;
      if(nr.y2 > r.y2) r.y2 = nr.y2;      
   }
   return r;
}

Graph.prototype.plot = function(draw, orX, orY)
{
   let svg = Graph.svg;
   //draw.clear();
   if(draw.ctx)
      draw.transformBeg(orX, orY);
   
   this.plotRibs(draw);                           // рисуем рёбра
   if(svg.showD)
      this.plotDists(draw);                       // подписываем расстояния
   
   this.plotNodes(draw);                          // рисуем узлы

   if(this.labels && this.labels.length)
      this.plotLabels(draw);                      // выводим пометки, если они есть   
   
   if(draw.ctx)
      draw.transformEnd();
}
Graph.svg = {
   h    : 21,             // высота ящика для узла
   w    : 21,             // минимальная ширина ящика для узла
   chW  : 10,             // ширина буквы 
   arrW : 3,              // ширина стрелки
   pointR: 2,             // размер точки, если узел не кружок (!showNm)
   showNm : true,         // показывть имя узла в кружочке
   showD  : true,         // показывть расстояние (длину ребра)
   cFill: "#FFC",         // цвет заливки
   cText: "#069",         // цвет текста
   sText: 16,             // размер шрифта имён узлов 
   sDist: 10,             // размер шрифта длин рёбер
   cLine: "#000",         // цвет линий
   wLine: 1,              // ширина линий рёбер
   shwBox: true,          // показывать ящик вокруг узла
   colors: [],            // массив цветов заливки узлов по номеру свойства chk узла   
};
Graph.prototype.plotRibs = function(draw)
{
   let svg = Graph.svg;
   for(let i=0; i < this.nodes.length; i++){
       let n =  this.nodes[i];
       if(n.go){
          for(let k=0; k < n.go.length; k++){
             let j = n.go[k];                     // ребро из i в j
             let c = this.nodes[j];               // узел куда идёт стрелка
             let fill = (n.chk === undefined || n.chk >= svg.colors.length
                     ||  c.chk === undefined || c.chk != n.chk || n.chk===0)? svg.cLine: svg.colors[n.chk];
             if(n.w && k < n.w.length)
                 draw.widthLine(n.w[k]);          // массив толщин линий
             else
                 draw.widthLine(svg.wLine);       // по умолчанию - толщина линии
             draw.colorLine(fill);
             let isBack = this.isRib(j, i);       // есть ли обратная связь
             if(j > i || !isBack )                // ребро рисуем один раз
                draw.line(n, this.nodes[j]);


                let x2 = c.x, y2 = c.y;
                let x = (n.x+x2)/2, y = (n.y+y2)/2;
                let nx = y2-y, ny = -(x2-x);
                let len1 = Math.sqrt(nx*nx+ny*ny);

                //draw.text(n.edgestart[k], x + 0.95*nx*svg.sDist/len1, y+0.95*ny*svg.sDist/len1);

                draw.text(n.edgestart[k], x + 0.75*nx*svg.sDist/len1, y+0.75*ny*svg.sDist/len1);

                // draw.text1("-9", n.x, n.y-30, c.x,  c.y);
                // draw.text1("5", n.x, n.y+30, c.x,  c.y);
                //draw.text1("fghvjbj", (n.x+c.x)/2, ((n.y+c.y)-50)/2);

                let dx = c.x-n.x, dy = c.y-n.y;
                let len = Math.sqrt(dx*dx+dy*dy);
                let r = svg.h/2;                    // ?
                dx *= r/len; dy *= r/len;
                //draw.transformBeg(c.x-dx, c.y-dy, Math.PI/2+Math.atan2(dy,dx) )
                //draw.text("99999", svg.arrW, 3*svg.arrW);

             if(!isBack){
                let dx = c.x-n.x, dy = c.y-n.y;
                let len = Math.sqrt(dx*dx+dy*dy);
                let r = svg.h/2;                    // ?
                dx *= r/len; dy *= r/len;
                //draw.text("99999", c.x-dx, c.y-dy);

                draw.transformBeg(c.x-dx, c.y-dy, Math.PI/2+Math.atan2(dy,dx) )
                   draw.line(0, 0,  svg.arrW, 3*svg.arrW);
                   draw.line(0, 0, -svg.arrW, 3*svg.arrW);

                draw.transformEnd();
             }
          }
       }//  if(n.go)
   }
}

Graph.prototype.plotDists = function(draw)
{
   let svg = Graph.svg;
   draw.sizeText(svg.sDist);
   for(let i=0; i < this.nodes.length; i++){      
      let n =  this.nodes[i];
      if(n.go && n.d && n.d.length===n.go.length){  // заданы длины рёбер
         for(let k=n.go.length; k--; )
            if(!this.isRib(n.go[k],i) || n.go[k] < i){
               let x2 = this.nodes[n.go[k]].x, y2 = this.nodes[n.go[k]].y;
               let x = (n.x+x2)/2, y = (n.y+y2)/2;
               let nx = y2-y, ny = -(x2-x);
               let len = Math.sqrt(nx*nx+ny*ny);
               draw.text(n.d[k], x + 0.75*nx*svg.sDist/len, y+0.75*ny*svg.sDist/len);
            }
      }    
   }   
}

Graph.prototype.plotNodes = function(draw)
{
   let svg = Graph.svg;
   draw.widthLine(1);                             // по умолчанию - единичная толщина линии
    
   draw.sizeText(svg.sText);    
   for(let i=0; i < this.nodes.length; i++){      //----------------------- рисуем узлы:
      let n = this.nodes[i];
      let fill = (n.chk === undefined || n.chk >= svg.colors.length)? svg.cFill: svg.colors[n.chk];
      let w, h=svg.h, svgH, svgW;
      if(svg.showNm){
         w = n.nm? Math.max(svg.w, svg.chW*(""+n.nm).length): svg.h;  // ширина ящика
         if(n.svg){
            svgW = parseFloat(n.svg.substr(n.svg.search(/width=\"\d+/)+7, 10)) ;
            svgH = parseFloat(n.svg.substr(n.svg.search(/height=\"\d+/)+8, 10));      
            w = svgW+svg.h/2;            
            h = Math.max(svgH, svg.h);
         }
         draw.colorLine(svg.cLine);
         draw.colorFill(fill);
         if(svg.shwBox)
            draw.box(n.x, n.y, w, h, svg.h/2);
      }
      else{
         if(!svg.colors.length) fill = svg.cLine;
         draw.colorFill(fill);
         draw.point(n.x, n.y, svg.pointR);
      }
      if(n.nm !== undefined && svg.showNm){
         let text =  svg.cText;   
         if(fill.length===4 && fill.charAt(0)==='#' ){  // инвертируем цвет текста
            let cr = parseInt(fill.charAt(1),16),  cg = parseInt(fill.charAt(2),16), cb = parseInt(fill.charAt(3),16);
            //text = '#' + (15-cr).toString(16) + (15-cg).toString(16) + (15-cb).toString(16); // инверсия
            let gray = 0.2126 * cr + 0.7152 * cg + 0.0722 * cb; // серый цвет
            text = (gray > 8)? "#000": "#fff";                  // белый или чёрный
         }         
         draw.colorText(text);
         if(n.svg && draw.svg)             
            draw.svg += '<g transform="translate('+(n.x-svgW/2)+' '+(n.y-svgH/2)+')">'+n.svg+'</g>';      
         else
            draw.text(n.nm, n.x, n.y+1);
      }
      
   }// for i по узлам
}

Graph.prototype.plotLabels = function(draw)
{
   let svg = Graph.svg;
   for(let k = this.labels.length; k--; ){
      let lbl = this.labels[k];
      draw.text(lbl.nm, lbl.x, lbl.y);  
   }
}

Graph.prototype.getNode = function(x, y, r)
{
   let nBest = -1, dBest = Infinity;
   for(let i=0; i<this.nodes.length; i++){ //
      let n =  this.nodes[i];      
      let d = (n.x-x)*(n.x-x) + (n.y-y)*(n.y-y);
      if(d < dBest && (r===undefined || d < r*r)){
         dBest = d;
         nBest = i;
      }
   }
   return nBest;
}

Graph.prototype.getNumCross = function()
{
   let ribs = [];
   for(let i=0; i<this.nodes.length; i++){
      let n = this.nodes[i];
      if(n.go)
      for(let j=0; j < n.go.length; j++){             // lines from node n to node c
         let c = this.nodes[n.go[j]];
         ribs.push({n1: {x: n.x, y: n.y}, n2: {x: c.x, y: c.y} });
       }
   }

   //let ctx = canvas.getContext('2d');
   let num = 0, point = {};
   for(let i=0; i<ribs.length; i++){
      for(let j=i+1; j<ribs.length; j++){
         if(G2D.intersectSegments(ribs[i].n1, ribs[i].n2, ribs[j].n1, ribs[j].n2, point)){
            num++;
            //G2D.plotCircle(point.x, point.y, 3);
         }
      }
   }
   return num;
}

Graph.prototype.getSigmaRibs = function()
{
   let ribs = [];
   for(let i=0; i < this.nodes.length; i++){
      let n =  this.nodes[i];
      if(n.go)
      for(let j=0; j < n.go.length; j++){             //
         let c = this.nodes[n.go[j]];
         let len = Math.sqrt(MS.sqr(n.x-c.x)+MS.sqr(n.y-c.y));
         ribs.push(len);
         //console.log("len["+i+"]="+len);
       }
   }
   let aver = 0, disp=0;
   for(let i in ribs)
      aver += ribs[i];
   aver /= ribs.length;
   for(let i in ribs)
      disp += MS.sqr(ribs[i]-aver);
   disp /= ribs.length;

   return Math.sqrt(disp);
}

Graph.prototype.getDistNodesToRibs = function()
{
   //let minD = Infinity;
   let num = 0;
   for(let i=0; i<this.nodes.length; i++){
      let n =  this.nodes[i];
      if(n.go)
      for(let j=0; j < n.go.length; j++){
         let c = this.nodes[n.go[j]];
         for(let k=0; k < this.nodes.length; k++){
            if(k==i || k==n.go[j])                     // skip ends of rib
               continue;
            let p =  this.nodes[k];
            let d = distToSegment(p.x,p.y,  n.x,n.y, c.x,c.y);
            if(d>=0 && d<this.nodeR)
               nim++;
         }
       }
   }
   return num;
}

Graph.prototype.getDistBetweenNodes = function()
{
   return num;
}

Graph.prototype.value = function (canvas)
{
   return Math.floor(1000*this.getNumCross()+this.getSigmaRibs());
}

Graph.prototype.setGraphPos = function (canvas)
{
   let pos = new Array(this.nodes.length);
   for(let i=0; i < this.nodes.length; i++){                          // set nodes coordinates:
      let x, y;
      for(let num = 0; num < 100; num++){
          x = this.nodeR + MS.rand(canvas.width-2*this.nodeR);
          y = this.nodeR + MS.rand(canvas.height-2*this.nodeR);
          let ok = true;
          for(let j=0; j<i; j++){                     //
             if( (x-pos[j].x)*(x-pos[j].x) + (y-pos[j].y)*(y-pos[j].y) < 16*this.nodeR*this.nodeR ){
                ok = false;
                break;
              }
          }
          if(ok)
             break;
      }
      pos[i]={"x":x, "y":y };
   }

   let i=0;
   for(let i=0; i < this.nodes.length; i++){
      let n =  this.nodes[i];
      n.x = pos[i].x;
      n.y = pos[i].y;
   }
}