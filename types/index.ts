
export * from './common';
export * from './workout';
export * from './user';
// Achievement is small enough to keep here or move to analytics later
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    threshold?: number;
}
