import { Recipe } from '@components';
import LazyLoad from 'react-lazyload';
import recipes from '@data/recipes.json';
import { normalize } from '@utils/string';
import React, { useState, useMemo } from 'react';

const App = () => {
    const [difficulty, setDifficulty] = useState('facil');
    const [textSearch, setTextSearch] = useState('');

    const difficultyChangeHandler = ({ target: { value } }) => (
        setDifficulty(value)
    );

    const onFilterTextChange = ({ target: { value } }) => (
        setTextSearch(value)
    );

    const mappedRecipes = useMemo(() => (
        recipes.filter((recipe) => (
            !!recipe.image && recipe.difficulty
        ))
    ), [recipes]);

    return (
        <>
            <h1>Recetas - Ollas GM</h1>
            <h2>Reborn</h2>

            <fieldset>
                <legend>Dificultad</legend>

                <label>
                    <input checked={difficulty === 'facil'} type="radio" name="difficulty" value="facil" onChange={difficultyChangeHandler} />
                    Facil
                </label>

                <label>
                    <input checked={difficulty === 'media'} type="radio" name="difficulty" value="media" onChange={difficultyChangeHandler} />
                    Media
                </label>

                <label>
                    <input checked={difficulty === 'dificil'} type="radio" name="difficulty" value="dificil" onChange={difficultyChangeHandler} />
                    Dificil
                </label>

                <label>
                    <input checked={difficulty === 'any'} type="radio" name="difficulty" value="any" onChange={difficultyChangeHandler} />
                    Cualquiera, soy un crack
                </label>
            </fieldset>

            <fieldset>
                <legend>Filtrar por texto</legend>
                <input type="text" placeholder="Buscar" onChange={onFilterTextChange} />
            </fieldset>

            <section className="list">
                {mappedRecipes.map((recipeData, key) => {
                    const recipeDifficulty = recipeData.difficulty?.toLowerCase();

                    const showByText = textSearch.length > 2
                        ? recipeData.title.includes(textSearch)
                        : true;

                    const showByDifficulty = recipeDifficulty && difficulty !== 'any'
                        ? normalize(recipeDifficulty) === difficulty
                        : true;

                    if(showByDifficulty && showByText) {
                        return (
                            <LazyLoad height={200} key={key} once offset={100} scrollContainer=".list">
                                <Recipe {...recipeData} />
                            </LazyLoad>
                        )
                    }
                })}
            </section>
        </>
    )
}

export default App;
