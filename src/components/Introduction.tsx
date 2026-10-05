import { ArrowRight } from './ArtIcons.tsx';

export function Introduction({ready, leaving, onBegin}: {ready: boolean; leaving: boolean; onBegin: () => void}) {
  return <section className={`introduction ${leaving ? 'is-leaving' : ''}`} aria-label="榜下尋人引言" aria-hidden={leaving} inert={leaving}>
    <div className="intro-brand"><span/>畫中有案</div>
    <div className="intro-content">
      <div className="intro-copy">
        <p className="intro-chapter">科舉放榜日</p>
        <p className="intro-story">榜前人潮湧動，書童一轉身，<br/>便不見了同行的考生。</p>
        <p className="intro-invitation">循着兩條證詞，<br/>在畫中替他們找到彼此。</p>
        <button className="intro-enter" onClick={onBegin} disabled={!ready}><span>{ready ? '入畫尋人' : '正在展卷'}</span><ArrowRight size={23}/></button>
        <span className="intro-play-note">尋線索 · 辨人物 · 解小案</span>
      </div>
      <div className="intro-title"><h1>榜下尋人</h1><span className="intro-seal" aria-hidden="true">入畫</span></div>
    </div>
    <p className="intro-footer">一卷市井，藏着一場相逢。</p>
  </section>;
}
