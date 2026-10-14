import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import { ErrorScreen } from "./error-screen";
import { ShellBackScope } from "./recovery-back-button";

function renderError(inShell = false) {
  const error = <ErrorScreen kind="error" fullPage onRetry={() => {}} />;
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="en" messages={en}>
      {inShell ? <ShellBackScope>{error}</ShellBackScope> : error}
    </NextIntlClientProvider>,
  );
}

describe("error recovery controls", () => {
  it("renders a Back control even without a navigation provider", () => {
    expect(renderError()).toContain('data-testid="recovery-back"');
  });

  it("keeps Retry and Home available alongside standalone Back", () => {
    const html = renderError();
    expect(html).toContain("Try again");
    expect(html).toContain('href="/"');
    expect(html).toContain("Back to Gullak");
  });

  it("does not duplicate the learner shell's Back control", () => {
    expect(renderError(true)).not.toContain('data-testid="recovery-back"');
  });
});
