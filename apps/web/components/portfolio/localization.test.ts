import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";
import missionEn from "../missions/messages/en.json";
import missionHi from "../missions/messages/hi.json";
import missionTe from "../missions/messages/te.json";
import { QUESTS } from "../missions/quest-state";
import en from "./messages/en.json";
import hi from "./messages/hi.json";
import te from "./messages/te.json";

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) =>
    typeof item === "string" ? [`${prefix}${key}`] : keys(item, `${prefix}${key}.`),
  );
}
for (const [module, locales] of Object.entries({
  portfolio: { en, hi, te },
  missions: { en: missionEn, hi: missionHi, te: missionTe },
})) {
  describe(`${module} isolated localization`, () => {
    for (const [locale, messages] of Object.entries(locales)) {
      it(`has complete, resolvable ${locale} messages`, () => {
        expect(keys(messages).sort()).toEqual(keys(locales.en).sort());
        const errors: unknown[] = [];
        const t = createTranslator({ locale, messages, onError: (error) => errors.push(error) });
        for (const key of keys(messages))
          expect(
            t(key, {
              amount: "₹100",
              name: "goal",
              percent: 50,
              remaining: "₹100",
              value: 80,
              xp: 20,
              done: 1,
              total: 2,
              quest: "quest",
            }),
          ).not.toBe(key);
        if (module === "missions")
          for (const quest of QUESTS)
            for (const step of quest.steps) {
              expect(t(`${quest.id}.${step.id}Why`)).not.toBe(`${quest.id}.${step.id}Why`);
              for (const choice of step.options) expect(t(`${quest.id}.${choice}`)).not.toBe(`${quest.id}.${choice}`);
            }
        expect(errors).toEqual([]);
      });
    }
  });
}
