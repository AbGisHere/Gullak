import episode from "@gullak/content/episodes/march-2020-hospital-bill/en.json";
import type { EpisodeMetadata, SimulationState } from "@gullak/ui/components/practice-simulation";
import { initialPracticeSimulationState } from "@gullak/ui/fixtures/simulation-fixtures";

export function episodeToSimulation(): { episode: EpisodeMetadata; state: SimulationState } {
  const event = episode.scheduledEvents[0];
  if (!event) throw new Error("Practice episode has no scheduled event");
  const start = new Date(episode.startDate);
  const end = new Date(episode.endDate);
  return {
    episode: {
      episodeId: episode.id,
      title: episode.title,
      subtitle: episode.intro,
      dateLabel: `${start.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – ${end.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
      learningGoals: episode.learningGoals,
      gradeGroup: "grade-8-10",
    },
    state: {
      ...initialPracticeSimulationState,
      currentDateLabel: new Date(event.on).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      currentEvent: {
        id: event.id,
        title: event.title,
        description: event.description,
        amountPaise: Math.abs(event.cashDeltaPaise),
        urgencyLabel: "Due this week",
      },
      protagonist: {
        ...initialPracticeSimulationState.protagonist,
        label: episode.persona.name,
        dialogue: undefined,
      },
    },
  };
}
