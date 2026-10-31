(function(root){
  'use strict';
  async function consume(response,onEvent=()=>{},signal){
    if(!response.ok){let value;try{value=await response.json();}catch{}throw Object.assign(Error(value?.error||'connection_failed'),{code:value?.error,status:response.status});}
    if(!(response.headers.get('content-type')||'').includes('text/event-stream')){const result=await response.json();onEvent('result',result);return result;}
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result,finished=false,size=0;
    try{
      while(true){
        signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;
        size+=value.byteLength;if(size>500000)throw Error('stream_size');buffer+=decoder.decode(value,{stream:true}).replace(/\r\n/g,'\n');
        let boundary;while((boundary=buffer.indexOf('\n\n'))>=0){
          const frame=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
          const event=frame.match(/^event:\s*(.+)$/m)?.[1]||'message',data=frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
          if(!data)continue;signal?.throwIfAborted();const payload=JSON.parse(data);
          if(event==='error')throw Object.assign(Error(payload.error),{code:payload.error});
          if(event==='result')result=payload;if(event==='done')finished=true;onEvent(event,payload);
        }
      }
      if(!result||!finished)throw Error('stream_interrupted');return result;
    }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  }
  const api={consume};if(typeof module==='object'&&module.exports)module.exports=api;else root.FactorLabCoachStream=api;
})(typeof globalThis!=='undefined'?globalThis:this);
