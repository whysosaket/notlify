export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified?: Date;
}

export interface Tab {
  id: string;
  isActive: boolean;
}