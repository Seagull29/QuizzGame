import React, { Dispatch, FC, SetStateAction } from 'react';
import "./style.css";
import { Answer, Question } from "./types/Question";
import { Quiz } from "./components/Quiz";
import { nanoid } from 'nanoid';
import { randomlyInsert } from './util/random';
import { Alert, AlertColor, AlertTitle, Skeleton } from '@mui/material';
import { TriviaApi } from "./services/triviaApi";
import { Config } from './components/Config';
import { QuizGame } from "./types/QuizGame";
import Confetti from "react-confetti";

const triviaApi : TriviaApi = new TriviaApi();

export const App = () => {
    
    const [isStarted, setIsStarted]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [questions, setQuestions]: [Question[], Dispatch<SetStateAction<Question[]>>] = React.useState<Question[]>([]);
    const [isFinished, setIsFinished]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [correctAnswers, setCorrectAnswers]: [number, Dispatch<SetStateAction<number>>] = React.useState<number>(0);
    const [isDisabled, setIsDisabled]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(true);
    const [isLoaded, setIsLoaded]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [triviaConfig, setTriviaConfig]: [QuizGame, Dispatch<SetStateAction<QuizGame>>] = React.useState<QuizGame>({
        amount: 5,
        category: 0,
        difficulty: "",
        type: ""
    });
    const [isReady, setIsReady]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [warning, setWarning]: [boolean, Dispatch<SetStateAction<boolean>>] = React.useState<boolean>(false);

    React.useEffect(() => {
        const allAnswered: boolean = questions.every((question: Question) => question.isAnswered);
        allAnswered ? setIsDisabled(false) : setIsDisabled(true);
    }, [questions]);

    
    const startGame = () => {
        const getQuestions = async () => {
            const { amount, category, difficulty, type } = triviaConfig;
            console.log(triviaConfig);
            const questionsData = await triviaApi.getQuestions(amount, [category, difficulty, type]);
            console.log(questionsData)
            const listQuestions: Question[] = questionsData.map((result: any) => {
                const { correctAnswer, incorrectAnswers } = result;
                const options: Answer[] = incorrectAnswers.map((answer: string) => ({ option: answer, isHeld: false, isCorrect: false }));
                return {
                    ...result,
                    options: randomlyInsert(options, {
                        option: correctAnswer,
                        isHeld: false,
                        isCorrect: true
                    }),
                    id: nanoid(),
                    isAnswered: false
                }
            });
            if (!listQuestions.length) {
                console.log("Salto el error");
                setIsStarted(false);
                setWarning(true);
                return;
            }
            setWarning(false);
            setQuestions(listQuestions);
            setIsLoaded(true);
        }
        getQuestions();
        setIsStarted(true);
    }

    const getReady = () => {
        setIsReady((status : boolean) => !status);
        setWarning(false);
    }

    const onSelectedAnswer = (id: string, index: number) => {
        setQuestions((oldQuestion: Question[]) => {
            return oldQuestion.map((question: Question) => {
                if (question.id === id) {
                    const { options } = question;
                    const updatedOptions: Answer[] = options.map((option: Answer, pos: number) => pos === index ? { ...option, isHeld: true } : { ...option, isHeld: false });
                    return {
                        ...question,
                        isAnswered: true,
                        options: updatedOptions
                    }
                } else {
                    return question;
                }
            });
        });
    }

    const checkAnswers = () => {
        if (!isDisabled) {
            setIsFinished(true);
            for (const question of questions) {
                for (const answer of question.options) {
                    if (answer.isHeld && answer.isCorrect) {
                        setCorrectAnswers((oldNumber : number) => oldNumber + 1);
                    }
                }
            }
        }
    }

    const onCheckFinishedGame = () => isFinished;

    const quizElements: JSX.Element[] = questions.map((question: Question) => <Quiz key={question.id} {...question} onSelectedAnswer={onSelectedAnswer} onCheckFinishedGame={() => onCheckFinishedGame()} />)

    const skeletonElements : JSX.Element[] = [...new Array<JSX.Element>(5)].map((ob : any, index : number) => <Skeleton key={index} variant="rectangular" animation="wave" width="80%" style={{margin: "15px 0"}} />)

    const calculateScoreStatus = (correctAnswers : number) : AlertColor => {
        if (!correctAnswers) {
            return "error";
        }
        return correctAnswers >= Math.ceil(questions.length / 2) ? "success" : "warning";
    }

    const restartGame = () => {
        setIsFinished(false);
        setIsStarted(false);
        setCorrectAnswers(0);
        setIsLoaded(false);
        //setIsReady(false);
        setWarning(false);
    }

    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        const { value, name, type, checked } = event.target;
        setTriviaConfig((prevConfig : QuizGame) => {
            if (name === "amount") {
                const [min, max] = [1, 50];
                const currentNumber : number = +value;
                if (currentNumber < min) {
                    return {
                        ...prevConfig,
                        [name]: min
                    }
                } else if (currentNumber > max) {
                    return {
                        ...prevConfig,
                        [name]: max
                    }
                }
                return {
                    ...prevConfig,
                    [name]: +value
                }
            }
            return {
                ...prevConfig,
                [name]: value
            };
        });
    }

    const handleSubmit = (event : any) => {
        event.preventDefault();
        console.log(triviaConfig);
    }


    return (
        <main className="trivia">
            { correctAnswers === questions.length && isFinished && <Confetti />}
            {
            !isStarted ?
                <>
                <div className="start">
                    <h1 className="start__title">Quizzical</h1>
                    <p className="start__description">Answer to some questions to prove your knowledge</p>
                    <button className="start__button" onClick={getReady}>Let's get started</button>
                </div> 
                {
                    isReady && <Config onHandleChange={handleChange} onHandleSubmit={handleSubmit} {...triviaConfig} onStartGame={startGame} />
                }
                {
                    warning && <Alert severity="warning" style={{marginTop: "20px"}}><AlertTitle>There are not questions!</AlertTitle>Try to choose another number of questions less than your latest choice</Alert>
                }
                </> :
                <>
                    <Alert severity="info">
                        <AlertTitle>Quizzical</AlertTitle>
                        <strong>Select an option in each question to enable checking</strong>
                    </Alert>
                    

                    {
                        isLoaded ?
                        <section className="quiz">
                            {quizElements}
                        </section> :
                        <>
                            {skeletonElements}
                        </>
                    }

                    {
                        !isFinished && isLoaded &&
                            <button className={`trivia__button ${isDisabled ? "" : "trivia__button--enabled"}`} onClick={checkAnswers} disabled={isDisabled}>Check answers</button>
                    }
                    {
                        isFinished && isLoaded &&
                        <div className="trivia__end">
                            <Alert severity={calculateScoreStatus(correctAnswers)}>You scored <strong>{`${correctAnswers}/${questions.length}`}</strong> correct answers</Alert>
                            <button className="trivia__button-restart" onClick={restartGame}>Play again</button>
                        </div>
                    }

                </>
            }
        </main>
    )
}