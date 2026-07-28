const SUPERSCRIPTS = { '-': '⁻', '+': '⁺', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const SUBSCRIPTS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', n: 'ₙ' };
const toScript = (value, map) => [...String(value)].map((character) => map[character] ?? character).join('');

const normalizeMathText = (value) => String(value ?? '')
  .replace(/[□�]+/g, '⋯')
  .replace(/[º˚]/g, '°')
  .replace(/\s+\*\s+/g, ' × ')
  .replace(/(\d)\s*[xX]\s*(?=\d|\()/g, '$1 × ')
  .replace(/(\d)\s*\((\d+(?:\.\d+)?)\)/g, '$1 × $2')
  .replace(/\b(m|cm|mm|km|ft|in|sec)([23])\b/gi, (_, unit, power) => `${unit}${toScript(power, SUPERSCRIPTS)}`)
  .replace(/\b([abcstv])([23])\b/g, (_, variable, power) => `${variable}${toScript(power, SUPERSCRIPTS)}`)
  .replace(/\b10\s*([-+]\d+)\b/g, (_, exponent) => `10${toScript(exponent, SUPERSCRIPTS)}`)
  .replace(/\b(CO|O|N|H|SO|NO)([234])\b/g, (_, chemical, index) => `${chemical}${toScript(index, SUBSCRIPTS)}`)
  .replace(/\b([CPVT])\s*([12n])\b/g, (_, variable, index) => `${variable}${toScript(index, SUBSCRIPTS)}`)
  .replace(/\bH\+/g, 'H⁺')
  .replace(/\s{2,}/g, ' ')
  .trim();

const splitIntoBlocks = (value) => {
  const normalized = normalizeMathText(value);
  if (!normalized) return [];

  const restoredLines = normalized
    .replace(/\s+(?=(?:Where:|Therefore:|Thus:|Remember(?: that)?:|NOTE:|The correct solution is))/gi, '\n')
    .replace(
      /\s+(?=(?:[A-Z][A-Za-z]*(?:\([^)]{1,30}\))?|[A-Z]{1,8}|[a-z]{1,3})\s*=)/g,
      '\n',
    );

  return restoredLines
    .split(/\r?\n+/)
    .map((text) => ({
      text: text.trim(),
      isEquation: /(?:=|≤|≥|≈|∑|√|\b(?:sin|cos|tan|log)\b)/i.test(text),
    }))
    .filter((block) => block.text);
};

const isTwaExample = (text) => {
  const compact = String(text ?? '').replace(/\s+/g, '').toLowerCase();
  return compact.includes('22(2)')
    && compact.includes('3(2)')
    && compact.includes('5(2)')
    && compact.includes('8(2)')
    && compact.includes('9.5ppm');
};

const Fraction = ({ numerator, denominator }) => (
  <span className="inline-flex max-w-full flex-col items-center align-middle">
    <span className="max-w-full border-b border-current px-2 pb-1 text-center">{numerator}</span>
    <span className="px-2 pt-1 text-center">{denominator}</span>
  </span>
);

const TwaExplanation = () => (
  <div className="overflow-x-auto text-gray-700 dark:text-slate-300">
    <div className="min-w-max space-y-4 py-1 text-base leading-relaxed">
      <div className="flex items-center gap-2">
        <span>TWA =</span>
        <Fraction
          numerator={<>C<sub>1</sub> × T<sub>1</sub> + C<sub>2</sub> × T<sub>2</sub> + ⋯ + C<sub>n</sub> × T<sub>n</sub></>}
          denominator={<>T<sub>1</sub> + T<sub>2</sub> + ⋯ + T<sub>n</sub></>}
        />
      </div>
      <div className="flex items-center gap-2">
        <span>TWA =</span>
        <Fraction
          numerator={<>22 × 2 + 3 × 2 + 5 × 2 + 8 × 2</>}
          denominator={<>2 + 2 + 2 + 2</>}
        />
      </div>
      <p>= 76 ÷ 8 = 9.5 ppm</p>
      <p>The correct solution is C.</p>
    </div>
  </div>
);

const ExplanationContent = ({ children }) => {
  const text = String(children ?? '');
  if (isTwaExample(text)) return <TwaExplanation />;

  const blocks = splitIntoBlocks(text);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
      {blocks.map((block, index) => block.isEquation ? (
        <div
          key={`${index}-${block.text}`}
          className="overflow-x-auto rounded-md border border-blue-100/80 bg-white/60 px-3 py-2 font-medium tabular-nums whitespace-pre-wrap dark:border-blue-800/30 dark:bg-slate-900/25"
        >
          {block.text}
        </div>
      ) : (
        <p key={`${index}-${block.text}`} className="whitespace-pre-wrap">{block.text}</p>
      ))}
    </div>
  );
};

export default ExplanationContent;
