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
  const dream = promptsFor('morning').find((p) => p.id === 'dream')!;

  it('repeats the answer back', () => {
    expect(replyTo(feel, 'happy', 'Arjun')).toContain('you feel happy');
    expect(replyTo(breakfast, 'eggs', '')).toContain('eggs');
  });

  it('answers yes and no differently instead of always cheering', () => {
    expect(replyTo(dream, 'no', 'Arjun')).not.toContain('no.');
    expect(replyTo(dream, 'no', 'Arjun')).toContain('That is okay');
    expect(replyTo(dream, 'yes', 'Arjun')).toContain('lovely');
  });

  it('is kind about a sad feeling', () => {
    expect(replyTo(feel, 'sad', '')).toContain('I am sorry');
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
    expect(followUp(wake, 'yes')?.text).toContain('dream about');
    expect(followUp(wake, 'no')?.text).toContain('woke you up');
    expect(followUp(lunch, 'rice')?.text).toBe('Did you like it?');
  });

  it('goes one step deeper and then lets a new topic start', () => {
    const second = followUp(lunch, 'rice')!;
    const third = followUp(second, 'yes')!;
    expect(third.text).toBe('Who ate with you?');
    expect(followUp(third, 'mum')).toBeNull();
  });

  it('never asks the same vague question again', () => {
    const second = followUp(colour, 'blue')!;
    expect(followUp(second, 'toy')).toBeNull();
  });

  it('answers a follow up without repeating the words back', () => {
    const second = followUp(lunch, 'rice')!;
    expect(replyTo(second, 'yes', 'Arjun')).toBe('That is good.');
    expect(replyTo(second, 'no', 'Arjun')).toBe('Okay, that is fine.');
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
