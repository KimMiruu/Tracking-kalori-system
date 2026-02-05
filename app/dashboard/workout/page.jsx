"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Workout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk fitur mulai latihan
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Data video untuk setiap jenis latihan
  const exerciseVideos = {
    // Cardio exercises
    "Jogging di Tempat": "https://www.youtube.com/embed/uymTGsML0HA",
    "Jumping Jack": "https://www.youtube.com/embed/iSSAk4XCsRA",
    "High Knees": "https://www.youtube.com/embed/ZNDHivUg7vA",
    "Butt Kicks": "https://www.youtube.com/embed/-dtvAxibgYQ",
    "Mountain Climber": "https://www.youtube.com/embed/cnyTQDSE884",
    Burpees: "https://www.youtube.com/embed/JZQA08SlJnM",
    "Jump Squats": "https://www.youtube.com/embed/U4s4mEQ5VqU",
    "Plank Jacks": "https://www.youtube.com/embed/VasEy9dNzZM?si=K24SGJ1Xp-g9Qk0c",
    "Cool Down": "https://www.youtube.com/embed/r5QG2Lq1oUo",
    Rest: "https://www.youtube.com/embed/r5QG2Lq1oUo",

    // Strength exercises
    "Push Up": "https://www.youtube.com/embed/IODxDxX7oi4",
    Squat: "https://www.youtube.com/embed/aclHkVaku9U",
    Plank: "https://www.youtube.com/embed/pSHjTRCQxIw",
    Lunges: "https://www.youtube.com/embed/D7KaRcUTQeE",
    "Tricep Dips": "https://www.youtube.com/embed/0326dy_-CzM",
    "Glute Bridge": "https://www.youtube.com/embed/Xp33YgPZgns",
    Deadlift: "https://www.youtube.com/embed/1ZXobu7JvvE",
    "Leg Press": "https://www.youtube.com/embed/IZxyjW7MPJQ",
    "Calf Raises": "https://www.youtube.com/embed/-M4-G8p8fmc",
    "Push Up Variasi": "https://www.youtube.com/embed/1TmIvHi6jSE",
    "Plank to Push Up": "https://www.youtube.com/embed/nToxCj-QA7E",
    "Arm Circles": "https://www.youtube.com/embed/vOsm1Sdgxvw",
    "Shoulder Taps": "https://www.youtube.com/embed/C6At19Q9i2Q",
    "Dragon Flag": "https://www.youtube.com/embed/rNpwcQuF0sQ",
    "L-Sit": "https://www.youtube.com/embed/_HbccxgnCg0?si=R8d6jjHzYmuJDKyW",
    "Hanging Leg Raises": "https://www.youtube.com/embed/7FwGZ8qY5OU",
    "Russian Twist": "https://www.youtube.com/embed/wkD8rjkodUI",
    "Plank Variations": "https://www.youtube.com/embed/k9w2LJAZ1iY",
    "Barbell Squat":"https://www.youtube.com/embed/-bJIpOq-LWk?si=MkIXg9H0LwfCT3Zt",

    // Yoga exercises
    "Pemanasan & Breathing": "https://www.youtube.com/embed/ftLAgXeOJ8k",
    "Sun Salutation": "https://www.youtube.com/embed/FPjppcOquE4",
    "Warrior Pose": "https://www.youtube.com/embed/sCReePaPF50",
    "Tree Pose": "https://www.youtube.com/embed/_u3NOB8pZf8?si=xb0NuScStupbxOAn",
    "Child's Pose": "https://www.youtube.com/embed/kH12QrSGedM?si=TqujrJtMt52EPDuG",
    Savasana: "https://www.youtube.com/embed/dXYtWuYxWmQ",
    "Dynamic Stretching": "https://www.youtube.com/embed/AUsbthQ9W-I",
    "Leg Swings": "https://www.youtube.com/embed/ZNpRO--nSN8",
    "Deep Breathing": "https://www.youtube.com/embed/K353fkHYMPs",

    // Default video untuk exercise yang tidak ada
    default: "https://www.youtube.com/embed/kLh-uczlPLg?si=e8UlCW2Gzw6_Fko6",
  };

  
  // Fetch workouts dari API
  useEffect(() => {
    fetchWorkouts();
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/workouts?${params}`);
      const result = await response.json();

      if (result.success) {
        setWorkouts(result.data);
      } else {
        setError(result.error);
        setWorkouts([]);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setError("Gagal memuat data latihan");
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  // Data kategori latihan
  const workoutCategories = [
    { id: "all", name: "Semua", icon: "💪" },
    { id: "cardio", name: "Cardio", icon: "🏃" },
    { id: "strength", name: "Strength", icon: "🏋️" },
    { id: "yoga", name: "Yoga", icon: "🧘" },
    { id: "hiit", name: "HIIT", icon: "⚡" },
    { id: "fullbody", name: "Full Body", icon: "👤" },
    { id: "upperbody", name: "Upper Body", icon: "💪" },
    { id: "lowerbody", name: "Lower Body", icon: "🦵" },
  ];

  // Data tingkat kesulitan
  const difficultyLevels = [
    { id: "all", name: "Semua Level", color: "#6b7280" },
    { id: "beginner", name: "Pemula", color: "#10b981" },
    { id: "intermediate", name: "Menengah", color: "#f59e0b" },
    { id: "advanced", name: "Lanjutan", color: "#ef4444" },
  ];

  // Filter latihan berdasarkan kategori, kesulitan, dan pencarian
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesCategory = selectedCategory === "all" || workout.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || workout.difficulty === selectedDifficulty;
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) || workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // Function untuk memulai latihan
  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setWorkoutInProgress(true);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsPaused(false);
  };

  // Function untuk exercise berikutnya
  const nextExercise = () => {
    if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimer(0);
    } else {
      completeWorkout();
    }
  };

  // Function untuk exercise sebelumnya
  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setTimer(0);
    }
  };

  // Function untuk menyelesaikan latihan
  const completeWorkout = () => {
    setWorkoutInProgress(false);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setTimer(0);
    setIsPaused(false);
    alert("🎉 Selamat! Anda telah menyelesaikan latihan!");
  };

  // Function untuk pause/resume latihan
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Function untuk menampilkan detail
  const showWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowDetailModal(true);
  };

  // Function untuk menutup detail
  const closeWorkoutDetail = () => {
    setShowDetailModal(false);
    setSelectedWorkout(null);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (workoutInProgress && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutInProgress, isPaused]);

  // Format waktu
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Dapatkan video untuk exercise saat ini
  const getCurrentExerciseVideo = () => {
    const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];
    if (currentExercise && currentExercise.name) {
      return exerciseVideos[currentExercise.name] || exerciseVideos.default;
    }
    return exerciseVideos.default;
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <main style={styles.mainContent}>
          <div style={styles.contentContainer}>
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Memuat data latihan...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <div style={styles.logoSection}>
              <Link href="/dashboard" style={styles.logo}>
                <div style={styles.logoImageContainer}>
                  <img
                    src="/logo1.png"
                    alt="SimpleFit Logo"
                    style={styles.logoImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <span style={styles.logoText}>SimpleFit</span>
              </Link>
            </div>

            <div style={styles.menuSection}>
              <Link href="/dashboard" style={styles.menuLink}>
                <span style={styles.menuIcon}>🏠</span>
                Dashboard
              </Link>
              <Link href="/dashboard/tracking" style={styles.menuLink}>
                <span style={styles.menuIcon}>📊</span>
                Tracking
              </Link>
              <Link
                href="/dashboard/workout"
                style={{
                  ...styles.menuLink,
                  ...styles.activeMenuLink,
                }}
              >
                <span style={styles.menuIcon}>💪</span>
                Latihan
              </Link>
              <Link href="/dashboard/food" style={styles.menuLink}>
                <span style={styles.menuIcon}>🍎</span>
                Makanan
              </Link>
              <Link href="/dashboard/progress" style={styles.menuLink}>
                <span style={styles.menuIcon}>📈</span>
                Progress
              </Link>
            </div>

            <div style={styles.profileSection}>
              <div style={styles.profileDropdown}>
                <button style={styles.profileButton}>
                  <div style={styles.profileAvatar}>
                    <span style={styles.avatarText}>U</span>
                  </div>
                  <span style={styles.profileName}>User</span>
                  <span style={styles.dropdownArrow}>▼</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main style={styles.mainContent}>
          <div style={styles.contentContainer}>
            <div style={styles.errorState}>
              <div style={styles.errorIcon}>⚠️</div>
              <h4 style={styles.errorTitle}>Terjadi Kesalahan</h4>
              <p style={styles.errorDescription}>{error}</p>
              <button onClick={fetchWorkouts} style={styles.retryButton}>
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* Header Section */}
          <div style={styles.headerSection}>
            <h1 style={styles.pageTitle}>Program Latihan</h1>
            <p style={styles.pageSubtitle}>Pilih program latihan yang sesuai dengan tujuan dan level Anda</p>
          </div>

          {/* Search Bar */}
          <div style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Cari latihan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            </div>
          </div>

          {/* Filter Section */}
          <div style={styles.filterSection}>
            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>Kategori Latihan</h4>
              <div style={styles.categoryGrid}>
                {workoutCategories.map((category) => (
                  <button
                    key={category.id}
                    style={{
                      ...styles.categoryButton,
                      ...(selectedCategory === category.id ? styles.activeCategoryButton : {}),
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span style={styles.categoryIcon}>{category.icon}</span>
                    <span style={styles.categoryName}>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>Tingkat Kesulitan</h4>
              <div style={styles.difficultyGrid}>
                {difficultyLevels.map((level) => (
                  <button
                    key={level.id}
                    style={{
                      ...styles.difficultyButton,
                      ...(selectedDifficulty === level.id
                        ? {
                            backgroundColor: level.color,
                            color: "white",
                          }
                        : {}),
                    }}
                    onClick={() => setSelectedDifficulty(level.id)}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workout Recommendations Grid */}
          <div style={styles.workoutSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                Rekomendasi Latihan
                {selectedCategory !== "all" && ` - ${workoutCategories.find((cat) => cat.id === selectedCategory)?.name}`}
                {selectedDifficulty !== "all" && ` (${difficultyLevels.find((diff) => diff.id === selectedDifficulty)?.name})`}
              </h3>
              <span style={styles.resultCount}>{filteredWorkouts.length} latihan ditemukan</span>
            </div>

            {filteredWorkouts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💪</div>
                <h4 style={styles.emptyTitle}>Tidak ada latihan ditemukan</h4>
                <p style={styles.emptyDescription}>Coba ubah filter pencarian atau pilih kategori lain</p>
              </div>
            ) : (
              <div style={styles.workoutGrid}>
                {filteredWorkouts.map((workout) => (
                  <div key={workout.id_workout} style={styles.workoutCard}>
                    <div style={styles.workoutHeader}>
                      <div style={styles.workoutImage}>{workout.image}</div>
                      <div style={styles.workoutInfo}>
                        <h4 style={styles.workoutName}>{workout.name}</h4>
                        <p style={styles.workoutDescription}>{workout.description}</p>
                        <div style={styles.workoutMeta}>
                          <span style={styles.metaItem}>⏱️ {workout.duration} menit</span>
                          <span style={styles.metaItem}>🔥 {workout.calories} kalori</span>
                          <span
                            style={{
                              ...styles.difficultyBadge,
                              backgroundColor: difficultyLevels.find((d) => d.id === workout.difficulty)?.color,
                            }}
                          >
                            {difficultyLevels.find((d) => d.id === workout.difficulty)?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.focusSection}>
                      <h5 style={styles.focusTitle}>Fokus Latihan:</h5>
                      <div style={styles.focusTags}>
                        {workout.focus.map((focus, index) => (
                          <span key={index} style={styles.focusTag}>
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.equipmentSection}>
                      <h5 style={styles.equipmentTitle}>Peralatan:</h5>
                      <div style={styles.equipmentList}>
                        {workout.equipment.map((item, index) => (
                          <span key={index} style={styles.equipmentTag}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.exercisePreview}>
                      <h5 style={styles.exerciseTitle}>Latihan:</h5>
                      <div style={styles.exerciseList}>
                        {workout.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} style={styles.exerciseItem}>
                            <span style={styles.exerciseName}>{exercise.name}</span>
                            <span style={styles.exerciseDetail}>
                              {exercise.sets} {exercise.duration && `• ${exercise.duration}`}
                            </span>
                          </div>
                        ))}
                        {workout.exercises.length > 3 && <div style={styles.moreExercises}>+{workout.exercises.length - 3} latihan lainnya...</div>}
                      </div>
                    </div>

                    <div style={styles.workoutActions}>
                      <button style={styles.startButton} onClick={() => startWorkout(workout)}>
                        🏁 Mulai Latihan
                      </button>
                      <button style={styles.detailButton} onClick={() => showWorkoutDetail(workout)}>
                        📋 Detail Latihan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Section */}
          <div style={styles.statsSection}>
            <h3 style={styles.sectionTitle}>Program Latihan Tersedia</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💪</div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{workouts.length}</div>
                  <div style={styles.statLabel}>Total Program</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏃</div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{workouts.filter((w) => w.category === "cardio").length}</div>
                  <div style={styles.statLabel}>Cardio</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏋️</div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{workouts.filter((w) => w.category === "strength").length}</div>
                  <div style={styles.statLabel}>Strength</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🧘</div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{workouts.filter((w) => w.category === "yoga").length}</div>
                  <div style={styles.statLabel}>Yoga</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Workout In Progress Modal */}
      {workoutInProgress && selectedWorkout && (
        <div style={styles.workoutModalOverlay}>
          <div style={styles.workoutModalContent}>
            <div style={styles.workoutModalHeader}>
              <h2 style={styles.workoutModalTitle}>
                {selectedWorkout.name}
                <span style={styles.workoutProgress}>
                  ({currentExerciseIndex + 1}/{selectedWorkout.exercises.length})
                </span>
              </h2>
              <div style={styles.timerSection}>
                <span style={styles.timer}>{formatTime(timer)}</span>
                <button style={styles.pauseButton} onClick={togglePause}>
                  {isPaused ? "▶️" : "⏸️"}
                </button>
              </div>
            </div>

            <div style={styles.workoutModalBody}>
              {/* Video Section */}
              <div style={styles.videoSection}>
                <h3 style={styles.currentExerciseTitle}>{selectedWorkout.exercises[currentExerciseIndex].name}</h3>
                <div style={styles.videoContainer}>
                  <iframe
                    width="100%"
                    height="300"
                    src={getCurrentExerciseVideo()}
                    title="Exercise Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={styles.videoIframe}
                  ></iframe>
                </div>
              </div>

              {/* Exercise Details */}
              <div style={styles.exerciseDetailsSection}>
                <div style={styles.exerciseInfo}>
                  <div style={styles.exerciseStat}>
                    <span style={styles.exerciseStatLabel}>Sets:</span>
                    <span style={styles.exerciseStatValue}>{selectedWorkout.exercises[currentExerciseIndex].sets}</span>
                  </div>
                  {selectedWorkout.exercises[currentExerciseIndex].duration && selectedWorkout.exercises[currentExerciseIndex].duration !== "-" && (
                    <div style={styles.exerciseStat}>
                      <span style={styles.exerciseStatLabel}>Durasi:</span>
                      <span style={styles.exerciseStatValue}>{selectedWorkout.exercises[currentExerciseIndex].duration}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={styles.progressSection}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${((currentExerciseIndex + 1) / selectedWorkout.exercises.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span style={styles.progressText}>{Math.round(((currentExerciseIndex + 1) / selectedWorkout.exercises.length) * 100)}% Selesai</span>
                </div>

                {/* Next Exercises Preview */}
                <div style={styles.upcomingExercises}>
                  <h4 style={styles.upcomingTitle}>Latihan Selanjutnya:</h4>
                  <div style={styles.upcomingList}>
                    {selectedWorkout.exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((exercise, index) => (
                      <div key={index} style={styles.upcomingExercise}>
                        <span style={styles.upcomingNumber}>{currentExerciseIndex + index + 2}.</span>
                        <span style={styles.upcomingName}>{exercise.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.workoutModalFooter}>
              <button style={styles.prevButton} onClick={prevExercise} disabled={currentExerciseIndex === 0}>
                ⬅️ Sebelumnya
              </button>

              {currentExerciseIndex < selectedWorkout.exercises.length - 1 ? (
                <button style={styles.nextButton} onClick={nextExercise}>
                  Selanjutnya ➡️
                </button>
              ) : (
                <button style={styles.completeButton} onClick={completeWorkout}>
                  🎉 Selesaikan Latihan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workout Detail Modal */}
      {showDetailModal && selectedWorkout && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedWorkout.name}</h2>
              <button style={styles.closeButton} onClick={closeWorkoutDetail}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.workoutOverview}>
                <div style={styles.workoutImageLarge}>{selectedWorkout.image}</div>
                <div style={styles.workoutOverviewInfo}>
                  <p style={styles.workoutDescriptionLarge}>{selectedWorkout.description}</p>
                  <div style={styles.workoutMetaLarge}>
                    <div style={styles.metaItemLarge}>
                      <span style={styles.metaIcon}>⏱️</span>
                      <span>{selectedWorkout.duration} menit</span>
                    </div>
                    <div style={styles.metaItemLarge}>
                      <span style={styles.metaIcon}>🔥</span>
                      <span>{selectedWorkout.calories} kalori</span>
                    </div>
                    <div style={styles.metaItemLarge}>
                      <span style={styles.metaIcon}>📊</span>
                      <span
                        style={{
                          ...styles.difficultyBadgeLarge,
                          backgroundColor: difficultyLevels.find((d) => d.id === selectedWorkout.difficulty)?.color,
                        }}
                      >
                        {difficultyLevels.find((d) => d.id === selectedWorkout.difficulty)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Fokus Latihan</h4>
                <div style={styles.focusTagsLarge}>
                  {selectedWorkout.focus.map((focus, index) => (
                    <span key={index} style={styles.focusTagLarge}>
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Peralatan yang Diperlukan</h4>
                <div style={styles.equipmentListLarge}>
                  {selectedWorkout.equipment.map((item, index) => (
                    <div key={index} style={styles.equipmentItemLarge}>
                      <span style={styles.equipmentIcon}>🛠️</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Rincian Latihan</h4>
                <div style={styles.exerciseListLarge}>
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} style={styles.exerciseItemLarge}>
                      <div style={styles.exerciseHeader}>
                        <span style={styles.exerciseNumber}>{index + 1}</span>
                        <span style={styles.exerciseNameLarge}>{exercise.name}</span>
                      </div>
                      <div style={styles.exerciseDetails}>
                        <span style={styles.exerciseSets}>{exercise.sets}</span>
                        {exercise.duration && exercise.duration !== "-" && <span style={styles.exerciseDuration}>• {exercise.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Tips & Panduan</h4>
                <div style={styles.tipsList}>
                  <div style={styles.tipItem}>🔥 Lakukan pemanasan 5-10 menit sebelum memulai</div>
                  <div style={styles.tipItem}>💧 Minum air yang cukup selama latihan</div>
                  <div style={styles.tipItem}>🎯 Fokus pada bentuk yang benar, bukan kecepatan</div>
                  <div style={styles.tipItem}>⏸️ Istirahat 30-60 detik antar set</div>
                  <div style={styles.tipItem}>🧘 Akhiri dengan pendinginan dan peregangan</div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.startFromDetailButton}
                onClick={() => {
                  closeWorkoutDetail();
                  startWorkout(selectedWorkout);
                }}
              >
                🏁 Mulai Latihan Ini
              </button>
              <button style={styles.closeDetailButton} onClick={closeWorkoutDetail}>
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    padding: "1rem 0",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navScrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.08)",
    padding: "0.75rem 0",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
  },
  logoSection: {
    flex: "0 0 auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.5rem",
    fontWeight: "700",
    textDecoration: "none",
  },
  logoImageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    objectFit: "contain",
  },
  logoText: {
    background: "linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "700",
  },
  menuSection: {
    flex: "1 1 auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
  },
  menuLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#64748b",
    textDecoration: "none",
    fontWeight: "500",
    padding: "0.75rem 1.25rem",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
  },
  activeMenuLink: {
    color: "#247ba0",
    backgroundColor: "rgba(36, 123, 160, 0.1)",
    boxShadow: "0 2px 10px rgba(36, 123, 160, 0.15)",
  },
  menuIcon: {
    fontSize: "1.1rem",
  },
  profileSection: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  profileDropdown: {
    position: "relative",
    display: "inline-block",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "#374151",
  },
  profileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #247ba0 0%, #1a5a7a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  avatarText: {
    color: "white",
  },
  profileName: {
    fontWeight: "500",
    fontSize: "0.875rem",
  },
  dropdownArrow: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "white",
    minWidth: "200px",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "0.5rem 0",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(-10px)",
    transition: "all 0.3s ease",
    zIndex: 1001,
    backdropFilter: "blur(20px)",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "0.75rem 1rem",
    textDecoration: "none",
    color: "#374151",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.875rem",
  },
  mainContent: {
    marginTop: "80px",
    minHeight: "calc(100vh - 80px)",
    padding: "2rem 1rem",
  },
  contentContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  pageTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  pageSubtitle: {
    fontSize: "1.125rem",
    color: "#6b7280",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchSection: {
    marginBottom: "2rem",
  },
  searchContainer: {
    position: "relative",
    maxWidth: "500px",
    margin: "0 auto",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.25rem",
    color: "#6b7280",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    fontSize: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  filterSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    marginBottom: "3rem",
  },
  filterGroup: {
    marginBottom: "1.5rem",
  },
  filterTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "0.75rem",
  },
  categoryButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 0.5rem",
    backgroundColor: "white",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeCategoryButton: {
    borderColor: "#247ba0",
    backgroundColor: "rgba(36, 123, 160, 0.05)",
  },
  categoryIcon: {
    fontSize: "1.5rem",
  },
  categoryName: {
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  difficultyGrid: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  difficultyButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  workoutSection: {
    marginBottom: "3rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  resultCount: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  workoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  workoutCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  },
  workoutHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
  },
  workoutImage: {
    fontSize: "3rem",
    flexShrink: 0,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "0.5rem",
  },
  workoutDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: 1.5,
    marginBottom: "0.75rem",
  },
  workoutMeta: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaItem: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  difficultyBadge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "white",
  },
  focusSection: {
    marginBottom: "1rem",
  },
  focusTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  focusTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  focusTag: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  equipmentSection: {
    marginBottom: "1rem",
  },
  equipmentTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  equipmentList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  equipmentTag: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderRadius: "6px",
    fontSize: "0.75rem",
  },
  exercisePreview: {
    marginBottom: "1.5rem",
  },
  exerciseTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  exerciseList: {
    spaceY: "0.25rem",
  },
  exerciseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f3f4f6",
  },
  exerciseName: {
    fontSize: "0.875rem",
    color: "#374151",
  },
  exerciseDetail: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  moreExercises: {
    fontSize: "0.75rem",
    color: "#247ba0",
    textAlign: "center",
    padding: "0.5rem",
    fontStyle: "italic",
  },
  workoutActions: {
    display: "flex",
    gap: "0.75rem",
  },
  startButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "#247ba0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  detailButton: {
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    color: "#247ba0",
    border: "1px solid #247ba0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem 2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "0.5rem",
  },
  emptyDescription: {
    color: "#6b7280",
  },
  statsSection: {
    marginBottom: "2rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    fontSize: "2rem",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f4f6",
    borderLeft: "4px solid #247ba0",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "1rem",
  },
  errorState: {
    textAlign: "center",
    padding: "3rem 2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  errorTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: "0.5rem",
  },
  errorDescription: {
    color: "#6b7280",
    marginBottom: "1.5rem",
  },
  retryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#247ba0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  // Workout In Progress Modal Styles
  workoutModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "1rem",
  },
  workoutModalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  workoutModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  workoutModalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  workoutProgress: {
    fontSize: "1rem",
    color: "#6b7280",
    fontWeight: "400",
  },
  timerSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  timer: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#247ba0",
    fontFamily: "monospace",
  },
  pauseButton: {
    background: "none",
    border: "none",
    fontSize: "1.25rem",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  workoutModalBody: {
    padding: "2rem",
  },
  videoSection: {
    marginBottom: "2rem",
  },
  currentExerciseTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
    textAlign: "center",
  },
  videoContainer: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
  },
  videoIframe: {
    borderRadius: "12px",
  },
  exerciseDetailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  exerciseInfo: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
  },
  exerciseStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  },
  exerciseStatLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  exerciseStatValue: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#247ba0",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    textAlign: "center",
  },
  upcomingExercises: {
    backgroundColor: "#f8fafc",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  upcomingTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.75rem",
  },
  upcomingList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  upcomingExercise: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
    borderRadius: "6px",
    backgroundColor: "white",
  },
  upcomingNumber: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#247ba0",
    minWidth: "20px",
  },
  upcomingName: {
    fontSize: "0.875rem",
    color: "#374151",
  },
  workoutModalFooter: {
    padding: "1.5rem 2rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prevButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  nextButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#247ba0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  completeButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  // Detail Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "2rem",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 1,
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#6b7280",
    padding: "0.5rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  modalBody: {
    padding: "2rem",
  },
  workoutOverview: {
    display: "flex",
    gap: "2rem",
    marginBottom: "2rem",
  },
  workoutImageLarge: {
    fontSize: "4rem",
    flexShrink: 0,
  },
  workoutOverviewInfo: {
    flex: 1,
  },
  workoutDescriptionLarge: {
    fontSize: "1rem",
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  workoutMetaLarge: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  metaItemLarge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#374151",
  },
  metaIcon: {
    fontSize: "1.25rem",
  },
  difficultyBadgeLarge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "white",
  },
  detailSection: {
    marginBottom: "2rem",
  },
  detailTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  focusTagsLarge: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  focusTagLarge: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  equipmentListLarge: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  equipmentItemLarge: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  equipmentIcon: {
    fontSize: "1rem",
  },
  exerciseListLarge: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  exerciseItemLarge: {
    padding: "1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  exerciseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  exerciseNumber: {
    width: "28px",
    height: "28px",
    backgroundColor: "#247ba0",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  exerciseNameLarge: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  exerciseDetails: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  exerciseSets: {
    fontWeight: "500",
  },
  exerciseDuration: {
    color: "#6b7280",
  },
  tipsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  tipItem: {
    padding: "0.75rem",
    backgroundColor: "#f0f9ff",
    border: "1px solid #e0f2fe",
    borderRadius: "8px",
    fontSize: "0.875rem",
    color: "#0369a1",
  },
  modalFooter: {
    padding: "1.5rem 2rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
  },
  startFromDetailButton: {
    padding: "0.75rem 2rem",
    backgroundColor: "#247ba0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  closeDetailButton: {
    padding: "0.75rem 2rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};

// CSS untuk hover effects dan animations
const stylesheet = `
  .profile-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .profile-button:hover {
    background-color: rgba(36, 123, 160, 0.1);
  }

  .menu-link:hover {
    color: #247ba0;
    background-color: rgba(36, 123, 160, 0.1);
    transform: translateY(-1px);
  }

  .dropdown-item:hover {
    background-color: #f8fafc;
    color: #247ba0;
  }

  .search-input:focus {
    border-color: #247ba0;
    box-shadow: 0 0 0 3px rgba(36, 123, 160, 0.1);
  }

  .category-button:hover {
    border-color: #247ba0;
    transform: translateY(-2px);
  }

  .difficulty-button:hover {
    transform: translateY(-1px);
  }

  .workout-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .start-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .detail-button:hover {
    background-color: #247ba0;
    color: white;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }

  .retry-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .pause-button:hover {
    background-color: #f3f4f6;
  }

  .prev-button:hover:not(:disabled) {
    background-color: #e5e7eb;
  }

  .next-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .complete-button:hover {
    background-color: #059669;
    transform: translateY(-1px);
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .start-from-detail-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .close-detail-button:hover {
    background-color: #e5e7eb;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = stylesheet;
  document.head.appendChild(styleSheet);
}
