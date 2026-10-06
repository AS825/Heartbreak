import { useNavigate } from 'react-router-dom';
import { onboarding } from '../content';
import { Button } from '../components/ui';

export default function Welcome() {
  const navigate = useNavigate();
  const { intro } = onboarding;
  return (
    <div className="flex min-h-[85dvh] flex-col justify-center">
      <div className="relative mx-auto mb-8 h-44 w-44">
        <div className="blob absolute inset-0 animate-float bg-coral/25" />
        <div className="absolute inset-0 flex items-center justify-center text-8xl">🌷</div>
        <span className="absolute -right-2 top-2 animate-float text-3xl [animation-delay:1s]">🦋</span>
      </div>
      <h1 className="animate-fade-up text-center text-4xl font-semibold">{intro.title}</h1>
      <div className="mt-4 space-y-3 text-center text-lg text-ink-soft">
        {intro.lines.map((l, i) => (
          <p key={i} className="animate-fade-up" style={{ animationDelay: `${150 + i * 150}ms` }}>
            {l}
          </p>
        ))}
      </div>
      <Button className="mt-10 w-full animate-fade-up [animation-delay:700ms]" onClick={() => navigate('/onboarding')}>
        {intro.cta}
      </Button>
    </div>
  );
}
