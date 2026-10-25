"use client";

import { useMemo, useState } from "react";
import { planTrip, type PlanTripOutput } from "@/lib/api";

type Budget = "low" | "mid" | "high";

const interestOptions = [
  "Food",
  "Culture",
  "Adventure",
  "Nature",
  "Nightlife",
  "Shopping",
  "History",
  "Photography"
];

export default function HomePage() {
  const [destination, setDestination] = useState("Bali");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState<Budget>("mid");
  const [startDate, setStartDate] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Food", "Nature"]);
  const [result, setResult] = useState<PlanTripOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => destination.trim().length > 0 && days > 0, [destination, days]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await planTrip({
        destination: destination.trim(),
        days,
        budget,
        interests: selectedInterests,
        startDate: startDate || undefined
      });
      setResult(data);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unexpected error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Future-ready travel product</p>
          <h1>Build an AI-first Trip Planner that can scale to millions.</h1>
          <p className="subtitle">
            This base app gives you structured planning, backend APIs, and AI itinerary generation so
            you can ship web now and mobile next.
          </p>
        </div>
      </section>

      <section className="planner-grid">
        <form className="card planner-form" onSubmit={onSubmit}>
          <h2>Plan a trip</h2>

          <label>
            Destination
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Tokyo" />
          </label>

          <div className="split">
            <label>
              Days
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 1)}
              />
            </label>
            <label>
              Budget
              <select value={budget} onChange={(e) => setBudget(e.target.value as Budget)}>
                <option value="low">Low</option>
                <option value="mid">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <label>
            Start date (optional)
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <div>
            <p className="field-label">Interests</p>
            <div className="chips">
              {interestOptions.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    className={`chip ${active ? "active" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? "Generating..." : "Generate AI Itinerary"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <article className="card planner-result">
          <h2>Itinerary Output</h2>
          {!result ? (
            <p className="placeholder">Submit the form to generate a daily trip plan.</p>
          ) : (
            <>
              <p className="summary">{result.summary}</p>
              <p className="meta">Source: {result.source.toUpperCase()}</p>
              <p className="meta">{result.estimatedBudgetNote}</p>

              <div className="days">
                {result.dailyPlan.map((item) => (
                  <div key={item.day} className="day-item">
                    <h3>Day {item.day}</h3>
                    <p>{item.theme}</p>
                    <ul>
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h3>Tips</h3>
                <ul>
                  {result.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  );
}
