export type NotePage = {
    id: string;
    title: string;
    owner: string;
    collaborators: string[];
    tags: string[];
    date: string;
    lastModified: number;
    lastModifiedBy: string;
    rawContent: string;
    htmlContent: string;
}