import React from 'react';
import { Button } from '@components';
import { fireEvent, render } from '@testing-library/react';

describe('Button component test', () => {
    it('Should trigger the callback', () => {
        const testCallBack = jest.fn()

        const { getByText } = render(<Button label="Button test" callBack={testCallBack} />);
        fireEvent.click(getByText('Button test'));

        expect(testCallBack).toHaveBeenCalled();
    });
});
