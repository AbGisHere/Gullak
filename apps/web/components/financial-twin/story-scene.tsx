import { Character, type CharacterProps } from "@gullak/ui/components/character";
import type { ReactNode } from "react";

export interface StorySceneProps {
  title: string;
  setting: string;
  speaker: string;
  dialogue: string;
  character: Pick<CharacterProps, "variant" | "pose" | "expression" | "accent">;
  children?: ReactNode;
}

/** Story copy stays with the caller's localized content, alongside the episode. */
export function StoryScene({ title, setting, speaker, dialogue, character, children }: StorySceneProps) {
  return (
    <section className="min-w-0 space-y-6" aria-labelledby="financial-twin-scene-title">
      <header className="max-w-2xl space-y-3">
        <h2
          id="financial-twin-scene-title"
          className="text-balance break-words text-3xl font-extrabold tracking-tight sm:text-5xl"
        >
          {title}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">{setting}</p>
      </header>
      <div className="grid min-w-0 items-center gap-5 rounded-2xl bg-brand-lilac p-5 text-brand-ink sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-8">
        <div className="flex justify-center sm:self-end" aria-hidden="true">
          <Character {...character} size="md" />
        </div>
        <figure className="min-w-0 space-y-3">
          <figcaption className="text-base font-bold">{speaker}</figcaption>
          <blockquote className="break-words text-xl font-medium leading-relaxed sm:text-2xl">{dialogue}</blockquote>
        </figure>
      </div>
      {children}
    </section>
  );
}
