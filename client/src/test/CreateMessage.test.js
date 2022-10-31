import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateMessage from "../components/CreateMessage";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { UserContext, UserProvider } from "../components/UserContext";

let mockedUseNavigate;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

describe("CreateMessage", () => {
  beforeEach(() => {
    fetch.resetMocks();
    mockedUseNavigate = jest.fn();
  });

  test("should renders successfully", () => {
    fetch.once(JSON.stringify({ message: "successfull response" }));

    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserProvider>
            <CreateMessage />
          </UserProvider>
        </CookiesProvider>
      </BrowserRouter>
    );

    const form = screen.getByTestId("form");
    const title = screen.getByTestId("title");
    const content = screen.getByTestId("content");
    const submitBtn = screen.getByRole("button");

    expect(form).toBeDefined();
    expect(title).toBeDefined();
    expect(content).toBeDefined();
    expect(submitBtn).toBeDefined();
  });

  test("should create message when sumbitting title and content", async () => {
    fetch
      .once(JSON.stringify({ message: "successfull response" }))
      .once(JSON.stringify({ message: "successfull response" }));

    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserProvider>
            <CreateMessage />
          </UserProvider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const user = userEvent.setup();
    const title = screen.getByTestId("title");
    const content = screen.getByTestId("content");
    const submitBtn = screen.getByRole("button");
 
    user.clear(title);
    user.clear(content);

    await user.type(title,'fakeTitle');
    await user.type(content,'fakeContent');
    await user.click(submitBtn);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
  });

test('should show error when submitting with missing fields',async()=>{

    fetch
    .once(JSON.stringify({ message: "successfull response" }))
    .once(JSON.stringify({ message: JSON.stringify([{param:'content'}]) }),{
        status:400,
        headers:{
            'Content-Type':'application/json',
        },
    });

  render(
    <BrowserRouter>
      <CookiesProvider>
        <UserProvider>
          <CreateMessage />
        </UserProvider>
      </CookiesProvider>
    </BrowserRouter>
  );
  const user = userEvent.setup();
  const title = screen.getByTestId("title");
  const content = screen.getByTestId("content");
  const submitBtn = screen.getByRole("button");
  const contentInvalidDiv = screen.getByTestId('contentInvalid-feedback');
  user.clear(title);
  user.clear(content);

  await user.type(title,'fakeTitle');
  await user.click(submitBtn);


  expect(content.classList[content.classList.length - 1]).toBe(
    "is-invalid"
  );
  expect(contentInvalidDiv.textContent).toBe("You'r message misses the content");


});



});
