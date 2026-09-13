import { describe, expect, it } from 'vitest';
import { buddyFace, followUp, greeting, isEcho, promptsFor, replyTo, timeOfDay } from './buddy';

describe('timeOfDay', () => {
  it('splits the day into four parts', () => {
    expect(timeOfDay(7)).toBe('morning');
    expect(timeOfDay(14)).toBe('afternoon');
    expect(timeOfDay(19)).toBe('evening');
    expect(timeOfDay(23)).toBe('night');
  });
});

describe('greeting', () => {
  it('uses the child name when there is one', () => {
    expect(greeting('morning', 'Arjun')).toContain('Good morning Arjun!');
    expect(greeting('evening', '')).toBe('Good evening! I am your talk buddy.');
  });
});

describe('promptsFor', () => {
  it('asks about breakfast in the morning and dinner in the evening', () => {
    expect(promptsFor('morning').map((p) => p.id)).toContain('breakfast');
    expect(promptsFor('evening').map((p) => p.id)).toContain('dinner');
    expect(promptsFor('afternoon').map((p) => p.id)).toContain('school');
  });

  it('has plenty of questions and never repeats one', () => {
    for (const time of ['morning', 'afternoon', 'evening', 'night'] as const) {
      const ids = promptsFor(time).map((prompt) => prompt.id);
      expect(ids.length).toBeGreaterThan(15);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('always offers answers to tap', () => {
    for (const time of ['morning', 'afternoon', 'evening', 'night'] as const) {
      for (const prompt of promptsFor(time)) {
        expect(prompt.chips.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('replyTo', () => {
  const feel = promptsFor('morning').find((p) => p.id === 'feel')!;
  const breakfast = promptsFor('morning').find((p) => p.id === 'breakfast')!;

  it('repeats the answer back', () => {
    expect(replyTo(feel, 'happy', 'Arjun')).toContain('You feel happy');
    expect(replyTo(breakfast, 'eggs', '')).toContain('eggs');
  });

  it('is patient with an empty answer', () => {
    expect(replyTo(feel, '  ', 'Arjun')).toBe('Take your time Arjun.');
  });
});

describe('followUp', () => {
  const wake = promptsFor('morning').find((p) => p.id === 'wake')!;
  const lunch = promptsFor('afternoon').find((p) => p.id === 'lunch')!;
  const colour = promptsFor('morning').find((p) => p.id === 'colour')!;

  it('stays on the topic instead of jumping to a new one', () => {
    expect(followUp(wake, 'yes')?.text).toContain('dream');
    expect(followUp(wake, 'no')?.text).toContain('woke you up');
    expect(followUp(lunch, 'rice')?.text).toBe('Did you like it?');
  });

  it('goes one step deeper and then lets a new topic start', () => {
    const second = followUp(colour, 'blue')!;
    const third = followUp(second, 'toy')!;
    expect(third.text).toBe('How did that feel?');
    expect(followUp(third, 'happy')).toBeNull();
  });

  it('does not push when there is nothing to answer', () => {
    expect(followUp(wake, '  ')).toBeNull();
    expect(followUp(promptsFor('morning').find((p) => p.id === 'pain')!, 'no')).toBeNull();
  });

  it('offers answers to tap for every follow up', () => {
    for (const time of ['morning', 'afternoon', 'evening', 'night'] as const) {
      for (const prompt of promptsFor(time)) {
        for (const said of ['yes', 'no', 'tired']) {
          const more = followUp(prompt, said);
          if (more) expect(more.chips.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('isEcho', () => {
  const spoken = 'Good talking! You said yes. How do you feel today?';

  it('ignores the buddy hearing itself through the speaker', () => {
    expect(isEcho('how do you feel today', spoken)).toBe(true);
    expect(isEcho('', spoken)).toBe(true);
  });

  it('keeps what the child actually says', () => {
    expect(isEcho('i am happy', spoken)).toBe(false);
    expect(isEcho('yes', spoken)).toBe(false);
    expect(isEcho('i want my tablet please', spoken)).toBe(false);
  });
});

describe('buddyFace', () => {
  it('changes with the mood', () => {
    expect(buddyFace('listening')).not.toBe(buddyFace('talking'));
  });
});
