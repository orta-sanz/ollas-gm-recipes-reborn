import React from 'react';

const Button = ({ label, callBack }) => {
    return (
        <button className="button" onClick={callBack}>{label}</button>
    )
};

export default Button;
