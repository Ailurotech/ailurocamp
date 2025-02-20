import InstructorCoursesTable from "@/components/ui/InstructorCoursesTable";
let error = "";

export default async function InstructorCoursesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/course`, {
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok) {
    error = data.error;
  }
  error = "";
  const courses = data.courses;

  return (
    <div className="p-6 relative">
      {error ? (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Courses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all the courses you created.
            </p>
          </div>

          {/* Courses Table */}
          <InstructorCoursesTable initialCourses={courses} />
        </>
      )}
    </div>
  );
}
