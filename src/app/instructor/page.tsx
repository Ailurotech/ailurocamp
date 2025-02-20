"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";

function InstructorDashboard() {
  const { data: session } = useSession();

  // Mock data: Replace with real data from an API or database
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "JavaScript Essentials",
      enrolledStudents: 120,
      rating: 4.5,
      revenue: 2400,
      status: "published",
    },
    {
      id: 2,
      title: "React Fundamentals",
      enrolledStudents: 80,
      rating: 4.7,
      revenue: 1600,
      status: "draft",
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      enrolledStudents: 30,
      rating: 4.3,
      revenue: 900,
      status: "published",
    },
  ]);

  // For the Delete Confirmation Modal
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Example stats (replace with real stats from your backend)
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, course) => acc + course.enrolledStudents, 0);
  const totalRevenue = courses.reduce((acc, course) => acc + course.revenue, 0);

  // Handlers
  const handleEdit = (courseId: number) => {
    // Navigate to course edit page or open an edit modal
    alert(`Edit course with id: ${courseId}`);
  };

  const handlePublishToggle = (courseId: number) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              status: course.status === "published" ? "draft" : "published",
            }
          : course
      )
    );
  };

  const handleDeleteConfirm = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const deleteCourse = () => {
    if (courseToDelete) {
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Instructor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your courses</p>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Courses"
          value={totalCourses}
          icon={<BookOpenIcon className="h-6 w-6 text-gray-400" />}
          link={{ href: "#courses", label: "View all courses" }}
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<UsersIcon className="h-6 w-6 text-gray-400" />}
          link={{ href: "#courses", label: "View students" }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue}`}
          icon={<RevenueIcon className="h-6 w-6 text-gray-400" />}
          link={{ href: "#courses", label: "View details" }}
        />
      </div>

      {/* ===== Courses Table ===== */}
      <div className="mt-8" id="courses">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Courses</h2>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.enrolledStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${course.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        "inline-flex px-2 text-xs leading-5 font-semibold rounded-full",
                        course.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePublishToggle(course.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {course.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(course)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Recent Activity (Optional) ===== */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <activity.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <div>
                    <span
                      className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        activity.type === "user"
                          ? "bg-green-100 text-green-800"
                          : activity.type === "course"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      )}
                    >
                      {activity.type}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Delete Confirmation Modal ===== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Confirmation
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong>{courseToDelete?.title}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={deleteCourse}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;

// ============================
// Helper Components and Data
// ============================

type Course = {
  id: number;
  title: string;
  enrolledStudents: number;
  rating: number;
  revenue: number;
  status: "published" | "draft";
};

const recentActivity = [
  {
    id: 1,
    type: "user",
    title: "New student enrolled: Alice",
    time: "3 hours ago",
    icon: UsersIcon,
  },
  {
    id: 2,
    type: "course",
    title: "Course updated: JavaScript Essentials",
    time: "1 day ago",
    icon: BookOpenIcon,
  },
  {
    id: 3,
    type: "course",
    title: "New course published: Machine Learning Basics",
    time: "2 days ago",
    icon: BookOpenIcon,
  },
];

// Generic stat card component
function StatCard({
  title,
  value,
  icon,
  link,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  link: { href: string; label: string };
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={link.href} className="font-medium text-indigo-600 hover:text-indigo-500">
            {link.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Icons (You can also use Heroicons, etc.)
function UsersIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function BookOpenIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function RevenueIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .843-3 1.882 0 .957.635 1.68 1.51 1.934l1.384.396c.734.21 1.356.922 1.356 1.788 0 1.039-1.343 1.882-3 1.882s-3-.843-3-1.882M12 8V6m0 10v-2"
      />
    </svg>
  );
}
