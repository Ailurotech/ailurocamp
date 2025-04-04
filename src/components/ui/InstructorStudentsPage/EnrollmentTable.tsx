'use client';

import { EnrollmentWithDetails } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  enrollments: EnrollmentWithDetails[];
  onSetLimit: (courseId: string, limit: number) => void;
  onGenerateReport: () => void;
  onRemoveStudent: (courseId: string, studentId: string) => Promise<void>;
  selectedCourse: string;
  onCourseSelect: (courseId: string) => void;
};

export function EnrollmentTable({
  enrollments,
  onSetLimit,
  onGenerateReport,
  onRemoveStudent,
  selectedCourse,
  onCourseSelect,
}: Props) {
  const [limit, setLimit] = useState(100);

  const uniqueCourses = Array.from(
    new Map(
      enrollments.map((enroll) => [enroll.courseId._id, enroll.courseId])
    ).values()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={selectedCourse} onValueChange={onCourseSelect}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="choose course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourse !== 'all' && (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-[100px]"
                min={0}
              />
              <Button onClick={() => onSetLimit(selectedCourse, limit)}>
                set limit
              </Button>
            </div>
          )}
        </div>

        <Button onClick={onGenerateReport}>generate report</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Enrollment Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enroll) => (
            <TableRow key={enroll._id}>
              <TableCell>{enroll.studentId.name}</TableCell>
              <TableCell>{enroll.studentId.email}</TableCell>
              <TableCell>{enroll.courseId.title}</TableCell>
              <TableCell>
                {new Date(enroll.enrolledAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Progress value={enroll.progress} />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() =>
                    onRemoveStudent(enroll.courseId._id, enroll.studentId._id)
                  }
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
