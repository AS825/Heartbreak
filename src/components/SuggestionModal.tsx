import { useNavigate } from 'react-router-dom';
import { copy, fill, getPhase } from '../content';
import { useStore } from '../store/userStore';
import { Button, Modal } from './ui';

/** Phasenwechsel ist immer ein Angebot – die Person entscheidet. */
export default function SuggestionModal() {
  const suggestion = useStore((s) => s.suggestion);
  const answer = useStore((s) => s.answerSuggestion);
  const navigate = useNavigate();
  if (!suggestion) return null;

  const text = copy.suggestions[suggestion.kind];
  const target = suggestion.kind === 'complete' ? null : getPhase(suggestion.to);
  const emoji = suggestion.kind === 'advance' ? '🌄' : suggestion.kind === 'step_back' ? '🫂' : '🎓';

  return (
    <Modal open>
      <div className="text-center">
        <div className="mb-2 animate-float text-6xl">{emoji}</div>
        <h2 className="text-2xl font-semibold">{text.title}</h2>
        <p className="mt-3 text-ink-soft">{fill(text.text, { phaseTitle: target?.title })}</p>
        {target && (
          <p className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold">
            {target.emoji} {target.subtitle}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={() => {
              answer(true);
              navigate(suggestion.kind === 'complete' ? '/abschluss' : '/weg');
            }}
          >
            {text.yes}
          </Button>
          <Button variant="ghost" onClick={() => answer(false)}>
            {text.no}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
