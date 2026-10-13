chapter.version='0.3.2';
// Observation excludes a neighbour's head instead of accepting the whole old rectangle.
const comparisonExclusions=[
 [[],['seated-drum','ensemble-discs-left']],
 [['hand-at-hat'],[]],
 [[],[]]
];
chapter.rounds[1].comparison[1].box=[1486,1598,1510,1625];
const comparisonAnchors=[[[1020,2490],[923,2365]],[[1419,1584],[1496,1610]],[[3745,2368],[3680,2401]]];
for(let r=0;r<chapter.rounds.length;r++)for(let s=0;s<2;s++){
 const point=chapter.rounds[r].comparison[s];point.exclusions=comparisonExclusions[r][s].map(id=>chapter.people.find(p=>p.id===id).head);point.anchor=comparisonAnchors[r][s];
}
chapter.rounds[2].recognitionFeatures=[[3728,2494,3788,2539]];
