import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizFlow } from "@/components/QuizFlow";

describe("QuizFlow", () => {
  it("shows explanation after answering when provided", () => {
    render(
      <QuizFlow
        questions={[
          {
            id: "q1",
            prompt: "Who posed the paradox?",
            options: ["Sagan", "Fermi", "Drake"],
            correctIndex: 1,
            explanation: "Enrico Fermi posed the question in 1950.",
          },
        ]}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Fermi/ }));
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(
      screen.getByText("Enrico Fermi posed the question in 1950."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "How did that land?" }),
    ).toBeInTheDocument();
  });

  it("shows a Sources link after why when source is provided", () => {
    render(
      <QuizFlow
        questions={[
          {
            id: "q1",
            prompt: "Who posed the paradox?",
            options: ["Sagan", "Fermi", "Drake"],
            correctIndex: 1,
            explanation: "Enrico Fermi posed the question in 1950.",
            source: {
              title: "NASA — Astrobiology",
              url: "https://astrobiology.nasa.gov/",
            },
          },
        ]}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Fermi/ }));
    expect(screen.getByText("Sources")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "NASA — Astrobiology" });
    expect(link).toHaveAttribute("href", "https://astrobiology.nasa.gov/");
  });

  it("staggers question prompt and options on reveal", () => {
    const { container } = render(
      <QuizFlow
        questions={[
          {
            id: "q1",
            prompt: "Who posed the paradox?",
            options: ["Sagan", "Fermi"],
            correctIndex: 1,
          },
        ]}
        onComplete={vi.fn()}
      />,
    );

    expect(container.querySelectorAll(".quiz-stagger-item").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "quiz-stagger-item",
    );
  });

  it("renders option letter and text together for each choice", () => {
    render(
      <QuizFlow
        questions={[
          {
            id: "q1",
            prompt: "Pick one",
            options: ["Alpha choice", "Beta choice", "Gamma choice"],
            correctIndex: 2,
          },
        ]}
        onComplete={vi.fn()}
      />,
    );

    const alpha = screen.getByRole("button", { name: /Alpha choice/ });
    expect(alpha.querySelector(".letter")).toHaveTextContent("A");
    expect(alpha.querySelector(".text")).toHaveTextContent("Alpha choice");
    const gamma = screen.getByRole("button", { name: /Gamma choice/ });
    expect(gamma.querySelector(".letter")).toHaveTextContent("C");
    expect(gamma.querySelector(".text")).toHaveTextContent("Gamma choice");
  });
});
