export interface Question {
    id: string,
    isAnswered: boolean,
    category: string,
    type: string,
    difficulty: string,
    question: string,
    correctAnswer: string,
    options: Answer[]
}

 export interface Answer {
    option: string,
    isHeld: boolean,
    isCorrect: boolean
}