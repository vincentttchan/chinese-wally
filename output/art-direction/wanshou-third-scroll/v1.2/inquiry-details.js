// Shared crop markup for collection art; interpretations are shown by the in-painting animations.
let inquiryCropId=0;
function inquiryCrop(box,src,width,height,label,id='inquiry-crop-'+(++inquiryCropId),clip=box){
 return '<svg viewBox="'+box.join(' ')+'" role="img" aria-label="'+label+'"><defs><clipPath id="'+id+'"><rect x="'+clip[0]+'" y="'+clip[1]+'" width="'+clip[2]+'" height="'+clip[3]+'"/></clipPath></defs><image href="'+src+'" width="'+width+'" height="'+height+'" clip-path="url(#'+id+')"/></svg>';
}
