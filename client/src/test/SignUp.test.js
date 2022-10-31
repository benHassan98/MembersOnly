import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "../components/Signup";
import { BrowserRouter } from "react-router-dom";


const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom',()=>({
...jest.requireActual('react-router-dom'),
useNavigate:()=>mockedUseNavigate

}));
describe('SignUp',()=>{
beforeEach(()=>{
    fetch.resetMocks();
});

test('renders successfully',()=>{

render(
    <BrowserRouter>
    <Signup/>
    </BrowserRouter>
);

const form = screen.getByTestId('form');
const userName = screen.getByTestId('username');
const password = screen.getByTestId('password');
const passwordConfirm = screen.getByTestId('passwordconfirm');
const signUpButton = screen.getByRole('button');

expect(form).toBeDefined();
expect(userName).toBeDefined();
expect(password).toBeDefined();
expect(passwordConfirm).toBeDefined();
expect(signUpButton).toBeDefined();
});

test('should signUp successfully',async()=>{
fetch.mockResponse(JSON.stringify({message:'successfull response'}));
    render(
        <BrowserRouter>
        <Signup/>
        </BrowserRouter>
    );
const user = userEvent.setup();
const userName = screen.getByTestId('username');
const password = screen.getByTestId('password');
const passwordConfirm = screen.getByTestId('passwordconfirm');
const signUpButton = screen.getByRole('button');

user.clear(userName);
user.clear(password);
user.clear(passwordConfirm);

await user.type(userName,'fake');
await user.type(password,'12345');
await user.type(passwordConfirm,'12345');
await user.click(signUpButton);


expect(mockedUseNavigate).toHaveBeenCalledTimes(1);

});

test("shouldn't signUp when passwordConfirm doesn't match",async()=>{

    fetch.mockResponse(JSON.stringify({message:JSON.stringify([
        {param:'passwordconfirm'}
    ])}),{status:400,headers:{
        'Content-Type':'application/json'
    }});
    render(
        <BrowserRouter>
        <Signup/>
        </BrowserRouter>
    );
const user = userEvent.setup();
const userName = screen.getByTestId('username');
const password = screen.getByTestId('password');
const passwordConfirm = screen.getByTestId('passwordconfirm');
const signUpButton = screen.getByRole('button');

user.clear(userName);
user.clear(password);
user.clear(passwordConfirm);

await user.type(userName,'fake');
await user.type(password,'12345');
await user.type(passwordConfirm,'12345666');
await user.click(signUpButton);


expect(passwordConfirm.classList[passwordConfirm.classList.length-1]).toBe('is-invalid');

});




});