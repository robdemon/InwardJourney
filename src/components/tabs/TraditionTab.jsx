import KnowledgeCard from '../common/KnowledgeCard.jsx';
import FormulaBlock from '../common/FormulaBlock.jsx';

/**
 * Shared template for the "new" tradition tabs (Buddhism, Jainism, Sikhism, Taoism).
 * Each tab passes in its title, subtitle blurb, knowledge cards and references.
 */
export default function TraditionTab({ title, blurb, cards, references }) {
  return (
    <div className="sec">
      <h2>{title}</h2>
      <div className="cd">
        <div className="desc">{blurb}</div>
      </div>
      <div className="kgrid">
        {cards.map((card) => (
          <KnowledgeCard key={card.title} {...card}>
            {card.formula ? <FormulaBlock>{card.formula}</FormulaBlock> : null}
          </KnowledgeCard>
        ))}
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
