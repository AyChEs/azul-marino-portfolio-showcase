import { fetchLiveHadith } from "../lib/hadith";

describe("fetchLiveHadith (live API client)", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it("translates the English edition for Spanish", async () => {
    // First call → English Nawawi hadith; second call → MyMemory translation.
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hadiths: [{ text: "Actions are by intentions.", reference: { hadith: 1 } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseData: { translatedText: "Las acciones son por las intenciones." },
          responseStatus: 200,
        }),
      }) as unknown as typeof fetch;

    const result = await fetchLiveHadith("es", 1);
    expect(result?.text).toBe("Las acciones son por las intenciones.");
    expect(result?.narrator).toBe("Los 40 de an-Nawawi");
    expect(result?.source).toContain("sunnah.com/nawawi40:1");
  });

  it("returns null for Spanish when translation fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hadiths: [{ text: "Actions.", reference: { hadith: 1 } }] }),
      })
      .mockResolvedValueOnce({ ok: false }) as unknown as typeof fetch;
    expect(await fetchLiveHadith("es", 1)).toBeNull();
  });

  it("maps a valid API response to a HadithView", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hadiths: [{ text: "Actions are by intentions.", reference: { book: 1, hadith: 1 } }],
      }),
    }) as unknown as typeof fetch;

    const result = await fetchLiveHadith("en", 1);
    expect(result).not.toBeNull();
    expect(result?.text).toBe("Actions are by intentions.");
    expect(result?.source).toContain("sunnah.com/nawawi40:1");
  });

  it("returns null on a non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    expect(await fetchLiveHadith("en", 99)).toBeNull();
  });

  it("returns null when the response has no hadith text", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hadiths: [{}] }),
    }) as unknown as typeof fetch;
    expect(await fetchLiveHadith("ar", 5)).toBeNull();
  });

  it("never throws on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    await expect(fetchLiveHadith("en", 1)).resolves.toBeNull();
  });

  it("uses the Arabic edition narrator label for ar", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hadiths: [{ text: "نص الحديث", reference: { hadith: 2 } }] }),
    }) as unknown as typeof fetch;
    const result = await fetchLiveHadith("ar", 2);
    expect(result?.narrator).toBe("الأربعون النووية");
  });
});
