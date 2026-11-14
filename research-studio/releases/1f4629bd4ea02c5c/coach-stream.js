(function(root){
  'use strict';
  async function consume(response,onEvent=()=>{},signal){
    if(!response.ok){
      let value;
      try{value=await response.json();}catch{}
      const retryAfter=Number(response.headers.get('retry-after'));
      throw Object.assign(Error(value?.error||'connection_failed'),{
        code:value?.error,status:response.status,
        retryAfter:response.status===429&&Number.isInteger(retryAfter)&&retryAfter>=1&&retryAfter<=86400?retryAfter:undefined
      });
    }
    if(!(response.headers.get('content-type')||'').includes('text/event-stream')){const result=await response.json();onEvent('result',result);return result;}
    const limit=500000;
    let buffer='',result,finished=false,size=0;
    function checkAbort(){
      if(signal?.aborted)throw signal.reason??new DOMException('Request aborted','AbortError');
    }
    function readFrames(text){
      buffer=(buffer+text).replace(/\r\n/g,'\n');
      let boundary;
      while(!finished&&(boundary=buffer.indexOf('\n\n'))>=0){
        const frame=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
        const event=frame.match(/^event:\s*(.+)$/m)?.[1]||'message',data=frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
        if(!data)continue;
        checkAbort();
        const payload=JSON.parse(data);
        if(event==='error')throw Object.assign(Error(payload.error),{code:payload.error,traceId:payload.traceId});
        if(event==='result')result=payload;
        if(event==='done')finished=true;
        onEvent(event,payload);
      }
    }
    checkAbort();
    if(typeof TextDecoder!=='function'||typeof response.body?.getReader!=='function'){
      const text=await response.text();
      if(text.length>limit)throw Error('stream_size');
      readFrames(text);
    }else{
      const reader=response.body.getReader(),decoder=new TextDecoder();
      try{
        while(!finished){
          checkAbort();
          const {done,value}=await reader.read();
          if(done)break;
          size+=value.byteLength;if(size>limit)throw Error('stream_size');
          readFrames(decoder.decode(value,{stream:true}));
        }
      }finally{void reader.cancel().catch(()=>{});reader.releaseLock();}
    }
    if(!result||!finished)throw Error('stream_interrupted');
    return result;
  }
  const api={consume};if(typeof module==='object'&&module.exports)module.exports=api;else root.FactorLabCoachStream=api;
})(typeof globalThis!=='undefined'?globalThis:this);
