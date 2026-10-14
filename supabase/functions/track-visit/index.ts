import {withSupabase} from 'npm:@supabase/server@1.9.2';
import {handleVisit} from './handler.ts';
const handler=withSupabase({auth:'none'},(req,ctx)=>handleVisit(req,ctx.supabaseAdmin));
Deno.serve(async req=>{
 try{return await handler(req)}catch{return new Response(null,{status:503,headers:{'Access-Control-Allow-Origin':'*'}})}
});
