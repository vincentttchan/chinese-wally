// Only the independent candidate reads this copy. Artwork, hitboxes and playback stay pinned.
chapter.question=kangquContentCopy.question;
for(const round of chapter.rounds){
 const copy=kangquContentCopy.stations[round.station];
 Object.assign(inquiryStationInfo[round.station],copy);
 Object.assign(round,{greeting:copy.greeting,observationTitle:copy.question,answer:copy.finding,next:copy.handoff});
 const ids=round.acceptedIds||[round.id];
 for(const id of ids){const person=chapter.people.find(p=>p.id===id);if(person)person.lines=[...copy.lines];}
 const review=chapter.review.find((_,index)=>chapter.rounds[index].station===round.station);
 if(review)review.text=copy.finding;
 const collection=chapter.collections.find(c=>c.id===({ensemble:'ensemble',flags:'flag',audience:'audience'}[round.station]));
 if(collection)Object.assign(collection,{observation:copy.question,explanation:copy.finding,next:copy.handoff});
}
