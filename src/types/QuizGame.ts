export interface QuizGame {
    amount: number,
    category: number, 
    difficulty: string,
    type: string
}

export interface QuizOptionItem {
    value: string,
    label: string
}