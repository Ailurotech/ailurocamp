import { IModule } from '@/types/module';

// Fetch all modules by course Id
export async function fetchModules(courseId: string) {
  const res: Response = await fetch(
    `/api/instructor/course/${courseId}/modules`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch modules, please try again.');
  }
  const data: { modules: IModule[]; error?: string } = await res.json();
  return data;
}

// Create a new module
export async function createModule(
  courseId: string,
  module: { title: string; content: string; order: number; duration: number }
) {
  const res: Response = await fetch(
    `/api/instructor/course/${courseId}/modules`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module),
    }
  );
  if (!res.ok) {
    throw new Error('Failed to create module, please try again.');
  }
  const data: { modules: IModule[]; error?: string } = await res.json();
  return data;
}

// Update a module
export async function updateModule(
  courseId: string,
  moduleId: string,
  module: {
    title?: string;
    content?: string;
    order?: number;
    duration?: number;
  }
) {
  const res: Response = await fetch(
    `/api/instructor/course/${courseId}/modules?moduleId=${moduleId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module),
    }
  );
  if (!res.ok) {
    throw new Error('Failed to update module, please try again.');
  }

  const data: { updatedModule: IModule; error?: string } = await res.json();
  return data;
}

// Delete a module
export async function deleteModule(courseId: string, moduleId: string) {
  const res: Response = await fetch(
    `/api/instructor/course/${courseId}/modules?moduleId=${moduleId}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Failed to delete module, please try again.');
  }
  const data: { deletedModule: IModule; error?: string } = await res.json();
  return data;
}
