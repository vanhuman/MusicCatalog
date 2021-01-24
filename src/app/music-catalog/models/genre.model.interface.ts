export interface GenreInterface {
    getId(): number;
    getName(): string;
    getDescription(): string;
    setDescription(description: string): void;
    getNotes(): string;
    setNotes(notes: string): void;
}
