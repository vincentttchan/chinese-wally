// Reuse the existing painting note, type, hand-drawn actions and choice styles.
// Answers are session-only; replay starts this one question afresh.
let kangquSummaryStage='work',kangquSummaryAnswer=null;
function resetKangquSummary(){kangquSummaryStage='work';kangquSummaryAnswer=null;}
function drawRecollection(){
 panel.classList.add('kangqu-recollection-note');
 const work=kangquWorkContext,quiz=kangquContentCopy.quiz;
 const close='<button id="recollection-close" class="paper-close" aria-label="留在畫中">'+icon('X')+'</button>';
 if(kangquSummaryStage==='work'){
  panel.innerHTML=close+'<div class="kangqu-recollection-copy"><p class="lantern-observation-eyebrow">畫作小記</p><h2>'+work.heading+'</h2><p class="kangqu-work-credit">'+work.title+'<br>'+work.volume+'<br>'+work.credit+'</p>'+[work.context,work.meaning,work.conclusion].map(text=>'<p class="lantern-note-body">'+text+'</p>').join('')+'<details class="lantern-note-sources"><summary>資料來源與演繹說明</summary><p class="lantern-note-caption">'+work.fiction+'</p><a class="kangqu-work-source" href="'+work.source+'" target="_blank" rel="noopener noreferrer">故宮館藏介紹 ↗</a> · <a class="kangqu-work-source" href="'+work.research+'" target="_blank" rel="noopener noreferrer">故宮《萬壽圖》研究 ↗</a></details></div><footer class="kangqu-recollection-footer">'+action('recollection-question','說說你的發現')+'</footer>';
  bind('recollection-question',()=>{kangquSummaryStage='question';drawPanel();panel.scrollTop=0;panel.focus({preventScroll:true});});
 }else{
  const selected=quiz.choices.find(choice=>choice.id===kangquSummaryAnswer),correct=selected?.id===quiz.correct;
  panel.innerHTML=close+'<div class="kangqu-recollection-copy"><p class="lantern-observation-eyebrow">畫作小記 · 說說你的發現</p><h2 id="kangqu-summary-question">'+quiz.question+'</h2><div class="lantern-note-choices" role="group" aria-labelledby="kangqu-summary-question">'+quiz.choices.map((choice,index)=>'<button id="summary-'+choice.id+'" type="button" aria-pressed="'+String(choice.id===kangquSummaryAnswer)+'" aria-describedby="kangqu-summary-feedback">'+String.fromCharCode(65+index)+'．'+choice.text+'</button>').join('')+'</div><p id="kangqu-summary-feedback" class="lantern-note-body" role="status" aria-live="polite">'+(selected?selected.feedback:'請把樂手、旗列與街邊表演的線索一起考慮。')+'</p>'+(correct?'<p class="lantern-note-caption">'+quiz.summary+'</p>':'')+'</div><footer class="kangqu-recollection-footer">'+(correct?action('recollection-seal','在見聞冊留下印記')+action('recollection-free','留在畫中'):'')+'<button id="recollection-work" class="lantern-note-secondary">回看畫作小記</button></footer>';
  for(const choice of quiz.choices)bind('summary-'+choice.id,()=>{
   // Keep the chosen button in place and retain keyboard focus while feedback changes.
   kangquSummaryAnswer=choice.id;
   drawRecollection();$('summary-'+choice.id).focus({preventScroll:true});
  });
  bind('recollection-work',()=>{kangquSummaryStage='work';drawPanel();panel.scrollTop=0;panel.focus({preventScroll:true});});
  if(correct){bind('recollection-seal',openViewingSeal);bind('recollection-free',leaveRecollection);}
 }
 bind('recollection-close',leaveRecollection);
}
