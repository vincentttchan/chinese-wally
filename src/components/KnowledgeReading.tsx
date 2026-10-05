import { useState } from 'react';
import { ArrowRight } from './ArtIcons.tsx';
import { knowledge } from '../game/knowledge.ts';

export function KnowledgeReading({completed, onComplete, onReturn}: {completed: boolean; onComplete: () => void; onReturn: () => void}) {
  const [selected, setSelected] = useState<number | null>(completed ? knowledge.question.correctIndex : null);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const question = knowledge.question;
  return <>
    <span className="card-kicker">科舉小知識 · 約一分鐘</span>
    <h2 id="reading-title">{knowledge.title}</h2>
    <span className="knowledge-scope">{knowledge.scope}</span>
    {knowledge.paragraphs.map(text => <p key={text}>{text}</p>)}
    <form className="knowledge-quiz" onSubmit={event => {
      event.preventDefault();
      if (selected === null || completed) return;
      setSubmitted(selected);
      if (selected === question.correctIndex) onComplete();
    }}>
      <span className="card-kicker">讀後一問 · 一題</span>
      <fieldset disabled={completed}>
        <legend>{question.prompt}</legend>
        {question.options.map((option, index) => <label className={`quiz-option ${selected === index ? 'is-selected' : ''}`} key={option}>
          <input type="radio" name="knowledge-answer" value={index} checked={selected === index} onChange={() => {setSelected(index); setSubmitted(null);}}/>
          <span className="quiz-letter" aria-hidden="true">{['甲', '乙', '丙'][index]}</span><span>{option}</span>
        </label>)}
      </fieldset>
      {(completed || submitted !== null) && <div className={`quiz-feedback ${completed ? 'is-correct' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <strong>{completed ? '答對了 · 閱讀完成' : '再想一想'}</strong>
        <p>{completed ? question.explanation : question.retryHints[submitted!]}</p>
      </div>}
      {!completed && <><button className="primary-button" type="submit" disabled={selected === null}><span>{submitted === null ? '確認答案' : '重新作答'}</span><ArrowRight size={17}/></button><p className="quiz-note">選一個答案，答對即可完成閱讀；答錯可重選。</p></>}
    </form>
    <div className="knowledge-note">{knowledge.note}</div>
    <div className="knowledge-sources"><span>延伸閱讀與來源</span>{knowledge.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowRight size={13}/></a>)}</div>
    <button className="primary-button" onClick={onReturn} disabled={!completed}><span>{completed ? '完成，返回畫卷' : '完成答題後返回畫卷'}</span><ArrowRight size={17}/></button>
  </>;
}
