import InstructorCoursesTable from "@/components/ui/InstructorCoursesTable";

export default async function InstructorCoursesPage() {

  return (
    <div className="p-6 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Courses</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all the courses you created.
        </p>
      </div>

      {/* Courses Table */}
      <InstructorCoursesTable initialCourses={[]} />
    </div>
  );
}
