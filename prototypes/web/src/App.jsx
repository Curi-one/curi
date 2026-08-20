import React, { useEffect, useMemo, useRef, useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { CourseLessonList } from "@/components/CourseLessonList";
import { DevToolbar } from "@/components/DevToolbar";
import { Header } from "@/components/Header";
import { LessonCompleteModal } from "@/components/LessonCompleteModal";
import { Sidebar } from "@/components/Sidebar";
import { StreakMoment } from "@/components/StreakMoment";
import {
  abandonedLibraryCourses,
  completedCourses,
  magazineLessons,
  SEED_COURSES,
  topicSuggestions,
} from "@/data/course-data";
import {
  curiosityReasons,
  learningOutcomes,
  teachingStyles,
} from "@/data/onboarding-data";
import {
  DEV_NEW_USER_ACTIVE,
  DEV_POWER_ACTIVE,
  DEV_POWER_COMPLETED,
  DEV_POWER_PAUSED,
  DEV_STRESS_ACTIVE,
  DEV_STRESS_COMPLETED,
  DEV_STRESS_PAUSED,
  makeDevActiveCourses,
  makeDevCardSets,
  makeDevCompletedCourses,
  makeDevPausedCourses,
} from "@/lib/dev-utils";
import { buildLessonActivitySeed, localDateKey, totalLessonsCompletedTally } from "@/lib/date-utils";
import { lessonBlurb } from "@/lib/feed-utils";
import { buildCourseLessons, durationForDepth, getLessonsForSubject } from "@/lib/lesson-utils";
import { buildLessonReviewDeck } from "@/lib/review-cards";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Landing } from "@/pages/Landing";
import { NewPath } from "@/pages/NewPath";
import { Onboarding } from "@/pages/Onboarding";
import {
  ArchiveQuiz,
  ArchivedCourseReader,
  AuthFlow,
  Billing,
  Browse,
  CourseComplete,
  CoursePathScreen,
  CoursePreviewModal,
  DailyEmailPreview,
  Dashboard,
  FlashcardScreen,
  Generating,
  LessonReader,
  LibraryScreen,
  PreviousCoursesPage,
  Profile,
  TodayFeed,
  Upgrade,
} from "@/pages/AppScreens";

function App() {
  const [screen, setScreen] = useState("landing");
  const [topic, setTopic] = useState("");
  const [aspect, setAspect] = useState("");
  const [level, setLevel] = useState("Standard");
  const [curiosityReason, setCuriosityReason] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [generatedLessons, setGeneratedLessons] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lessonActivityByDay, setLessonActivityByDay] = useState(() => ({}));
  const [showStreakMoment, setShowStreakMoment] = useState(false);
  const [browsePreview, setBrowsePreview] = useState(null);
  const [plan, setPlan] = useState("free");
  const [pendingCourse, setPendingCourse] = useState(null);
  const [pendingQuizComplete, setPendingQuizComplete] = useState(false);
  /** Screen to return to when auth is cancelled (or completed without a pending save) */
  const [authBackTarget, setAuthBackTarget] = useState("landing");
  const [user, setUser] = useState({
    name: "Awais",
    email: "awais@example.com",
    certificateName: "Awais",
    // Learning preferences
    curiosityContext: "For work or a project",
    goal: "Prepare for a first institutional raise without a top-tier accelerator network",
    lessonDepth: "Standard",
    learningStyle: "With real examples",
    // Daily email
    emailEnabled: true,
    emailTime: "morning",
    emailFormat: "Full",
    emailWeekends: false,
    emailWeeklyDigest: true,
    // Display
    appTheme: "System",
  });
  const [selectedArchiveCourse, setSelectedArchiveCourse] = useState(completedCourses[0]);
  const [selectedArchiveLessonIndex, setSelectedArchiveLessonIndex] = useState(0);
  const [archiveQuizAnswers, setArchiveQuizAnswers] = useState({});
  const [readerInitialLessonIndex, setReaderInitialLessonIndex] = useState(null);
  /** Which course map is shown in the main area: `{ courseId, courseType }` */
  const [pathContext, setPathContext] = useState(null);
  /** Return target after lesson / quiz when opened from the course path map */
  const [lessonBackScreen, setLessonBackScreen] = useState("today");
  const [archiveBackScreen, setArchiveBackScreen] = useState("previousCourses");
  const [completedCourseSummary, setCompletedCourseSummary] = useState(null);
  const [courseLessonListTarget, setCourseLessonListTarget] = useState(null);
  const [lessonCompleteData, setLessonCompleteData] = useState(null);

  // Flashcard decks (spaced repetition)
  const [cardSets, setCardSets] = useState([]);
  const [reviewActivityByDay, setReviewActivityByDay] = useState({});
  const [flashcardEntry, setFlashcardEntry] = useState(null);

  function saveCardSet(set) {
    setCardSets((prev) => {
      const byId = prev.findIndex((s) => s.id === set.id);
      if (byId >= 0) {
        const next = [...prev];
        next[byId] = set;
        return next;
      }
      if (set.sourceId) {
        const bySource = prev.findIndex((s) => s.sourceId === set.sourceId);
        if (bySource >= 0) {
          const next = [...prev];
          next[bySource] = set;
          return next;
        }
      }
      return [...prev, set];
    });
  }

  function autoSaveLessonReviewDeck(course, lessonIndex) {
    const deck = buildLessonReviewDeck(course, lessonIndex);
    saveCardSet(deck);
    return deck.cards.length;
  }

  function markReviewDoneToday() {
    const key = localDateKey();
    setReviewActivityByDay((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setFlashcardEntry(null);
  }

  function deleteCardSet(id) {
    setCardSets((prev) => prev.filter((s) => s.id !== id));
  }

  // Global audio player — floating card
  const [nowPlaying, setNowPlaying] = useState(null);
  // nowPlaying: null | { id, title, topic, text, state: "playing"|"paused" }
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioUtteranceRef = useRef(null);

  // Dev state toggles — stress test / empty state previews
  const [devMode, setDevMode] = useState("off");
  const [devCompletedCourses, setDevCompletedCourses] = useState(null);
  const [devAbandonedCourses, setDevAbandonedCourses] = useState(null);

  const effectiveCompletedCourses = devCompletedCourses ?? completedCourses;
  const effectiveAbandonedCourses = devAbandonedCourses ?? abandonedLibraryCourses;

  const activeCourse = useMemo(() => {
    const fromCourses = courses.length > 0
      ? (courses.find((c) => c.id === activeCourseId) ?? courses[0])
      : null;
    if (fromCourses) return fromCourses;
    // Allow lesson + quiz to run against a pending course before auth
    if (pendingCourse && (activeCourseId == null || String(pendingCourse.id) === String(activeCourseId))) {
      return pendingCourse;
    }
    return null;
  }, [courses, activeCourseId, pendingCourse]);
  const currentLessonIndex = Math.min(activeCourse?.progress || 0, 13);
  const currentLessonTitle = activeCourse?.lessons?.[currentLessonIndex] || "Today’s lesson";

  const pathCourseResolved = useMemo(() => {
    if (!pathContext) return null;
    const { courseId, courseType } = pathContext;
    if (courseType === "active") {
      const c = courses.find((x) => String(x.id) === String(courseId));
      return c ? { ...c, courseType: "active" } : null;
    }
    if (courseType === "completed") {
      const c = effectiveCompletedCourses.find((x) => x.id === courseId);
      return c ? { ...c, courseType: "completed", progress: c.lessons.length } : null;
    }
    if (courseType === "abandoned") {
      const c = effectiveAbandonedCourses.find((x) => x.id === courseId);
      return c ? { ...c, courseType: "abandoned" } : null;
    }
    return null;
  }, [pathContext, courses, effectiveCompletedCourses, effectiveAbandonedCourses]);

  useEffect(() => {
    if (screen === "coursePath" && !pathCourseResolved) {
      setPathContext(null);
      setScreen("dashboard");
    }
  }, [screen, pathCourseResolved]);

  function seedDemoLibrary() {
    setCourses([...SEED_COURSES]);
    setActiveCourseId(SEED_COURSES[0].id);
    setLessonActivityByDay(buildLessonActivitySeed(7, totalLessonsCompletedTally(SEED_COURSES)));
    setScreen("today");
  }

  function applyDevMode(mode) {
    setDevMode(mode);
    if (mode === "off") {
      setSignedIn(false);
      setCourses([]);
      setStreak(0);
      setDevCompletedCourses(null);
      setDevAbandonedCourses(null);
      setLessonActivityByDay({});
      setCardSets([]);
      setScreen("landing");
      return;
    }
    if (mode === "empty") {
      setPlan("free");
      setSignedIn(false);
      setCourses([]);
      setStreak(0);
      setDevCompletedCourses([]);
      setDevAbandonedCourses([]);
      setLessonActivityByDay({});
      setCardSets([]);
      setScreen("landing");
      return;
    }
    if (mode === "new-user") {
      const newCourses = makeDevActiveCourses(DEV_NEW_USER_ACTIVE);
      setPlan("free");
      setSignedIn(true);
      setCourses(newCourses);
      setActiveCourseId(newCourses[0].id);
      setStreak(3);
      setDevCompletedCourses([]);
      setDevAbandonedCourses([]);
      setLessonActivityByDay(buildLessonActivitySeed(3, 8));
      setCardSets([]);
      setScreen("today");
      return;
    }
    if (mode === "power-user") {
      const newCourses = makeDevActiveCourses(DEV_POWER_ACTIVE);
      setPlan("paid");
      setSignedIn(true);
      setCourses(newCourses);
      setActiveCourseId(newCourses[0].id);
      setStreak(47);
      setDevCompletedCourses(makeDevCompletedCourses(DEV_POWER_COMPLETED));
      setDevAbandonedCourses(makeDevPausedCourses(DEV_POWER_PAUSED));
      setLessonActivityByDay(buildLessonActivitySeed(47, 180));
      setCardSets(makeDevCardSets("power-user"));
      setScreen("today");
      return;
    }
    if (mode === "library-stress") {
      const newCourses = makeDevActiveCourses(DEV_STRESS_ACTIVE);
      setPlan("paid");
      setSignedIn(true);
      setCourses(newCourses);
      setActiveCourseId(newCourses[0].id);
      setStreak(89);
      setDevCompletedCourses(makeDevCompletedCourses(DEV_STRESS_COMPLETED));
      setDevAbandonedCourses(makeDevPausedCourses(DEV_STRESS_PAUSED));
      setLessonActivityByDay(buildLessonActivitySeed(89, 600));
      setCardSets(makeDevCardSets("library-stress"));
      setScreen("flashcards");
      return;
    }
    if (mode === "daily-email") {
      const newCourses = makeDevActiveCourses(DEV_NEW_USER_ACTIVE);
      setPlan("free");
      setSignedIn(true);
      setCourses(newCourses);
      setActiveCourseId(newCourses[0].id);
      setStreak(8);
      setDevCompletedCourses([]);
      setDevAbandonedCourses([]);
      setLessonActivityByDay(buildLessonActivitySeed(8, 12));
      setScreen("dailyEmail");
      return;
    }
    if (mode === "admin-dashboard") {
      setScreen("admin");
      return;
    }
    if (mode === "course-complete") {
      const newCourses = makeDevActiveCourses(DEV_NEW_USER_ACTIVE);
      setPlan("free");
      setSignedIn(true);
      setCourses(newCourses);
      setActiveCourseId(newCourses[0].id);
      setStreak(14);
      setDevCompletedCourses([]);
      setDevAbandonedCourses([]);
      setLessonActivityByDay(buildLessonActivitySeed(14, 42));
      const demoCourse = { id: "demo-complete", topic: "Business Models", lessons: magazineLessons["Business Models"], progress: magazineLessons["Business Models"].length };
      setCompletedCourseSummary(demoCourse);
      setScreen("courseComplete");
      return;
    }
  }

  function previewCourseComplete() {
    const demoCourse = { id: "demo-complete", topic: "Business Models", lessons: magazineLessons["Business Models"], progress: magazineLessons["Business Models"].length };
    setCompletedCourseSummary(demoCourse);
    setScreen("courseComplete");
  }

  const suggestions = useMemo(() => {
    const exact = Object.keys(topicSuggestions).find((key) => key.toLowerCase() === topic.trim().toLowerCase());
    return exact ? topicSuggestions[exact] : topicSuggestions.default;
  }, [topic]);

  const lessonsForTopic = useMemo(() => {
    return buildCourseLessons(topic || "your topic", aspect, level, {
      curiosityReason,
      desiredOutcome,
      learningStyle
    });
  }, [topic, aspect, level, curiosityReason, desiredOutcome, learningStyle]);

  useEffect(() => {
    if (!isGenerating) return;
    setGeneratedLessons([]);
    let index = 0;
    let revealTimer;

    // Warmup pause — gives the UI time to show anticipation state
    const warmup = window.setTimeout(() => {
      revealTimer = window.setInterval(() => {
        setGeneratedLessons((prev) => [...prev, lessonsForTopic[index]]);
        index += 1;
        if (index >= lessonsForTopic.length) {
          window.clearInterval(revealTimer);
          setIsGenerating(false);
        }
      }, 230);
    }, 1600);

    return () => {
      window.clearTimeout(warmup);
      window.clearInterval(revealTimer);
    };
  }, [isGenerating, lessonsForTopic]);

  function handleTopicSelect(selectedTopic) {
    const trimmed = selectedTopic.trim();
    if (!trimmed) return;
    setTopic(trimmed);
    // Pre-select sensible defaults so onboarding is one-click-through
    const exactKey = Object.keys(topicSuggestions).find((k) => k.toLowerCase() === trimmed.toLowerCase());
    const sug = exactKey ? topicSuggestions[exactKey] : topicSuggestions.default;
    setAspect(sug[0] || topicSuggestions.default[0]);
    setLevel("Standard");
    setCuriosityReason(curiosityReasons[0]);
    setDesiredOutcome(learningOutcomes[0]);
    setLearningStyle(teachingStyles[0]);
    setGeneratedLessons([]);
    setScreen("onboarding");
  }

  function beginTopicSubmit(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    const pickedLevel = level; // snapshot — handleTopicSelect resets to "Standard"
    handleTopicSelect(topic);
    setLevel(pickedLevel);    // restore Landing's depth pick
  }

  function handleAuthBack() {
    if (pendingCourse && pendingQuizComplete) {
      // User backed out of auth after completing their first quiz — return to lesson
      setPendingQuizComplete(false);
      setScreen("lesson");
      return;
    }
    if (pendingCourse) {
      setScreen("generating");
      return;
    }
    setScreen(authBackTarget);
  }

  function startGeneration() {
    setScreen("generating");
    setIsGenerating(true);
  }

  function saveGeneratedCourse() {
    const newCourse = {
      id: Date.now(),
      topic: topic.trim(),
      aspect,
      level,
      duration: durationForDepth(level),
      context: { curiosityReason, desiredOutcome, learningStyle },
      progress: 0,
      lessons: lessonsForTopic
    };

    if (signedIn) {
      setCourses((previous) => [...previous, newCourse]);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("today");
      setScreen("lesson");
    } else {
      // Let the user read first; we'll ask for auth after the first quiz
      setPendingCourse(newCourse);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("generating");
      setScreen("lesson");
    }
  }

  function completeAuth(values) {
    const fallbackName = values.name || values.email?.split("@")[0] || "Reader";
    setUser((previous) => ({
      ...previous,
      name: fallbackName,
      email: values.email || previous.email
    }));
    setSignedIn(true);

    if (pendingCourse) {
      // If the user just completed their first quiz, record that progress
      const savedProgress = pendingQuizComplete ? 1 : 0;
      const savedCourse = { ...pendingCourse, progress: savedProgress };
      setCourses((previous) => [...previous, savedCourse]);
      setActiveCourseId(savedCourse.id);
      setPendingCourse(null);

      if (pendingQuizComplete) {
        autoSaveLessonReviewDeck(savedCourse, 0);
        setStreak(1);
        setLessonActivityByDay({ [localDateKey()]: 1 });
        setShowStreakMoment(true);
        window.setTimeout(() => setShowStreakMoment(false), 1900);
      } else {
        setLessonActivityByDay(buildLessonActivitySeed(1, 1));
      }
      setPendingQuizComplete(false);
      setScreen("today");
      return;
    }

    setScreen("today");
  }

  function signOut() {
    setSignedIn(false);
    setPendingCourse(null);
    setPendingQuizComplete(false);
    setReviewActivityByDay({});
    setFlashcardEntry(null);
    setCardSets([]);
    setCourses([]);
    setActiveCourseId(null);
    setLessonActivityByDay({});
    setAuthBackTarget("landing");
    setPathContext(null);
    setScreen("landing");
  }

  function openArchiveCourse(course, lessonIndex = 0, backScreen = "previousCourses") {
    setArchiveBackScreen(backScreen);
    setSelectedArchiveCourse(course);
    setSelectedArchiveLessonIndex(lessonIndex);
    setArchiveQuizAnswers({});
    setScreen("archiveReader");
  }

  function openPreviousCourses() {
    setScreen("previousCourses");
  }

  function openCourseLesson(courseId, lessonIndex = null, backScreen = "today") {
    setLessonBackScreen(backScreen);
    setActiveCourseId(courseId);
    setReaderInitialLessonIndex(lessonIndex);
    setScreen("lesson");
  }

  function openCourseLessonList(course) {
    setCourseLessonListTarget(course);
    setScreen("courseLessonList");
  }

  function openCoursePath(course) {
    if (course.type === "active") {
      setActiveCourseId(course.id);
    }
    setPathContext({ courseId: course.id, courseType: course.type });
    setScreen("coursePath");
  }

  function exitCoursePath() {
    const courseType = pathCourseResolved?.courseType;
    setPathContext(null);
    setScreen(courseType === "abandoned" || courseType === "completed" ? "previousCourses" : "dashboard");
  }

  function openLessonFromPath(lessonIndex) {
    const c = pathCourseResolved;
    if (!c) return;
    if (c.courseType === "active") {
      openCourseLesson(c.id, lessonIndex, "coursePath");
    } else if (c.courseType === "completed") {
      openArchiveCourse(c, lessonIndex, "coursePath");
    }
  }

  // ── Audio player handlers ─────────────────────────────────────────────────
  function _startSpeech(text, rate, onEnd) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend   = onEnd;
    utterance.onerror = onEnd;
    audioUtteranceRef.current = utterance;
    synth.speak(utterance);
  }

  function handleListen(item) {
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Same item — toggle play/pause
    if (nowPlaying?.id === item.id) {
      if (nowPlaying.state === "playing") {
        synth.pause();
        setNowPlaying(np => ({ ...np, state: "paused" }));
      } else {
        synth.resume();
        setNowPlaying(np => ({ ...np, state: "playing" }));
      }
      return;
    }

    // New item — build text and start
    const blurb = lessonBlurb(item.title, item.lessonIndex, item.totalLessons, item.topic);
    const text = `${item.title}. ${blurb}`;
    _startSpeech(text, playbackRate, () => setNowPlaying(null));
    setNowPlaying({ id: item.id, title: item.title, topic: item.topic, text, state: "playing" });
  }

  function handleAudioToggle() {
    const synth = window.speechSynthesis;
    if (!synth || !nowPlaying) return;
    if (nowPlaying.state === "playing") {
      synth.pause();
      setNowPlaying(np => ({ ...np, state: "paused" }));
    } else {
      synth.resume();
      setNowPlaying(np => ({ ...np, state: "playing" }));
    }
  }

  function handleAudioStop() {
    window.speechSynthesis?.cancel();
    setNowPlaying(null);
  }

  function handleAudioRestart() {
    if (!nowPlaying) return;
    _startSpeech(nowPlaying.text, playbackRate, () => setNowPlaying(null));
    setNowPlaying(np => ({ ...np, state: "playing" }));
  }

  function handleSpeedChange(newRate) {
    setPlaybackRate(newRate);
    if (!nowPlaying) return;
    // Restart speech at new rate (SpeechSynthesis can't change rate mid-utterance)
    _startSpeech(nowPlaying.text, newRate, () => setNowPlaying(null));
    setNowPlaying(np => ({ ...np, state: "playing" }));
  }

  function tryNewCourse() {
    if (plan === "free" && courses.filter(c => !c.bookAuthor).length >= 2) {
      setScreen("upgrade");
      return;
    }
    setTopic("");
    setAspect("");
    setCuriosityReason("");
    setDesiredOutcome("");
    setLearningStyle("");
    setGeneratedLessons([]);
    setScreen("newPath");
  }

  // Start a pre-curated Browse course — skips onboarding and generation entirely
  function startBrowseCourse(subject) {
    if (plan === "free" && courses.filter(c => !c.bookAuthor).length >= 2) {
      return;
    }
    const lessons = getLessonsForSubject(subject.name);
    const newCourse = {
      id: Date.now(),
      topic: subject.name,
      aspect: subject.tag,
      level: "Standard",
      duration: lessons.length,
      context: {},
      progress: 0,
      lessons,
    };
    setBrowsePreview(null);
    if (signedIn) {
      setCourses((prev) => [...prev, newCourse]);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("today");
      setScreen("lesson");
    } else {
      setPendingCourse(newCourse);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("browse");
      setScreen("lesson");
    }
  }

  function startBookPath(book) {
    if (book.tier === "paid" && plan === "free") {
      setScreen("upgrade");
      return;
    }
    const newCourse = {
      id: Date.now(),
      topic: book.title,
      aspect: `By ${book.author}`,
      level: "Standard",
      duration: book.lessons.length,
      context: {},
      progress: 0,
      lessons: book.lessons,
      bookAuthor: book.author,
      bookId: book.id,
    };
    if (signedIn) {
      setCourses((prev) => [...prev, newCourse]);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("today");
      setScreen("lesson");
    } else {
      setPendingCourse(newCourse);
      setActiveCourseId(newCourse.id);
      setLessonBackScreen("browse");
      setScreen("lesson");
    }
  }

  function completeQuiz(difficulty) {
    if (!activeCourse || activeCourseId == null) return;

    if (!signedIn) {
      setPendingQuizComplete(true);
      setScreen("auth");
      return;
    }

    const completedIdx = activeCourse.progress || 0;
    const newProgress = Math.min(completedIdx + 1, activeCourse.lessons.length);
    const isCourseComplete = newProgress === activeCourse.lessons.length;
    const cardsSaved = autoSaveLessonReviewDeck(activeCourse, completedIdx);

    setCourses((previous) =>
      previous.map((course) =>
        course.id === activeCourseId
          ? { ...course, progress: newProgress }
          : course
      )
    );
    setStreak((value) => value + 1);
    setLessonActivityByDay((previous) => {
      const key = localDateKey();
      return { ...previous, [key]: (previous[key] || 0) + 1 };
    });

    if (isCourseComplete) {
      setCompletedCourseSummary(activeCourse);
      setShowStreakMoment(true);
      window.setTimeout(() => setShowStreakMoment(false), 1900);
      setScreen("courseComplete");
    } else {
      setLessonCompleteData({
        courseId: activeCourseId,
        difficulty: difficulty || null,
        lessonTitle: activeCourse.lessons[completedIdx],
        courseTopic: activeCourse.topic,
        lessonNumber: completedIdx + 1,
        totalLessons: activeCourse.lessons.length,
        nextLessonTitle: activeCourse.lessons[newProgress] || null,
        newStreak: streak + 1,
        backScreen: lessonBackScreen,
        cardsSaved,
      });
    }
  }

  function dismissLessonComplete() {
    const data = lessonCompleteData;
    setLessonCompleteData(null);
    if (data.difficulty && data.courseId != null) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === data.courseId
            ? { ...c, lastDifficulty: data.difficulty }
            : c
        )
      );
    }
    setShowStreakMoment(true);
    window.setTimeout(() => setShowStreakMoment(false), 1900);
    setScreen(data.backScreen === "generating" ? "today" : data.backScreen);
  }

  function previewCatalogContent(item) {
    if (!item || item.type === "sequence") return;
    const lessonTitles = item.lessons?.map((l) => l.title) || [];
    const newCourse = {
      id: `preview-${item.id}`,
      topic: item.title,
      aspect: item.type === "book" ? `By ${item.author || "Unknown"}` : (item.tag || item.category),
      level: "Standard",
      duration: lessonTitles.length,
      context: {},
      progress: 0,
      lessons: lessonTitles,
      ...(item.type === "book" ? { bookAuthor: item.author, bookId: item.slug } : {}),
    };
    setPlan("paid");
    setSignedIn(true);
    setCourses([newCourse]);
    setActiveCourseId(newCourse.id);
    setLessonBackScreen("dashboard");
    setScreen(item.type === "book" ? "coursePath" : "lesson");
    if (item.type === "book") {
      setPathContext({ courseId: newCourse.id, courseType: "active" });
    }
  }

  if (screen === "admin") {
    return (
      <main className="curi relative min-h-screen overflow-hidden antialiased" style={{ backgroundColor: "var(--c-bg)", color: "var(--c-ink)" }}>
        <DevToolbar devMode={devMode} onSetMode={applyDevMode} />
        <AdminDashboard onExit={() => applyDevMode("off")} onPreviewContent={previewCatalogContent} />
      </main>
    );
  }

  return (
    <main className="curi relative min-h-screen overflow-hidden antialiased" style={{ backgroundColor: "var(--c-bg)", color: "var(--c-ink)" }}>
      <DevToolbar devMode={devMode} onSetMode={applyDevMode} />
      <div className="app-frame relative z-10 flex h-screen w-full max-w-none overflow-hidden">
        {signedIn ? (
        <Sidebar
          screen={screen}
          streak={streak}
          plan={plan}
          user={user}
          todayHasLesson={!!lessonActivityByDay[localDateKey()]}
          onToday={() => setScreen("today")}
          onBrowse={() => setScreen("browse")}
          onLibrary={() => setScreen("library")}
          onAnalytics={() => setScreen("dashboard")}
          onFlashcards={() => { setFlashcardEntry(null); setScreen("flashcards"); }}
          onNewCourse={tryNewCourse}
          onProfile={() => setScreen("profile")}
          onUpgrade={() => setScreen("upgrade")}
        />
        ) : null}
        <div
          key={screen}
          className={`curi-animate-in flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto ${screen === "coursePath" || screen === "lesson" ? "" : "px-5 py-6 sm:px-8 lg:px-12 xl:px-14"}`}
        >
          {screen !== "coursePath" && screen !== "lesson" ? (
          <Header
            signedIn={signedIn}
            user={user}
            alwaysShowBar={!signedIn && screen === "landing"}
            onLogo={() => setScreen(signedIn ? "today" : "landing")}
            onProfile={() => setScreen("profile")}
            onSignIn={() => {
              setAuthBackTarget(screen === "today" ? "today" : "landing");
              setScreen("auth");
            }}
            onSignUp={() => {
              setAuthBackTarget(screen === "today" ? "today" : "landing");
              setScreen("auth");
            }}
          />
          ) : null}

          {screen === "newPath" && (
            <NewPath
              topic={topic}
              setTopic={setTopic}
              onSubmit={beginTopicSubmit}
              onBrowse={() => setScreen("browse")}
            />
          )}
          {screen === "landing" && (
            <Landing
              topic={topic}
              setTopic={setTopic}
              onSubmit={beginTopicSubmit}
              onTopicSelect={handleTopicSelect}
            />
          )}
          {screen === "onboarding" && (
            <Onboarding
              topic={topic}
              aspect={aspect}
              setAspect={setAspect}
              level={level}
              setLevel={setLevel}
              suggestions={suggestions}
              curiosityReason={curiosityReason}
              setCuriosityReason={setCuriosityReason}
              desiredOutcome={desiredOutcome}
              setDesiredOutcome={setDesiredOutcome}
              learningStyle={learningStyle}
              setLearningStyle={setLearningStyle}
              onGenerate={startGeneration}
            />
          )}
          {screen === "generating" && <Generating topic={topic} lessons={generatedLessons} totalLessons={lessonsForTopic.length} complete={!isGenerating && generatedLessons.length === lessonsForTopic.length} onSave={saveGeneratedCourse} signedIn={signedIn} />}
          {screen === "browse" && (
            <Browse onPreview={setBrowsePreview} onStartCourse={handleTopicSelect} onStartBook={startBookPath} plan={plan} onUpgrade={() => setScreen("upgrade")} courses={courses} />
          )}
          {screen === "library" && (
            <LibraryScreen
              courses={courses}
              completedCourses={effectiveCompletedCourses}
              abandonedCourses={effectiveAbandonedCourses}
              onOpenLesson={(courseId, idx) => openCourseLesson(courseId, idx, "library")}
              onOpenArchive={(course) => openArchiveCourse(course, 0, "library")}
              onOpenCoursePath={openCoursePath}
              onOpenLessonList={openCourseLessonList}
              onNewCourse={tryNewCourse}
              streak={streak}
            />
          )}
          {screen === "courseLessonList" && courseLessonListTarget ? (
            <CourseLessonList
              course={courseLessonListTarget}
              user={user}
              onBack={() => setScreen("library")}
              onOpenLesson={(lessonIndex) => {
                const c = courseLessonListTarget;
                if (c.type === "completed") {
                  openArchiveCourse(c, lessonIndex, "courseLessonList");
                } else {
                  openCourseLesson(c.id, lessonIndex, "courseLessonList");
                }
              }}
            />
          ) : null}
          {screen === "today" && (
            <TodayFeed
              courses={courses}
              onOpenLesson={(courseId, lessonIndex) => openCourseLesson(courseId, lessonIndex, "today")}
              onNewCourse={tryNewCourse}
              onBrowse={() => setScreen("browse")}
              signedIn={signedIn}
              onAuthSignIn={() => { setAuthBackTarget("today"); setScreen("auth"); }}
              onAuthSignUp={() => { setAuthBackTarget("today"); setScreen("auth"); }}
              onListen={handleListen}
              nowPlaying={nowPlaying}
              cardSets={cardSets}
              onStartReview={() => { setFlashcardEntry("review-due"); setScreen("flashcards"); }}
              lessonDoneToday={!!lessonActivityByDay[localDateKey()]}
              reviewDoneToday={!!reviewActivityByDay[localDateKey()]}
              streak={streak}
            />
          )}
          {screen === "dashboard" && (
            <Dashboard
              courses={courses}
              completedCourses={effectiveCompletedCourses}
              activeCourseId={activeCourseId}
              streak={streak}
              lessonActivityByDay={lessonActivityByDay}
              signedIn={signedIn}
              user={user}
              onRead={() => activeCourse && openCourseLesson(activeCourse.id, currentLessonIndex)}
              onOpenOtherLesson={(courseId, lessonIndex) => openCourseLesson(courseId, lessonIndex, "dashboard")}
              onNewCourse={tryNewCourse}
              onUpgrade={() => setScreen("upgrade")}
              onProfile={() => setScreen("profile")}
              onPreviousCourses={openPreviousCourses}
              plan={plan}
              onSeedDemo={seedDemoLibrary}
              onPreviewComplete={previewCourseComplete}
              onAuthSignIn={() => {
                setAuthBackTarget("dashboard");
                setScreen("auth");
              }}
              onAuthSignUp={() => {
                setAuthBackTarget("dashboard");
                setScreen("auth");
              }}
            />
          )}
          {screen === "coursePath" && pathCourseResolved ? (
            <CoursePathScreen
              course={pathCourseResolved}
              streak={streak}
              onBack={exitCoursePath}
              onOpenLesson={pathCourseResolved.courseType === "abandoned" ? undefined : openLessonFromPath}
            />
          ) : null}
          {screen === "auth" && (
            <AuthFlow
              onComplete={completeAuth}
              onBack={handleAuthBack}
              pendingCourse={pendingCourse}
              pendingQuizComplete={pendingQuizComplete}
            />
          )}
          {screen === "profile" && (
            <Profile
              user={user}
              setUser={setUser}
              plan={plan}
              streak={streak}
              courses={courses}
              onBack={() => setScreen("today")}
              onUpgrade={() => setScreen("upgrade")}
              onBilling={() => setScreen("billing")}
              onSignOut={signOut}
            />
          )}
          {screen === "billing" && <Billing plan={plan} setPlan={setPlan} onBack={() => setScreen("profile")} onUpgrade={() => { setPlan("paid"); setScreen("profile"); }} />}
          {screen === "lesson" && activeCourse ? (
            <LessonReader
              course={activeCourse}
              lessonIndex={currentLessonIndex}
              initialLessonIndex={readerInitialLessonIndex ?? currentLessonIndex}
              title={currentLessonTitle}
              backLabel={
                lessonBackScreen === "generating"       ? "Course outline" :
                lessonBackScreen === "today"            ? "Home" :
                lessonBackScreen === "library"          ? "Library" :
                lessonBackScreen === "courseLessonList" ? "Lessons" :
                lessonBackScreen === "coursePath"       ? "Course" :
                "Dashboard"
              }
              signedIn={signedIn}
              onQuiz={completeQuiz}
              onBack={() => setScreen(lessonBackScreen)}
              cardSets={cardSets}
              onSaveCardSet={saveCardSet}
              onViewFlashcards={() => setScreen("flashcards")}
            />
          ) : null}
          {screen === "flashcards" && (
            <FlashcardScreen
              cardSets={cardSets}
              onSaveSet={saveCardSet}
              onDeleteSet={deleteCardSet}
              autoStartReview={flashcardEntry === "review-due"}
              onReviewComplete={markReviewDoneToday}
            />
          )}
          {screen === "courseComplete" && completedCourseSummary ? (
            <CourseComplete
              course={completedCourseSummary}
              streak={streak}
              plan={plan}
              user={user}
              onStartPath={handleTopicSelect}
              onDashboard={() => setScreen("today")}
              onUpgrade={() => setScreen("upgrade")}
            />
          ) : null}
          {screen === "dailyEmail" && (
            <DailyEmailPreview
              courses={courses}
              streak={streak}
              user={user}
              onContinue={() => {
                if (courses.length > 1) {
                  setScreen("today");
                } else if (courses[0]) {
                  openCourseLesson(courses[0].id, courses[0].progress ?? 0, "today");
                }
              }}
              onDashboard={() => setScreen("today")}
            />
          )}
          {screen === "previousCourses" && (
            <PreviousCoursesPage
              activeCourses={courses}
              completedCourses={effectiveCompletedCourses}
              abandonedCourses={effectiveAbandonedCourses}
              activeCourseId={activeCourseId}
              onBack={() => setScreen("dashboard")}
              onOpenCompleted={(course) => openCoursePath({ ...course, type: "completed", progress: course.lessons.length })}
              onOpenActive={(course) => openCoursePath({ ...course, type: "active" })}
              onOpenAbandoned={(course) => openCoursePath(course)}
            />
          )}
          {screen === "archiveReader" && (
            <ArchivedCourseReader
              course={selectedArchiveCourse}
              selectedLessonIndex={selectedArchiveLessonIndex}
              setSelectedLessonIndex={setSelectedArchiveLessonIndex}
              onBack={() => setScreen(archiveBackScreen)}
              onRetakeQuiz={() => {
                setArchiveQuizAnswers({});
                setScreen("archiveQuiz");
              }}
              userName={user?.name || ""}
            />
          )}
          {screen === "archiveQuiz" && <ArchiveQuiz course={selectedArchiveCourse} lessonIndex={selectedArchiveLessonIndex} answers={archiveQuizAnswers} setAnswers={setArchiveQuizAnswers} onBack={() => setScreen("archiveReader")} onComplete={() => setScreen("archiveReader")} />}
          {screen === "upgrade" && (
            <Upgrade
              onClose={() => setScreen(signedIn ? "dashboard" : "landing")}
              onUpgrade={() => {
                if (signedIn) {
                  setPlan("paid");
                  setScreen("dashboard");
                } else {
                  setAuthBackTarget("landing");
                  setScreen("auth");
                }
              }}
            />
          )}
        </div>
      </div>
      {lessonCompleteData && (
        <LessonCompleteModal data={lessonCompleteData} onClose={dismissLessonComplete} />
      )}
      {showStreakMoment && <StreakMoment streak={streak} />}
      {browsePreview && (
        <CoursePreviewModal
          subject={browsePreview}
          onClose={() => setBrowsePreview(null)}
          onStart={() => startBrowseCourse(browsePreview)}
          atPathLimit={plan === "free" && courses.filter(c => !c.bookAuthor).length >= 2}
        />
      )}

      {/* ── Floating audio player ── */}
      <AudioPlayer
        nowPlaying={nowPlaying}
        playbackRate={playbackRate}
        onToggle={handleAudioToggle}
        onStop={handleAudioStop}
        onRestart={handleAudioRestart}
        onSpeedChange={handleSpeedChange}
      />
    </main>
  );
}
export default App;
