import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BecomeMember from '../components/BecomeMember';
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { UserContext } from "../components/UserContext";

let mockedUseNavigate,mockedRemoveCookie;
let user, setUser;
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedUseNavigate,
  }));
  jest.mock("react-cookie", () => ({
    ...jest.requireActual("react-cookie"),
    useCookies: () => [{},{},mockedRemoveCookie],
  }));


describe("BecomeMember", () => {
  beforeEach(() => {
    fetch.resetMocks();
    user = { userName: "fake", isMember: false };
    setUser = jest.fn();
    mockedRemoveCookie = jest.fn();
    mockedUseNavigate = jest.fn();
  });

  test("renders successfully", () => {
    fetch.once(JSON.stringify({ message: "successfull response" }));
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <BecomeMember />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );

    const form = screen.getByTestId("form");
    const memberPassword = screen.getByTestId("memberpassword");
    const submitBtn = screen.getByRole("button");

    expect(form).toBeDefined();
    expect(memberPassword).toBeDefined();
    expect(submitBtn).toBeDefined();
  });

  test("should upgrade user to admin", async () => {
    fetch
      .once(JSON.stringify({ message: "successfull response" }))
      .once(JSON.stringify({ message: "successfull response" }));

    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <BecomeMember />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
  
    const userMock = userEvent.setup();
    const memberPassword = screen.getByTestId('memberpassword');
    const submitBtn = screen.getByRole('button');

    userMock.clear(memberPassword);

    await userMock.type(memberPassword,'12345');
    await userMock.click(submitBtn);


    expect(setUser.mock.calls[0][0]).toMatchObject({userName:'fake',isMember:true});
    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);

  });


test('should show errors when submitting wrong memberPassword',async()=>{
    fetch
    .once(JSON.stringify({ message: "successfull response" }))
    .once(JSON.stringify({ message: "failed response" }),{
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
    });

  render(
    <BrowserRouter>
      <CookiesProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <BecomeMember />
        </UserContext.Provider>
      </CookiesProvider>
    </BrowserRouter>
  );

  const userMock = userEvent.setup();
  const memberPassword = screen.getByTestId('memberpassword');
  const submitBtn = screen.getByRole('button');

  userMock.clear(memberPassword);

  await userMock.type(memberPassword,'12345');
  await userMock.click(submitBtn);


  expect(memberPassword.classList[memberPassword.classList.length - 1]).toBe(
    "is-invalid"
  );

});




});
