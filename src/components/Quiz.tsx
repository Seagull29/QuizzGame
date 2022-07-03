import React, { FC } from 'react';
import { Answer, Question } from "../types/Question";

interface QuestionProps extends Question{
    onSelectedAnswer(id : string, index : number) : void;
    onCheckFinishedGame() : boolean;
}


export const Quiz : FC<QuestionProps> = (quiz : QuestionProps) => {
    const { 
        id,
        category,
        type,
        difficulty,
        question,
        correctAnswer,
        options,
        isAnswered
    } = quiz;

    const { onSelectedAnswer, onCheckFinishedGame } = quiz;
    
    const getStyle = ({isHeld, isCorrect} : Answer) => {
        
        if (onCheckFinishedGame() && isCorrect || (onCheckFinishedGame() && isCorrect && isHeld)) {
            return {
                backgroundColor: "rgba(4, 136, 56, 0.7)", 
                color: "white",
                border: "none"
            }
        }
        
        if (onCheckFinishedGame() && isHeld) {
            return {
                backgroundColor: "rgba(165, 6, 6, 0.8)", 
                color: "white",
                border: "none"
            }
        }

        if (isHeld) {
            return {
                backgroundColor: "rgb(106, 115, 217)", 
                color: "white",
                border: "none"
            }  
        }  
    }

    const answersElements = options.map((answer : Answer, index : number) => <li key={index} className="question__answer" style={getStyle(answer)} dangerouslySetInnerHTML={{__html: answer.option}} onClick={onCheckFinishedGame() ? () => null : () => onSelectedAnswer(id, index)}></li>);

    return (
        <article className="question">
            <h2 className="question__title" dangerouslySetInnerHTML={{__html: question}}></h2>
            <ul className="question__answers">
                {answersElements}
            </ul>
        </article>
    )
}