// High-quality mock responses used when no OPENAI_API_KEY is configured.
// Keeps the AI Coach experience usable in demo / offline mode.

interface MockMatcher {
  patterns: RegExp[];
  reply: string;
}

const MOCK_REPLIES: MockMatcher[] = [
  {
    patterns: [/endurance/i, /aerobic base/i, /stamina/i],
    reply:
      "Endurance is built in the *slow* miles, not the fast ones. Spend 80% of your weekly volume at a conversational pace where you can hold a sentence without gasping. Add one long run per week and grow it by no more than ~10% in distance. Throw in one tempo or threshold session weekly to lift your ceiling. The aerobic engine takes weeks to remodel — be patient and consistent.",
  },
  {
    patterns: [/5k/i, /5 ?k training/i],
    reply:
      "Here's a clean 6-week 5K block:\n\n• 3 easy runs (30–40 min, Z2)\n• 1 interval day — start with 6×400m at goal 5K pace, +90s rest\n• 1 tempo — 20 min at comfortably hard\n• 1 long run — 60–75 min easy\n• 1 full rest day\n\nWeek 4 add 8×400m. Week 5 shift to 5×800m at 5K pace. Week 6 taper: cut volume 40%, keep one short tempo, race fresh.",
  },
  {
    patterns: [/calves/i, /calf/i, /shin/i],
    reply:
      "Sore calves usually means one of three things: cadence dropped (you're overstriding), you ramped volume too fast, or your shoes have lost their pop. Try this: count your steps for 30s — aim for 88+ per leg. Roll your calves with a lacrosse ball for 90s each side, twice a day. If it's sharp pain (not soreness), back off for 48 hours.",
  },
  {
    patterns: [/recovery/i, /sore/i, /tired/i],
    reply:
      "Recovery has three pillars: sleep (8h minimum on hard days), fuel (30g protein within an hour post-run), and active blood flow (an easy 20-min spin or walk beats lying still). The single biggest lever is sleep — most plateaus break with one extra hour per night for a week.",
  },
  {
    patterns: [/threshold/i, /lactate/i, /tempo/i],
    reply:
      "Threshold pace = the pace you could hold for ~60 minutes all-out. It's the single highest-ROI session for distance runners. Format: 2-mile warmup → 20–30 min at threshold → 1-mile cooldown. HR should sit in the high Z3 / low Z4 band. Run it once weekly, never two days in a row with intervals.",
  },
  {
    patterns: [/pace/i, /pacing/i],
    reply:
      "The #1 pacing mistake is going out too fast on the first mile. Plan a negative split: target 5–10 sec/mile slower than goal pace for mile 1, lock into goal pace by mile 2, and have something left to push the final third. Your watch is a tool — your effort is the truth.",
  },
  {
    patterns: [/marathon/i, /full/i, /26\.2/i],
    reply:
      "Marathon prep is 70% aerobic base, 20% race-pace work, 10% speed. The long run is non-negotiable — peak at 20–22 miles 3 weeks out. Practice fueling: take a gel every 30 min from mile 6 onward. Race-day rule: if you feel great at mile 10, you went out too fast.",
  },
  {
    patterns: [/cadence/i, /steps/i],
    reply:
      "Optimal cadence sits around 170–180 steps per minute for most runners. Higher cadence = shorter stride = less impact per step. To raise yours, use a metronome app at 5 bpm above your current rate for short intervals. Don't force it — let it climb gradually as you get fitter.",
  },
  {
    patterns: [/fuel/i, /eat/i, /nutrition/i, /carb/i],
    reply:
      "For runs under 75 minutes: water is enough. For runs over 90 minutes: 30–60g of carbs per hour, plus electrolytes. Pre-run: an easy-to-digest 200–300 cal snack 60–90 min before (banana + toast is a classic). Post-run within an hour: 20–30g protein + carbs for glycogen replenishment.",
  },
  {
    patterns: [/injury/i, /pain/i, /hurts/i],
    reply:
      "Quick triage: sharp pain = stop today, ice, reassess in 48h. Dull ache that fades during the run = usually safe to continue, but cut intensity. Pain that worsens during the run = stop immediately. The 24-hour rule: if you're still hurting the next morning, take a true rest day. Running through pain almost always turns weeks of rest into months.",
  },
  {
    patterns: [/race/i, /race day/i],
    reply:
      "Race-day checklist:\n\n• Sleep priority is *two nights before* — race-eve nerves are normal\n• Eat what you've trained with — no experiments\n• Lay out gear the night before\n• Arrive early enough to do a 10-min jog + 4×30s strides\n• First mile rule: feel like you're holding back\n• Race the second half harder than the first\n\nTrust the training.",
  },
  {
    patterns: [/strength/i, /lift/i, /gym/i],
    reply:
      "Runners need strength work — 2× per week, 30 min each. Hit: single-leg squats, deadlifts, planks, glute bridges, calf raises. The goal isn't bulk — it's resilience. Strong glutes prevent knee injuries; strong calves prevent Achilles issues; a strong core stabilizes form when you get tired.",
  },
];

const FALLBACK_REPLIES = [
  "Good question. Give me one more detail — are you asking about training, recovery, or race prep? I'll tailor the answer.",
  "I can help with that. To dial in the advice, tell me your current weekly mileage and your goal — those two numbers shape everything.",
  "Happy to dig into this. The honest answer depends on your training history. Want me to assume intermediate (3-5 years) or adjust?",
];

export function mockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const m of MOCK_REPLIES) {
    if (m.patterns.some((p) => p.test(lower))) {
      return m.reply;
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

export const SUGGESTED_PROMPTS: string[] = [
  "How should I improve my endurance?",
  "Create a 5K training plan",
  "Why are my calves sore after running?",
  "What's the right way to pace a long run?",
  "How do I run through a side stitch?",
  "Should I run on rest days?",
];
