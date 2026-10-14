const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
function ipValue(value: string | null): string | null {
 const ip=value?.split(',')[0].trim();
 if(!ip||ip.length>45)return null;
 if(/^\d{1,3}(\.\d{1,3}){3}$/.test(ip))return ip.split('.').every(x=>Number(x)<=255)?ip:null;
 if(!/^[\da-f:]+$/i.test(ip)||!ip.includes(':'))return null;
 try{new URL(`http://[${ip}]/`);return ip}catch{return null}
}
export function apparentIp(headers: Headers):string|null {
 return ipValue(headers.get('cf-connecting-ip'))??ipValue(headers.get('x-forwarded-for'))??ipValue(headers.get('x-real-ip'));
}
export interface Admin {from(table:string):{insert(row:Record<string,string|null>):PromiseLike<{error:unknown}>}}
export async function handleVisit(req:Request,admin:Admin):Promise<Response>{
 const response=(status:number)=>new Response(null,{status,headers:cors});
 if(req.method==='OPTIONS')return response(204);
 if(req.method!=='POST')return response(405);
 try {
  if(Number(req.headers.get('content-length'))>8192)return response(413);
  // Bound streamed input even if content-length is absent or forged.
  const reader=req.body?.getReader();if(!reader)return response(400);
  const chunks:Uint8Array[]=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8192){await reader.cancel();return response(413)}chunks.push(value)}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  const body=JSON.parse(new TextDecoder().decode(bytes));
  if(!body||typeof body.path!=='string'||!body.path.startsWith('/')||body.path.startsWith('//')||body.path.length>2048||/[\x00-\x1f]/.test(body.path))return response(400);
  if(body.referrer!==undefined&&typeof body.referrer!=='string')return response(400);
  let error:unknown;try{({error}=await admin.from('page_visits').insert({path:body.path,ip:apparentIp(req.headers),user_agent:req.headers.get('user-agent')?.slice(0,1024)??null,referrer:body.referrer?.slice(0,2048)||null}));}catch{return response(503)}
  return response(error?503:204);
 }catch{return response(400)}
}
