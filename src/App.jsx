import React from 'react';
import { Button } from '@components';

const App = () => {
    const onButtonClick = () => alert('Button clicked');

    return (
        <>
            <h1>Hello World!</h1>
            <Button label="Example button" callBack={onButtonClick} />
        </>
    )
}

export default App;
