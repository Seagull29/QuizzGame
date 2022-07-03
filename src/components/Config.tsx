import TextField from '@mui/material/TextField';
import React, { Dispatch, FC, SetStateAction } from 'react';
import { TriviaApi } from '../services/triviaApi';
import { QuizGame } from "../types/QuizGame";
import { QuizOptionItem } from "../types/QuizGame";

interface QuizGameProps extends QuizGame {
    onHandleChange(event : React.ChangeEvent<HTMLInputElement>): void;
    onHandleSubmit(event : any): void;
    onStartGame(): void;
}

const triviaApi : TriviaApi = new TriviaApi();

const difficulties : QuizOptionItem[] = [
    {
        value: "easy",
        label: "Easy"
    },
    {
        value: "medium",
        label: "Medium"
    },
    {
        value: "hard",
        label: "Hard"
    }
];

const types : QuizOptionItem[] = [
    {
        value: "multiple",
        label: "Multiple Choice"
    },
    {
        value: "boolean",
        label: "True / False"
    }
];

export const Config : FC<QuizGameProps> = (configGame : QuizGameProps) => {

    const { onHandleChange, onHandleSubmit, onStartGame } = configGame;
    const { amount, category, difficulty, type } = configGame;

    const difficultyOptions = difficulties.map((option : QuizOptionItem) => <option key={option.value} value={option.value} >{option.label}</option>)
    const typesOptions  = types.map((option : QuizOptionItem) => <option key={option.value} value={option.value} >{option.label}</option>);
    
    const [categories, setCategories] : [QuizOptionItem[], Dispatch<SetStateAction<QuizOptionItem[]>>] = React.useState<QuizOptionItem[]>([]);

    React.useEffect(() => {
        const getCategories = async () => {
            const data = await triviaApi.getCategories();
            const items : QuizOptionItem[] = data.map((item : any) => ({ value: item.id, label: item.name }));
            setCategories(items);
        }
        getCategories();
    }, []);

    const categoriesOptions = categories.map((option : QuizOptionItem) => <option key={option.value} value={option.value} >{option.label}</option>)
    return (
        <>
        <form className="trivia__config" onSubmit={onHandleSubmit}>
            <TextField name="amount" label="Questions" type="number" InputLabelProps={{ shrink: true }} variant="filled" onChange={onHandleChange} value={amount}></TextField>
            <TextField  name="category"
                        select 
                        SelectProps={{ native: true }}
                        InputLabelProps={{ shrink: category ? true : false }}
                        variant="filled" 
                        helperText="Select a category if you want" 
                        label="Category"
                        onChange={onHandleChange}
                        value={category} >
                            <option value=""></option>
                            {categoriesOptions}
            </TextField>
            <TextField  name="difficulty"
                        select 
                        SelectProps={{ native: true }} 
                        variant="filled" 
                        helperText="Select a difficulty if you want" 
                        label="Difficulty"
                        onChange={onHandleChange}
                        value={difficulty} >
                            <option value=""></option>
                            {difficultyOptions}
            </TextField>
            <TextField  name="type"
                        select 
                        SelectProps={{ native: true }} 
                        variant="filled" 
                        helperText="Select a type if you want" 
                        label="Type"
                        onChange={onHandleChange}
                        value={type} >
                            <option value=""></option>
                            {typesOptions}
            </TextField>
        </form>
        <button className="trivia__start" onClick={onStartGame} >Start Quiz</button>
        </>
    )
}