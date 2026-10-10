# Gullak — Design

<!-- SEED: agreed product/design direction captured before a main-aligned implementation audit; this document does not claim the current working tree implements every rule. -->

## Overview

**Editorial youth culture meets playful learning product.** Gullak is warm, graphic and confident: youthful without being childish, expressive without losing trust. Use approximately **70% calm / 30% playful**. Calm space makes decisions readable; a selective accent gives an important choice or consequence energy.

This is the agreed visual/UX direction for the current main product recorded in `PRODUCT.md`, not a redesign of the repository in this task. It preserves Practice, Live, the paper portfolio, three learning engines, tutor and existing technical decisions. No routes, layouts, components or services are implemented by this document.

Keep the learning mechanism legible: evidence → recommendation → activity → simulation → mastery update → changed recommendation. Visual expression supports comprehension rather than competing with it.

Avoid the visual language of banking dashboards, generic fintech SaaS, corporate LMS and Duolingo copies. A portfolio can show holdings and balances without making financial performance the product's identity.

## Colors

The following are the agreed palette direction, not a claim that every token is already installed:

| Role | Colour | Intended use |
|---|---|---|
| Ink / Charcoal | `#171717` | Main text, important controls, graphic anchors |
| Warm Paper | `#F7F3E8` | Primary reading and learning ground |
| Acid Lime | `#DFFF3F` | A dominant choice, next activity or purposeful highlight |
| Soft Lilac | `#CBB5FF` | A secondary learning surface or Practice moment |
| Coral | `#FF6847` | Selective emphasis; not automatic failure or loss |
| Warm Yellow | `#FFD84D` | A useful reveal or contextual note |
| Muted Surface | `#ECE8DF` | Quiet grouping and supporting surfaces |

A typical screen uses one base surface, one main accent and optionally one secondary accent. Do not distribute all accents across every card. Keep primary reading text dark on pale/accent surfaces; validate contrast before choosing other pairings. These palette swatches are not automatically approved text colours on every background.

Colour never carries state alone. Pair it with words, icons, labels or patterns for mastery, locks, feedback, Practice/Live mode and data freshness. Do not reduce returns to green/red status or teach that a green outcome means the “right” financial decision.

## Typography

Use strong editorial hierarchy: bold, confident headings and neutral, highly readable body text. Expressive display lettering must remain readable to Grades 6–12 and support the required language scripts. Do not select a new font dependency or replace the repository's fonts as part of initialization.

Suggested scale for later application: 12px metadata, 14px supporting text, 16px body, 20px card heading, 28px section heading and 40px or larger for a short hero where space allows. Mobile instructional body copy should generally be at least 16px. Essential sources, assumptions and warnings must not be relegated to unreadable metadata.

Keep headings short, line lengths comfortable and spacing generous between conceptual sections. Avoid all-caps paragraphs, crowded labels and excessive decorative type changes. Support text expansion in Hindi and Telugu; do not clip translations to preserve an English-only composition.

Use tabular numerals when comparing money or dates. Differentiate virtual balances, dates, assumptions and learning feedback through hierarchy and labels, not a wall of equally weighted numbers.

## Layout

Design mobile-first for small and medium Android-style screens, then expand the same journey on desktop. Preserve the main's phone bottom-navigation and desktop-sidebar intent without introducing a separate desktop product or defining new routes here.

Organise around a meaningful task: understand the recommendation, make a choice, inspect a consequence, reflect, and continue. Home should make the next activity and its reason clear rather than prioritising an account balance, returns chart or grid of statistics.

Use substantial surfaces and clear grouping. Occasional asymmetry can add expression, but reading order, focus order and touch access remain predictable. No horizontal page scrolling. Keep controls and explanations within comfortable reach and leave room for persistent navigation.

Onboarding remains language first, grade group, current experience, and optional format preference. “Mix it up” is the default and Skip stays visible. Do not visually turn a prior into an ability judgement or a permanent learning-style identity.

Within the life + market sim, keep the current mode, fictional-money label, clock, available cash, commitments and relevant consequences visible. Practice uses a historical episode and reveals alternatives afterwards. Live uses current/as-of prices and reviews habits without a hindsight panel. Never blur these distinctions in a single generic trading screen.

Compare Practice alternatives in a readable sequence on phones and side by side where desktop space allows. The takeaway highlights emergency reserves, liquidity and resilience, not a winning trade. Charts appear only when they explain a learning question; include axes, units, source/as-of dates and an accessible summary.

## Elevation & Depth

Prefer bold flat surfaces and clear contrast over shadow stacks. A restrained border or subtle elevation can clarify an interactive surface, but repeated heavy shadows should not become the identity.

Tactile interaction means a clear pressed/selected/focused response, not simulated glass or decorative blur. Keep sufficient distinction among controls, selected choices and non-interactive content without making every surface appear clickable.

Motion is purposeful and restrained: reveal a consequence, connect a choice with changed information, or clarify progression. Do not scatter entrance animations across every card. Respect reduced motion and provide the same meaning without animation. No essential countdown, price change or feedback may depend on watching an effect.

## Shapes

Use substantial cards and confidently bounded controls. Modest corner rounding can make surfaces approachable; do not turn every element into a pill. Reserve pill-like shapes for small labels where useful, not long explanations or entire navigation systems.

Use selective graphic or sticker-like elements as accents. They can punctuate a lesson or a meaningful moment, but must not cover content, mimic required controls or compete with the scenario. Avoid mascot clutter, excessive emoji and decoration on every component.

Shape and layout should reinforce meaning: a choice looks selectable, an explanation reads as content, and a counterfactual remains distinguishable from the learner's actual decision.

## Components

These are design responsibilities for existing or future components, not an instruction to create a new component library in this PR.

- **Actions:** clear verbs, touch-friendly targets, visible keyboard focus and distinct primary/secondary hierarchy. Include hover, pressed, disabled, loading and failure feedback. Do not rely on colour alone or silent disabled controls.
- **Choice surfaces:** one meaningful decision per surface; selected state is explicit and reversible where the activity allows. Large, labelled targets work without hover.
- **Recommendations:** show the next topic/activity, the evidence-informed reason and a clear way to continue. “Why this?” must explain the signal rather than merely saying “AI recommended”. Do not invent evidence or certainty when it is absent.
- **Learning and mastery:** use the curriculum's pillar/topic/activity hierarchy and existing mastery terminology. Explain unlock requirements using learning evidence. Do not substitute a wealth score or return rank for understanding.
- **Formats:** use the team's existing format names and an understandable choice, including Mix it up/Skip during onboarding. Preferences remain revisable and the format bandit adapts from evidence.
- **Scenario surfaces:** consistently show Practice or Live, play money, scenario clock and relevant sources/assumptions. Scheduled and random life events have readable consequences and choices; prevent decorative motion from obscuring them.
- **Story choices and spot & sort:** show consequences/explanations, support retry, and offer keyboard/tap alternatives to swiping or dragging. Feedback should teach why, not only mark correct/incorrect.
- **Paper portfolio:** present the shared instruments and virtual holdings in service of the learning task. Keep safety labels and data freshness clear. No real-product promotion, broker links, return leaderboard or real-money affordances.
- **What-if sandbox:** label assumptions and variable changes; provide accessible alternatives to sliders and readable numeric inputs where appropriate. Hypothetical results are not guarantees.
- **Tutor:** remain grounded, supportive and visibly educational. Guardrails and fallback states must be understandable. It supports learning rather than replacing the curriculum with an unbounded chat experience.
- **Feedback and recovery:** supportive, specific language explains the consequence and what can be tried next. Data unavailable, stale prices, offline use, empty evidence and pending unlocks need honest states and clear recovery paths.

## Do's and Don'ts

**Do**

- Balance calm reading space with selective playful expression.
- Use the agreed warm ground, strong typography and purposeful flat accents.
- Keep the same accessible learning journey on mobile and desktop.
- Preserve semantic headings, keyboard order, focus visibility and comfortable touch targets.
- Pair state colours with text/icons and verify readable contrast.
- Make virtual money, Practice/Live mode, historical/current data, sources and assumptions explicit.
- Teach resilience and emergency-fund reasoning in the Practice reveal.
- Design for English, Hindi and Telugu and low-bandwidth school use.

**Don't**

- Use glassmorphism, excessive gradients, excessive shadows or blue corporate fintech styling.
- Use all accent colours simultaneously or make every control a rounded pill.
- Fill the learner's home with tiny financial-stat cards, stock-market decoration or return rankings.
- Copy another product's exact branding, mascot, illustrations or layouts.
- Shame learners, imply grade group is a fixed skill level, or declare permanent learning styles.
- Hide important data behind hover, colour alone, tiny text, motion or inaccessible gestures.
- Add hindsight reveals to Live or make a historical counterfactual a market-timing recommendation.
- Treat this seed as proof that current code implements the agreed design or as permission to change application files.
