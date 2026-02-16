# AI Skill Assessment Game - Gamified Skill Validation

**Fecha:** 2026-02-15
**Estado:** Propuesta innovadora - Post-MVP feature
**Prioridad:** Media-Alta (diferenciador fuerte)

---

## 🎯 Concepto

**En lugar de solo auto-declarar skills o validar con GitHub, los users pueden "demostrar" sus skills jugando un mini-juego de assessment con IA.**

```
User agrega skill "React"
  ↓
Sistema ofrece: "Want to prove your React knowledge? 🎮"
  ↓
AI-powered quiz/ejercicios adaptados al nivel declarado
  ↓
User completa desafíos (3 vidas)
  ↓
Score → Credibility boost + Badge
```

---

## 🎮 Mecánica del Juego

### Sistema de Niveles por Skill

```typescript
enum SkillLevel {
  BEGINNER = 1,      // Básico, conceptos fundamentales
  INTERMEDIATE = 2,  // Aplicación práctica, experiencia
  ADVANCED = 3,      // Expert, arquitectura, best practices
  EXPERT = 4         // Master, enseña a otros, innova
}
```

### Sistema de Vidas

```
🟢 🟢 🟢  (3 vidas al inicio)

Respuesta incorrecta → Pierde 1 vida
Respuesta correcta → Mantiene vidas
Hint usado → -0.5 vida (opcional)

0 vidas → Assessment failed (puede reintentar en 24h)
```

### Tipos de Desafíos

#### 1. **Multiple Choice Questions**
```typescript
// IA genera pregunta adaptada al nivel
const question = {
  skill: "React",
  level: "INTERMEDIATE",
  type: "multiple_choice",
  question: "What's the best way to handle side effects in React?",
  options: [
    "componentDidMount",
    "useEffect hook",
    "useState with setTimeout",
    "render method"
  ],
  correctAnswer: 1,
  explanation: "useEffect is the modern way to handle side effects in functional components."
}
```

#### 2. **Code Snippet Review** (Identificar bugs)
```typescript
const challenge = {
  skill: "JavaScript",
  level: "INTERMEDIATE",
  type: "find_bug",
  code: `
    function fetchUser(id) {
      const user = await fetch(\`/api/users/\${id}\`)
      return user.json()
    }
  `,
  question: "What's wrong with this code?",
  options: [
    "Missing async keyword",
    "Should use .then() instead of await",
    "fetch doesn't need await",
    "Nothing is wrong"
  ],
  correctAnswer: 0
}
```

#### 3. **Short Answer** (AI evalúa respuesta)
```typescript
const challenge = {
  skill: "React",
  level: "ADVANCED",
  type: "short_answer",
  question: "Explain when you would use useMemo vs useCallback. Give an example scenario for each.",
  evaluationCriteria: [
    "Mentions useMemo for expensive calculations",
    "Mentions useCallback for function references",
    "Provides concrete examples",
    "Understands performance implications"
  ]
}

// AI evalúa la respuesta del user
const userAnswer = "useMemo is for memoizing values from expensive calculations, like filtering a large array. useCallback is for memoizing function references to prevent re-renders when passing callbacks to child components."

// Claude API evalúa
const evaluation = await evaluateAnswer(userAnswer, challenge)
// → { score: 0.85, feedback: "Good answer! Could improve by...", isCorrect: true }
```

#### 4. **Real-world Scenario**
```typescript
const challenge = {
  skill: "UX Design",
  level: "INTERMEDIATE",
  type: "scenario",
  scenario: "A user completes a purchase on your e-commerce site. Design the confirmation flow.",
  question: "What elements should the confirmation page include?",
  type: "checklist",
  correctAnswers: [
    "Order number",
    "Estimated delivery date",
    "Contact support link",
    "Order summary",
    "Payment confirmation"
  ],
  partialCredit: true // Puede acertar algunas
}
```

---

## 🎯 Flow Completo del Assessment

### Paso 1: Inicio
```tsx
// User está en Skills page, agrega "React"

<SkillCard skill="React">
  <Badge>INTERMEDIATE (Self-assessed)</Badge>

  <AssessmentCTA>
    🎮 Prove your React skills

    • 5 questions (adaptive difficulty)
    • ~5 minutes
    • Earn "Verified React Developer" badge
    • +150 XP bonus

    [Start Assessment]
  </AssessmentCTA>
</SkillCard>
```

### Paso 2: Onboarding del Juego
```
┌─────────────────────────────────────┐
│  🎮 React Skill Assessment         │
├─────────────────────────────────────┤
│  Rules:                            │
│  • 5 questions (mix of types)      │
│  • 3 lives: 🟢🟢🟢                 │
│  • Pass: 4/5 correct               │
│  • Time limit: 10 min              │
│  • Hints available (-0.5 life)     │
│                                    │
│  Rewards:                          │
│  ✓ Verified badge                  │
│  ✓ +150 XP                         │
│  ✓ 1.5x credibility multiplier     │
│                                    │
│  Ready? [Let's Go!]                │
└─────────────────────────────────────┘
```

### Paso 3: Preguntas (Adaptativas)
```tsx
// Question 1 (Easy warmup)
<Question number={1} lives={3}>
  What is React?

  ○ A JavaScript library
  ○ A programming language
  ○ A database
  ○ A CSS framework

  Lives: 🟢🟢🟢
  [Submit Answer] [Need a hint?]
</Question>

// Si acierta → Question 2 (Normal)
// Si falla → Question 2 (Easier)

// Adaptive difficulty basado en performance
```

### Paso 4: Feedback Inmediato
```
✅ Correct!

React is indeed a JavaScript library for building UIs.

Lives: 🟢🟢🟢
XP earned: +30

[Next Question]
```

o

```
❌ Incorrect

Lives: 🟢🟢🔴

The correct answer was: useEffect hook

Explanation: useEffect is the modern way to handle
side effects in functional components, replacing
lifecycle methods from class components.

[Next Question]
```

### Paso 5: Resultados Finales
```
┌─────────────────────────────────────┐
│  🎉 Assessment Complete!           │
├─────────────────────────────────────┤
│  Score: 4/5 (80%) ✅ PASSED        │
│                                    │
│  ✅ Question 1: React basics       │
│  ✅ Question 2: Hooks              │
│  ❌ Question 3: Performance        │
│  ✅ Question 4: State management   │
│  ✅ Question 5: Best practices     │
│                                    │
│  Rewards Unlocked:                 │
│  ✓ "Verified React Dev" badge      │
│  ✓ +150 XP                         │
│  ✓ Credibility: 1.0x → 1.5x        │
│                                    │
│  Your skill level confirmed:       │
│  INTERMEDIATE ✓                    │
│                                    │
│  [View Badge] [Share Results]      │
└─────────────────────────────────────┘
```

---

## 🤖 IA Implementation

### Generación de Preguntas (Claude API)

```typescript
// features/ai/services/skill-assessment.service.ts

export async function generateAssessment(
  skill: string,
  level: SkillLevel,
  previousAnswers?: AssessmentAnswer[]
): Promise<AssessmentQuestion> {

  // Adaptive: Ajustar dificultad basado en respuestas previas
  const performance = calculatePerformance(previousAnswers)
  const adjustedLevel = adjustDifficulty(level, performance)

  const prompt = `
Generate a ${adjustedLevel} level assessment question for the skill: ${skill}

Requirements:
- Type: multiple_choice
- 4 options
- 1 correct answer
- Include brief explanation
- Practical, real-world scenario
- No trick questions

Previous questions covered: ${previousAnswers?.map(a => a.topic).join(', ')}
(Avoid repetition)

Return JSON:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0-3,
  "explanation": "...",
  "topic": "..."
}
`

  const response = await generateJSON<AssessmentQuestion>(prompt)

  return response
}
```

### Evaluación de Respuestas Abiertas

```typescript
export async function evaluateShortAnswer(
  question: string,
  userAnswer: string,
  criteria: string[]
): Promise<{
  score: number // 0-1
  isCorrect: boolean
  feedback: string
}> {

  const prompt = `
Evaluate this answer to a skill assessment question.

Question: ${question}
User answer: ${userAnswer}

Evaluation criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Return JSON:
{
  "score": 0.0-1.0,
  "isCorrect": true/false (>0.7 is correct),
  "feedback": "brief constructive feedback",
  "criteriaMetCount": number of criteria met
}
`

  const evaluation = await generateJSON<EvaluationResult>(prompt)

  return evaluation
}
```

### Generación de Code Challenges

```typescript
export async function generateCodeChallenge(
  skill: string,
  level: SkillLevel
): Promise<CodeChallenge> {

  const prompt = `
Generate a "find the bug" code challenge for ${skill} at ${level} level.

Requirements:
- Real-world code snippet (5-10 lines)
- 1 clear bug (not syntax error, conceptual issue)
- 4 multiple choice options explaining what's wrong
- 1 correct answer
- Brief explanation of the fix

Return JSON with: code, question, options, correctAnswer, explanation
`

  return generateJSON<CodeChallenge>(prompt)
}
```

---

## 💰 Costos & Modelos

### Problema: AI Costs a Escala

```typescript
// Por assessment (5 preguntas):
- Generate 5 questions: ~2500 tokens input + 1500 output
- Evaluate answers: ~500 tokens input + 200 output

Total: ~4700 tokens per assessment
```

**Con Claude Sonnet 4.5:**
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**Costo por assessment:**
```
(3000 input * $3/1M) + (1700 output * $15/1M)
= $0.009 + $0.0255
= ~$0.035 per assessment
```

**Para 1000 users haciendo 1 assessment/mes:**
- $35/mes en AI costs

**Para 10,000 users:**
- $350/mes

Bastante razonable! ✅

---

### Solución: Freemium + Caching

#### Opción 1: Freemium Model
```typescript
const ASSESSMENT_LIMITS = {
  free: {
    assessmentsPerMonth: 3,  // 3 skills pueden validar gratis
    features: ['multiple_choice', 'find_bug']
  },
  pro: {
    assessmentsPerMonth: 'unlimited',
    features: ['multiple_choice', 'find_bug', 'short_answer', 'scenarios'],
    price: '$9/month'
  }
}
```

**Revenue vs Costs:**
```
10,000 users:
  - 70% free (7k users × 3 assessments × $0.035) = $735/mes
  - 30% pro (3k users × $9) = $27,000/mes

Costs: $735 AI + ~$100 infrastructure
Revenue: $27,000
Profit: ~$26,100/mes 🎉
```

#### Opción 2: Question Bank + AI Hybrid
```typescript
// Pre-generar 1000 preguntas por skill con AI
// Cachear en database
// Usar AI solo para:
//   1. Adaptive difficulty
//   2. Evaluar short answers
//   3. Generar nuevas preguntas periódicamente

// Esto reduce costs ~80%
Cost per assessment: $0.035 → $0.007
```

#### Opción 3: Open-Source Models (Self-Hosted)
```typescript
// Usar modelos open-source para algunas tasks:
- Multiple choice generation: Llama 3 70B (self-hosted)
- Evaluation: Claude Haiku (barato, $0.25/1M input)
- Complex tasks: Claude Sonnet (solo cuando necesario)

// Costo híbrido: ~$0.015 per assessment
```

---

## 🎨 UI/UX Design

### Assessment Widget (Gaming Mode)

```tsx
// Dashboard widget
<GamingCard variant="glow">
  <CardHeader>
    🎮 Skill Assessments
  </CardHeader>

  <CardContent>
    {unvalidatedSkills.map(skill => (
      <AssessmentCTA
        skill={skill}
        xpReward={calculateXPReward(skill.level)}
        badge={getBadgeName(skill)}
      >
        Prove your {skill.name} knowledge
        [Start Challenge]
      </AssessmentCTA>
    ))}

    {validatedSkills.length > 0 && (
      <ValidatedSkills>
        ✓ {validatedSkills.length} skills verified
      </ValidatedSkills>
    )}
  </CardContent>
</GamingCard>
```

### Assessment In-Progress

```tsx
<AssessmentGame>
  {/* Header */}
  <Header>
    <SkillBadge>{skill.name}</SkillBadge>
    <Lives>🟢🟢🔴</Lives>
    <Timer>4:32 remaining</Timer>
  </Header>

  {/* Progress */}
  <Progress>
    Question {currentQuestion} of 5
    [====●-----] 40%
  </Progress>

  {/* Question */}
  <QuestionCard>
    <QuestionText>{question.text}</QuestionText>

    {question.type === 'code' && (
      <CodeBlock language={skill.language}>
        {question.code}
      </CodeBlock>
    )}

    <Options>
      {question.options.map((opt, i) => (
        <OptionButton
          key={i}
          selected={selectedAnswer === i}
          onClick={() => setSelectedAnswer(i)}
        >
          {opt}
        </OptionButton>
      ))}
    </Options>
  </QuestionCard>

  {/* Actions */}
  <Actions>
    <HintButton disabled={hintsUsed >= 2}>
      💡 Hint (-0.5 life)
    </HintButton>
    <SubmitButton disabled={!selectedAnswer}>
      Submit Answer
    </SubmitButton>
  </Actions>
</AssessmentGame>
```

### Results Screen

```tsx
<ResultsScreen success={score >= 0.8}>
  <ResultsHeader>
    {success ? '🎉 Congratulations!' : '😔 Try Again'}
  </ResultsHeader>

  <ScoreDisplay>
    {score * 100}% ({correctAnswers}/{totalQuestions})
  </ScoreDisplay>

  <QuestionBreakdown>
    {questions.map((q, i) => (
      <QuestionResult
        question={q}
        userAnswer={userAnswers[i]}
        correct={q.isCorrect}
      />
    ))}
  </QuestionBreakdown>

  {success && (
    <Rewards>
      <Badge>{badgeEarned}</Badge>
      <XP>+{xpEarned} XP</XP>
      <CredibilityBoost>
        Credibility: {oldCredibility}x → {newCredibility}x
      </CredibilityBoost>
    </Rewards>
  )}

  <Actions>
    {success ? (
      <>
        <ShareButton>Share on LinkedIn</ShareButton>
        <ViewBadgeButton>View Badge</ViewBadgeButton>
      </>
    ) : (
      <>
        <RetryButton disabled={!canRetry}>
          Retry in {timeUntilRetry}
        </RetryButton>
        <ReviewButton>Review Answers</ReviewButton>
      </>
    )}
  </Actions>
</ResultsScreen>
```

---

## 🏆 Rewards & Incentives

### Badges Desbloqueables

```typescript
const SKILL_BADGES = {
  verified: {
    name: 'Verified {skill}',
    icon: '✓',
    requirement: 'Pass assessment with >80%',
    credibilityBoost: 1.5
  },
  expert: {
    name: '{skill} Expert',
    icon: '⭐',
    requirement: 'Pass ADVANCED level with 100%',
    credibilityBoost: 2.0
  },
  polyglot: {
    name: 'Tech Polyglot',
    icon: '🌟',
    requirement: 'Verify 5+ languages',
    credibilityBoost: 1.2,
    xpBonus: 500
  },
  perfectionist: {
    name: 'Perfectionist',
    icon: '💯',
    requirement: 'Get 100% on any assessment',
    xpBonus: 200
  }
}
```

### XP Rewards

```typescript
const XP_REWARDS = {
  BEGINNER: {
    pass: 50,
    perfect: 75
  },
  INTERMEDIATE: {
    pass: 150,
    perfect: 200
  },
  ADVANCED: {
    pass: 300,
    perfect: 400
  },
  EXPERT: {
    pass: 500,
    perfect: 750
  }
}
```

### Credibility Multiplier

```typescript
// Skill credibility aumenta con assessment
skill.credibilityScore = baseScore * assessmentMultiplier

// Example:
Manual skill: 1.0x
+ GitHub verified: 1.3x
+ Assessment passed (80%): 1.5x
+ Assessment perfect (100%): 2.0x

// Esto afecta:
- Portfolio ranking/visibility
- Search placement
- Trust score visible para recruiters
```

---

## 📊 Gamification Mechanics

### Leaderboards

```tsx
<Leaderboard skill="React">
  Top React Developers (This Month)

  1. @johndoe - 5/5 perfect assessments 💯
  2. @janedoe - 4/5 perfect assessments ⭐
  3. @alex - 12 skills verified ✓
  ...

  Your rank: #47 (top 15%)
</Leaderboard>
```

### Achievements

```typescript
const ACHIEVEMENTS = {
  first_assessment: {
    name: 'First Steps',
    description: 'Complete your first skill assessment',
    xp: 50
  },
  perfect_score: {
    name: 'Perfect Score',
    description: 'Get 100% on any assessment',
    xp: 100
  },
  comeback: {
    name: 'Comeback Kid',
    description: 'Pass an assessment after previously failing',
    xp: 150
  },
  streak_3: {
    name: '3-Day Streak',
    description: 'Complete assessments on 3 consecutive days',
    xp: 200
  },
  polyglot_5: {
    name: 'Polyglot',
    description: 'Verify 5 different skills',
    xp: 300
  }
}
```

### Challenges & Events

```tsx
// Weekly challenges
<WeeklyChallenge>
  🏆 This Week's Challenge

  "React Master Week"
  Verify React + 2 related skills

  Rewards:
  • "React Ecosystem Expert" badge
  • 2x XP for React-related assessments
  • Chance to win $50 swag

  Ends in: 3d 14h

  [Accept Challenge]
</WeeklyChallenge>
```

---

## 🔐 Anti-Cheating Measures

### 1. Time Limits
```typescript
const TIME_LIMITS = {
  multiple_choice: 60, // seconds per question
  find_bug: 120,
  short_answer: 180,
  scenario: 240
}

// Si timeout → respuesta incorrecta automática
```

### 2. Question Randomization
```typescript
// Randomizar:
- Orden de opciones
- Orden de preguntas (de un pool)
- Variaciones de la misma pregunta

// Evita que users compartan respuestas
```

### 3. Cooldown Periods
```typescript
const RETRY_COOLDOWNS = {
  failed_assessment: 24 * 60 * 60 * 1000, // 24 hours
  passed_assessment: 30 * 24 * 60 * 60 * 1000 // 30 days (para re-verificar)
}

// No pueden spam intentos
```

### 4. Browser Tab Detection
```typescript
// Detectar si user cambia de tab (buscar respuestas)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && assessmentActive) {
    tabSwitchCount++

    if (tabSwitchCount > 3) {
      flagSuspiciousActivity(userId, assessmentId)
      // Warning o invalidar assessment
    }
  }
})
```

### 5. AI Detection de Respuestas Copiadas
```typescript
// Para short answers, detectar si response es copy-paste de docs
const aiDetection = await detectCopiedAnswer(userAnswer, skill)

if (aiDetection.isSuspicious) {
  // Solicitar re-formulación en sus propias palabras
  return {
    error: 'Please answer in your own words',
    allowRetry: true
  }
}
```

---

## 📈 Success Metrics

### Engagement
- % de users que intentan assessments: Target >40%
- Assessment completion rate: Target >70%
- Retry rate after failure: Target >60%
- Average score: Target ~75%

### Quality
- Assessment difficulty calibration: Target 80% pass rate
- User satisfaction con questions: Target >4/5
- Correlation con GitHub validation: Target >0.7

### Revenue (si freemium)
- Free→Pro conversion via assessments: Target >5%
- Avg assessments per user/month: Target 2-3

---

## 🚀 Implementation Roadmap

### Phase 1: MVP (2-3 semanas)
```
- [ ] Basic assessment engine
- [ ] Multiple choice questions only
- [ ] Claude API integration para question generation
- [ ] 3 vidas system
- [ ] Pass/fail logic
- [ ] Badge rewards
- [ ] XP rewards
- [ ] 5 skills supported (React, JavaScript, TypeScript, Python, Node.js)
```

### Phase 2: Enhanced (2 semanas)
```
- [ ] Code challenges (find the bug)
- [ ] Adaptive difficulty
- [ ] Short answer evaluation
- [ ] Hints system
- [ ] Question bank caching
- [ ] Leaderboards
- [ ] More skills (10+)
```

### Phase 3: Advanced (3 semanas)
```
- [ ] Scenario-based questions
- [ ] Weekly challenges
- [ ] Achievements system
- [ ] Anti-cheating measures
- [ ] Analytics dashboard
- [ ] Share results on social
```

### Phase 4: Scale (ongoing)
```
- [ ] Freemium model
- [ ] Question bank expansion (1000+ per skill)
- [ ] Community-contributed questions
- [ ] Professional Mode adaptation
- [ ] Industry certifications integration
```

---

## 💡 Diferenciador Competitivo

**Ningún otro portfolio builder tiene esto:**
- LinkedIn: Solo endorsements (no validación real)
- GitHub: Solo activity (no knowledge testing)
- Behance/Dribbble: Solo portfolio visual
- HackerRank/LeetCode: Solo coding challenges (no portfolio integration)

**Portfoland Assessment = Portfolio + Proof**

---

## 🎯 Next Steps

1. **Validar concepto** con early users (¿Les interesa?)
2. **Prototype simple** con 1 skill (React)
3. **Test cost/user** con real usage
4. **Medir engagement** vs traditional validation
5. **Decidir freemium** pricing si costs lo requieren
6. **Scale gradually** skill by skill

---

## 🎤 Extensión: Mock Interviews + Career Coaching

**Idea adicional:** Además del skill assessment, ofrecer **práctica de entrevistas** y **coaching personalizado** con IA.

### 1. Mock Interview Mode 🎭

#### Tipos de Entrevistas

**A. Technical Interview**
```typescript
// User elige skill para practicar
const interview = {
  skill: "React",
  type: "technical",
  difficulty: "senior",
  duration: 30 // minutes
}

// IA hace preguntas progresivas
const questions = [
  {
    type: "conceptual",
    question: "Explain how React's reconciliation algorithm works",
    followUps: [
      "How does it compare to other frameworks?",
      "When would you optimize it?"
    ]
  },
  {
    type: "coding",
    question: "Implement a custom hook for debouncing",
    hints: ["Consider useEffect", "What about cleanup?"]
  },
  {
    type: "system_design",
    question: "Design a scalable comment system",
    aspects: ["State management", "Optimization", "API design"]
  }
]
```

**B. Behavioral Interview (STAR method)**
```typescript
const behavioralQuestions = [
  "Tell me about a time you had to resolve a conflict in your team",
  "Describe a challenging project and how you overcame obstacles",
  "Give an example of when you showed leadership"
]

// IA evalúa respuesta según STAR
const evaluation = {
  structure: {
    situation: 0.8,  // Did they set context?
    task: 0.9,       // Clear objective?
    action: 0.7,     // What did they DO?
    result: 0.6      // Impact? Numbers?
  },
  feedback: "Good situation setup, but result could be more specific. Add metrics.",
  score: 0.75
}
```

**C. System Design Interview**
```typescript
// Para senior/lead roles
const systemDesignPrompt = {
  scenario: "Design Instagram's feed system",
  requirements: [
    "Handle 1M concurrent users",
    "Real-time updates",
    "Personalized feeds"
  ],
  evaluationCriteria: [
    "Scalability considerations",
    "Database choices",
    "Caching strategy",
    "API design"
  ]
}

// IA evalúa diagramas + respuestas de texto
```

#### Mock Interview Flow

```tsx
<MockInterview>
  {/* Setup */}
  <InterviewSetup>
    Choose Interview Type:
    ○ Technical (30 min)
    ○ Behavioral (20 min)
    ○ System Design (45 min)

    Difficulty:
    ○ Junior ○ Mid-level ● Senior

    [Start Interview]
  </InterviewSetup>

  {/* Durante la entrevista */}
  <InterviewSession>
    <Timer>24:32 remaining</Timer>

    <AIInterviewer>
      👔 "Explain React's reconciliation algorithm"
    </AIInterviewer>

    {/* User responde (texto o voz) */}
    <AnswerInput
      type="text" // o "voice" con speech-to-text
      placeholder="Your answer..."
    />

    {/* Real-time feedback (opcional) */}
    <LiveFeedback>
      💡 Tip: Consider mentioning virtual DOM
    </LiveFeedback>

    <Actions>
      <PassButton>I don't know, skip</PassButton>
      <HintButton>Give me a hint</HintButton>
      <SubmitButton>Submit Answer</SubmitButton>
    </Actions>
  </InterviewSession>

  {/* Feedback final */}
  <InterviewFeedback>
    Overall Score: 7.5/10 ⭐

    Strengths:
    ✓ Clear communication
    ✓ Good technical depth
    ✓ Structured thinking

    Areas to Improve:
    ⚠ Add more specific examples
    ⚠ Mention edge cases
    ⚠ Quantify impact with numbers

    Detailed Breakdown:
    • Technical accuracy: 8/10
    • Communication: 7/10
    • Problem solving: 8/10
    • STAR structure: 6/10

    [Practice Again] [View Transcript]
  </InterviewFeedback>
</MockInterview>
```

---

### 2. Career Coaching & Tips 💡

#### Personalized Improvement Suggestions

```typescript
// Basado en portfolio + assessments + mock interviews
const careerCoaching = await generateCoaching(userId)

// Output
{
  currentLevel: "Mid-level React Developer",
  nextGoal: "Senior React Developer",

  skillGaps: [
    {
      skill: "System Design",
      currentLevel: "Beginner",
      targetLevel: "Intermediate",
      priority: "High",
      estimatedTime: "3-6 months"
    },
    {
      skill: "Testing (Jest, RTL)",
      currentLevel: "Intermediate",
      targetLevel: "Advanced",
      priority: "Medium",
      estimatedTime: "2-3 months"
    }
  ],

  actionPlan: [
    {
      action: "Complete System Design course",
      resources: [...], // Videos, cursos
      timeline: "Week 1-4"
    },
    {
      action: "Build 2 projects demonstrating architecture skills",
      examples: ["Build a scalable chat app", "Create a microservices API"],
      timeline: "Week 5-12"
    },
    {
      action: "Practice system design interviews",
      frequency: "2x per week",
      timeline: "Ongoing"
    }
  ],

  salaryProjection: {
    current: "$60k-$80k",
    withImprovements: "$80k-$100k",
    timeline: "6-12 months"
  }
}
```

#### UI: Career Dashboard Widget

```tsx
<CareerCoachingWidget>
  <Header>🎯 Your Career Path</Header>

  <CurrentStatus>
    <Badge>Mid-level React Dev</Badge>
    → Target: <Badge variant="goal">Senior React Dev</Badge>
  </CurrentStatus>

  <SkillGaps>
    Top priorities to reach Senior:

    1. 🔴 System Design
       Current: Beginner | Target: Intermediate
       Est. time: 3-6 months

    2. 🟡 Testing (Jest, RTL)
       Current: Intermediate | Target: Advanced
       Est. time: 2-3 months

    [View Full Plan]
  </SkillGaps>

  <NextActions>
    This week:
    ☐ Complete "Designing Data-Intensive Apps" (Ch 1-3)
    ☐ Practice 1 system design interview
    ☐ Build chat app MVP

    [Track Progress]
  </NextActions>
</CareerCoachingWidget>
```

---

### 3. Learning Resources Recommendations 📚

#### Video Course Suggestions (YouTube, Udemy, etc.)

```typescript
// IA busca recursos relevantes para skill gaps
const recommendations = await getRecommendedResources({
  skill: "System Design",
  currentLevel: "Beginner",
  targetLevel: "Intermediate",
  learningStyle: "visual" // vs "reading", "hands-on"
})

// Output
{
  videos: [
    {
      title: "System Design Interview Prep",
      platform: "YouTube",
      channel: "Tech Dummies",
      url: "https://youtube.com/watch?v=...",
      duration: "45 min",
      rating: 4.8,
      relevance: 0.95,
      why: "Covers fundamentals with real examples"
    },
    {
      title: "Designing Data-Intensive Applications",
      platform: "Udemy",
      instructor: "Martin Kleppmann",
      url: "https://udemy.com/...",
      duration: "12 hours",
      price: "$49.99",
      rating: 4.9,
      relevance: 0.92
    }
  ],

  articles: [
    {
      title: "System Design Primer",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "GitHub repo",
      stars: 245k,
      relevance: 0.98
    }
  ],

  books: [
    {
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      relevance: 0.96,
      why: "Industry standard for system design"
    }
  ],

  practice: [
    {
      platform: "LeetCode",
      section: "System Design",
      problems: 15,
      url: "https://leetcode.com/..."
    }
  ]
}
```

#### UI: Learning Resources

```tsx
<LearningResourcesPanel>
  <Header>
    📚 Recommended for System Design
  </Header>

  <Tabs>
    <Tab label="Videos (12)">
      {videos.map(video => (
        <ResourceCard>
          <Thumbnail src={video.thumbnail} />
          <Info>
            <Title>{video.title}</Title>
            <Meta>
              {video.platform} • {video.duration}
              ⭐ {video.rating}
            </Meta>
            <Relevance>
              95% match for your learning path
            </Relevance>
          </Info>
          <Actions>
            <SaveButton>Save</SaveButton>
            <WatchButton href={video.url}>
              Watch Now
            </WatchButton>
          </Actions>
        </ResourceCard>
      ))}
    </Tab>

    <Tab label="Courses (5)">...</Tab>
    <Tab label="Articles (8)">...</Tab>
    <Tab label="Books (3)">...</Tab>
  </Tabs>

  {/* Progress tracking */}
  <ProgressSection>
    Resources completed: 3/28 (11%)
    [Mark as completed]
  </ProgressSection>
</LearningResourcesPanel>
```

---

### 4. Interview Preparation Checklist ✅

```typescript
// IA genera checklist personalizado para interview prep
const prepChecklist = {
  company: "Google", // Si user especifica
  role: "Senior Frontend Engineer",

  technicalPrep: [
    { task: "Review React advanced patterns", done: true },
    { task: "Practice 10 algorithm problems", done: false, progress: 6 },
    { task: "System design mock interview", done: false },
    { task: "Review past projects for STAR stories", done: true }
  ],

  behavioralPrep: [
    { task: "Prepare 3 STAR stories (conflict resolution)", done: false },
    { task: "Research company culture", done: true },
    { task: "Prepare questions for interviewer", done: true }
  ],

  portfolioPrep: [
    { task: "Update portfolio with latest projects", done: true },
    { task: "Add metrics to project descriptions", done: false },
    { task: "Practice portfolio walkthrough (5 min)", done: false }
  ],

  dayBefore: [
    { task: "Test camera/mic for video call", done: false },
    { task: "Prepare clean background", done: false },
    { task: "Print resume (if in-person)", done: false }
  ]
}
```

---

### 💰 Costs & Pricing

#### Resource Recommendations
```typescript
// Usar web scraping o APIs para recursos (gratis)
- YouTube API: Gratis (buscar videos)
- Google Custom Search API: $5 per 1000 queries
- Manual curated list: Gratis (mantener database)

// Para generar recommendations con IA
Cost per recommendation: ~$0.01 (prompt pequeño)
```

#### Mock Interviews
```typescript
// Más costoso que assessments (conversacional)
- Technical interview (30 min): ~15 exchanges
- Cost per interview: ~$0.15 - $0.25

// Freemium model
Free: 1 mock interview/mes
Pro ($9/mes): 5 interviews/mes
Premium ($29/mes): Unlimited + detailed feedback
```

---

### 🎯 Success Metrics

#### Engagement
- % users que prueban mock interviews: Target >30%
- Interview completion rate: Target >60%
- Avg score improvement (retry): Target +20%

#### Learning
- Resources clicked: Target >50% click-through
- Resources completed: Target >20%
- Time to skill improvement: Measure before/after

---

### 🚀 Implementation Priority

```
Phase 1 (v1.2): Skill Assessment Game
  ↓
Phase 2 (v1.3): Career Coaching + Resources
  - Personalized skill gap analysis
  - Learning resource recommendations
  - Action plan generation
  ↓
Phase 3 (v1.4): Mock Interviews
  - Technical interviews
  - Behavioral interviews (STAR)
  - Feedback & scoring
  ↓
Phase 4 (v2.0): Advanced Features
  - System design interviews
  - Voice-based interviews
  - Interview prep checklist
  - Progress tracking
```

---

**Conclusión Extendida:**

Mock Interviews + Career Coaching + Learning Resources = **Suite completa de career development**.

Esto transforma Portfoland de "solo un portfolio" a **"tu asistente de carrera 24/7"**.

Combinado con el Assessment Game, tienes un ecosistema completo que ningún competidor ofrece.

---

**Conclusión:** Esta feature es un **game-changer** para Portfoland. Combina gamification + AI + skill validation de una manera única que ningún competidor tiene. Es perfecta para Gaming Mode y puede adaptarse a Professional Mode también.

**Costo-beneficio:** Muy razonable (~$0.035/assessment), especialmente con freemium model o question caching.

**Timing:** Post-MVP (no bloquea lanzamiento) pero high priority para v1.2+
