import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WowDataNotice } from "../components/wow-data-notice/index.tsx";
import { WowItemLink } from "../components/wow-item-link/index.tsx";
import { useItemTooltipLocale } from "../hooks/use-item-tooltip-locale.ts";
import { useWowDataReady } from "../hooks/use-wow-data-ready.ts";
import { ItemTooltipLocaleProvider } from "./item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "./wow-data-provider.tsx";

function Probe() {
  const { coreStatus, hintStatus } = useWowDataReady();
  const { toggleLocale } = useItemTooltipLocale();
  return (
    <>
      <button onClick={toggleLocale}>Switch locale</button>
      <span data-testid="load-status">{coreStatus}/{hintStatus}</span>
      <WowDataNotice />
      <WowItemLink itemId={123} />
    </>
  );
}

it("keeps the current locale usable while a shared dependency fails and retries it once", async () => {
  let rejectEnglish!: (error: unknown) => void;
  const english = new Promise<Response>((_, reject) => { rejectEnglish = reject; });
  let englishRequests = 0;
  let russianRequests = 0;
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const name = new URL(String(url), "http://localhost").pathname.split("/").at(-1);
    if (name === "wotlk-item-names.json") {
      englishRequests += 1;
      return englishRequests === 1 ? english : Response.json({ 123: "English item" });
    }
    if (name === "wotlk-item-names-ru.json") {
      russianRequests += 1;
      return Response.json({ 123: "Русский предмет" });
    }
    return Response.json({});
  });
  try {
    render(
      <ItemTooltipLocaleProvider initialLocale="en">
        <WowDataProvider><Probe /></WowDataProvider>
      </ItemTooltipLocaleProvider>,
    );
    expect(screen.getByTestId("load-status")).toHaveTextContent("loading/loading");
    expect(screen.getByRole("link", { name: "#123" })).toBeInTheDocument();
    await waitFor(() => expect(englishRequests).toBe(1));

    fireEvent.click(screen.getByRole("button", { name: "Switch locale" }));
    expect(await screen.findByRole("link", { name: "Русский предмет" })).toBeInTheDocument();
    await act(async () => rejectEnglish(new TypeError("offline")));
    await waitFor(() => expect(screen.getByTestId("load-status")).toHaveTextContent("ready/failed"));

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    await waitFor(() => expect(screen.getByTestId("load-status")).toHaveTextContent("ready/ready"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(englishRequests).toBe(2);
    expect(russianRequests).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Switch locale" }));
    expect(await screen.findByRole("link", { name: "English item" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("load-status")).toHaveTextContent("ready/ready"));
    expect(englishRequests).toBe(2);
  } finally {
    fetchMock.mockRestore();
  }
});
