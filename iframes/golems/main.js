(()=>{let e=e=>{let t=[];for(let l in e){let i="";for(let e=0;e<l.length;e++){let t=l[e],n=t.toLowerCase();i+=t===n?t:"-"+n}t.push(`${i}:${e[l]}`)}return t.join(";")},t={ce:function(t,l){var i;let n=[],a=null==l?void 0:l.style;a&&(l.style=e(a));let r=Array.prototype.slice.call(arguments,2);for(let e=0;e<r.length;e++){let t=r[e];if("string"==typeof t||"number"==typeof t)n.push(U(t));else if(void 0!==(null===(i=t)||void 0===i?void 0:i.length))for(let e=0;e<t.length;e++)t[e]&&n.push(t[e]);else n.push(t)}return W(t,l||{},n)}},l=e=>{let t=Z();if(3===(null==t?void 0:t.lvl))return void i();let l=ce(t?t.lvl+1:0);Q(l),te(e),e.maxDeploy++,a(l,e),e.units.forEach((e=>{e.hp>0&&(e.hp=e.mhp),e.state=we.IDLE,e.disabled=!1}))},i=()=>{Q(null),it()};window.addEventListener("load",(async()=>{await Promise.all([H([["packed","packed.png",16,16,2,2,["misc1","terrain1","map1","actors1"]]])]),j(),r(),(()=>{q(!1),it(),window.running=!0;let e=()=>{let t=Z();Se(),t&&d(t),window.running&&requestAnimationFrame(e)};e()})()}));let n=async e=>new Promise((t=>{setTimeout(t,e)})),a=(e,t)=>{e.phase=ae.DEPLOY,e.ui.deploy.unitI=0,e.ui.deploy.mapVis=!1,t.units=t.units.concat(e.template.playerUnits.map((t=>{let l=Ie(t,0,0,!1);for(let t=0;t<e.lvl;t++){let e=E();m(l,e),l.lvl++}return l}))).sort(((e,t)=>e.name<t.name?-1:1)),it()},r=()=>{let e=Xe("canv");e&&(e.onmousedown=e.ontouchstart=t=>{let{offsetX:i,offsetY:n}=t;if(void 0===i){let l=e.getBoundingClientRect(),{clientX:a,clientY:r}=t.touches[0];i=a-l.left,n=r-l.top}let a=K(),r=n/a,s=Math.floor(i/a/re),o=Math.floor(r/re),u=Z();u?u.phase===ae.PLAYER?((e,t,l)=>{let i=de(e,t,l);if(i&&i!==e.ui.activeUnit)i.allegiance===xe.ENEMY?(e.ui.enemy=i===e.ui.enemy?null:i,Qe(e.ui.enemy?"select":"cancel")):i.state===we.IDLE?(e.ui.activeUnit=i,Qe("select4")):(e.ui.player=i===e.ui.player?null:i,e.ui.activeUnit=null,Qe("select"));else{if(e.ui.activeUnit){let i=e.ui.activeUnit,n=Ne(i,e,[t,l]);n?(Qe("select"),t===i.x&&l===i.y?(e.ui.lastPos=[t,l],e.ui.activeUnit.path.i=0,Qe("rdy"),he(e,ae.WAITING_ACTION),it()):h(e,i,n).then((()=>{Qe("rdy"),he(e,ae.WAITING_ACTION),it()}))):(Qe("cancel"),e.ui.activeUnit=null)}else e.ui.enemy&&Qe("cancel");e.ui.player=null,e.ui.enemy=null}it()})(u,s,o):u.phase===ae.SELECT_ENEMY?((e,t,l)=>{let i=de(e,t,l);if(i){let t=e.ui.selUnits.indexOf(i);t>-1&&(Qe("select"),e.ui.selUnitI=t,it())}})(u,s,o):u.phase===ae.SELECT_TILE||u.phase===ae.DEPLOY&&((e,t,l)=>{let[i,n,a,r]=e.deploy,s=le();if(s){let o=s.units[e.ui.deploy.unitI],u=e.ui.deploy.mapVis;t>=i&&t<a&&l>=n&&l<r&&!u&&(Qe("select3"),((e,t,l,i)=>{let n=e.units.includes(t),a=de(e,l,i);if(a)if(n)a.x=t.x,a.y=t.y;else{let t=e.units.indexOf(a);e.units.splice(t,1)}if(a!==t){t.x=l,t.y=i;let a=le(),r=Ee(e,xe.PLAYER).length;n||(r<a.maxDeploy?e.units.push(t):Qe("cancel"))}})(e,o,t,l))}let o=de(e,t,l);o&&e.ui.deploy.mapVis?o.allegiance===xe.ENEMY&&(e.ui.enemy=o===e.ui.enemy?null:o,Qe(e.ui.enemy?"select":"cancel")):(e.ui.enemy&&Qe("cancel"),e.ui.enemy=null),it()})(u,s,o):(Qe("select4"),(()=>{let e=ne();te(e),l(e)})())})},s=(e,t)=>e[1]*t+e[0]%t,o=(e,t)=>{let[l,i]=e,[n,a]=t;return Math.sqrt(Math.pow(n-l,2)+Math.pow(a-i,2))},u=9999999,c=(e,t,l,i)=>{let n={path:[]},a=((e,t)=>({width:e.w,height:e.h,nodes:e.tiles.map((l=>{let i=l.wall,n=de(e,l.x,l.y);return n&&n.allegiance!==t&&(i=!0),{hCost:u,cost:u,isWall:i,x:l.x,y:l.y,connections:[],tile:l,visited:!1}}))}))(l,i);((e,t,l)=>{if(!l.nodes[s(t,l.width)])throw Error("");l.nodes.forEach((e=>{e.visited=!1,e.connections=((e,t)=>{let l=t.nodes[s([e.x,e.y-1],t.width)],i=t.nodes[s([e.x-1,e.y],t.width)],n=t.nodes[s([e.x,e.y+1],t.width)],a=t.nodes[s([e.x+1,e.y],t.width)];return e.isWall?[]:[l,i,n,a].filter((e=>!!e&&!e.isWall)).map((e=>({node:e,cost:1})))})(e,l)}))})(0,t,a);let r=a.nodes[s(e,a.width)];if(!r)throw Error("");let c=a.nodes[s(t,a.width)];if(!c)throw Error("");if(r===c)return n.path=[[r.x,r.y]],n;if(c.isWall)return n;let d=[r];r.cost=0,r.hCost=0;let p=0;for(;d.length&&p<500;){let e=d.shift();if(e===c)break;if(!e)break;for(let t=0;t<e.connections.length;t++){let{node:l,cost:i}=e.connections[t],n=e.cost+i;n<l.cost&&(l.cost=n,l.hCost=n+o([l.x,l.y],[c.x,c.y]),l.parent=e,d.includes(l)||d.push(l))}d=d.sort(((e,t)=>e.hCost<t.hCost?-1:1)),p++}if(1e3===p||!c.parent)return n;let h=c;do{n.path.push([h.x,h.y]),h=h.parent}while(h&&h.parent);return n.path=n.path.reverse(),n},d=e=>{me(e);let t=K();He(e,t,0,0)},p=async(e,t,a)=>{await a.cb(t,e)?(async(e,t)=>{var a;let r=Ee(e,e.turn).every((e=>e.state!==we.IDLE)),s=le();t.disabled=!0;let o=e.ui.selUnits[e.ui.selUnitI],u=!1;for(let t=0;t<e.units.length;t++){let l=e.units[t];if(l.hp<=0){if(e.particles.push(ie(l.x,l.y,"KO!",750)),e.units.splice(t,1),s){let e=s.units.indexOf(l);e>-1&&s.units.splice(e,1)}u=!0,t--}}u&&(Qe("ko"),await n(750),t.hp>0&&t.allegiance===xe.PLAYER?await f(e,t):(null==o?void 0:o.hp)>0&&(null==o?void 0:o.allegiance)===xe.PLAYER&&await f(e,o));let c=Ee(e,xe.PLAYER),d=Ee(e,xe.ENEMY);if(!c.length)return Qe("lose"),e.conclusion=!1,e.phase=ae.CONCLUDED,it(),await n(3e3),void i();if(!d.length){Qe("win"),e.conclusion=!0,e.phase=ae.CONCLUDED,it(),await n(3e3);let t=le();return void l(t)}let E=9===(null===(a=pe(e,t.x,t.y))||void 0===a?void 0:a.id);e.tiles.forEach((l=>{(E||t.btn&&!E)&&(7===l.id?fe(e,l.x,l.y,8):8===l.id&&fe(e,l.x,l.y,7))})),t.btn=E,e.ui.activeUnit=null,it();let m=ye(e,[t.x,t.y]),g=m.map((e=>e.id));if(g.includes(5)){be(t,4),e.particles.push(ie(t.x,t.y,"+4",750));let l=m[g.indexOf(5)];Qe("miss"),await n(1e3),fe(e,l.x,l.y,1),await n(250)}if(g.includes(4)){be(t,-4),e.particles.push(ie(t.x,t.y,"-4",750));let l=m[g.indexOf(4)];Qe("hit"),await n(1e3),fe(e,l.x,l.y,1),await n(250)}r?(it(),await n(300),Qe("endTurn"),await n(300),(e=>{e.turn=e.turn===xe.PLAYER?xe.ENEMY:xe.PLAYER,Ee(e,e.turn).forEach((e=>{Ce(e,we.IDLE)}));for(let t=0;t<e.units.length;t++)e.units[t].disabled=!1;he(e,e.turn===xe.PLAYER?ae.PLAYER:ae.ENEMY),e.ui.enemy=null,e.ui.player=null,it(),e.turn===xe.ENEMY&&(async e=>{let t=Ee(e,xe.ENEMY);for(let l=0;l<t.length;l++){let i=t[l];e.ui.activeUnit=i,e.ui.enemy=null;let a=Me(i,e);if(he(e,ae.ENEMY),it(),a.length){await n(750);let t=a.sort(((e,t)=>{if("Medica"===e.unit.name)return-1;if("Medica"===t.unit.name)return 1;let[l]=y(i,e.unit),[n]=y(i,t.unit);if(l>n)return-1;if(l<n)return 1;{let[l]=v(i,e.unit),[n]=v(i,t.unit);return l>n?-1:1}})),{unit:l,tile:r}=t[0],s=Ne(i,e,[r.x,r.y]);if(s){await h(e,i,s);let t=p(e,i,I(x));e.ui.selUnits=[l],e.ui.selUnitI=0,n(1e3).then((()=>{e.ui.unitClickCb(l)})),it(),await t,await n(250)}else await p(e,i,I(A))}else await n(150),await p(e,i,I(w))}})(e)})(e)):(he(e,e.turn===xe.PLAYER?ae.PLAYER:ae.ENEMY),it())})(e,t):(he(e,ae.WAITING_ACTION),it())},h=(e,t,l)=>(he(e,ae.MOVING),it(),e.ui.lastPos=[t.x,t.y],new Promise((e=>{Le(t,l,e)}))),E=()=>{let e=["POW","FOR","EVA","MOV","hp"],t={};for(let n=0;n<2;n++){let n=(void 0,(l=e)[(i=l.length,Math.floor(Math.random()*(i-0)+0))]),a=e.indexOf(n);e.splice(a,1),t[n]=1}var l,i;return t},m=(e,t)=>{for(let l in t)e[l]+=t[l],"hp"===l&&(e.mhp+=t[l])},f=async(e,t)=>{if(e.phase=ae.LEVEL,t.ko++,t.ko===t.lvl){t.ko=t.lvl-1,it(),await n(1e3);let l=E();t.ko=t.lvl,e.ui.lvl=l,Qe("select2"),it(),await n(3e3),t.ko=0,t.lvl++,m(t,l),it()}else it(),await n(1e3)},y=(e,t)=>{let l=Z(),{POW:i}=e,[n]=Re(t,l,"FOR"),a=i-n,r=!1;return"Lancer"===e.name&&"Blocker"===t.name&&(r=!0,a*=2),"Duelist"===e.name&&0===Oe(t,Z(),t.allegiance).length&&(r=!0,a+=3),Oe(t,l,t.allegiance),[Math.max(a,0),r]},v=(e,t)=>{let l=t.EVA,i=pe(Z(),t.x,t.y),n=!1;return i&&6===i.id&&(n=!0,l+=2),[100-5*l,n]},g=async(e,t,l,i)=>{he(e,ae.BATTLE),it();let{x:a,y:r}=t,{x:s,y:o}=l,[u]=v(t,l),c=100*Math.random()<=u,[d]=y(t,l);await n(350);let[p,h]=((e,t)=>{let l=t[0]-e[0],i=t[1]-e[1];return[l/(Math.abs(l)||1),i/(Math.abs(i)||1)]})([a,r],[s,o]);t.x=t.x+p/2,t.y=t.y+h/2,await n(100),t.x=a,t.y=r,await n(50),c?(Qe("hit"),be(l,-d),e.particles.push(ie(s,o,"-"+d,750))):(Qe("miss"),e.particles.push(ie(s,o,"Miss!",750))),it(),await n(750),!i&&l.state===we.DEFENDING&&l.hp>0&&await g(e,l,t,!0),it(),await n(500),Ce(t,we.WAITING),it()},x=0,w=1,A=2,I=e=>L[e],L=[{name:"Attack",cnd:(e,t)=>Te(e,t).length>0,cb:async(e,t)=>{try{let l=await((e,t)=>(he(e,ae.SELECT_ENEMY),e.ui.selUnitI=0,e.ui.selUnits=t,it(),new Promise(((t,l)=>{e.ui.unitClickCb=e=>{t(e)},e.ui.cancelCb=l}))))(t,Te(e,t));await g(t,e,l)}catch(e){return!1}return!0}},{name:"Defend",cnd:e=>e.path.i<=e.MOV,cb:async e=>(Ce(e,we.DEFENDING),!0)},{name:"Wait",cnd:()=>!0,cb:async e=>(Ce(e,we.WAITING),!0)},{name:"Heal Adj",cnd:(e,t)=>{let l=Math.floor(e.mhp/4),i=Oe(e,t,xe.PLAYER);return e.hp>l&&!!i.length},cb:async(e,t)=>{he(t,ae.WAITING),it(),Qe("select2"),await n(500);let l=Math.floor(e.mhp/4);return Oe(e,t,xe.PLAYER).forEach((e=>{be(e,l),t.particles.push(ie(e.x,e.y,"+"+l,750))})),be(e,-l),t.particles.push(ie(e.x,e.y,"-"+l,750)),Qe("select3"),await n(1e3),Ce(e,we.WAITING),!0}}];var C={},N=[],P=function(e){this.events[e.type](e)},T=e=>null==e?e:e.key,M=(e,t,l,i,n)=>{"key"===t||("o"===t[0]&&"n"===t[1]?((e.events||(e.events={}))[t=t.slice(2)]=i)?l||e.addEventListener(t,P):e.removeEventListener(t,P):!n&&"list"!==t&&"form"!==t&&t in e?e[t]=null==i?"":i:null==i||!1===i?e.removeAttribute(t):e.setAttribute(t,i))},Y=(e,t)=>{var l=e.props,i=3===e.type?document.createTextNode(e.tag):document.createElement(e.tag,{is:l.is});for(var n in l)M(i,n,null,l[n],t);for(var a=0;a<e.children.length;a++)i.appendChild(Y(e.children[a]=b(e.children[a]),t));return e.node=i},O=(e,t,l,i,n)=>{if(l===i);else if(null!=l&&3===l.type&&3===i.type)l.tag!==i.tag&&(t.nodeValue=i.tag);else if(null==l||l.tag!==i.tag)t=e.insertBefore(Y(i=b(i),n),t),null!=l&&e.removeChild(l.node);else{var a,r,s,o,u=l.props,c=i.props,d=l.children,p=i.children,h=0,E=0,m=d.length-1,f=p.length-1;for(var y in n=n||"svg"===i.tag,{...u,...c})("value"===y||"selected"===y||"checked"===y?t[y]:u[y])!==c[y]&&M(t,y,u[y],c[y],n);for(;E<=f&&h<=m&&null!=(s=T(d[h]))&&s===T(p[E]);)O(t,d[h].node,d[h++],p[E]=b(p[E++]),n);for(;E<=f&&h<=m&&null!=(s=T(d[m]))&&s===T(p[f]);)O(t,d[m].node,d[m--],p[f]=b(p[f--]),n);if(h>m)for(;E<=f;)t.insertBefore(Y(p[E]=b(p[E++]),n),(r=d[h])&&r.node);else if(E>f)for(;h<=m;)t.removeChild(d[h++].node);else{var v={},g={};for(y=h;y<=m;y++)null!=(s=d[y].key)&&(v[s]=d[y]);for(;E<=f;)s=T(r=d[h]),o=T(p[E]=b(p[E])),g[s]||null!=o&&o===T(d[h+1])?(null==s&&t.removeChild(r.node),h++):null==o||1===l.type?(null==s&&(O(t,r&&r.node,r,p[E],n),E++),h++):(s===o?(O(t,r.node,r,p[E],n),g[o]=!0,h++):null!=(a=v[o])?(O(t,t.insertBefore(a.node,r&&r.node),a,p[E],n),g[o]=!0):O(t,r&&r.node,null,p[E],n),E++);for(;h<=m;)null==T(r=d[h++])&&t.removeChild(r.node);for(var y in v)null==g[y]&&t.removeChild(v[y].node)}}return i.node=t},b=e=>!0!==e&&!1!==e&&e?e:D(""),k=e=>3===e.nodeType?D(e.nodeValue,e):R(e.nodeName.toLowerCase(),C,N.map.call(e.childNodes,k),1,e),R=(e,t,l,i,n)=>({tag:e,props:t,key:t.key,children:l,type:i,node:n}),D=(e,t)=>R(e,C,N,3,t);let U=D,W=(e,t,l=N)=>R(e,t,Array.isArray(l)?l:[l]);new(window.AudioContext||webkitAudioContext);let V=null,S=null,G=null,_=e=>{let[t,l,i]=$(e.width,e.height);return l.translate(i,0),l.scale(-1,1),l.drawImage(e,0,0),t},F=(e,t,l)=>{let[i,n]=$(e.width,e.height);n.drawImage(e,0,0);let a=n.getImageData(0,0,i.width,i.height),{data:r}=a,[s,o,u]=t;for(let e=0;e<r.length;e+=4){let[t,i,n]=[r[e+0],r[e+1],r[e+2]];t===s&&i===o&&n===u&&(r[e+0]=l[0],r[e+1]=l[1],r[e+2]=l[2])}return n.putImageData(a,0,0),i},B=e=>{let[,,,t,l]=e,[i,n]=$(t,l);return Ge(e,0,0,1,n),i},H=async e=>{let t={},l={};await Promise.all(e.map((([e,i,n,a,r,s,o])=>new Promise((u=>{let c=new Image;c.onload=()=>{t[e]=c,((e,t,l,i,n,a,r)=>{let s=(t,l,i,n,a,r)=>e[t]=[l,i,n,a,r],o=(e,t)=>{let l=F(e,[219,96,76],[224,252,128]);s(t+"_alt",l,0,0,i,n);let a=F(e,[219,96,76],[246,219,186]);s(t+"_disabled",a,0,0,i,n)},u=t.width/i/a,c=t.height/n/r;for(let e=0;e<r;e++)for(let r=0;r<a;r++){let d=l[e*a+r],p=0;for(let l=0;l<c;l++)for(let a=0;a<u;a++){let h=`${d}_${p}`,E=s(`${d}_${p}`,t,r*i*u+a*i,e*n*c+l*n,i,n);o(B(E),h);let m=_(B(E));o(m,h+"_f'"),s(h+"_f",m,0,0,i,n),p++}}})(l,c,o,n,a,r,s),u(void 0)},c.src=i}))))),S=t,G=l},$=(e,t)=>{let l=document.createElement("canvas");l.width=e,l.height=t;let i=l.getContext("2d");return i.imageSmoothingEnabled=!1,[l,i,e,t]},j=()=>{if(V)return V;{let e=K(),[t,l]=$(256*e,240*e);return t.id="canv",l.lineWidth=Math.max(2,e),window.canvasDiv.appendChild(t),V=t,t}},z=e=>(e||j()).getContext("2d"),K=()=>4,X=!1,q=e=>X=e,J=null,Q=e=>J=e,Z=()=>J,ee=null,te=e=>ee=e,le=()=>ee,ie=(e,t,l,i)=>{let n=new We(i);return n.start(),{x:e,y:t,text:l,timer:n}},ne=()=>({maxDeploy:4,units:[]});var ae;!function(e){e[e.DEPLOY=0]="DEPLOY",e[e.ENEMY=1]="ENEMY",e[e.PLAYER=2]="PLAYER",e[e.MOVING=3]="MOVING",e[e.WAITING=4]="WAITING",e[e.WAITING_ACTION=5]="WAITING_ACTION",e[e.SELECT_ENEMY=6]="SELECT_ENEMY",e[e.SELECT_TILE=7]="SELECT_TILE",e[e.BATTLE_FORECAST=8]="BATTLE_FORECAST",e[e.BATTLE=9]="BATTLE",e[e.LEVEL=10]="LEVEL",e[e.CONCLUDED=11]="CONCLUDED"}(ae||(ae={}));let re=16,se={};for(let e=0;e<64;e++)se[e]=[4*e,4*e,4*e];let oe={};for(let e in se)oe[se[e].join("")]=+e;let ue={0:{deploy:[4,12,9,14],playerUnits:[6,2,1,3,4,5,7]},1:{deploy:[27,2,30,4],playerUnits:[4]},2:{deploy:[34,11,37,13],playerUnits:[2]},3:{deploy:[50,11,53,15],playerUnits:[1]}},ce=e=>{let t=[],l=[],i=16,[,n]=$(i,i);Ge("map1_"+e,0,0,1,n);let a=ue[e];if(!a)throw Error("");let{data:r}=n.getImageData(0,0,i,i),s=0;for(let e=0;e<r.length;e+=4){let n=oe[`${r[e+0]}${r[e+1]}${r[e+2]}`]||0,a=s%i,o=Math.floor(s/i);if(n>15){let e=Ie(n-16,a,o,!0);l.push(e),n=0}let u=ge(n,a,o);t.push(u),s++}let o={lvl:e,tiles:t,units:l,particles:[],conclusion:null,deploy:a.deploy.map((e=>e%16)),w:i,h:i,phase:ae.DEPLOY,turn:xe.PLAYER,ui:{activeUnit:null,lastPos:[0,0],enemyRanges:!1,enemy:null,player:null,selUnitI:0,selUnits:[],unitClickCb:()=>{},selTileI:0,selTiles:[],tileClickCb:()=>{},cancelCb:()=>{},lvl:{},deploy:{unitI:0,mapVis:!1}},template:a};for(let t=0;t<e;t++)for(let e=0;e<l.length;e++){let t=E();m(l[e],t),l[e].lvl++}return o},de=(e,t,l)=>{for(let i=0;i<e.units.length;i++){let n=e.units[i];if(n.x===t&&n.y===l)return n}return null},pe=(e,t,l)=>t<0||t>=e.w||l<0||l>=e.w?null:e.tiles[s([t,l],e.w)]||null,he=(e,t)=>{e.phase=t},Ee=(e,t)=>e.units.filter((e=>e.allegiance===t)),me=e=>{for(let t=0;t<e.units.length;t++)De(e.units[t]);for(let t=0;t<e.particles.length;t++)e.particles[t].timer.isComplete()&&(e.particles.splice(t,1),t--)},fe=(e,t,l,i)=>{let n=pe(e,t,l);if(n){let e=ge(i,0,0);Object.assign(n,e),n.x=t,n.y=l}},ye=(e,[t,l])=>{let i=[];return Pe(1).forEach((([n,a])=>{let r=pe(e,t+n,l+a);r&&i.push(r)})),i},ve={0:{name:"Floor"},1:{name:"Wall",wall:!0},2:{name:"Crumbling Wall",wall:!0},3:{name:"Water",wall:!0},4:{name:"Evil Statue",wall:!0},5:{name:"Medical Statue",wall:!0},6:{name:"Stable Ground"},7:{name:"Closed Gate",wall:!0},8:{name:"Open Gate"},9:{name:"Button"},10:{name:"Chest",wall:!0}},ge=(e,t,l)=>{let i=ve[e];if(!i)throw Error("");return{name:i.name,id:e,x:t,y:l,size:re,fill:"",stroke:"",wall:!!i.wall}};var xe,we;!function(e){e[e.ENEMY=0]="ENEMY",e[e.PLAYER=1]="PLAYER"}(xe||(xe={})),function(e){e[e.IDLE=0]="IDLE",e[e.ATTACKING=1]="ATTACKING",e[e.WAITING=2]="WAITING",e[e.DEFENDING=3]="DEFENDING",e[e.SHIELDING=4]="SHIELDING"}(we||(we={}));let Ae={1:{name:"Blocker",dsc:"Has extra FOR",hp:20,POW:5,FOR:4,EVA:1,MOV:3},2:{name:"Shielder",dsc:"Adjacent allies have +2 FOR",hp:15,POW:8,FOR:1,EVA:1,MOV:3},3:{name:"Duelist",dsc:"Bonus vs isolated enemies",hp:12,POW:9,FOR:0,EVA:1,MOV:4},4:{name:"Ranger",dsc:"Has two range",hp:10,POW:7,FOR:0,EVA:5,MOV:4,rng:2},5:{name:"Lancer",dsc:"Bonus vs Blockers",hp:15,POW:9,FOR:2,EVA:5,MOV:4},6:{name:"Medica",dsc:"Can heal adjacent spaces",hp:18,POW:4,FOR:1,EVA:8,MOV:4,act:[3]},7:{name:"Vaulter",dsc:"Has extra MOV",hp:12,POW:8,FOR:3,EVA:5,MOV:5}},Ie=(e,t,l,i)=>{let n=Ae[e];if(!n)throw Error("");return{sprite:"actors1_"+(i?e:e+"_alt"),state:we.IDLE,id:e,x:t,y:l,lvl:1,ko:0,btn:!1,disabled:!1,allegiance:i?xe.ENEMY:xe.PLAYER,path:{route:null,i:0,t:new We(100),cb:()=>{}},rng:1,mhp:n.hp,...n,template:n}},Le=(e,t,l)=>{e.path.route=t,t&&(e.path.i=0),e.path.cb=l,e.path.t.start()},Ce=(e,t)=>{e.state=t},Ne=(e,t,l)=>{let i=Ye(e,t).map((e=>[e.x,e.y])),n=de(t,l[0],l[1]);return(!n||n===e)&&(i.reduce(((e,t)=>e||l.join(",")===t.join(",")),!1)?c([e.x,e.y],l,t,e.allegiance):void 0)},Pe=e=>{let t=[];for(let l=-e;l<=e;l++){let i=Math.abs(l);for(let n=-e+i;n<=e-i;n++)(n||l)&&t.push([l,n])}return t},Te=(e,t)=>{let{x:l,y:i,rng:n}=e;return Pe(n).map((([n,a])=>{let r=de(t,l+n,i+a);if(r&&r.allegiance!=e.allegiance)return r})).filter((e=>!!e))},Me=(e,t)=>{let l=Ye(e,t),{x:i,y:n}=e,a=[];return l.forEach((l=>{let i=de(t,l.x,l.y);if(i&&i!==e)return;e.x=l.x,e.y=l.y;let n=Te(e,t).map((e=>({unit:e,tile:l})));a=a.concat(n)})),e.x=i,e.y=n,a},Ye=(e,t)=>{let l=[],{x:i,y:n,allegiance:a}=e,r=e.MOV;for(let e=-r;e<=r;e++)for(let s=-r;s<=r;s++){let o=[i+s,n+e],u=pe(t,o[0],o[1]);if(!u)continue;let{path:d}=c([i,n],o,t,a);d.length&&d.length<=r&&l.push(u)}return l},Oe=(e,t,l)=>{let i=[];return Pe(1).forEach((([n,a])=>{let r=de(t,e.x+n,e.y+a);r&&(void 0!==l&&l!==r.allegiance||i.push(r))})),i},be=(e,t)=>{e.hp+=t,e.hp<0?e.hp=0:e.hp>e.mhp&&(e.hp=e.mhp)},ke=e=>e.name+" "+e.lvl,Re=(e,t,l)=>{if("FOR"===l){let l=Oe(e,t,e.allegiance);for(let t=0;t<l.length;t++)if("Shielder"===l[t].name)return[e.FOR+2,e.FOR,2]}return[e[l],e[l],0]},De=e=>{if(e.path.route){let{t:t,i:l,route:i}=e.path;if(t.isComplete()){t.start();let n=i.path[l];n&&(e.x=n[0],e.y=n[1]),e.path.i++,l>=i.path.length&&(e.path.cb(),Le(e,null,(()=>{})))}}},Ue=()=>window.performance.now();class We{constructor(e){this.timestampStart=Ue(),this.timestampPause=0,this.duration=e,this.paused=!1,this.awaits=[]}start(e){this.paused&&(this.timestampPause=Ue(),this.unpause()),this.timestampStart=Ue(),this.duration=null!=e?e:this.duration}isPaused(){return this.paused}pause(){this.paused||(this.paused=!0,this.timestampPause=Ue())}unpause(){this.paused&&(this.paused=!1,this.updateStart(Ue()-this.timestampPause))}updateStart(e){this.timestampStart+=e}update(){this.isComplete()&&(this.awaits.forEach((e=>e())),this.awaits=[])}isComplete(){return this.getPctComplete()>=1}onCompletion(){return new Promise((e=>{this.isComplete()||this.awaits.push(e)}))}getPctComplete(){let e=Ue();this.isPaused()&&(e-=e-this.timestampPause);let t=e-this.timestampStart;return t>this.duration?t=this.duration:t<0&&(t=-1),Math.min(1,t/this.duration)}getDiff(){let e=Ue();return this.isPaused()&&(e-=e-this.timestampPause),[e-this.timestampStart,e-this.timestampPause,this.timestampStart,this.timestampPause]}}let Ve={font:"monospace",color:"#fff",size:14,align:"center",strokeColor:"black"},Se=e=>{(e=null!=e?e:z()).clearRect(0,0,e.canvas.width,e.canvas.height)},Ge=(e,t,l,i,n)=>{i=i||1,n=n||z();let a="string"==typeof e?G[e]:e;if(!a)throw Error("");let[r,s,o,u,c]=a;n.drawImage(r,s,o,u,c,t,l,u*i,c*i)},_e=(e,t,l,i,n,a,r)=>{r=r||z(),a&&(l-=r.lineWidth/2,i-=r.lineWidth/2),r[a?"strokeStyle":"fillStyle"]=n,r[a?"strokeRect":"fillRect"](e,t,l,i)},Fe=(e,t,l,i,n)=>{let{font:a,size:r,color:s,align:o,strokeColor:u}={...Ve,...i||{}};(n=n||z()).font=`${r}px ${a}`,n.textAlign=o,n.textBaseline="middle",u&&(n.strokeStyle=u,n.lineWidth=4,n.strokeText(e,t,l)),n.fillStyle=s,n.fillText(e,t,l)},Be=(e,t,l,i)=>{l=l||1;let{x:n,y:a}=e,[r,s]=Je([n,a]);Ge((e=>e.disabled?"actors1_"+e.id+"_disabled":e.sprite)(e),r,s,l,i);let o=re*l-8,u=Math.ceil(o*(e.hp/e.mhp)),c=l+1;_e(r+4,s+re*l-c,o,c,$e.ENEMY),_e(r+4,s+re*l-c,u,c,$e.PLAYER)},He=(e,t,l,i)=>{let n=z();n.save(),n.translate(Math.floor(l),Math.floor(i));let a=re*t;for(let l=0;l<e.tiles.length;l++){let i=e.tiles[l],n=i.x*a,r=i.y*a;Ge("terrain1_"+i.id,n,r,t),i.fill&&_e(n,r,a,a,i.fill),i.stroke&&_e(n,r,a,a,i.stroke,!0)}for(let l=0;l<e.units.length;l++)Be(e.units[l],0,t);let r={color:$e.BLACK,size:30,align:"center",strokeColor:""},s={...r,color:$e.WHITE};for(let t=0;t<e.particles.length;t++){let l=e.particles[t],i=l.x*a+a/2,n=l.y*a+a/2;Fe(l.text,i+2,n+2,r),Fe(l.text,i,n,s)}if(e.phase===ae.DEPLOY){let[t,l,i,n]=e.deploy,o=t*a,u=l*a,c=(i-t)*a+4,d=(n-l)*a+6,p="Click here to place units.";e.ui.deploy.mapVis||(Fe(p,o+c/2+2,u-32+2,r),Fe(p,o+c/2,u-32,s)),_e(o,u,c,d,$e.WHITE,!0)}n.restore()};var $e;!function(e){e.ENEMY="#db604c",e.PLAYER="#e0fc80",e.NEUTRAL_LIGHT="#74c99e",e.NEUTRAL="#317c87",e.ALT="#b13353",e.BLACK="#1a1016",e.WHITE="#f6dbba"}($e||($e={}));let je=(e,t)=>{let[l,i,n]=e.match(/\w\w/g).map((e=>parseInt(e,16)));return`rgba(${l},${i},${n},${t})`},ze={position:"absolute",left:"0",top:"0",width:"100%",height:"100%",boxSizing:"border-box",padding:"8px"},Ke={height:"unset",border:"2px solid "+$e.WHITE,background:je($e.BLACK,.75),pointerEvents:"all",fontSize:"22px"},Xe=e=>document.getElementById(e),qe=(e,t)=>{let[l,i,n,a]=e,[r,s,o,u]=t,c=z(),{width:d,height:p}=c.canvas;return{left:l+n/2<=d/2?l+n:l-o,top:Math.max(64,(()=>{let e=0;return e=i<0?0:i+u>p?p-u:i,Math.min(672,e)})())}},Je=e=>{let t=K();return[e[0]*t*re,e[1]*t*re]},Qe=e=>{},Ze=()=>t.ce("div",null),et=je($e.PLAYER,.33),tt=je($e.ENEMY,.5),lt=je($e.ALT,.5),it=()=>{let e=Z();var t,l,i;e&&nt(e),t=Xe("ui"),i=rt(),(l=O((l=t).parentNode,l,l.vdom||k(l),i)).vdom=i,dt()},nt=e=>{((e,t)=>{e.tiles.forEach((e=>{e.fill=""}))})(e),((e,t)=>{e.tiles.forEach((e=>{e.stroke=""}))})(e);let t=(t,l)=>{let i=((e,t)=>{let l=[];return Ye(e,t).forEach((i=>{let n=Pe(e.rng).map((e=>pe(t,i.x+e[0],i.y+e[1]))).filter((e=>!!e));l=l.concat(n)})),l})(t,e).map((e=>[e.x,e.y])),n=Ye(t,e).map((e=>[e.x,e.y]));at(i,tt,!1,!1),at(n,et,!1,!1)},l=()=>{let t=e.ui.activeUnit,l=Pe(t.rng).map((e=>[t.x+e[0],t.y+e[1]]));at(l,tt)};if(e.ui.enemy&&t(e.ui.enemy),e.ui.activeUnit){if(e.phase===ae.PLAYER){let l=Ye(e.ui.activeUnit,e).map((e=>[e.x,e.y]));at(l,et,!1,!0),t(e.ui.activeUnit)}else if(e.phase===ae.SELECT_ENEMY){let t=e.ui.selUnits.map((e=>[e.x,e.y]));at(t,tt);let i=e.ui.selUnits[e.ui.selUnitI];i&&at([[i.x,i.y]],$e.ENEMY,!0),l()}else e.phase===ae.WAITING_ACTION&&l();e.phase!==ae.BATTLE&&at([[e.ui.activeUnit.x,e.ui.activeUnit.y]],$e.WHITE,!0)}},at=(e,t,l,i)=>{let n=Z();if(n)for(let a=0;a<e.length;a++){let[r,s]=e[a],o=pe(n,r,s);if(o){if(o[l?"stroke":"fill"]===lt)continue;o[l?"stroke":"fill"]=i&&o[l?"stroke":"fill"]?lt:t}}},rt=()=>{var e,l,i,n,a,r;let s=Z(),o=null===(e=null==s?void 0:s.ui)||void 0===e?void 0:e.enemy;(null==s?void 0:s.phase)===ae.SELECT_ENEMY&&(o=null===(i=null===(l=null==s?void 0:s.ui)||void 0===l?void 0:l.selUnits)||void 0===i?void 0:i[null===(n=null==s?void 0:s.ui)||void 0===n?void 0:n.selUnitI]);let u=(null===(a=null==s?void 0:s.ui)||void 0===a?void 0:a.activeUnit)||(null===(r=null==s?void 0:s.ui)||void 0===r?void 0:r.player);return[ae.BATTLE,ae.ENEMY,ae.LEVEL].includes(null==s?void 0:s.phase)&&(o=null,u=null),t.ce("div",{style:{...ze}},st(),(()=>{let e=Z();if(!e||(null==e?void 0:e.phase)!=ae.CONCLUDED)return Ze();let l=e.conclusion?"VICTORY":"DEFEAT";return 3===e.lvl&&(l="GAME COMPLETED"),t.ce("div",{style:{...ze,...Ke,top:"40%",fontSize:"64px",textAlign:"center"}},l)})(),(()=>{let e=Z(),l=le();if(!e||!l)return Ze();let i=K(),n=e.phase===ae.DEPLOY,a=l.units[e.ui.deploy.unitI],r=e.deploy[0]*re*i<=16*re*i/2?"right":"left",s=Ee(e,xe.PLAYER),o=e.ui.deploy.mapVis,u="left"===r?"64px":"700px";o&&(u="16px");let c=o?"0px":"128px",d="left"===r?parseInt(u)+256:parseInt(u)-204,p=parseInt(c);return t.ce(t.Fragment,null,n&&!o?t.ce("div",{style:{...ze,display:"flex",justifyContent:"center",alignItems:"center"}},t.ce("div",{style:{...Ke,padding:"8px"}},t.ce("div",{style:{textAlign:"center",textDecoration:"underline",marginBottom:"8px"}},"DESCRIPTION"),t.ce("div",{style:{textAlign:"center",color:$e.PLAYER}},a.name),a.dsc,".")):null,n&&!o?ut(a,[d,p]):null,t.ce("div",{style:{...ze,...Ke,left:u,display:n?"block":"none",height:"unset",width:"256px",top:c,bottom:o?"unset":c}},o?null:t.ce("button",{disabled:!s.length,onclick:()=>{Qe("begin"),e.phase=ae.PLAYER,it()},style:{width:"100%",padding:"8px",background:$e.WHITE}},"Begin!"),t.ce("button",{onclick:()=>{Qe("select"),e.ui.deploy.mapVis=!e.ui.deploy.mapVis,e.ui.enemy=null,it()},style:{width:"100%",padding:"8px",background:$e.NEUTRAL_LIGHT}},o?"View Deploy":"View Map"),o?null:t.ce("div",{style:{textAlign:"center"}},"Placed ",s.length," of ",l.maxDeploy),o?null:t.ce("div",{style:{height:"calc(100% - 126px)",overflowY:"auto"}},l.units.map(((l,i)=>{let n=e.ui.deploy.unitI===i,a=e.units.includes(l);return t.ce("div",{onclick:()=>((t,l)=>{Qe("select"),e.ui.deploy.unitI=l,it()})(0,i),style:{border:"2px solid "+(n?$e.WHITE:"transparent"),display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px"}},a?"*":""," ",ke(l),t.ce("div",null,pt(l.sprite,"unit-"+i)))})))))})(),(()=>{let e=Z(),l=le(),i=null==e?void 0:e.ui.activeUnit;if(!e||!l||!i||e.phase!==ae.LEVEL)return Ze();let n=e.ui.lvl;return t.ce("div",{style:{...ze,...Ke,left:"calc(50% - 296px/2)",top:"35%",bottom:"35%",width:"296px",textAlign:"center"}},t.ce("div",null,ke(i)),t.ce("div",null,i.ko," / ",i.lvl," ",i.lvl===i.ko?"Level Gained!":""),ut(i,[42,84],n))})(),(()=>{let e=Z();if(!e)return Ze;if(e.phase!=ae.WAITING_ACTION)return Ze;let l=e.ui.activeUnit;if(!l)return Ze;let i=((e,t)=>{var l;let i=(null!==(l=e.template.act)&&void 0!==l?l:[]).map((e=>L[e]));return[L[0],...i,L[1],L[2]].filter((l=>l.cnd(e,t)))})(l,e),{x:n,y:a}=l,[r,s]=Je([n,a]),o=K()*re,u=[r-o-o/2,s-o-o/2,3*o,3*o],c=[0,0,164,164];return qe(u,c),t.ce("div",{id:"act-list",key:"act-list",style:{...ze,...qe(u,c),...Ke,width:"250px"}},i.map((i=>t.ce("div",{key:i.name},t.ce("button",{onclick:()=>{Qe("select3"),p(e,l,i)},style:{background:$e.NEUTRAL_LIGHT}},i.name)))),t.ce("div",{key:"Cancel"},t.ce("button",{onclick:()=>{((e,t)=>{t.x=e.ui.lastPos[0],t.y=e.ui.lastPos[1],Qe("cancel"),he(e,e.turn===xe.PLAYER?ae.PLAYER:ae.ENEMY),it()})(e,l)},style:{background:$e.ENEMY}},"Cancel")))})(),(()=>{let e=Z();if(!e)return Ze();if(e.phase!=ae.SELECT_ENEMY)return Ze();let l=e.ui.activeUnit,i=e.ui.selUnits[e.ui.selUnitI];if(!l)return Ze();let{x:n,y:a}=l,[r,s]=Je([n,a]),o=K()*re,u=[r-3*o-o/2,s-3*o-o/2,6*o,6*o],c=l.hp,[d,p]=y(l,i),[h,E]=v(l,i),m=i.state===we.DEFENDING,f=i.hp,[g,x]=m?y(i,l):["-"],[w,A]=m?v(i,l):["-"],I={display:"flex",justifyContent:"space-between",padding:"8px"},L=(e,l,i)=>t.ce("span",{style:{width:i?"50%":"33%",textAlign:"center",color:l?$e.PLAYER:"inherit"}},e);return t.ce("div",{key:"forecast",style:{...ze,...qe(u,[0,0,236,236]),...Ke,width:"296px"}},t.ce("div",null,t.ce("div",{style:I},L(ke(l),!1,!0),t.ce("span",null),L(ke(i),!1,!0)),t.ce("div",{style:I},L(c),L("HP"),L(f)),t.ce("div",{style:I},L(d,p),L("DMG"),L(g,x)),t.ce("div",{style:I},L(h,E),L("HIT"),L(w,A))),t.ce("div",null,t.ce("button",{onclick:()=>{Qe("select2"),e.ui.unitClickCb((e=>e.ui.selUnits[e.ui.selUnitI])(e))},style:{width:"100%",padding:"8px",background:$e.WHITE,display:e.turn==xe.ENEMY?"none":""}},"Fight!")),t.ce("div",null,t.ce("button",{onclick:()=>{Qe("cancel"),e.ui.cancelCb()},style:{width:"100%",padding:"8px",background:$e.ENEMY,display:e.turn==xe.ENEMY?"none":""}},"Cancel")))})(),ut(o),ut(u),ot())},st=()=>Z()?Ze():t.ce("div",{style:{...ze,...Ke,pointerEvents:"none",top:"40%",fontSize:"64px",textAlign:"center"}},t.ce("div",null,"GOLEMS"),t.ce("div",null,"click to start")),ot=()=>{let e=Z();if(!e)return Ze();let l=e.turn===xe.ENEMY?"Enemy":"Player";return e.phase===ae.DEPLOY&&(l="Deploy"),t.ce("div",{style:{...ze,...Ke,pointerEvents:"none",width:"unset",left:"28%",right:"28%",fontSize:"28px",textAlign:"center"}},t.ce("div",null,"PHASE:"," ",t.ce("span",{style:{color:e.turn===xe.ENEMY?$e.ENEMY:$e.PLAYER}},l)))},ut=(e,l,i)=>{let n=z(),{height:a}=n.canvas,r={},s={},o=K(),u=(null==e?void 0:e.allegiance)===xe.ENEMY;l?(r.top=""+l[1],s.left=""+l[0]):(((null==e?void 0:e.y)||0)*o*re>=a/2?r.top="28px":(r.top="unset",r.bottom="28px"),s.left=u?"unset":"28px",s.right=u?"28px":"unset");let c=["hp","POW","FOR","EVA","MOV"].map((l=>{let n=l.toUpperCase(),a="";if(e){let[,t,n]=Re(e,Z(),l);a=t,!i&&n&&(a+=" + "+n)}return"hp"===l&&(a=(null==e?void 0:e.hp)+"/"+(null==e?void 0:e.mhp)),(null==i?void 0:i[l])&&(a+=" + "+(null==i?void 0:i[l])),((e,l)=>t.ce("div",{style:{padding:"2px"}},e," ",l))(n,a)}));return t.ce("div",{style:{...ze,...Ke,...r,...s,textAlign:"left",display:e?"block":"none",width:"204px",height:"unset"}},t.ce("div",{style:{textAlign:"center",color:u?$e.ENEMY:$e.PLAYER}},t.ce("div",null,e&&ke(e)),e&&!i&&!u&&"EXP: "+e.ko+"/"+(null==e?void 0:e.lvl)),c)},ct={},dt=()=>{for(let e in ct){let{id:t,sprite:l}=ct[e],i=K(),n=Xe(t);if(n){let e=z(n);e&&(e.imageSmoothingEnabled=!1,Se(e),Ge(l,0,0,i,e))}}},pt=(e,l)=>{let i=K();return ct[l]={id:l,sprite:e},t.ce("canvas",{key:l,id:l,width:re*i,height:re*i})}})();