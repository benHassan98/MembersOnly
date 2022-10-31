import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BecomeAdmin from "../components/BecomeAdmin";
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


describe("BecomeAdmin", () => {
  beforeEach(() => {
    fetch.resetMocks();
    user = { userName: "fake", isAdmin: false };
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
            <BecomeAdmin />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );

    const form = screen.getByTestId("form");
    const adminPassword = screen.getByTestId("adminpassword");
    const submitBtn = screen.getByRole("button");

    expect(form).toBeDefined();
    expect(adminPassword).toBeDefined();
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
            <BecomeAdmin />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
  
    const userMock = userEvent.setup();
    const adminPassword = screen.getByTestId('adminpassword');
    const submitBtn = screen.getByRole('button');

    userMock.clear(adminPassword);

    await userMock.type(adminPassword,'12345');
    await userMock.click(submitBtn);


    expect(setUser.mock.calls[0][0]).toMatchObject({userName:'fake',isAdmin:true});
    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);

  });


test('should show errors when submitting wrong adminPassword',async()=>{
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
          <BecomeAdmin />
        </UserContext.Provider>
      </CookiesProvider>
    </BrowserRouter>
  );

  const userMock = userEvent.setup();
  const adminPassword = screen.getByTestId('adminpassword');
  const submitBtn = screen.getByRole('button');

  userMock.clear(adminPassword);

  await userMock.type(adminPassword,'12345');
  await userMock.click(submitBtn);


  expect(adminPassword.classList[adminPassword.classList.length - 1]).toBe(
    "is-invalid"
  );

});




});
