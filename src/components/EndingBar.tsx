import { endings, type Ending } from '../lib/morphology';

interface Props {
  disabled: boolean;
  onApply: (ending: Ending) => void;
}

export function EndingBar({ disabled, onApply }: Props) {
  return (
    <div className="ending-bar">
      <span className="ending-title">Word endings</span>
      {endings.map((ending) => (
        <button
          key={ending.id}
          type="button"
          className="ending-button"
          disabled={disabled}
          title={ending.hint}
          onClick={() => onApply(ending.id)}
        >
          {ending.label}
        </button>
      ))}
    </div>
  );
}
