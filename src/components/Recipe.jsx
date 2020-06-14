import React, { useState, useCallback } from 'react';

const Recipe = ({ difficulty, title, link, rations, time, image }) => {
    const [withImage, setWithImage] = useState(true);

    const onImageError = useCallback(() => setWithImage(false), []);

    return withImage ? (
        <a href={link} title={title} className="recipe" target="_blank">
            <img src={image} onError={onImageError} style={{display: 'none'}} />
            <span className="recipe--marker"></span>
            <div className="recipe--image" style={{backgroundImage: `url(${image})`}}></div>
            <span className="recipe--degrade"></span>
            <h4>{title}</h4>

            <ul>
                {difficulty && <li>Dificultad: <strong>{difficulty}</strong></li>}
                {rations && <li>Raciones: <strong>{rations}</strong></li>}
                {time && <li>Tiempo: <strong>{time}</strong></li>}
            </ul>
        </a>
    ) : null;
}

export default Recipe;
