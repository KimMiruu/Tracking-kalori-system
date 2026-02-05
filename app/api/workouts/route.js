import { db } from "@/lib/db"; // Ganti { query } dengan { db }
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const difficulty = searchParams.get("difficulty") || "all";
    const search = searchParams.get("search") || "";

    let whereConditions = [];
    let queryParams = [];

    if (category !== "all") {
      whereConditions.push("category = ?");
      queryParams.push(category);
    }

    if (difficulty !== "all") {
      whereConditions.push("difficulty = ?");
      queryParams.push(difficulty);
    }

    if (search) {
      whereConditions.push("(name LIKE ? OR description LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const workoutsQuery = `
      SELECT 
        id_workout,
        name,
        category,
        difficulty,
        duration,
        calories,
        image,
        description,
        exercises,
        equipment,
        focus
      FROM workouts 
      ${whereClause}
      ORDER BY name
    `;

    // Gunakan db.execute() bukan query()
    const [workouts] = await db.execute(workoutsQuery, queryParams);

    // Parse JSON fields
    const parsedWorkouts = workouts.map((workout) => ({
      ...workout,
      exercises: JSON.parse(workout.exercises || "[]"),
      equipment: JSON.parse(workout.equipment || "[]"),
      focus: JSON.parse(workout.focus || "[]"),
    }));

    return NextResponse.json({
      success: true,
      data: parsedWorkouts,
    });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
