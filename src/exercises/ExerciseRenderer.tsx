import type { Exercise } from '../content/types';
import type { ExerciseOutput } from '../store/types';
import BreathPlayer from './BreathPlayer';
import StepsPlayer from './StepsPlayer';
import MicroAction from './MicroAction';
import Top5List from './Top5List';
import TextPrompt from './TextPrompt';
import IkigaiStep from './IkigaiStep';
import HabitDesigner from './HabitDesigner';

export type RendererProps<T extends Exercise['type']> = {
  exercise: Extract<Exercise, { type: T }>;
  onDone: (output: ExerciseOutput) => void;
};

/** Ein Renderer pro Übungstyp. Neue Übungen brauchen nur JSON – neue Typen einen Renderer hier. */
export default function ExerciseRenderer({ exercise, onDone }: { exercise: Exercise; onDone: (o: ExerciseOutput) => void }) {
  switch (exercise.type) {
    case 'breath':
      return <BreathPlayer exercise={exercise} onDone={onDone} />;
    case 'grounding':
      return <StepsPlayer exercise={exercise} onDone={onDone} />;
    case 'micro_action':
      return <MicroAction exercise={exercise} onDone={onDone} />;
    case 'list_top5':
      return <Top5List exercise={exercise} onDone={onDone} />;
    case 'journal':
    case 'reflection':
    case 'inner_child':
    case 'letter':
    case 'vent':
      return <TextPrompt exercise={exercise} onDone={onDone} />;
    case 'ikigai_step':
      return <IkigaiStep exercise={exercise} onDone={onDone} />;
    case 'habit_design':
      return <HabitDesigner onDone={onDone} />;
  }
}
