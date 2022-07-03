import axios from "axios";

interface TriviaCategorie {
    id: number,
    name: string
}

interface TriviaQuestion {
    category: string,
    type: string,
    difficulty: string, 
    question: string,
    correctAnswer: string,
    incorrectAnswers: string[]
}

export class TriviaApi {

    static #token: string;
    static readonly #tokenEndpoint : string = "https://opentdb.com/api_token.php";
    static readonly #mainEndpoint : string = "https://opentdb.com/api.php";

    constructor() {
        if (!TriviaApi.#token) {
            this.getToken().then((token) => {
                TriviaApi.#token = token;
            }).catch((error) => {
                console.log(error);
            })
        }
    }

    private getToken = async  () : Promise<string> => {
        const params = {
            command: "request"
        };

        try {
            const { data } = await axios.get(TriviaApi.#tokenEndpoint, { params });
            const { response_code : responseCode } = data;
            if (responseCode) {
                throw new Error(responseCode);
            } 
            const { token } = data;
            return token;

        } catch (err) {
            console.log(err);
            return axios.isAxiosError(err) ? JSON.stringify(err.response) : "";
        }

    }

    private restartToken = (tokenToUpdate : string) : void => {
        const params = {
            command: "reset",
            token: tokenToUpdate
        };
        axios.get(TriviaApi.#tokenEndpoint, { params }).then(response => {
        }).catch(err => {
            console.log(err);
        });
    }

    public getCategories = async () : Promise<TriviaCategorie[]> => {
        try {
            const categoriesEndpoint : string = "https://opentdb.com/api_category.php";
            const { data } = await axios.get(categoriesEndpoint);
            const { trivia_categories : triviaCategories } = data;
            return triviaCategories;

        } catch (err) {
            console.log(err);
            return [];
        }
    }

    public getQuestions = async (numberQuestions : number, [category = 0, difficulty = "", type = ""]) : Promise<TriviaQuestion[]> => {
        try {
            const filterParams = this.generateParams([category, difficulty, type]);
            const currentToken : string = TriviaApi.#token;
            const params = {
                amount: numberQuestions,
                ...filterParams,
                token: currentToken
            }
            const { data } = await axios.get(TriviaApi.#mainEndpoint, {
                params
            });
            const { response_code : responseCode, results } = data;
            
            if (responseCode === 4 && numberQuestions === 1) {
                this.restartToken(TriviaApi.#token);
                console.log(`Response code: ${responseCode} - Trying to refresh the token`);
                throw new Error("14");
            } else if (responseCode === 4) {
                throw new Error(`Response code: ${responseCode} - no results. Try to choose another number of questions less than your current choice`);
            } 

            const questions : TriviaQuestion[] = results.map((question : any) => (
                {
                    ...question,
                    correctAnswer: question.correct_answer,
                    incorrectAnswers: question.incorrect_answers
                }
            ));
            return questions;

        } catch (error : any) {
            if (error.message === "14") {
                return await this.getQuestions(numberQuestions, [category, difficulty, type]);
            }
            console.log(error.message);
            return [];
        }
        
    }

    private generateParams = ([...args]) => {
        const [category, difficulty, type] = args;
        let params = {};
        if (category) {
            params = {
                ...params,
                category
            }
        }
        if (difficulty) {
            params = {
                ...params,
                difficulty
            }
        }
        if (type) {
            params = {
                ...params,
                type
            }
        }
        return params;

    }

}