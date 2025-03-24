export interface IModuleApiReq {
  id?: string;
  title: string;
  content: string;
  order: string;
  duration: string;
}

export interface IModule {
  _id: string;
  title: string;
  content: string;
  order: number;
  duration: number;
}
