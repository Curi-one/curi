import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayView } from "@/components/TodayView";
import type {
  FeedDayGroup,
  FeedLessonItem,
  PathSummary,
} from "@/lib/api/schemas";

const due: PathSummary[] = [
  {
    id: "a",
    topic: "Stoicism",
    depth: "fluent",
    progress: 1,
    totalLessons: 14,
  },
];

const done: PathSummary[] = [
  {
    id: "b",
    topic: "Sleep science",
    depth: "essentials",
    progress: 1,
    totalLessons: 7,
  },
];

function lessonItem(overrides: Partial<FeedLessonItem>): FeedLessonItem {
  return {
    id: "item-1",
    courseId: "a",
    topic: "Stoicism",
    lessonIndex: 1,
    title: "The dichotomy of control",
    lessonNumber: 2,
    totalLessons: 14,
    daysAgo: 0,
    status: "available",
    ...overrides,
  };
}

describe("TodayView", () => {
  it("renders day groups with available and completed lesson cards", () => {
    const groups: FeedDayGroup[] = [
      {
        daysAgo: 0,
        label: "Today",
        items: [
          lessonItem({
            id: "a-today",
            courseId: "a",
            topic: "Stoicism",
            status: "available",
          }),
          lessonItem({
            id: "b-today",
            courseId: "b",
            topic: "Sleep science",
            lessonIndex: 0,
            lessonNumber: 1,
            totalLessons: 7,
            status: "completed",
          }),
        ],
      },
    ];

    render(
      <TodayView
        due={due}
        done={done}
        groups={groups}
        streak={3}
        streakAtRisk={false}
      />,
    );

    expect(screen.getAllByText("Today").length).toBeGreaterThan(0);
    expect(screen.getByText("Stoicism")).toBeInTheDocument();
    expect(screen.getByText("Sleep science")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 still to read")).toBeInTheDocument();
    expect(screen.getByText("Read now")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("links a completed lesson item back to that exact lesson index for re-reading", () => {
    const groups: FeedDayGroup[] = [
      {
        daysAgo: 0,
        label: "Today",
        items: [
          lessonItem({
            id: "b-today",
            courseId: "b",
            topic: "Sleep science",
            lessonIndex: 0,
            lessonNumber: 1,
            totalLessons: 7,
            status: "completed",
          }),
        ],
      },
    ];

    render(
      <TodayView
        due={[]}
        done={done}
        groups={groups}
        streak={3}
        streakAtRisk={false}
      />,
    );

    const completedLink = screen.getByRole("link", { name: /Sleep science/ });
    expect(completedLink).toHaveAttribute(
      "href",
      "/courses/b/lessons/0?from=today",
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders a locked tomorrow section with unlock copy", () => {
    const groups: FeedDayGroup[] = [
      {
        daysAgo: -1,
        label: "Tomorrow",
        items: [
          lessonItem({
            id: "a-tomorrow",
            courseId: "a",
            lessonIndex: 2,
            lessonNumber: 3,
            status: "locked",
          }),
        ],
      },
      {
        daysAgo: 0,
        label: "Today",
        items: [
          lessonItem({
            id: "a-today",
            courseId: "a",
            status: "available",
          }),
        ],
      },
    ];

    render(
      <TodayView
        due={due}
        done={[]}
        groups={groups}
        streak={3}
        streakAtRisk={false}
      />,
    );

    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
    expect(
      screen.getByText("Unlocks after today's lesson"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /control/ })).not.toBeNull();
  });

  it("shows an all-caught-up note when nothing is due but paths exist", () => {
    const groups: FeedDayGroup[] = [
      {
        daysAgo: -1,
        label: "Tomorrow",
        items: [
          lessonItem({
            id: "a-tomorrow",
            courseId: "a",
            status: "locked",
          }),
        ],
      },
    ];

    render(
      <TodayView
        due={[]}
        done={done}
        groups={groups}
        streak={3}
        streakAtRisk={false}
      />,
    );

    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
    expect(screen.getByText("Unlocks tomorrow")).toBeInTheDocument();
  });

  it("shows welcome headline and full-width action rows when empty", () => {
    render(
      <TodayView due={[]} done={[]} groups={[]} streak={0} streakAtRisk={false} />,
    );

    expect(screen.getByText("Your daily founder fluency")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse founder paths/ }),
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getByRole("link", { name: /Create a custom path/ }),
    ).toHaveAttribute("href", "/new");
    expect(screen.queryByText("Nothing due today")).not.toBeInTheDocument();
  });
});
