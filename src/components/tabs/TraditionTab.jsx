import KnowledgeCard from '../common/KnowledgeCard.jsx';
import FormulaBlock from '../common/FormulaBlock.jsx';

/**
 * Shared template for Buddhism, Jainism, Sikhism, Taoism tabs.
 * Each card's optional compute(session) yields { value, valueLabel, interpretation }.
 */
export default function TraditionTab({ title, blurb, cards, references, session }) {
  return (
    <div className="sec">
      <h2>{title}</h2>
      <div className="cd">
        <div className="desc">{blurb}</div>
      </div>
      <div className="kgrid">
        {cards.map((card) => {
          const { compute, formula, ...rest } = card;
          const derived = compute && session ? compute(session) : {};
          return (
            <KnowledgeCard key={card.title} {...rest} {...derived}>
              {formula ? <FormulaBlock>{formula}</FormulaBlock> : null}
            </KnowledgeCard>
          );
        })}
      </div>
      <div className="cd">
        <h3>Research References</h3>
        <ol style={{ paddingLeft: 20, font: '400 12px/1.9 DM Sans', color: 'var(--dim)' }}>
          {references.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </div>
    </div>
  );
}
