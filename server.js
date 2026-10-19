'use strict';
const http=require('http'),crypto=require('crypto');
const port=process.env.PORT||3000,pin=process.env.TRAINER_PIN;
if(!pin){console.error('Set TRAINER_PIN in your hosting environment.');process.exit(1)}
const phases=['lobby','story','response','results','disc','discresults','reveal','rescue','closing1','closing2','bonus','modelanswer','leaderboard'];
const newState=()=>({phase:'lobby',code:String(crypto.randomInt(100000,999999)),players:{},selected:[null,null],bonuses:{}});
let s=newState();
const answerKey={response:'B',disc:'D'};
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data))};
const body=req=>new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>10000)reject(Error('Too large'))});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(Error('Invalid JSON'))}})});
const summary=(token,admin)=>{let players=Object.values(s.players).map(p=>({id:p.id,name:p.name,answered:!!p.response,discAnswered:!!p.disc,quiz:(p.response==='B'?10:0)+(p.disc==='D'?10:0),bonus:s.bonuses[p.id]||0}));let ranking=players.map(x=>({...x,total:x.quiz+x.bonus})).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));let counts={A:0,B:0,C:0},discCounts={D:0,I:0,S:0,C:0};Object.values(s.players).forEach(p=>{if(counts[p.response]!==undefined)counts[p.response]++;if(discCounts[p.disc]!==undefined)discCounts[p.disc]++});let own=s.players[token];return {responseCounts:counts,discCounts,phase:s.phase,code:admin||s.phase==='lobby'?s.code:undefined,count:players.length,answered:players.filter(x=>x.answered).length,discAnswered:players.filter(x=>x.discAnswered).length,selected:s.selected,ranking:admin||s.phase==='leaderboard'?ranking:ranking.map(x=>({name:x.name,total:s.phase==='leaderboard'?x.total:undefined})),players:admin?players:undefined,joinedNames:s.phase==='lobby'?players.map(p=>p.name):undefined,me:own?{id:own.id,name:own.name,response:own.response,disc:own.disc,score:ranking.find(x=>x.id===own.id)?.total}:null}};
http.createServer(async(req,res)=>{let url=new URL(req.url,'http://localhost');if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});return res.end(require('fs').readFileSync(require('path').join(__dirname,'index.html')))}
if(!url.pathname.startsWith('/api/')){return send(res,404,{error:'Not found'})}
const admin=req.headers['x-trainer-pin']===pin,token=req.headers['x-player-token']||'';
try{
if(req.method==='GET'&&url.pathname==='/api/state')return send(res,200,summary(token,admin));
if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
let b=await body(req);
if(url.pathname==='/api/join'){if(s.phase!=='lobby')return send(res,409,{error:'Pendaftaran ditutup'});if(String(b.code||'').trim()!==s.code)return send(res,403,{error:'Kod sesi telah berubah. Sila refresh QR dan cuba semula.'});let name=String(b.name||'').trim().slice(0,45);if(name.length<2)return send(res,400,{error:'Masukkan nama'});let t=crypto.randomBytes(24).toString('hex'),id=crypto.randomUUID();s.players[t]={id,name,response:null,disc:null};return send(res,200,{token:t,name})}
if(url.pathname==='/api/answer'){let p=s.players[token];if(!p)return send(res,401,{error:'Sila masuk semula'});if(s.phase==='response'&&p.response===null&&['A','B','C'].includes(b.answer)){p.response=b.answer;return send(res,200,{ok:true})}if(s.phase==='disc'&&p.disc===null&&['D','I','S','C'].includes(b.answer)){p.disc=b.answer;return send(res,200,{ok:true})}return send(res,409,{error:'Soalan ditutup atau telah dijawab'})}
if(!admin)return send(res,403,{error:'PIN trainer tidak sah'});
if(url.pathname==='/api/phase'){if(!phases.includes(b.phase))return send(res,400,{error:'Fasa salah'});s.phase=b.phase;return send(res,200,{ok:true})}
if(url.pathname==='/api/select'){let ids=Object.values(s.players).map(p=>p.id);if(!Array.isArray(b.ids)||b.ids.length!==2||b.ids.some(id=>!ids.includes(id))||b.ids[0]===b.ids[1])return send(res,400,{error:'Pilih dua peserta berbeza'});s.selected=b.ids;return send(res,200,{ok:true})}
if(url.pathname==='/api/bonus'){if(!s.selected.includes(b.id)||!Number.isInteger(b.score)||b.score<0||b.score>20)return send(res,400,{error:'Bonus 0–20 sahaja'});s.bonuses[b.id]=b.score;return send(res,200,{ok:true})}
if(url.pathname==='/api/reset'){s=newState();return send(res,200,{ok:true})}
return send(res,404,{error:'Not found'})
}catch(e){send(res,400,{error:e.message})}
}).listen(port,'0.0.0.0',()=>console.log('Andalusia listening on '+port));
