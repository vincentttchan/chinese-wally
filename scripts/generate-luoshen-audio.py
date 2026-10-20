"""Original modern pentatonic ambient score; no historical reconstruction or samples."""
from pathlib import Path
import math,wave,array
rate=24000;length=48;out=[0.0]*(rate*length)
notes=[(0,62),(3,69),(6,74),(9,71),(12,67),(15,69),(18,62),(21,64),(24,67),(27,74),(30,76),(33,71),(36,69),(39,67),(42,64)]
for start,midi in notes:
 f=440*2**((midi-69)/12)
 for i in range(6*rate):
  t=i/rate;j=int(start*rate)+i
  if j>=len(out):break
  attack=min(1,t/.035);env=attack*math.exp(-t/1.6)
  value=sum(math.sin(2*math.pi*f*k*t)*math.exp(-t*k*.22)/(k*k) for k in [1,2,3,4])*.15*env
  out[j]+=value
  echo=j+int(.28*rate)
  if echo<len(out):out[echo]+=value*.18
for i in range(len(out)):
 t=i/rate;fade=min(1,t/2,(length-t)/4);out[i]*=max(0,fade)
path=Path(__file__).resolve().parents[1]/'public/audio/luoshen-music.wav'
with wave.open(str(path),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(array.array('h',(int(max(-1,min(1,v))*32700) for v in out)).tobytes())
print(path)
