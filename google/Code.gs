/* ORVEN inquiry processing. No personal data or secrets are logged.
 * Private functions end in _. Deployment: execute as owner; access Anyone.
 * Script properties: SHARED_SECRET (64+ chars); FORM_ID and ITEM_IDS set by setup.
 * Owner-only administration remains inaccessible to anonymous web visitors.
 */
var OWNER_='orven.agency01@gmail.com';
var POLICY_='2026-10-19';
var DAY_=86400000;
var FIELD_NAMES_=['Request ID','Name','Contact','Service','Project details','Language','Privacy version'];
function properties_(){return PropertiesService.getScriptProperties();}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function hmac_(text,secret){return Utilities.computeHmacSha256Signature(text,secret,Utilities.Charset.UTF_8).map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');}
function equal_(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function owner_(){if(Session.getActiveUser().getEmail().toLowerCase()!==OWNER_)throw new Error('Owner authorization required.');}
function meta_(id){var s=properties_().getProperty('Q_'+id);return s?JSON.parse(s):null;}
function saveMeta_(id,m){properties_().setProperty('Q_'+id,JSON.stringify(m));}
function form_(){var id=properties_().getProperty('FORM_ID');if(!id)throw new Error('Not configured.');return FormApp.openById(id);}
function validPayload_(d){
 if(!d||!/^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(d.requestId||''))return false;
 if(['ar','en'].indexOf(d.locale)<0||d.policyVersion!==POLICY_||['','website','application'].indexOf(d.service)<0)return false;
 for(var k in {name:120,contact:254,details:5000}){if(typeof d[k]!=='string'||!d[k].trim()||d[k].length>({name:120,contact:254,details:5000})[k])return false;}
 if(/[\r\n\x00-\x1f\x7f]/.test(d.name+d.contact)||/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(d.details))return false;
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact)||/^\+?\d{8,15}$/.test(d.contact.replace(/[\s()-]/g,''));
}
function doPost(e){
 var lock=LockService.getScriptLock();var locked=false;
 try{
  var raw=e&&e.postData&&e.postData.contents;if(!raw||raw.length>22000)return json_({received:false});
  var env=JSON.parse(raw),secret=properties_().getProperty('SHARED_SECRET');
  if(!secret||secret.length<32||typeof env.payload!=='string'||env.payload.length>18000||!/^\d{13}$/.test(env.timestamp||'')||Math.abs(Date.now()-Number(env.timestamp))>300000||!/^[-a-f0-9]{36}$/i.test(env.nonce||''))return json_({received:false});
  if(!equal_(env.signature,hmac_(env.timestamp+'.'+env.nonce+'.'+env.payload,secret)))return json_({received:false});
  var data=JSON.parse(env.payload);if(!validPayload_(data))return json_({received:false});
  if(!lock.tryLock(10000))return json_({received:false});locked=true;
  var form=form_(),m=meta_(data.requestId);
  // Recover a response after an interrupted metadata write; never duplicate a saved request.
  var response=m&&m.responseId?form.getResponse(m.responseId):findResponse_(form,data.requestId);
  if(!response){
   var props=properties_().getProperties(),keys=Object.keys(props).filter(function(k){return k.indexOf('Q_')===0;});
   if(keys.length>=600)return json_({received:false});
   var itemIds=JSON.parse(properties_().getProperty('ITEM_IDS')||'[]');if(itemIds.length!==7)return json_({received:false});
   var values=[data.requestId,data.name,data.contact,data.service,data.details,data.locale,data.policyVersion];
   response=form.createResponse();itemIds.forEach(function(id,i){var item=form.getItemById(id);response.withItemResponse(i===4?item.asParagraphTextItem().createResponse(values[i]):item.asTextItem().createResponse(values[i]));});
   response=response.submit();
  }
  // Read the saved Form response back before signing the acknowledgement.
  var saved=form.getResponse(response.getId());if(!saved||getAnswer_(saved,0)!==data.requestId)return json_({received:false});
  var expected=[data.requestId,data.name,data.contact,data.service,data.details,data.locale,data.policyVersion];
  if(expected.some(function(v,i){return getAnswer_(saved,i)!==v;}))return json_({received:false});
  if(!m){m={responseId:saved.getId(),createdAt:saved.getTimestamp().getTime(),lastContactAt:saved.getTimestamp().getTime(),status:'open',legalHold:false,reviewAt:null,threadIds:[],copies:[],notificationSent:false,stage:'stored'};}
  saveMeta_(data.requestId,m);
  notify_(form,data.requestId,m);
  return json_({received:true,requestId:data.requestId,receipt:hmac_('receipt.'+data.requestId+'.saved',secret)});
 }catch(error){return json_({received:false});}
 finally{if(locked)lock.releaseLock();}
}
function getAnswer_(response,index){var ids=JSON.parse(properties_().getProperty('ITEM_IDS')||'[]');var found=response.getItemResponses().filter(function(x){return String(x.getItem().getId())===String(ids[index]);});return found.length?String(found[0].getResponse()):'';}
function findResponse_(form,id){var all=form.getResponses();for(var i=all.length-1;i>=0;i--)if(getAnswer_(all[i],0)===id)return all[i];return null;}
function notify_(form,id,m){
 if(m.notificationSent)return;
 try{
  // No name, phone, email or project details are duplicated in the notification.
  GmailApp.sendEmail(OWNER_,'ORVEN-Q-'+id,'تم حفظ استفسار جديد في ORVEN.\nNew ORVEN inquiry saved.\n\nReference: '+id+'\nReview in the private Google Form:\n'+form.getEditUrl()+'\n\nNotifications do not reset the retention clock.');
  m.notificationSent=true;saveMeta_(id,m);
 }catch(ignore){/* Stored response remains acknowledged; the hourly job retries notification. */}
}
function setupOrven(){
 owner_();var props=properties_();
 if(!props.getProperty('SHARED_SECRET'))throw new Error('Set SHARED_SECRET in Script properties first.');
 if(props.getProperty('FORM_ID'))return {configured:true};
 var form=FormApp.create('ORVEN — Project Inquiries');form.setDescription('Private ORVEN inquiry store. Managed by the ORVEN intake script.');
 form.setCollectEmail(false);form.setAllowResponseEdits(false);form.setShowLinkToRespondAgain(false);
 var ids=FIELD_NAMES_.map(function(label,i){return (i===4?form.addParagraphTextItem():form.addTextItem()).setTitle(label).getId();});
 // No linked response spreadsheet is created, avoiding another personal-data copy.
 props.setProperties({FORM_ID:form.getId(),ITEM_IDS:JSON.stringify(ids),RETENTION_ENABLED:'false',RETENTION_DAYS:'30',OWNER_EMAIL:OWNER_});
 return {configured:true,formUrl:form.getEditUrl()};
}
function retentionDecision_(m,now){
 if(m.status==='project')return {delete:false,reason:'project'};
 if(m.legalHold)return {delete:false,reason:'legal_hold',reviewDue:!m.reviewAt||m.reviewAt<=now};
 if(!Number.isFinite(m.lastContactAt)||m.lastContactAt>now||m.lastContactAt<m.createdAt)return {delete:false,reason:'invalid_clock'};
 return {delete:now-m.lastContactAt>=30*DAY_,reason:now-m.lastContactAt>=30*DAY_?'expired':'within_window',dueAt:m.lastContactAt+30*DAY_};
}
function inquiryMessages_(id,m){
 var threads=GmailApp.search('in:anywhere "ORVEN-Q-'+id+'"',0,100);
 (m.threadIds||[]).forEach(function(threadId){var thread=GmailApp.getThreadById(threadId);if(thread)threads.push(thread);});
 var unique={};threads.forEach(function(thread){thread.getMessages().forEach(function(msg){
  var refs=msg.getSubject().match(/ORVEN-Q-([a-f0-9-]{36})/ig)||[];
  if(refs.some(function(ref){return ref.toLowerCase()!==('ORVEN-Q-'+id).toLowerCase();}))throw new Error('Mixed inquiry thread requires review.');
  unique[msg.getId()]=msg;
 });});return Object.keys(unique).map(function(k){return unique[k];});
}
function actualMessage_(msg){
 var from=msg.getFrom().toLowerCase(),to=msg.getTo().toLowerCase(),cc=msg.getCc().toLowerCase();
 // Self-to-self notifications, bounces and scheduled alerts are not actual client contact.
 if(from.indexOf(OWNER_)>=0&&to.indexOf(OWNER_)>=0&&!cc)return false;
 if(/mailer-daemon|postmaster|no-?reply|notifications?@/.test(from))return false;
 return true;
}
function refreshClock_(id,m,messages){
 messages.forEach(function(msg){var at=msg.getDate().getTime();if(actualMessage_(msg)&&at<=Date.now()&&at>m.lastContactAt)m.lastContactAt=at;});
 saveMeta_(id,m);
}
function linkedDestination_(form){try{return form.getDestinationId()||'';}catch(ignore){return '';}}
function scrubSheetRows_(fileId,sheetName,idColumn,id,dryRun){
 var book=SpreadsheetApp.openById(fileId),sheets=sheetName?[book.getSheetByName(sheetName)]:book.getSheets();var matched=0;
 sheets.forEach(function(sheet){if(!sheet)return;var rows=sheet.getDataRange().getDisplayValues();for(var r=rows.length-1;r>=1;r--){var match=idColumn?rows[r][idColumn-1]===id:rows[r].some(function(v){return v===id;});if(match){matched++;if(!dryRun)sheet.deleteRow(r+1);}}});return matched;
}
function purgeCopies_(id,m,form,dryRun){
 var results=[];var dest=linkedDestination_(form);
 if(dest)results.push({kind:'linked_sheet',rows:scrubSheetRows_(dest,null,null,id,dryRun)});
 (m.copies||[]).forEach(function(copy){
  if(copy.kind==='sheet')results.push({kind:'registered_sheet',rows:scrubSheetRows_(copy.id,copy.sheetName,copy.idColumn,id,dryRun)});
  else if(copy.kind==='file'){
   if(!copy.exclusive)throw new Error('Shared export requires manual review.');
   if(!dryRun)Drive.Files.remove(copy.id);results.push({kind:'exclusive_export',removed:!dryRun});
  }else throw new Error('Unmanaged copy.');
 });return results;
}
function sweep_(dryRun,now,onlyId){
 var props=properties_(),form=form_(),all=props.getProperties(),report={dryRun:dryRun,checked:0,deleted:0,eligible:0,held:0,reviewDue:0,failed:0,notificationRetries:0,sheetHistoryReview:false};
 var keys=Object.keys(all).filter(function(k){return k.indexOf('Q_')===0&&(!onlyId||k==='Q_'+onlyId);});
 // Process in a bounded batch so Apps Script can resume on the next hourly run.
 var start=Date.now();
 keys.forEach(function(key){
  if(Date.now()-start>240000)return;
  var id=key.slice(2),m=JSON.parse(props.getProperty(key));report.checked++;
  try{
   var messages=inquiryMessages_(id,m);refreshClock_(id,m,messages);var choice=retentionDecision_(m,now);
   if(!choice.delete){if(choice.reason==='legal_hold')report.held++;if(choice.reviewDue)report.reviewDue++;if(!m.notificationSent&&!dryRun){notify_(form,id,m);report.notificationRetries++;}return;}
   report.eligible++;
   var copies=purgeCopies_(id,m,form,dryRun);if(copies.some(function(c){return /sheet/.test(c.kind);}))report.sheetHistoryReview=true;
   if(dryRun)return;
   // Each individual message is deleted; unrelated Gmail threads are never bulk-deleted.
   messages.forEach(function(message){Gmail.Users.Messages.remove('me',message.getId());});
   if(m.responseId){try{form.getResponse(m.responseId);form.deleteResponse(m.responseId);}catch(err){if(findResponse_(form,id))throw err;}}
   if(findResponse_(form,id))throw new Error('Form response remains.');
   props.deleteProperty(key);report.deleted++;
  }catch(error){report.failed++;}
 });
 // Keep only aggregate health information, never copies of deleted inquiry content.
 props.setProperty('RETENTION_LAST_REPORT',JSON.stringify({at:now,report:report}));return report;
}
function previewRetention(){owner_();var result=sweep_(true,Date.now());console.log(JSON.stringify(result));return result;}
function hourlyMaintenance(e){
 if(!e||!e.triggerUid)return;
 var lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{var enabled=properties_().getProperty('RETENTION_ENABLED')==='true';var result=sweep_(!enabled,Date.now());
  var props=properties_(),lastAlert=Number(props.getProperty('RETENTION_LAST_ALERT_AT')||0);
  if((result.failed||result.sheetHistoryReview||result.reviewDue)&&Date.now()-lastAlert>=DAY_){GmailApp.sendEmail(OWNER_,'ORVEN — مراجعة سياسة الاحتفاظ','تحتاج نتيجة التنظيف المجدول أو استثناءات الاحتفاظ القانوني إلى مراجعة. لا يتضمّن هذا الإشعار تفاصيل الاستفسارات. يُرجى مراجعة لوحة الإدارة الخاصة.');props.setProperty('RETENTION_LAST_ALERT_AT',String(Date.now()));}
 }finally{lock.releaseLock();}
}
function enableRetention(){
 owner_();var props=properties_();
 if(props.getProperty('RETENTION_APPROVED')!=='2026-10-19')throw new Error('Set RETENTION_APPROVED=2026-10-19 after the owner has reviewed the dry run and irreversible deletion permissions.');
 var existing=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hourlyMaintenance';});
 if(!existing.length)ScriptApp.newTrigger('hourlyMaintenance').timeBased().everyHours(1).create();
 props.setProperty('RETENTION_ENABLED','true');return {enabled:true};
}
function liveSelfTest(){
 owner_();var now=Date.now(),secret=properties_().getProperty('SHARED_SECRET'),id=Utilities.getUuid();
 var data={requestId:id,name:'ORVEN synthetic test',contact:'orven-test@example.invalid',service:'website',details:'Disposable test fixture created by ORVEN. No client data.',locale:'en',policyVersion:POLICY_};
 var payload=JSON.stringify(data),timestamp=String(now),nonce=Utilities.getUuid();
 function send(){return JSON.parse(doPost({postData:{contents:JSON.stringify({timestamp:timestamp,nonce:nonce,payload:payload,signature:hmac_(timestamp+'.'+nonce+'.'+payload,secret)})}}).getContent());}
 var first=send(),second=send();if(!first.received||!second.received)throw new Error('Save/readback failed.');
 var count=form_().getResponses().filter(function(r){return getAnswer_(r,0)===id;}).length;
 if(count!==1)throw new Error('Idempotency failed.');
 var m=meta_(id);m.createdAt=now-31*DAY_;m.lastContactAt=now-31*DAY_;m.testFixture=true;saveMeta_(id,m);
 m.status='project';saveMeta_(id,m);var project=sweep_(false,now,id);if(project.deleted!==0||!meta_(id))throw new Error('Project exclusion failed.');
 m=meta_(id);m.status='open';m.legalHold=true;m.reviewAt=now+DAY_;saveMeta_(id,m);var held=sweep_(false,now,id);if(held.deleted!==0||!meta_(id))throw new Error('Legal hold failed.');
 m=meta_(id);m.legalHold=false;saveMeta_(id,m);var preview=sweep_(true,now,id);if(preview.eligible!==1||!meta_(id))throw new Error('Dry run failed.');
 var deleted=sweep_(false,now,id);if(deleted.deleted!==1||meta_(id)||findResponse_(form_(),id))throw new Error('Retention deletion failed.');
 var result={savedAndReadBack:true,duplicateSavedOnce:true,projectExcluded:true,legalHoldExcluded:true,dryRunPreserved:true,expiredFixtureDeleted:true,scope:'Real Google services; synthetic fixture; simulated age only'};
 properties_().setProperty('LIVE_TEST_RESULT',JSON.stringify({at:now,result:result}));console.log(JSON.stringify(result));return result;
}
function doGet(){
 try{owner_();return HtmlService.createHtmlOutput(adminHtml_()).setTitle('ORVEN — Inquiry administration');}
 catch(ignore){return ContentService.createTextOutput('ORVEN inquiry endpoint.');}
}
function adminList(){
 owner_();var p=properties_().getProperties();return {formUrl:form_().getEditUrl(),retentionEnabled:p.RETENTION_ENABLED==='true',lastReport:p.RETENTION_LAST_REPORT?JSON.parse(p.RETENTION_LAST_REPORT):null,inquiries:Object.keys(p).filter(function(k){return k.indexOf('Q_')===0;}).map(function(k){var m=JSON.parse(p[k]);return {id:k.slice(2),createdAt:m.createdAt,lastContactAt:m.lastContactAt,status:m.status,legalHold:m.legalHold,reviewAt:m.reviewAt,copies:m.copies,threadIds:m.threadIds};})};
}
function adminUpdate(input){
 owner_();if(!input||!/^[-a-f0-9]{36}$/i.test(input.id||''))throw new Error('Invalid inquiry.');
 var lock=LockService.getScriptLock();lock.waitLock(10000);
 try{var m=meta_(input.id);if(!m)throw new Error('Inquiry unavailable.');
  if(['open','closed','project'].indexOf(input.status)<0)throw new Error('Invalid status.');
  m.status=input.status;m.legalHold=Boolean(input.legalHold);
  if(m.legalHold){if(['legal_obligation','dispute','regulatory_request'].indexOf(input.holdReason)<0)throw new Error('Select a documented legal reason.');m.holdReason=input.holdReason;m.reviewAt=Date.now()+30*DAY_;}
  else {m.holdReason='';m.reviewAt=null;}
  if(input.lastContactAt){var at=Date.parse(input.lastContactAt);if(!Number.isFinite(at)||at> Date.now()||at<m.lastContactAt)throw new Error('Contact time must be a real event, after the current clock and no later than now.');m.lastContactAt=at;}
  if(input.threadId){if(!/^[a-f0-9]{8,32}$/i.test(input.threadId))throw new Error('Invalid Gmail thread ID.');if(m.threadIds.indexOf(input.threadId)<0)m.threadIds.push(input.threadId);}
  if(input.copy){if(['file','sheet'].indexOf(input.copy.kind)<0||!/^[-\w]{10,150}$/.test(input.copy.id))throw new Error('Invalid copy reference.');m.copies.push({kind:input.copy.kind,id:input.copy.id,exclusive:input.copy.exclusive===true,sheetName:input.copy.sheetName||null,idColumn:Number(input.copy.idColumn)||null});}
  saveMeta_(input.id,m);return {updated:true};
 }finally{lock.releaseLock();}
}
function adminHtml_(){
 return '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0b0b0c;color:#f1efea;font:16px Arial;line-height:1.7;max-width:1000px;margin:40px auto;padding:20px}input,select,button{font:inherit;padding:10px;margin:6px;border-radius:6px}button{background:#b9a189;border:0}table{width:100%;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #444;text-align:start}a{color:#b9a189}</style><h1>إدارة استفسارات ORVEN</h1><p>تُحسب الثلاثون يومًا من آخر تواصل فعلي. سجّل تواصل واتساب والمكالمات هنا؛ الإشعارات الآلية لا تمدّد المدة. الاستفسار المتحوّل إلى مشروع أو الخاضع لاحتفاظ قانوني يُستثنى من الحذف التلقائي.</p><div id="status" role="status"></div><div id="list"></div><h2>تحديث استفسار</h2><form id="update"><label>مرجع الاستفسار <input name="id" required></label><label>الحالة <select name="status"><option value="open">استفسار مفتوح</option><option value="closed">لم يتحوّل إلى مشروع</option><option value="project">تحوّل إلى مشروع</option></select></label><p><label>آخر تواصل فعلي <input name="lastContactAt" type="datetime-local"></label></p><label><input name="legalHold" type="checkbox">احتفاظ قانوني موثّق</label><select name="holdReason"><option value="legal_obligation">التزام قانوني</option><option value="dispute">نزاع قائم</option><option value="regulatory_request">طلب جهة مختصّة</option></select><p><label>معرّف محادثة Gmail ذات الصلة <input name="threadId"></label></p><button>حفظ التحديث</button></form><script>function load(){google.script.run.withSuccessHandler(function(d){const root=document.getElementById("list");root.textContent="";const a=document.createElement("a");a.href=d.formUrl;a.textContent="فتح Google Form الخاص";a.target="_blank";root.append(a);const table=document.createElement("table");d.inquiries.forEach(function(q){const tr=document.createElement("tr");[q.id,({open:"استفسار مفتوح",closed:"لم يتحوّل إلى مشروع",project:"مشروع"}[q.status]||q.status),new Date(q.lastContactAt).toLocaleString("ar-EG"),q.legalHold?"احتفاظ قانوني":""].forEach(function(v){const td=document.createElement("td");td.textContent=v;tr.append(td)});table.append(tr)});root.append(table);document.getElementById("status").textContent=d.retentionEnabled?"التنظيف المجدول مفعّل.":"التنظيف في وضع المراجعة."}).withFailureHandler(function(){document.getElementById("status").textContent="تعذّر تحميل الإدارة. تأكّد من حساب المالك."}).adminList()}document.getElementById("update").onsubmit=function(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.legalHold=e.target.legalHold.checked;if(data.lastContactAt)data.lastContactAt=new Date(data.lastContactAt).toISOString();google.script.run.withSuccessHandler(function(){document.getElementById("status").textContent="حُفظ التحديث.";load()}).withFailureHandler(function(err){document.getElementById("status").textContent="تعذّر حفظ التحديث. تحقّق من البيانات وصلاحية حساب المالك."}).adminUpdate(data)};load();</script></html>';
}
